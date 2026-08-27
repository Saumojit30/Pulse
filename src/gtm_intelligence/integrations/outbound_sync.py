"""Outbound Sales Campaign Dispatcher for Apollo, Instantly, and Smartlead."""

import csv
import json
import io
from typing import Dict, Any, List, Optional
from gtm_intelligence.models.gtm_models import OutreachCampaign, EmailTemplate


class OutboundCampaignDispatcher:
    """Exports generated outreach sequences to Apollo / Instantly compatible CSV & JSON formats."""

    @staticmethod
    def export_apollo_csv(campaign: OutreachCampaign, company_domain: str = "example.com") -> str:
        """Generate Apollo.io sequence import CSV."""
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["Step", "Touchpoint Type", "Subject", "Body", "Call To Action", "Target Persona"])
        
        for email in campaign.email_sequence:
            writer.writerow([
                f"Step {email.step_number}",
                "Email",
                email.subject_line,
                email.body_text.replace("\n", " "),
                email.call_to_action,
                campaign.target_persona
            ])
            
        for idx, touch in enumerate(campaign.linkedin_touchpoints, 1):
            writer.writerow([
                f"LinkedIn Step {idx}",
                "LinkedIn Connection / InMail",
                f"Connection Hook: {campaign.value_prop_hook[:50]}",
                touch.replace("\n", " "),
                "Connect on LinkedIn",
                campaign.target_persona
            ])
            
        return output.getvalue()

    @staticmethod
    def export_instantly_json(campaign: OutreachCampaign) -> Dict[str, Any]:
        """Generate Instantly / Smartlead campaign payload."""
        steps = []
        for email in campaign.email_sequence:
            steps.append({
                "type": "email",
                "step_number": email.step_number,
                "subject": email.subject_line,
                "body": email.body_text,
                "cta": email.call_to_action
            })
            
        return {
            "campaign_name": f"Pulse Conquest: {campaign.target_persona}",
            "value_prop_hook": campaign.value_prop_hook,
            "target_persona": campaign.target_persona,
            "steps": steps,
            "linkedin_angles": campaign.linkedin_touchpoints
        }
