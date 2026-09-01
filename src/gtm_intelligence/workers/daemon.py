"""Autonomous 24/7 Background Sensing Daemon for Pulse."""

import os
import json
import time
import logging
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from gtm_intelligence.crew import GtmIntelligenceCrew
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine
from gtm_intelligence.exporters.slack_exporter import SlackExporter
from gtm_intelligence.logging.audit_logger import PulseAuditLogger
from gtm_intelligence.tools.seltz_tool import set_active_audit_context, clear_active_audit_context

logger = logging.getLogger(__name__)


class PulseSensingDaemon:
    """Headless 24/7 background sensing worker that monitors watch-list competitors and fires drift alerts."""

    def __init__(
        self,
        watchlist: Optional[List[str]] = None,
        watchlist_file: Optional[str] = None,
        check_interval_seconds: int = 86400
    ):
        self.check_interval_seconds = check_interval_seconds
        self.watchlist = watchlist or []
        self.watchlist_file = Path(watchlist_file) if watchlist_file else Path("watchlist.json")
        self.drift_engine = CompetitorDriftEngine()
        self.slack_exporter = SlackExporter()
        self.audit_logger = PulseAuditLogger()
        self._running = False
        
        self.load_watchlist()

    def load_watchlist(self) -> None:
        """Load watchlist from file or default list."""
        if self.watchlist_file.exists():
            try:
                with open(self.watchlist_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.watchlist = data.get("watchlist", self.watchlist)
            except Exception as e:
                logger.warning(f"Failed to load watchlist file: {str(e)}")
        if not self.watchlist:
            self.watchlist = ["AI Developer Tools", "Developer Security Platforms"]

    def save_watchlist(self, items: List[str]) -> None:
        """Save updated watchlist to file."""
        self.watchlist = items
        with open(self.watchlist_file, "w", encoding="utf-8") as f:
            json.dump({"watchlist": self.watchlist, "updated_at": datetime.now().isoformat()}, f, indent=2)

    def scan_target(self, target_domain: str) -> Dict[str, Any]:
        """Perform a single target scan, compute drift, and dispatch alerts."""
        logger.info(f"[*] Pulse Daemon: Starting scan for '{target_domain}'...")
        run_record = self.audit_logger.create_run_log(target_domain, mode="deep")
        set_active_audit_context(self.audit_logger, run_record)

        try:
            crew = GtmIntelligenceCrew(mode="deep").crew()
            result_markdown = str(crew.kickoff(inputs={"target_domain": target_domain}))

            # Save structured snapshot with auto-extracted competitor models
            snapshot_path = self.drift_engine.save_snapshot(target_domain, {
                "target_domain": target_domain,
                "output_summary": result_markdown[:500],
                "full_report": result_markdown
            })

            # Check for competitor drift
            drift_res = self.drift_engine.detect_drift(target_domain)
            drift_events = drift_res.get("drift_events", [])

            if drift_events:
                logger.warning(f"[!] Drift detected for '{target_domain}': {len(drift_events)} events.")
                self.slack_exporter.send_drift_alert(target_domain, drift_events)

            self.audit_logger.finalize_run(run_record, status="SUCCESS")

            return {
                "target_domain": target_domain,
                "status": "SUCCESS",
                "drift_events_count": len(drift_events),
                "snapshot_path": snapshot_path
            }

        except Exception as e:
            logger.error(f"[X] Daemon scan failed for '{target_domain}': {str(e)}")
            self.audit_logger.finalize_run(run_record, status=f"FAILED: {str(e)}")
            return {
                "target_domain": target_domain,
                "status": "FAILED",
                "error": str(e)
            }
        finally:
            clear_active_audit_context()

    def run_single_cycle(self) -> List[Dict[str, Any]]:
        """Run a single monitoring cycle across all watchlist targets synchronously."""
        results = []
        for target in list(self.watchlist):
            res = self.scan_target(target)
            results.append(res)
        return results

    async def run_forever(self) -> None:
        """Run the 24/7 background sensing loop using asyncio.to_thread to avoid blocking."""
        self._running = True
        logger.info(f"[*] Pulse Sensing Daemon started. Watchlist count: {len(self.watchlist)}")
        while self._running:
            for target in list(self.watchlist):
                if not self._running:
                    break
                try:
                    await asyncio.to_thread(self.scan_target, target)
                except Exception as e:
                    logger.error(f"Error in background sensing cycle for {target}: {str(e)}")
            try:
                await asyncio.sleep(self.check_interval_seconds)
            except asyncio.CancelledError:
                break

    def stop(self) -> None:
        """Stop the daemon loop."""
        self._running = False
