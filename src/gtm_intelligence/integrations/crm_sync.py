"""CRM Bi-Directional Deal Stage Sync for Pulse."""

import json
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class CRMDealWebhookPayload(BaseModel):
    """Payload representing a deal update from HubSpot or Salesforce."""
    deal_id: str = Field(..., description="Unique CRM Deal ID")
    deal_name: str = Field(..., description="Deal opportunity name")
    deal_stage: str = Field(..., description="Current pipeline stage (e.g., 'Discovery', 'Demo', 'Proposal')")
    deal_amount_usd: Optional[float] = Field(default=0.0, description="Estimated deal value")
    competitor_tagged: Optional[str] = Field(default=None, description="Competitor mentioned or selected in CRM")
    owner_email: Optional[str] = Field(default=None, description="Sales Rep / Deal Owner email")


class CRMSyncEngine:
    """Processes CRM deal webhooks and prepares contextual battlecard attachments."""

    def process_deal_event(self, deal: CRMDealWebhookPayload, battlecard_text: Optional[str] = None) -> Dict[str, Any]:
        """Process deal event and attach competitive battlecard if competitor is tagged."""
        if not deal.competitor_tagged:
            return {
                "action": "IGNORED",
                "deal_id": deal.deal_id,
                "reason": "No competitor tagged on deal"
            }

        content = battlecard_text or f"Automated Pulse Battlecard for {deal.competitor_tagged}"
        
        hubspot_engagement = {
            "engagement": {
                "active": True,
                "type": "NOTE",
                "timestamp": None
            },
            "associations": {
                "dealIds": [deal.deal_id]
            },
            "metadata": {
                "body": (
                    f"<h3>🎯 Pulse Competitive Intel: {deal.competitor_tagged}</h3>"
                    f"<p><b>Deal:</b> {deal.deal_name} (${deal.deal_amount_usd:,.2f})</p>"
                    f"<hr/>"
                    f"<div>{content}</div>"
                )
            }
        }

        return {
            "action": "BATTLECARD_ATTACHED",
            "deal_id": deal.deal_id,
            "competitor": deal.competitor_tagged,
            "rep_alert_email": deal.owner_email,
            "hubspot_payload": hubspot_engagement
        }
