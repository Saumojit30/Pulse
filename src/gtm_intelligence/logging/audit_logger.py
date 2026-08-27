"""Structured Audit Logging and Observability for Pulse."""

import os
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path


class PulseAuditLogger:
    """Tracks execution traces, Seltz tool latencies, token consumption, and audit logs."""

    def __init__(self, log_dir: Optional[str] = None):
        if log_dir:
            self.log_dir = Path(log_dir)
        else:
            self.log_dir = Path(os.getcwd()) / "gtm_history" / "audit_logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)

    def create_run_log(self, target_domain: str, mode: str) -> Dict[str, Any]:
        """Initialize a new audit log record for a run."""
        run_id = f"pulse_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
        return {
            "run_id": run_id,
            "target_domain": target_domain,
            "mode": mode,
            "started_at": datetime.now().isoformat(),
            "status": "RUNNING",
            "duration_seconds": 0.0,
            "tool_calls": [],
            "tokens_and_cost": {
                "estimated_input_tokens": 0,
                "estimated_output_tokens": 0,
                "estimated_cost_usd": 0.0,
                "seltz_api_calls_count": 0
            },
            "fact_check_metrics": {
                "claims_audited": 0,
                "claims_verified": 0,
                "grounding_score": 1.0
            },
            "quality_grade": "PENDING"
        }

    def log_tool_call(
        self,
        run_record: Dict[str, Any],
        tool_name: str,
        query_or_input: str,
        latency_ms: float,
        results_count: int,
        status: str = "SUCCESS"
    ) -> None:
        """Record a tool execution event."""
        event = {
            "timestamp": datetime.now().isoformat(),
            "tool_name": tool_name,
            "input": query_or_input[:200],
            "latency_ms": round(latency_ms, 2),
            "results_count": results_count,
            "status": status
        }
        run_record["tool_calls"].append(event)
        if "Seltz" in tool_name:
            run_record["tokens_and_cost"]["seltz_api_calls_count"] += 1

    def finalize_run(
        self,
        run_record: Dict[str, Any],
        status: str = "SUCCESS",
        estimated_input_tokens: int = 0,
        estimated_output_tokens: int = 0,
        quality_scorecard: Optional[Dict[str, Any]] = None
    ) -> str:
        """Finalize and persist the audit log to disk."""
        start_dt = datetime.fromisoformat(run_record["started_at"])
        duration = (datetime.now() - start_dt).total_seconds()
        
        run_record["status"] = status
        run_record["duration_seconds"] = round(duration, 2)
        run_record["completed_at"] = datetime.now().isoformat()
        
        # Estimate cost: assume standard blended rate ($2.5/1M input, $10/1M output)
        input_tokens = estimated_input_tokens or (len(str(run_record)) * 2)
        output_tokens = estimated_output_tokens or 1500
        cost = (input_tokens / 1_000_000 * 2.5) + (output_tokens / 1_000_000 * 10.0)
        
        run_record["tokens_and_cost"]["estimated_input_tokens"] = input_tokens
        run_record["tokens_and_cost"]["estimated_output_tokens"] = output_tokens
        run_record["tokens_and_cost"]["estimated_cost_usd"] = round(cost, 5)
        
        if quality_scorecard:
            run_record["quality_evaluation"] = quality_scorecard
            run_record["quality_grade"] = quality_scorecard.get("grade", "A")

        file_path = self.log_dir / f"{run_record['run_id']}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(run_record, f, indent=2)
            
        return str(file_path)
