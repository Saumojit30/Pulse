"""Competitor Snapshot & Drift Detection Engine.

Tracks competitor data changes over time to detect pricing shifts, feature additions,
hiring sprees, and strategic pivots with embedded SQLite WAL mode storage.
"""

import json
import os
import re
import sqlite3
from contextlib import contextmanager
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
        self.db_path = self.storage_dir / "gtm_drift.db"
        self._migrated_domains: set[str] = set()
        self._init_db()

    @contextmanager
    def _get_connection(self):
        """Yield an SQLite connection that is explicitly closed upon context exit to prevent Windows file locks."""
        conn = sqlite3.connect(str(self.db_path))
        try:
            yield conn
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def _init_db(self) -> None:
        """Initialize SQLite database with WAL mode and indexes."""
        with self._get_connection() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA busy_timeout=5000;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    target_domain TEXT NOT NULL,
                    safe_domain TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    report_json TEXT NOT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_snapshots_safe_domain_ts_id ON snapshots(safe_domain, timestamp DESC, id DESC);")
            conn.commit()

    @staticmethod
    def _to_safe_domain(target_domain: str) -> str:
        return "".join([c if c.isalnum() else "_" for c in target_domain.lower()])

    def _extract_structured_competitors(self, report_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract structured competitors from unstructured report or markdown fields."""
        if not report_data:
            return []
            
        # If competitors already provided as a valid list of dicts, return them
        comps = report_data.get("competitors")
        if isinstance(comps, list) and comps and all(isinstance(c, dict) for c in comps):
            return comps

        # Check full_report, output_summary, or report_markdown
        text = str(report_data.get("full_report") or report_data.get("report_markdown") or report_data.get("output_summary") or "")
        if not text:
            return []

        extracted_comps: List[Dict[str, Any]] = []
        
        # Regex patterns to detect competitor sections: e.g. "### Competitor: Acme" or "## Acme Corp"
        comp_matches = re.split(r'(?i)(?:^|\n)#{2,4}\s+(?:Competitor:?\s*)?([A-Za-z0-9\.\-_ ]+)', text)
        if len(comp_matches) > 1:
            for i in range(1, len(comp_matches), 2):
                name = comp_matches[i].strip()
                body = comp_matches[i+1] if i + 1 < len(comp_matches) else ""
                
                # Ignore non-competitor headers like Executive Summary, ICP, Battlecard
                if any(k in name.lower() for k in ["executive summary", "icp", "battlecard", "outreach", "recommendation", "citations"]):
                    continue
                if len(name) < 2 or len(name) > 60:
                    continue

                # Extract pricing
                pricing_match = re.search(r'(?i)(?:pricing|cost|rate|tier)[:\s]*([^\n\.]+)', body)
                pricing_str = pricing_match.group(1).strip() if pricing_match else "Standard SaaS pricing"

                # Extract features
                features = re.findall(r'(?i)[-*]\s*([^\n:]+(?:feature|integration|api|cloud|platform|support)[^\n]*)', body)
                if not features:
                    features = [line.strip("- *") for line in body.split("\n") if line.strip().startswith(("-", "*"))][:5]

                # Extract hiring signals
                hiring_match = re.findall(r'(?i)(?:hiring|open roles?|roles?)[:\s]*([^\n]+)', body)
                hiring_signals = [h.strip() for h in hiring_match] if hiring_match else []

                # Extract tech stack
                tech_match = re.findall(r'(?i)(?:tech stack|technologies|built with)[:\s]*([^\n]+)', body)
                tech_signals = [t.strip() for t in tech_match] if tech_match else []

                extracted_comps.append({
                    "name": name,
                    "pricing_summary": pricing_str,
                    "key_features": features,
                    "hiring_signals": hiring_signals,
                    "tech_stack_signals": tech_signals
                })

        return extracted_comps

    def _migrate_existing_json_files(self, safe_domain: str) -> None:
        """Migrate legacy JSON files for this domain to SQLite (cached to avoid repeat filesystem globbing)."""
        if safe_domain in self._migrated_domains:
            return
        self._migrated_domains.add(safe_domain)

        pattern = f"{safe_domain}_*.json"
        matching_files = list(self.storage_dir.glob(pattern))
        if not matching_files:
            return

        try:
            with self._get_connection() as conn:
                conn.execute("PRAGMA busy_timeout=5000;")
                cur = conn.cursor()
                for file_path in matching_files:
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        ts = data.get("timestamp") or datetime.now().isoformat()
                        domain = data.get("target_domain", safe_domain)
                        report = data.get("report") or {}
                        report_str = json.dumps(report)
                        
                        cur.execute("SELECT id FROM snapshots WHERE safe_domain = ? AND timestamp = ?", (safe_domain, ts))
                        if not cur.fetchone():
                            cur.execute(
                                "INSERT INTO snapshots (target_domain, safe_domain, timestamp, report_json) VALUES (?, ?, ?, ?)",
                                (domain, safe_domain, ts, report_str)
                            )
                    except Exception:
                        continue
                conn.commit()
        except Exception:
            pass

    def save_snapshot(self, target_domain: str, report_data: Dict[str, Any]) -> str:
        """Save a timestamped GTM report snapshot to SQLite WAL store and disk JSON."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        safe_domain = self._to_safe_domain(target_domain)
        file_path = self.storage_dir / f"{safe_domain}_{timestamp}.json"
        
        # Ensure report_data is a dictionary
        if not isinstance(report_data, dict):
            report_data = {"raw_report": str(report_data)}

        # Enrich with structured competitors if missing
        if "competitors" not in report_data or not report_data["competitors"]:
            extracted = self._extract_structured_competitors(report_data)
            if extracted:
                report_data["competitors"] = extracted

        iso_ts = datetime.now().isoformat()
        report_json_str = json.dumps(report_data)

        # 1. Insert into SQLite store
        try:
            with self._get_connection() as conn:
                conn.execute("PRAGMA busy_timeout=5000;")
                conn.execute(
                    "INSERT INTO snapshots (target_domain, safe_domain, timestamp, report_json) VALUES (?, ?, ?, ?)",
                    (target_domain, safe_domain, iso_ts, report_json_str)
                )
                conn.commit()
        except Exception:
            pass

        # 2. Write JSON file for backwards compatibility
        snapshot_payload = {
            "target_domain": target_domain,
            "timestamp": iso_ts,
            "report": report_data
        }
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(snapshot_payload, f, indent=2)
            
        return str(file_path)

    def get_latest_snapshots(self, target_domain: str, limit: int = 2) -> List[Dict[str, Any]]:
        """Retrieve recent snapshots for a domain ordered by newest first from SQLite with JSON fallback."""
        safe_domain = self._to_safe_domain(target_domain)
        self._migrate_existing_json_files(safe_domain)

        snapshots: List[Dict[str, Any]] = []
        try:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute(
                    "SELECT target_domain, timestamp, report_json FROM snapshots WHERE safe_domain = ? ORDER BY timestamp DESC, id DESC LIMIT ?",
                    (safe_domain, limit)
                )
                rows = cur.fetchall()
                for row in rows:
                    try:
                        rep = json.loads(row[2])
                    except Exception:
                        rep = {}
                    snapshots.append({
                        "target_domain": row[0],
                        "timestamp": row[1],
                        "report": rep
                    })
        except Exception:
            pass

        # Fallback to filesystem if SQLite had insufficient rows
        if len(snapshots) < limit:
            pattern = f"{safe_domain}_*.json"
            matching_files = sorted(self.storage_dir.glob(pattern), reverse=True)
            for file_path in matching_files:
                if len(snapshots) >= limit:
                    break
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if not any(s["timestamp"] == data.get("timestamp") for s in snapshots):
                            snapshots.append(data)
                except Exception:
                    continue

        return snapshots

    def detect_drift(self, target_domain: str) -> Dict[str, Any]:
        """Calculate delta change between the latest two runs for a domain, comparing pricing, features, tech stack, and hiring."""
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

        if not isinstance(latest_list, list):
            latest_list = []
        if not isinstance(prev_list, list):
            prev_list = []

        latest_comps = {c.get("name"): c for c in latest_list if isinstance(c, dict) and c.get("name")}
        prev_comps = {c.get("name"): c for c in prev_list if isinstance(c, dict) and c.get("name")}
        
        # 1. Check for removed competitors
        for name in prev_comps:
            if name not in latest_comps:
                drift_events.append(f"[COMPETITOR REMOVED] Competitor '{name}' was not detected in latest scan.")

        # 2. Check for new competitors and changes in existing competitors
        for name, data in latest_comps.items():
            if name not in prev_comps:
                drift_events.append(f"[NEW COMPETITOR] Competitor '{name}' detected in latest scan.")
            else:
                prev_data = prev_comps[name]
                
                # Compare pricing
                latest_pricing = data.get("pricing_summary")
                prev_pricing = prev_data.get("pricing_summary")
                if latest_pricing and prev_pricing and latest_pricing != prev_pricing:
                    drift_events.append(f"[PRICING DRIFT] Competitor '{name}' pricing changed from '{prev_pricing}' to '{latest_pricing}'.")
                
                # Compare hiring signals
                def _to_clean_str_set(items):
                    res = set()
                    for it in (items or []):
                        if isinstance(it, str) and it.strip():
                            res.add(it.strip())
                        elif isinstance(it, dict):
                            val = it.get("role") or it.get("title") or it.get("name") or str(it)
                            if val and val.strip():
                                res.add(val.strip())
                        elif it:
                            res.add(str(it).strip())
                    return res

                latest_hiring = _to_clean_str_set(data.get("hiring_signals"))
                prev_hiring = _to_clean_str_set(prev_data.get("hiring_signals"))
                new_hiring = latest_hiring - prev_hiring
                removed_hiring = prev_hiring - latest_hiring
                if new_hiring:
                    drift_events.append(f"[HIRING DRIFT] Competitor '{name}' introduced new hiring signals: {sorted(list(new_hiring))}.")
                if removed_hiring:
                    drift_events.append(f"[HIRING DRIFT] Competitor '{name}' closed hiring roles: {sorted(list(removed_hiring))}.")
                
                # Compare key features ([FEATURE ADDED] / [FEATURE REMOVED])
                def _get_feature_names(feat_list):
                    names = set()
                    for f in (feat_list or []):
                        if isinstance(f, dict):
                            val = f.get("feature_name") or f.get("name") or str(f)
                            if val and val.strip():
                                names.add(val.strip())
                        elif isinstance(f, str) and f.strip():
                            names.add(f.strip())
                        elif f:
                            names.add(str(f).strip())
                    return names

                latest_features = _get_feature_names(data.get("key_features"))
                prev_features = _get_feature_names(prev_data.get("key_features"))
                added_features = latest_features - prev_features
                removed_features = prev_features - latest_features
                if added_features:
                    drift_events.append(f"[FEATURE ADDED] Competitor '{name}' introduced new features: {sorted(list(added_features))}.")
                if removed_features:
                    drift_events.append(f"[FEATURE REMOVED] Competitor '{name}' discontinued features: {sorted(list(removed_features))}.")

                # Compare tech stack signals
                latest_tech = _to_clean_str_set(data.get("tech_stack_signals"))
                prev_tech = _to_clean_str_set(prev_data.get("tech_stack_signals"))
                new_tech = latest_tech - prev_tech
                removed_tech = prev_tech - latest_tech
                if new_tech or removed_tech:
                    diff_str = []
                    if new_tech:
                        diff_str.append(f"+{sorted(list(new_tech))}")
                    if removed_tech:
                        diff_str.append(f"-{sorted(list(removed_tech))}")
                    drift_events.append(f"[TECH STACK DRIFT] Competitor '{name}' updated tech stack signals: {' '.join(diff_str)}.")
                    
        return {
            "status": "Drift computed successfully",
            "compared_dates": [snapshots[1].get("timestamp", ""), snapshots[0].get("timestamp", "")],
            "drift_events": drift_events
        }
