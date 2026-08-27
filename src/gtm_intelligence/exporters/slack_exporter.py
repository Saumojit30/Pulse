"""Slack Webhook Exporter for GTM Intelligence System."""

import os
import json
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class SlackExporter:
    """Exports competitive battlecards and drift alerts to Slack webhooks."""

    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or os.getenv("SLACK_WEBHOOK_URL")

    def send_gtm_summary(self, target_domain: str, report_summary: str) -> Dict[str, Any]:
        """Post GTM Intelligence report summary to Slack."""
        if not self.webhook_url:
            return {"status": "skipped", "reason": "No SLACK_WEBHOOK_URL configured"}

        payload = {
            "text": f"🎯 *New GTM Intelligence Scan Completed*",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🎯 GTM Intelligence: {target_domain}"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"```{report_summary[:1500]}```"
                    }
                }
            ]
        }

        try:
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            if response.status_code == 200:
                return {"status": "success", "status_code": 200}
            else:
                return {"status": "error", "status_code": response.status_code, "text": response.text}
        except Exception as e:
            logger.error(f"Slack webhook dispatch failed: {str(e)}")
            return {"status": "failed", "error": str(e)}

    def send_drift_alert(self, target_domain: str, drift_events: list) -> Dict[str, Any]:
        """Post competitor drift alert to Slack."""
        if not self.webhook_url:
            return {"status": "skipped", "reason": "No SLACK_WEBHOOK_URL configured"}

        if not drift_events:
            return {"status": "skipped", "reason": "No drift events to report"}

        events_str = "\n".join([f"• {e}" for e in drift_events])
        payload = {
            "text": f"⚠️ *Competitor Drift Alert for {target_domain}*",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"⚠️ *Competitor Drift Detected for {target_domain}:*\n{events_str}"
                    }
                }
            ]
        }

        try:
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            return {"status": "success" if response.status_code == 200 else "error"}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
