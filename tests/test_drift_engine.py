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
        shutil.rmtree(temp_dir, ignore_errors=True)


def test_drift_engine_feature_and_tech_stack_drift():
    """Test detecting feature additions/removals and tech stack drift."""
    temp_dir = tempfile.mkdtemp()
    try:
        engine = CompetitorDriftEngine(storage_dir=temp_dir)
        target = "DevTools Domain"

        run_1 = {
            "competitors": [
                {
                    "name": "DevFlow",
                    "pricing_summary": "$29/seat",
                    "key_features": ["GitHub Integration", "CLI Tool"],
                    "tech_stack_signals": ["Rust", "PostgreSQL"]
                }
            ]
        }
        engine.save_snapshot(target, run_1)

        run_2 = {
            "competitors": [
                {
                    "name": "DevFlow",
                    "pricing_summary": "$29/seat",
                    "key_features": ["GitHub Integration", "Slack Alerts", "AI Code Review"],
                    "tech_stack_signals": ["Rust", "PostgreSQL", "ClickHouse"]
                }
            ]
        }
        engine.save_snapshot(target, run_2)

        drift = engine.detect_drift(target)
        assert drift["status"] == "Drift computed successfully"
        events = drift["drift_events"]
        
        assert any("FEATURE ADDED" in e and "AI Code Review" in e for e in events)
        assert any("TECH STACK DRIFT" in e and "ClickHouse" in e for e in events)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def test_drift_engine_removal_and_dict_handling():
    """Test feature removal, tech stack removal, and handling dict-based signals."""
    temp_dir = tempfile.mkdtemp()
    try:
        engine = CompetitorDriftEngine(storage_dir=temp_dir)
        target = "Enterprise Infra"

        run_1 = {
            "competitors": [
                {
                    "name": "InfraCo",
                    "pricing_summary": "$100/mo",
                    "key_features": [{"name": "Autoscaling"}, {"feature_name": "Multi-region"}],
                    "tech_stack_signals": [{"name": "Kubernetes"}, "Terraform"]
                }
            ]
        }
        engine.save_snapshot(target, run_1)

        run_2 = {
            "competitors": [
                {
                    "name": "InfraCo",
                    "pricing_summary": "$120/mo",
                    "key_features": [{"name": "Autoscaling"}],  # Multi-region removed
                    "tech_stack_signals": [{"name": "Kubernetes"}]  # Terraform removed
                }
            ]
        }
        engine.save_snapshot(target, run_2)

        drift = engine.detect_drift(target)
        assert drift["status"] == "Drift computed successfully"
        events = drift["drift_events"]

        assert any("FEATURE REMOVED" in e and "Multi-region" in e for e in events)
        assert any("TECH STACK DRIFT" in e and "Terraform" in e for e in events)
        assert any("PRICING DRIFT" in e for e in events)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

