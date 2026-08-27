"""Unit tests for PulseAuditLogger and PulseEvaluator."""

import os
import shutil
import tempfile
import json
import pytest

from gtm_intelligence.logging.audit_logger import PulseAuditLogger
from gtm_intelligence.evaluation.evaluator import PulseEvaluator


def test_audit_logger_flow():
    """Test creating, logging tool calls, and finalizing audit logs."""
    temp_dir = tempfile.mkdtemp()
    try:
        logger = PulseAuditLogger(log_dir=temp_dir)
        run = logger.create_run_log("Test SaaS", "deep")
        
        assert run["status"] == "RUNNING"
        assert run["target_domain"] == "Test SaaS"
        
        # Log a tool call
        logger.log_tool_call(run, "SeltzSearchTool", "Acme pricing", latency_ms=185.2, results_count=4)
        assert len(run["tool_calls"]) == 1
        assert run["tokens_and_cost"]["seltz_api_calls_count"] == 1
        
        # Finalize
        file_path = logger.finalize_run(run, status="SUCCESS", quality_scorecard={"grade": "A", "overall_score": 0.95})
        assert os.path.exists(file_path)
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert data["status"] == "SUCCESS"
            assert data["quality_grade"] == "A"
            assert data["duration_seconds"] >= 0
            assert data["tokens_and_cost"]["estimated_cost_usd"] > 0
    finally:
        shutil.rmtree(temp_dir)


def test_evaluator_grounding_and_completeness():
    """Test PulseEvaluator scoring functions."""
    evaluator = PulseEvaluator()
    
    sample_report = """
    # GTM Intelligence Report
    ## Competitor Analysis
    Pricing is $49/mo according to https://seltz.ai/sources/acme-pricing
    ## Target ICP
    Enterprise Devs.
    ## Battlecard
    Why we win vs Acme.
    ## Outreach Campaign
    Step 1: Cold email.
    """
    
    sources = ["https://seltz.ai/sources/acme-pricing"]
    scorecard = evaluator.generate_quality_scorecard(sample_report, sources)
    
    assert scorecard["passed"] is True
    assert scorecard["grade"] in ["A", "B"]
    assert scorecard["completeness"]["is_complete"] is True
    assert scorecard["grounding"]["cited_urls_count"] == 1
