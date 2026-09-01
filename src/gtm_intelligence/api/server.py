"""FastAPI Event Gateway, REST API, and Live SSE Streaming for Pulse."""

import os
import json
import uuid
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse

from gtm_intelligence.crew import GtmIntelligenceCrew
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine
from gtm_intelligence.logging.audit_logger import PulseAuditLogger
from gtm_intelligence.evaluation.evaluator import PulseEvaluator
from gtm_intelligence.integrations.crm_sync import CRMSyncEngine, CRMDealWebhookPayload
from gtm_intelligence.integrations.slack_bot import SlackBotEngine
from gtm_intelligence.workers.daemon import PulseSensingDaemon
from gtm_intelligence.tools.seltz_tool import set_active_audit_context, clear_active_audit_context
from gtm_intelligence.storage.account_store import AccountStore
from gtm_intelligence.engine.seltz_engine import SeltzGTMEngine

audit_logger = PulseAuditLogger()
evaluator = PulseEvaluator()
drift_engine = CompetitorDriftEngine()
account_store = AccountStore()
sensing_daemon = PulseSensingDaemon()
seltz_engine = SeltzGTMEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for background workers and daemon management."""
    daemon_task = None
    if os.getenv("ENABLE_BACKGROUND_DAEMON", "false").lower() in ("true", "1", "yes"):
        daemon_task = asyncio.create_task(sensing_daemon.run_forever())
    yield
    sensing_daemon.stop()
    if daemon_task and not daemon_task.done():
        daemon_task.cancel()
        try:
            await daemon_task
        except asyncio.CancelledError:
            pass

app = FastAPI(
    title="Pulse: Autonomous GTM Operating System API",
    description="Event Gateway and REST API for real-time GTM intelligence, Seltz web indexing, and competitor drift.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Concurrency limiter: max 3 concurrent agent runs
CONCURRENCY_SEMAPHORE = asyncio.Semaphore(3)

# Simple TTL Cache dictionary: {domain_key: (timestamp, report_dict)}
_CACHE: Dict[str, tuple[datetime, Dict[str, Any]]] = {}
CACHE_TTL_HOURS = 24

# SSE Job tracking models & storage
class JobStatus:
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ScanJob:
    def __init__(self, job_id: str, target_domain: str, mode: str):
        self.job_id = job_id
        self.target_domain = target_domain
        self.mode = mode
        self.status = JobStatus.QUEUED
        self.created_at = datetime.now().isoformat()
        self.completed_at: Optional[str] = None
        self.events: List[Dict[str, Any]] = []
        self.event_notifier: asyncio.Event = asyncio.Event()
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None

    async def push_event(self, event_type: str, data: Dict[str, Any]):
        evt = {"event": event_type, "data": data, "timestamp": datetime.now().isoformat()}
        self.events.append(evt)
        self.event_notifier.set()

_JOBS: Dict[str, ScanJob] = {}


class ScanRequest(BaseModel):
    target_domain: str = Field(..., description="Target market vertical or product domain", json_schema_extra={"example": "AI Developer Tools"})
    mode: str = Field(default="deep", description="'deep' (fact-audited) or 'standard'", json_schema_extra={"example": "deep"})
    force_refresh: bool = Field(default=False, description="Ignore 24h TTL cache and force fresh scan")


class ScanJobCreatedResponse(BaseModel):
    job_id: str
    target_domain: str
    mode: str
    status: str
    created_at: str


class ScanResponse(BaseModel):
    status: str
    target_domain: str
    cached: bool
    run_id: str
    report_markdown: str
    quality_grade: str
    grounding_score: float
    duration_seconds: float


class DriftResponse(BaseModel):
    target_domain: str
    status: str
    drift_events: List[str]


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Pulse GTM Operating System",
        "version": "1.0.0",
        "indexing_mode": "Seltz Live API" if os.getenv("SELTZ_API_KEY") else "Fallback Web Search"
    }


async def _execute_scan_job(job: ScanJob, force_refresh: bool):
    """Background execution engine for asynchronous scan jobs with live SSE streaming."""
    job.status = JobStatus.RUNNING
    cache_key = f"{job.target_domain.lower().strip()}_{job.mode}"

    # 1. Check TTL cache
    if not force_refresh and cache_key in _CACHE:
        cached_time, cached_data = _CACHE[cache_key]
        if datetime.now() - cached_time < timedelta(hours=CACHE_TTL_HOURS):
            await job.push_event("step_start", {"step": "cache_lookup", "message": "Found valid 24h cached intelligence snapshot."})
            cached_resp = {
                "status": "SUCCESS_CACHED",
                "target_domain": job.target_domain,
                "cached": True,
                "run_id": cached_data.get("run_id", "cached_run"),
                "report_markdown": cached_data.get("report_markdown", ""),
                "quality_grade": cached_data.get("quality_grade", "A"),
                "grounding_score": cached_data.get("grounding_score", 1.0),
                "duration_seconds": 0.05
            }
            job.result = cached_resp
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.now().isoformat()
            await job.push_event("job_completed", cached_resp)
            return

    # 2. Acquire concurrency semaphore and run Crew pipeline
    async with CONCURRENCY_SEMAPHORE:
        run_record = audit_logger.create_run_log(job.target_domain, job.mode)
        set_active_audit_context(audit_logger, run_record)
        try:
            await job.push_event("step_start", {
                "step": "web_intelligence",
                "message": f"Seltz Web Indexing live search and competitor analysis for '{job.target_domain}'..."
            })

            structured_account: Optional[Dict[str, Any]] = None
            if os.getenv("OPENAI_API_KEY"):
                def _run_crew():
                    crew = GtmIntelligenceCrew(mode=job.mode).crew()
                    return str(crew.kickoff(inputs={"target_domain": job.target_domain}))
                result_markdown = await asyncio.to_thread(_run_crew)
                extracted_citations = evaluator.extract_urls(result_markdown)
            else:
                intel_res = await asyncio.to_thread(
                    seltz_engine.run_gtm_intelligence, job.target_domain, job.mode
                )
                result_markdown = intel_res["report_markdown"]
                extracted_citations = intel_res["crawled_urls"]
                structured_account = intel_res["structured_data"]

            # Combine citations: URLs from tool execution plus URLs in report markdown
            report_urls = evaluator.extract_urls(result_markdown)
            tool_urls = run_record.get("crawled_urls", []) + extracted_citations
            all_crawled_urls = list(dict.fromkeys(tool_urls + report_urls))

            await job.push_event("tool_call", {
                "tool": "SeltzSearchTool",
                "query": job.target_domain,
                "citations_extracted_count": len(all_crawled_urls),
                "citations": all_crawled_urls[:5]
            })

            # Run factuality evaluation with actual citations
            await job.push_event("step_start", {
                "step": "fact_audit",
                "message": "Fact-Checker Auditor evaluating citation grounding and completeness..."
            })
            scorecard = evaluator.generate_quality_scorecard(result_markdown, source_citations=all_crawled_urls)

            await job.push_event("fact_audit", {
                "grade": scorecard["grade"],
                "overall_score": scorecard["overall_score"],
                "grounding_score": scorecard["grounding"]["grounding_score"],
                "cited_urls_count": scorecard["grounding"]["cited_urls_count"]
            })

            # Finalize audit log and persist structured snapshot
            audit_logger.finalize_run(run_record, status="SUCCESS", quality_scorecard=scorecard)
            drift_engine.save_snapshot(job.target_domain, {
                "target_domain": job.target_domain,
                "output_summary": result_markdown[:500],
                "full_report": result_markdown,
                "source_citations": all_crawled_urls
            })

            resp_payload = {
                "status": "SUCCESS",
                "target_domain": job.target_domain,
                "cached": False,
                "run_id": run_record["run_id"],
                "report_markdown": result_markdown,
                "quality_grade": scorecard["grade"],
                "grounding_score": scorecard["grounding"]["grounding_score"],
                "duration_seconds": run_record["duration_seconds"]
            }

            _CACHE[cache_key] = (datetime.now(), resp_payload)

            # Persist scan result to SQLite AccountStore
            if structured_account:
                structured_account["intel"]["quality"] = {
                    "overallScore": scorecard.get("overall_score", 0.95),
                    "grade": scorecard.get("grade", "A"),
                    "passed": scorecard.get("passed", True),
                    "groundingScore": scorecard.get("grounding", {}).get("grounding_score", 0.95),
                    "citedUrlsCount": len(all_crawled_urls),
                    "citedUrls": list(all_crawled_urls)[:5]
                }
                account_store.save_account(structured_account)
            else:
                account_store.save_account({
                    "domain": job.target_domain,
                    "name": job.target_domain.split(".")[0].capitalize(),
                    "intel_status": "Ready",
                    "intel": {
                        "executiveSummary": result_markdown[:400],
                        "quality": {
                            "overallScore": scorecard.get("overall_score", 0.95),
                            "grade": scorecard.get("grade", "A"),
                            "passed": scorecard.get("passed", True),
                            "groundingScore": scorecard.get("grounding", {}).get("grounding_score", 0.95),
                            "citedUrlsCount": len(all_crawled_urls),
                            "citedUrls": list(all_crawled_urls)[:5]
                        },
                        "lastScannedAt": "Just now",
                        "tokensCostUsd": run_record["tokens_and_cost"]["estimated_cost_usd"]
                    }
                })

            job.result = resp_payload
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.now().isoformat()
            await job.push_event("job_completed", resp_payload)

        except Exception as e:
            audit_logger.finalize_run(run_record, status=f"FAILED: {str(e)}")
            job.status = JobStatus.FAILED
            job.error = str(e)
            job.completed_at = datetime.now().isoformat()
            await job.push_event("error", {"error": str(e)})
        finally:
            clear_active_audit_context()


@app.post("/api/v1/scan/jobs", response_model=ScanJobCreatedResponse, status_code=status.HTTP_202_ACCEPTED, tags=["GTM Intelligence"])
async def create_scan_job(req: ScanRequest, background_tasks: BackgroundTasks):
    """Create an asynchronous GTM scan job and immediately return 202 Accepted with job_id."""
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    job = ScanJob(job_id=job_id, target_domain=req.target_domain, mode=req.mode)
    _JOBS[job_id] = job

    # Dispatch to asyncio background task
    asyncio.create_task(_execute_scan_job(job, req.force_refresh))

    return ScanJobCreatedResponse(
        job_id=job.job_id,
        target_domain=job.target_domain,
        mode=job.mode,
        status=job.status,
        created_at=job.created_at
    )


@app.get("/api/v1/scan/jobs/{job_id}/stream", tags=["GTM Intelligence"])
async def stream_scan_job(job_id: str):
    """Stream real-time SSE progress events for an active scan job without duplicate events."""
    if job_id not in _JOBS:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    job = _JOBS[job_id]

    async def event_generator():
        cursor = 0
        while True:
            # Replay all pending events in strict sequential order
            while cursor < len(job.events):
                evt = job.events[cursor]
                cursor += 1
                yield f"event: {evt['event']}\ndata: {json.dumps(evt['data'])}\n\n"
                if evt["event"] in ("job_completed", "error"):
                    return

            # If job finished and all events emitted, exit cleanly
            if job.status in (JobStatus.COMPLETED, JobStatus.FAILED):
                return

            # Wait for next event or heartbeat timeout
            try:
                await asyncio.wait_for(job.event_notifier.wait(), timeout=15.0)
                job.event_notifier.clear()
            except asyncio.TimeoutError:
                yield ": ping\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream"
        }
    )


@app.post("/api/v1/scan", response_model=ScanResponse, tags=["GTM Intelligence"])
async def trigger_gtm_scan(req: ScanRequest):
    """Synchronous GTM scan endpoint (retained for backwards compatibility)."""
    cache_key = f"{req.target_domain.lower().strip()}_{req.mode}"
    
    # Check TTL cache
    if not req.force_refresh and cache_key in _CACHE:
        cached_time, cached_data = _CACHE[cache_key]
        if datetime.now() - cached_time < timedelta(hours=CACHE_TTL_HOURS):
            return ScanResponse(
                status="SUCCESS_CACHED",
                target_domain=req.target_domain,
                cached=True,
                run_id=cached_data.get("run_id", "cached_run"),
                report_markdown=cached_data.get("report_markdown", ""),
                quality_grade=cached_data.get("quality_grade", "A"),
                grounding_score=cached_data.get("grounding_score", 1.0),
                duration_seconds=0.05
            )

    # Acquire concurrency semaphore
    async with CONCURRENCY_SEMAPHORE:
        run_record = audit_logger.create_run_log(req.target_domain, req.mode)
        set_active_audit_context(audit_logger, run_record)
        
        try:
            structured_account: Optional[Dict[str, Any]] = None
            if os.getenv("OPENAI_API_KEY"):
                def _run_crew():
                    crew = GtmIntelligenceCrew(mode=req.mode).crew()
                    return str(crew.kickoff(inputs={"target_domain": req.target_domain}))
                result_markdown = await asyncio.to_thread(_run_crew)
                extracted_citations = evaluator.extract_urls(result_markdown)
            else:
                intel_res = await asyncio.to_thread(
                    seltz_engine.run_gtm_intelligence, req.target_domain, req.mode
                )
                result_markdown = intel_res["report_markdown"]
                extracted_citations = intel_res["crawled_urls"]
                structured_account = intel_res["structured_data"]
            
            # Extract actual citations from result and tool execution
            report_urls = evaluator.extract_urls(result_markdown)
            tool_urls = run_record.get("crawled_urls", []) + extracted_citations
            crawled_urls = list(dict.fromkeys(tool_urls + report_urls))
            
            # Evaluate output quality with verified source citations
            scorecard = evaluator.generate_quality_scorecard(result_markdown, source_citations=crawled_urls)
            
            # Finalize audit log
            audit_logger.finalize_run(
                run_record,
                status="SUCCESS",
                quality_scorecard=scorecard
            )
            
            # Save structured snapshot for drift engine
            drift_engine.save_snapshot(req.target_domain, {
                "target_domain": req.target_domain,
                "output_summary": result_markdown[:500],
                "full_report": result_markdown,
                "source_citations": crawled_urls
            })

            if structured_account:
                structured_account["intel"]["quality"] = {
                    "overallScore": scorecard.get("overall_score", 0.95),
                    "grade": scorecard.get("grade", "A"),
                    "passed": scorecard.get("passed", True),
                    "groundingScore": scorecard.get("grounding", {}).get("grounding_score", 0.95),
                    "citedUrlsCount": len(crawled_urls),
                    "citedUrls": list(crawled_urls)[:5]
                }
                account_store.save_account(structured_account)
            
            response_payload = {
                "run_id": run_record["run_id"],
                "report_markdown": result_markdown,
                "quality_grade": scorecard["grade"],
                "grounding_score": scorecard["grounding"]["grounding_score"],
                "duration_seconds": run_record["duration_seconds"]
            }
            
            # Update cache
            _CACHE[cache_key] = (datetime.now(), response_payload)
            
            return ScanResponse(
                status="SUCCESS",
                target_domain=req.target_domain,
                cached=False,
                run_id=run_record["run_id"],
                report_markdown=result_markdown,
                quality_grade=scorecard["grade"],
                grounding_score=scorecard["grounding"]["grounding_score"],
                duration_seconds=run_record["duration_seconds"]
            )
            
        except Exception as e:
            audit_logger.finalize_run(run_record, status=f"FAILED: {str(e)}")
            raise HTTPException(status_code=500, detail=f"GTM Intelligence Execution Failed: {str(e)}")
        finally:
            clear_active_audit_context()


@app.get("/api/v1/drift/{target_domain}", response_model=DriftResponse, tags=["GTM Intelligence"])
async def get_competitor_drift(target_domain: str):
    """Retrieve competitor drift delta report for a target domain."""
    drift_data = drift_engine.detect_drift(target_domain)
    return DriftResponse(
        target_domain=target_domain,
        status=drift_data.get("status", "Unknown"),
        drift_events=drift_data.get("drift_events", [])
    )


@app.get("/api/v1/audit/logs", tags=["Observability"])
async def get_audit_logs(limit: int = 50, offset: int = 0):
    """Retrieve paginated audit logs."""
    log_files = sorted(audit_logger.log_dir.glob("*.json"), key=os.path.getmtime, reverse=True)
    total = len(log_files)
    logs = []
    for fpath in log_files[offset : offset + limit]:
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                logs.append(json.load(f))
        except Exception:
            continue
    return {"total": total, "count": len(logs), "logs": logs}


@app.get("/api/v1/audit/logs/{run_id}", tags=["Observability"])
async def get_audit_log_detail(run_id: str):
    """Retrieve detailed audit log for a specific run."""
    file_path = audit_logger.log_dir / f"{run_id}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Audit log for run '{run_id}' not found")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read audit log: {str(e)}")


crm_sync_engine = CRMSyncEngine()
slack_bot_engine = SlackBotEngine()


@app.post("/api/v1/crm/webhook", tags=["Integrations"])
async def handle_crm_webhook(payload: CRMDealWebhookPayload):
    """Handle incoming HubSpot/Salesforce deal-stage webhook."""
    result = crm_sync_engine.process_deal_event(payload)
    return result


@app.post("/api/v1/slack/command", tags=["Integrations"])
async def handle_slack_command(text: str = "intel General"):
    """Handle incoming Slack slash command (e.g. /pulse intel AcmeCorp)."""
    return slack_bot_engine.handle_slash_command(text)


@app.get("/api/v1/accounts", tags=["Target Accounts"])
async def list_target_accounts():
    """Retrieve all persistent target accounts and enriched intelligence from SQLite."""
    accounts = account_store.list_accounts()
    return {"count": len(accounts), "accounts": accounts}


@app.post("/api/v1/accounts", tags=["Target Accounts"])
async def create_target_account(payload: Dict[str, Any]):
    """Add or update a target account in SQLite."""
    domain = payload.get("domain")
    if not domain:
        raise HTTPException(status_code=400, detail="Missing required field: domain")
    acc_id = account_store.save_account(payload)
    acc = account_store.get_account_by_domain(domain)
    return {"status": "SUCCESS", "account_id": acc_id, "account": acc}


@app.delete("/api/v1/accounts/{account_id}", tags=["Target Accounts"])
async def delete_target_account(account_id: str):
    """Delete a target account from SQLite."""
    deleted = account_store.delete_account(account_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Account '{account_id}' not found")
    return {"status": "DELETED", "account_id": account_id}

