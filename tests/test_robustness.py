"""Comprehensive edge-case and robustness test suite."""

import os
import shutil
import tempfile
import pytest
from unittest.mock import patch, MagicMock

from gtm_intelligence.tools.seltz_tool import SeltzSearchTool, SeltzAnswerTool, sanitize_query
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine
from gtm_intelligence.exporters.slack_exporter import SlackExporter
from gtm_intelligence.exporters.crm_exporter import CRMExporter


def test_sanitize_query_edge_cases():
    """Test input query sanitization under edge cases."""
    assert sanitize_query("") == "GTM Intelligence market research"
    assert sanitize_query("   ") == "GTM Intelligence market research"
    assert sanitize_query("Competitor X <script>alert('xss')</script>") == "Competitor X script alert xss script"
    long_query = "A" * 500
    assert len(sanitize_query(long_query)) <= 300


def test_seltz_search_tool_resilience():
    """Test SeltzSearchTool handling API exceptions gracefully."""
    tool = SeltzSearchTool()
    
    # Mock seltz client raising an exception
    with patch("os.getenv", return_value="fake_api_key"):
        with patch("seltz.Seltz") as mock_seltz:
            mock_client = MagicMock()
            mock_client.search.side_effect = Exception("API rate limited 429")
            mock_seltz.return_value = mock_client
            
            # Tool should catch exception, retry, and fall back without crashing
            output = tool._run("test query", max_results=2)
            assert isinstance(output, str)
            assert len(output) > 0


def test_slack_exporter_no_url():
    """Test SlackExporter handles missing webhook URL gracefully."""
    exporter = SlackExporter(webhook_url=None)
    result = exporter.send_gtm_summary("Test Domain", "Summary content")
    assert result["status"] == "skipped"
    assert result["reason"] == "No SLACK_WEBHOOK_URL configured"


def test_crm_exporter_file_saving():
    """Test CRMExporter file export and error handling."""
    temp_dir = tempfile.mkdtemp()
    try:
        valid_path = os.path.join(temp_dir, "subfolder", "crm_payload.json")
        payload = {"domain": "Test", "data": "Sample"}
        
        success = CRMExporter.export_to_json_file(valid_path, payload)
        assert success is True
        assert os.path.exists(valid_path)
    finally:
        shutil.rmtree(temp_dir)


def test_drift_engine_corrupt_data_resilience():
    """Test drift engine handling malformed snapshot files without crashing."""
    temp_dir = tempfile.mkdtemp()
    try:
        engine = CompetitorDriftEngine(storage_dir=temp_dir)
        target = "Malformed Sector"
        
        # Save snapshot with empty/missing competitor structures
        engine.save_snapshot(target, {"invalid_key": "no_competitors_here"})
        engine.save_snapshot(target, {"competitors": None})
        
        drift = engine.detect_drift(target)
        assert drift["status"] == "Drift computed successfully"
        assert isinstance(drift["drift_events"], list)
    finally:
        shutil.rmtree(temp_dir)
