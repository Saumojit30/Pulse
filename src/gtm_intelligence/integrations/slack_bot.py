"""Interactive Slack Bot and Slash Command Handler for Pulse."""

import json
from typing import Dict, Any, List, Optional


class SlackBotEngine:
    """Formats interactive Slack Block Kit payloads for /pulse slash commands and alerts."""

    @staticmethod
    def handle_slash_command(command_text: str, report_summary: Optional[str] = None) -> Dict[str, Any]:
        """Handle incoming /pulse slash command (e.g. '/pulse intel AcmeCorp' or '/pulse drift SaaS')."""
        tokens = command_text.strip().split(maxsplit=1)
        subcommand = tokens[0].lower() if tokens else "help"
        target = tokens[1] if len(tokens) > 1 else "General Market"

        if subcommand == "intel":
            summary = report_summary or f"Intelligence scan complete for *{target}*."
            return {
                "response_type": "in_channel",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"🎯 Pulse Intel: {target}",
                            "emoji": True
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": summary[:1800]
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "📊 View Full Battlecard"
                                },
                                "value": f"view_battlecard_{target}",
                                "action_id": "button_view_battlecard"
                            },
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "📧 Generate Outreach Campaign"
                                },
                                "value": f"outreach_{target}",
                                "action_id": "button_gen_outreach"
                            }
                        ]
                    }
                ]
            }

        elif subcommand == "drift":
            return {
                "response_type": "in_channel",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"📈 *Pulse Drift Monitor for {target}:*\nQuerying historical snapshots..."
                        }
                    }
                ]
            }

        else:
            return {
                "response_type": "ephemeral",
                "text": "💡 *Pulse Slash Commands:*\n- `/pulse intel <competitor or domain>` - Instant fact-audited battlecard.\n- `/pulse drift <domain>` - Check recent competitor drift."
            }
