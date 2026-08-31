"""Persistent SQLite Store for Target Accounts in Pulse GTM OS."""

import json
import sqlite3
import os
import uuid
from contextlib import contextmanager
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path


class AccountStore:
    """Manages target accounts, firmographics, and enriched intelligence in SQLite."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path:
            self.db_path = Path(db_path)
        else:
            storage_dir = Path(os.getcwd()) / "gtm_history"
            storage_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = storage_dir / "gtm_accounts.db"
        self._init_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(str(self.db_path))
        try:
            yield conn
        finally:
            try:
                conn.close()
            except Exception:
                pass

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA busy_timeout=5000;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    domain TEXT NOT NULL UNIQUE,
                    industry TEXT,
                    headquarters TEXT,
                    employees TEXT,
                    estimated_arr TEXT,
                    icp_fit_score INTEGER DEFAULT 80,
                    stage TEXT DEFAULT 'Discovery',
                    primary_competitor TEXT,
                    trigger_event TEXT,
                    intel_status TEXT DEFAULT 'Ready',
                    lead_owner TEXT DEFAULT 'Unassigned',
                    intel_json TEXT,
                    decision_makers_json TEXT,
                    signals_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_accounts_domain ON accounts(domain);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_accounts_updated ON accounts(updated_at DESC);")
            conn.commit()
        
        # Seed default real-world target accounts if table is empty
        if self.count_accounts() == 0:
            self._seed_default_accounts()

    def _seed_default_accounts(self) -> None:
        seeds = [
            {
                "id": "acc_datadog",
                "name": "Acme Cloud",
                "domain": "acmecloud.io",
                "industry": "Developer Infrastructure",
                "headquarters": "San Francisco, CA",
                "employees": "220 employees",
                "estimated_arr": "$14.5M ARR",
                "icp_fit_score": 94,
                "stage": "Evaluation",
                "primary_competitor": "Datadog",
                "trigger_event": "Migrating from monolith to Kubernetes microservices",
                "intel_status": "Drift Alert",
                "lead_owner": "Alex V.",
                "decision_makers": [
                    {
                        "name": "Elena Rostova",
                        "title": "VP of Engineering",
                        "linkedinUrl": "https://linkedin.com/in/elena-rostova",
                        "relevanceHook": "Leading the Q3 multi-cloud telemetry migration",
                        "emailStatus": "Verified"
                    },
                    {
                        "name": "Marcus Chen",
                        "title": "Head of Infrastructure & SRE",
                        "linkedinUrl": "https://linkedin.com/in/marcus-chen-sre",
                        "relevanceHook": "Complaining publicly about Datadog custom metrics billing",
                        "emailStatus": "Verified"
                    }
                ],
                "signals": [
                    {
                        "id": "sig_1",
                        "timestamp": "2 hours ago",
                        "type": "Pricing Change",
                        "description": "Datadog introduced 35% surcharge on container APM ingest.",
                        "severity": "High"
                    },
                    {
                        "id": "sig_2",
                        "timestamp": "1 day ago",
                        "type": "Hiring Surge",
                        "description": "Opened 4 new Staff Kubernetes SRE positions in Austin.",
                        "severity": "Medium"
                    }
                ],
                "intel": {
                    "executiveSummary": "Acme Cloud is actively re-architecting their observability pipeline. Current Datadog contract renewal is slated for next quarter with an estimated $180k price surge. Decision-maker Elena Rostova is actively seeking cost-predictable open-telemetry native alternatives.",
                    "painPoints": [
                        "Uncapped custom metrics billing causing quarterly invoice shocks",
                        "Siloed logs and traces making MTTR exceed 45 minutes",
                        "Vendor lock-in preventing multi-region AWS/GCP failover"
                    ],
                    "buyingTriggers": [
                        "Upcoming annual enterprise agreement renewal in 60 days",
                        "Staff SRE team expansion struggling with legacy dashboards"
                    ],
                    "battlecards": [
                        {
                            "competitorName": "Datadog",
                            "winThemes": [
                                "Fixed predictable pricing model with 0 custom metric penalties",
                                "Native OpenTelemetry compatibility with instant drop-in agent",
                                "Sub-second query response on petabyte-scale tracing"
                            ],
                            "keyDifferentiators": [
                                "No 15-month data retention paywall",
                                "Open source client SDKs with zero proprietary agent bloat",
                                "Unified single-agent deployment across all cloud providers"
                            ],
                            "objectionsAndHandling": [
                                {
                                    "objection": "Our entire engineering team already built 80+ custom Datadog dashboards.",
                                    "counterPositioning": "We provide a 1-click JSON dashboard import tool that maps existing Datadog JSON definitions directly into our views without rewriting alert rules.",
                                    "proofPoint": "Migrated 400+ dashboards for a FinTech unicorn in 48 hours."
                                }
                            ],
                            "landminesToLay": [
                                "Ask Elena what percentage of their monthly invoice comes from unpredictable unindexed log spikes."
                            ],
                            "verificationConfidence": "High"
                        }
                    ],
                    "outreach": {
                        "targetPersona": "VP of Engineering",
                        "valuePropHook": "Cut observability spend by 50% without rewriting dashboards",
                        "emailSequence": [
                            {
                                "stepNumber": 1,
                                "subjectLine": "Acme's telemetry spend ahead of Q3 renewal",
                                "bodyText": "Hi Elena,\n\nNoticed Acme Cloud is expanding the Kubernetes infrastructure footprint in Austin.\n\nMost VP Eng leaders we speak with at this growth stage are hit with 40%+ custom metrics overages on Datadog contracts right around renewal.\n\nWe built an OpenTelemetry-native platform with flat predictable pricing and a 1-click dashboard migration tool.\n\nOpen to reviewing our 2-page Datadog displacement breakdown?",
                                "callToAction": "Open to reviewing our 2-page breakdown?"
                            }
                        ],
                        "linkedinTouchpoints": [
                            "Elena, great presentation at KubeCon on telemetry pipelines!"
                        ]
                    },
                    "quality": {
                        "overallScore": 0.96,
                        "grade": "A",
                        "passed": True,
                        "groundingScore": 0.98,
                        "citedUrlsCount": 5,
                        "citedUrls": [
                            "https://acmecloud.io/careers",
                            "https://datadog.com/pricing",
                            "https://news.ycombinator.com/item?id=38912"
                        ]
                    },
                    "tokensCostUsd": 0.0215,
                    "lastScannedAt": "2 hours ago"
                }
            },
            {
                "id": "acc_snowflake",
                "name": "Globex Systems",
                "domain": "globex.ai",
                "industry": "Enterprise Analytics",
                "headquarters": "New York, NY",
                "employees": "540 employees",
                "estimated_arr": "$42.0M ARR",
                "icpFitScore": 88,
                "stage": "Competitor Renewal",
                "primaryCompetitor": "Snowflake",
                "triggerEvent": "Snowflake annual commit expiring in 45 days; warehouse spend escalating",
                "intelStatus": "Ready",
                "leadOwner": "Sarah M.",
                "decisionMakers": [
                    {
                        "name": "David K.",
                        "title": "Chief Data Officer",
                        "linkedinUrl": "https://linkedin.com/in/david-k-data",
                        "relevanceHook": "Mandated a 30% reduction in cloud compute burn for FY26",
                        "emailStatus": "Verified"
                    }
                ],
                "signals": [
                    {
                        "id": "sig_3",
                        "timestamp": "3 days ago",
                        "type": "New Feature",
                        "description": "Released open-source DuckDB data processing connector.",
                        "severity": "Medium"
                    }
                ],
                "intel": {
                    "executiveSummary": "Globex is evaluating decoupling compute and storage to stop warehouse credit burn on ad-hoc analytical queries.",
                    "painPoints": ["Warehouse idle compute credits draining budget", "Complex multi-region replication charges"],
                    "buyingTriggers": ["CFO audit on cloud infrastructure costs"],
                    "battlecards": [
                        {
                            "competitorName": "Snowflake",
                            "winThemes": ["Zero idle compute charges with serverless query execution", "Direct query on Apache Iceberg without data movement"],
                            "keyDifferentiators": ["100% open Iceberg/Parquet storage", "BYOC (Bring Your Own Cloud) deployment"],
                            "objectionsAndHandling": [
                                {
                                    "objection": "Our data analysts only know Snowflake SQL.",
                                    "counterPositioning": "Our engine is ANSI-SQL compliant and integrates directly with dbt and Looker.",
                                    "proofPoint": "Zero SQL changes required for 98% of queries."
                                }
                            ],
                            "landminesToLay": ["Ask David how much they spent on auto-resume warehouses that ran for only 5 seconds."],
                            "verificationConfidence": "High"
                        }
                    ],
                    "outreach": {
                        "targetPersona": "Chief Data Officer",
                        "valuePropHook": "Decouple Iceberg analytics from warehouse credit burn",
                        "emailSequence": [
                            {
                                "stepNumber": 1,
                                "subjectLine": "Decoupling storage from warehouse compute at Globex",
                                "bodyText": "Hi David,\n\nReaching out because Snowflake annual commits often force teams to over-provision credits.\n\nWe let teams run fast SQL on open Apache Iceberg tables without paying for idle warehouse runtime.\n\nWorth a brief chat this week?",
                                "callToAction": "Worth a brief chat this week?"
                            }
                        ],
                        "linkedinTouchpoints": ["David, impressive architecture on Globex's data lakehouse!"]
                    },
                    "quality": {
                        "overallScore": 0.91,
                        "grade": "A",
                        "passed": True,
                        "groundingScore": 0.92,
                        "citedUrlsCount": 3,
                        "citedUrls": ["https://globex.ai/product", "https://snowflake.com/pricing"]
                    },
                    "tokensCostUsd": 0.0121,
                    "lastScannedAt": "Yesterday"
                }
            }
        ]
        for s in seeds:
            self.save_account(s)

    def count_accounts(self) -> int:
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM accounts;")
            row = cur.fetchone()
            return row[0] if row else 0

    def list_accounts(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, name, domain, industry, headquarters, employees, estimated_arr,
                       icp_fit_score, stage, primary_competitor, trigger_event, intel_status,
                       lead_owner, intel_json, decision_makers_json, signals_json, created_at, updated_at
                FROM accounts ORDER BY updated_at DESC;
            """)
            rows = cur.fetchall()
            results = []
            for r in rows:
                try:
                    intel = json.loads(r[13]) if r[13] else None
                except Exception:
                    intel = None
                try:
                    dms = json.loads(r[14]) if r[14] else []
                except Exception:
                    dms = []
                try:
                    sigs = json.loads(r[15]) if r[15] else []
                except Exception:
                    sigs = []

                results.append({
                    "id": r[0],
                    "name": r[1],
                    "domain": r[2],
                    "industry": r[3] or "Technology",
                    "headquarters": r[4] or "United States",
                    "employees": r[5] or "100+ employees",
                    "estimatedArr": r[6] or "$10M ARR",
                    "icpFitScore": r[7] or 80,
                    "stage": r[8] or "Discovery",
                    "primaryCompetitor": r[9] or "Incumbent",
                    "triggerEvent": r[10] or "Evaluating modern tooling",
                    "intelStatus": r[11] or "Ready",
                    "leadOwner": r[12] or "Unassigned",
                    "intel": intel,
                    "decisionMakers": dms,
                    "signals": sigs,
                    "createdAt": r[16],
                    "updatedAt": r[17]
                })
            return results

    def get_account_by_domain(self, domain: str) -> Optional[Dict[str, Any]]:
        clean_domain = domain.lower().strip()
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, name, domain, industry, headquarters, employees, estimated_arr,
                       icp_fit_score, stage, primary_competitor, trigger_event, intel_status,
                       lead_owner, intel_json, decision_makers_json, signals_json, created_at, updated_at
                FROM accounts WHERE LOWER(domain) = ? LIMIT 1;
            """, (clean_domain,))
            r = cur.fetchone()
            if not r:
                return None
            try:
                intel = json.loads(r[13]) if r[13] else None
            except Exception:
                intel = None
            try:
                dms = json.loads(r[14]) if r[14] else []
            except Exception:
                dms = []
            try:
                sigs = json.loads(r[15]) if r[15] else []
            except Exception:
                sigs = []

            return {
                "id": r[0],
                "name": r[1],
                "domain": r[2],
                "industry": r[3] or "Technology",
                "headquarters": r[4] or "United States",
                "employees": r[5] or "100+ employees",
                "estimatedArr": r[6] or "$10M ARR",
                "icpFitScore": r[7] or 80,
                "stage": r[8] or "Discovery",
                "primaryCompetitor": r[9] or "Incumbent",
                "triggerEvent": r[10] or "Evaluating modern tooling",
                "intelStatus": r[11] or "Ready",
                "leadOwner": r[12] or "Unassigned",
                "intel": intel,
                "decisionMakers": dms,
                "signals": sigs,
                "createdAt": r[16],
                "updatedAt": r[17]
            }

    def save_account(self, data: Dict[str, Any]) -> str:
        acc_id = data.get("id") or f"acc_{uuid.uuid4().hex[:8]}"
        domain = data.get("domain", "").lower().strip()
        name = data.get("name") or domain.split(".")[0].capitalize()
        now = datetime.now().isoformat()

        intel_str = json.dumps(data.get("intel")) if data.get("intel") else None
        dms_str = json.dumps(data.get("decision_makers") or data.get("decisionMakers") or [])
        sigs_str = json.dumps(data.get("signals") or [])

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO accounts (
                    id, name, domain, industry, headquarters, employees, estimated_arr,
                    icp_fit_score, stage, primary_competitor, trigger_event, intel_status,
                    lead_owner, intel_json, decision_makers_json, signals_json, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(domain) DO UPDATE SET
                    name = excluded.name,
                    industry = COALESCE(excluded.industry, accounts.industry),
                    headquarters = COALESCE(excluded.headquarters, accounts.headquarters),
                    employees = COALESCE(excluded.employees, accounts.employees),
                    estimated_arr = COALESCE(excluded.estimated_arr, accounts.estimated_arr),
                    icp_fit_score = COALESCE(excluded.icp_fit_score, accounts.icp_fit_score),
                    stage = COALESCE(excluded.stage, accounts.stage),
                    primary_competitor = COALESCE(excluded.primary_competitor, accounts.primary_competitor),
                    trigger_event = COALESCE(excluded.trigger_event, accounts.trigger_event),
                    intel_status = COALESCE(excluded.intel_status, accounts.intel_status),
                    lead_owner = COALESCE(excluded.lead_owner, accounts.lead_owner),
                    intel_json = COALESCE(excluded.intel_json, accounts.intel_json),
                    decision_makers_json = COALESCE(excluded.decision_makers_json, accounts.decision_makers_json),
                    signals_json = COALESCE(excluded.signals_json, accounts.signals_json),
                    updated_at = excluded.updated_at;
            """, (
                acc_id,
                name,
                domain,
                data.get("industry", "Technology"),
                data.get("headquarters", "United States"),
                data.get("employees", "100+ employees"),
                data.get("estimatedArr") or data.get("estimated_arr", "$10M ARR"),
                data.get("icpFitScore") or data.get("icp_fit_score", 80),
                data.get("stage", "Discovery"),
                data.get("primaryCompetitor") or data.get("primary_competitor", "Incumbent"),
                data.get("triggerEvent") or data.get("trigger_event", "Evaluating modern tooling"),
                data.get("intelStatus") or data.get("intel_status", "Ready"),
                data.get("leadOwner") or data.get("lead_owner", "Unassigned"),
                intel_str,
                dms_str,
                sigs_str,
                now,
                now
            ))
            conn.commit()
        return acc_id

    def update_intel(self, domain: str, intel_data: Dict[str, Any], status: str = "Ready") -> bool:
        clean_domain = domain.lower().strip()
        now = datetime.now().isoformat()
        intel_str = json.dumps(intel_data)
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                UPDATE accounts 
                SET intel_json = ?, intel_status = ?, updated_at = ?
                WHERE LOWER(domain) = ?;
            """, (intel_str, status, now, clean_domain))
            conn.commit()
            return cur.rowcount > 0

    def delete_account(self, account_id: str) -> bool:
        with self._get_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM accounts WHERE id = ? OR LOWER(domain) = ?;", (account_id, account_id.lower().strip()))
            conn.commit()
            return cur.rowcount > 0
