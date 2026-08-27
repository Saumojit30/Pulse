"""Unit tests for Pulse Integrations (CRM Sync, Slack Bot, Outbound Dispatcher)."""

import pytest
from gtm_intelligence.integrations.crm_sync import CRMSyncEngine, CRMDealWebhookPayload
from gtm_intelligence.integrations.slack_bot import SlackBotEngine
from gtm_intelligence.integrations.outbound_sync import OutboundCampaignDispatcher
from gtm_intelligence.models.gtm_models import OutreachCampaign, EmailTemplate


def test_crm_sync_engine():
    """Test CRMSyncEngine creates proper HubSpot deal payload."""
    engine = CRMSyncEngine()
    
    # Deal with competitor
    deal = CRMDealWebhookPayload(
        deal_id="deal_12345",
        deal_name="Acme Enterprise Tier",
        deal_stage="Proposal",
        deal_amount_usd=50000.0,
        competitor_tagged="CompetitorX",
        owner_email="rep@mycompany.com"
    )
    
    res = engine.process_deal_event(deal, battlecard_text="Why we win vs CompetitorX")
    assert res["action"] == "BATTLECARD_ATTACHED"
    assert res["competitor"] == "CompetitorX"
    assert "dealIds" in res["hubspot_payload"]["associations"]
    assert res["hubspot_payload"]["associations"]["dealIds"] == ["deal_12345"]
    
    # Deal without competitor
    deal_no_comp = CRMDealWebhookPayload(
        deal_id="deal_999",
        deal_name="Inbound Small Deal",
        deal_stage="Discovery"
    )
    res_no_comp = engine.process_deal_event(deal_no_comp)
    assert res_no_comp["action"] == "IGNORED"


def test_slack_bot_engine():
    """Test SlackBotEngine slash command formatting."""
    engine = SlackBotEngine()
    
    # /pulse intel
    res_intel = engine.handle_slash_command("intel AcmeCorp", "Acme pricing is $99/mo.")
    assert res_intel["response_type"] == "in_channel"
    assert len(res_intel["blocks"]) >= 2
    assert "AcmeCorp" in res_intel["blocks"][0]["text"]["text"]
    
    # /pulse drift
    res_drift = engine.handle_slash_command("drift SaaS")
    assert res_drift["response_type"] == "in_channel"
    
    # help
    res_help = engine.handle_slash_command("help")
    assert res_help["response_type"] == "ephemeral"


def test_outbound_dispatcher():
    """Test OutboundCampaignDispatcher for Apollo CSV and Instantly JSON."""
    campaign = OutreachCampaign(
        target_persona="VP Engineering",
        value_prop_hook="Automate your GTM research in 2 minutes",
        email_sequence=[
            EmailTemplate(
                step_number=1,
                subject_line="Quick question on developer tooling",
                body_text="Hi {{first_name}},\nNoticed you are scaling your team.",
                call_to_action="Open to a 5-min demo?"
            )
        ],
        linkedin_touchpoints=["Saw your post on AI development tooling."]
    )
    
    # Test Apollo CSV export
    csv_out = OutboundCampaignDispatcher.export_apollo_csv(campaign)
    assert "Step 1" in csv_out
    assert "Quick question" in csv_out
    assert "VP Engineering" in csv_out
    
    # Test Instantly JSON export
    json_out = OutboundCampaignDispatcher.export_instantly_json(campaign)
    assert json_out["target_persona"] == "VP Engineering"
    assert len(json_out["steps"]) == 1
    assert json_out["steps"][0]["cta"] == "Open to a 5-min demo?"
