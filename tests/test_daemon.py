"""Unit tests for PulseSensingDaemon."""

import os
import shutil
import tempfile
import json
import pytest
from unittest.mock import patch, MagicMock

from gtm_intelligence.workers.daemon import PulseSensingDaemon


def test_daemon_watchlist_management():
    """Test saving and loading watchlist from disk."""
    temp_dir = tempfile.mkdtemp()
    try:
        watchlist_file = os.path.join(temp_dir, "test_watchlist.json")
        daemon = PulseSensingDaemon(watchlist_file=watchlist_file)
        
        # Default fallback list
        assert len(daemon.watchlist) > 0
        
        # Save custom watchlist
        daemon.save_watchlist(["Snowflake", "Datadog", "Linear"])
        assert os.path.exists(watchlist_file)
        
        # Reload daemon from same file
        new_daemon = PulseSensingDaemon(watchlist_file=watchlist_file)
        assert new_daemon.watchlist == ["Snowflake", "Datadog", "Linear"]
    finally:
        shutil.rmtree(temp_dir)


def test_daemon_scan_target_execution():
    """Test daemon scan execution with mocked crew."""
    temp_dir = tempfile.mkdtemp()
    try:
        watchlist_file = os.path.join(temp_dir, "watchlist.json")
        daemon = PulseSensingDaemon(watchlist=["TestSaaS"], watchlist_file=watchlist_file)
        
        with patch("gtm_intelligence.workers.daemon.GtmIntelligenceCrew") as mock_crew_cls:
            mock_crew = MagicMock()
            mock_crew.kickoff.return_value = "# Report for TestSaaS"
            mock_instance = MagicMock()
            mock_instance.crew.return_value = mock_crew
            mock_crew_cls.return_value = mock_instance
            
            results = daemon.run_single_cycle()
            assert len(results) == 1
            assert results[0]["target_domain"] == "TestSaaS"
            assert results[0]["status"] == "SUCCESS"
    finally:
        shutil.rmtree(temp_dir)
