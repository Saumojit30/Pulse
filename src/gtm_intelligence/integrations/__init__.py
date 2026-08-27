"""Integrations module for Pulse."""

from .crm_sync import CRMSyncEngine, CRMDealWebhookPayload
from .slack_bot import SlackBotEngine
from .outbound_sync import OutboundCampaignDispatcher

__all__ = [
    "CRMSyncEngine",
    "CRMDealWebhookPayload",
    "SlackBotEngine",
    "OutboundCampaignDispatcher"
]
