"""FastAPI Event Gateway and REST API for Pulse."""

import os
import json
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware

from gtm_intelligence.crew import GtmIntelligenceCrew
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine
from gtm_intelligence.logging.audit_logger import PulseAuditLogger
from gtm_intelligence.evaluation.evaluator import PulseEvaluator
from gtm_intelligence.integrations.crm_sync import CRMSyncEngine, CRMDealWebhookPayload
from gtm_intelligence.integrations.slack_bot import SlackBotEngine

app = FastAPI(
    title="Pulse: Autonomous GTM Operating System API",
    description="Event Gateway and REST API for real-time GTM intelligence, Seltz web indexing, and competitor drift.",
    version="1.0.0"
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

audit_logger = PulseAuditLogger()
evaluator = PulseEvaluator()
drift_engine = CompetitorDriftEngine()


class ScanRequest(BaseModel):
    target_domain: str = Field(..., description="Target market vertical or product domain", json_schema_extra={"example": "AI Developer Tools"})
    mode: str = Field(default="deep", description="'deep' (fact-audited) or 'standard'", json_schema_extra={"example": "deep"})
    force_refresh: bool = Field(default=False, description="Ignore 24h TTL cache and force fresh scan")


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


@app.post("/api/v1/scan", response_model=ScanResponse, tags=["GTM Intelligence"])
async def trigger_gtm_scan(req: ScanRequest):
    """Trigger an on-demand or cached GTM scan."""
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
        
        try:
            # Execute Crew in worker thread to avoid blocking async event loop
            def _run_crew():
                crew = GtmIntelligenceCrew(mode=req.mode).crew()
                return str(crew.kickoff(inputs={"target_domain": req.target_domain}))

            result_markdown = await asyncio.to_thread(_run_crew)
            
            # Evaluate output quality
            scorecard = evaluator.generate_quality_scorecard(result_markdown)
            
            # Finalize audit log
            audit_logger.finalize_run(
                run_record,
                status="SUCCESS",
                quality_scorecard=scorecard
            )
            
            # Save snapshot for drift engine
            drift_engine.save_snapshot(req.target_domain, {
                "output_summary": result_markdown[:500],
                "full_report": result_markdown
            })
            
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


@app.get("/api/v1/drift/{target_domain}", response_model=DriftResponse, tags=["GTM Intelligence"])
async def get_competitor_drift(target_domain: str):
    """Retrieve competitor drift delta report for a target domain."""
    drift_data = drift_engine.detect_drift(target_domain)
    return DriftResponse(
        target_domain=target_domain,
        status=drift_data.get("status", "Unknown"),
        drift_events=drift_data.get("drift_events", [])
    )


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

