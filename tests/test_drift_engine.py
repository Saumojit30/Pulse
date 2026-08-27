"""Tests for CompetitorDriftEngine."""

import os
import shutil
import tempfile
import pytest
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine


def test_drift_engine_save_and_detect():
    """Test saving snapshots and computing competitor drift."""
    temp_dir = tempfile.mkdtemp()
    try:
        engine = CompetitorDriftEngine(storage_dir=temp_dir)
        target = "Test SaaS Sector"
        
        # Save first snapshot
        run_1 = {
            "competitors": [
                {"name": "CompA", "pricing_summary": "$10/mo", "hiring_signals": ["Sales Rep"]}
            ]
        }
        engine.save_snapshot(target, run_1)
        
        # Check single snapshot status
        drift_1 = engine.detect_drift(target)
        assert drift_1["status"] == "Insufficient history"
        
        # Save second snapshot with changes
        run_2 = {
            "competitors": [
                {"name": "CompA", "pricing_summary": "$15/mo", "hiring_signals": ["Sales Rep", "VP Engineering"]},
                {"name": "CompB", "pricing_summary": "$50/mo", "hiring_signals": []}
            ]
        }
        engine.save_snapshot(target, run_2)
        
        # Check drift detection
        drift_2 = engine.detect_drift(target)
        assert drift_2["status"] == "Drift computed successfully"
        events = drift_2["drift_events"]
        assert len(events) >= 2
        assert any("CompB" in e for e in events)
        assert any("pricing changed" in e for e in events)
        
    finally:
        shutil.rmtree(temp_dir)
