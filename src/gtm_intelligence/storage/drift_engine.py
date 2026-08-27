"""Competitor Snapshot & Drift Detection Engine.

Tracks competitor data changes over time to detect pricing shifts, feature additions,
hiring sprees, and strategic pivots.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path


class CompetitorDriftEngine:
    """Stores and compares historical GTM Intelligence runs to calculate competitor drift."""

    def __init__(self, storage_dir: Optional[str] = None):
        if storage_dir:
            self.storage_dir = Path(storage_dir)
        else:
            self.storage_dir = Path(os.getcwd()) / "gtm_history"
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def save_snapshot(self, target_domain: str, report_data: Dict[str, Any]) -> str:
        """Save a timestamped GTM report snapshot."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        safe_domain = "".join([c if c.isalnum() else "_" for c in target_domain.lower()])
        file_path = self.storage_dir / f"{safe_domain}_{timestamp}.json"
        
        snapshot_payload = {
            "target_domain": target_domain,
            "timestamp": datetime.now().isoformat(),
            "report": report_data
        }
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(snapshot_payload, f, indent=2)
            
        return str(file_path)

    def get_latest_snapshots(self, target_domain: str, limit: int = 2) -> List[Dict[str, Any]]:
        """Retrieve recent snapshots for a domain ordered by newest first."""
        safe_domain = "".join([c if c.isalnum() else "_" for c in target_domain.lower()])
        pattern = f"{safe_domain}_*.json"
        matching_files = sorted(self.storage_dir.glob(pattern), reverse=True)
        
        snapshots = []
        for file_path in matching_files[:limit]:
            with open(file_path, "r", encoding="utf-8") as f:
                snapshots.append(json.load(f))
                
        return snapshots

    def detect_drift(self, target_domain: str) -> Dict[str, Any]:
        """Calculate delta change between the latest two runs for a domain."""
        snapshots = self.get_latest_snapshots(target_domain, limit=2)
        if len(snapshots) < 2:
            return {
                "status": "Insufficient history",
                "message": "At least 2 historical runs are needed to compute competitor drift.",
                "drift_events": []
            }
            
        latest = snapshots[0].get("report") or {}
        previous = snapshots[1].get("report") or {}
        
        drift_events = []
        
        # Safely extract competitors list
        latest_list = latest.get("competitors") or []
        prev_list = previous.get("competitors") or []

        latest_comps = {c.get("name"): c for c in latest_list if isinstance(c, dict) and c.get("name")}
        prev_comps = {c.get("name"): c for c in prev_list if isinstance(c, dict) and c.get("name")}
        
        for name, data in latest_comps.items():
            if name not in prev_comps:
                drift_events.append(f"[NEW COMPETITOR] Competitor '{name}' detected in latest scan.")
            else:
                prev_data = prev_comps[name]
                # Compare pricing
                if data.get("pricing_summary") != prev_data.get("pricing_summary"):
                    drift_events.append(f"[PRICING DRIFT] Competitor '{name}' pricing changed from '{prev_data.get('pricing_summary')}' to '{data.get('pricing_summary')}'.")
                # Compare hiring signals
                latest_hiring = set(data.get("hiring_signals") or [])
                prev_hiring = set(prev_data.get("hiring_signals") or [])
                new_hiring = latest_hiring - prev_hiring
                if new_hiring:
                    drift_events.append(f"[HIRING DRIFT] Competitor '{name}' introduced new hiring signals: {list(new_hiring)}.")
                    
        return {
            "status": "Drift computed successfully",
            "compared_dates": [snapshots[1]["timestamp"], snapshots[0]["timestamp"]],
            "drift_events": drift_events
        }
