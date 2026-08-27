"""Pydantic data models for structured GTM Intelligence outputs."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CompetitorFeature(BaseModel):
    """Specific feature offered by a competitor."""
    feature_name: str = Field(description="Name of the feature")
    description: str = Field(description="Brief explanation of the feature")
    is_unique: bool = Field(default=False, description="Whether this is a key differentiator")
    pricing_tier: Optional[str] = Field(default=None, description="Tier offering this feature, e.g., Pro, Enterprise")


class CompetitorProfile(BaseModel):
    """Structured breakdown of a single competitor."""
    name: str = Field(description="Competitor company or product name")
    website_url: Optional[str] = Field(default=None, description="Primary website URL")
    value_proposition: str = Field(description="Summary of their core positioning/tagline")
    key_features: List[CompetitorFeature] = Field(default_factory=list, description="List of key features")
    pricing_summary: str = Field(description="Overview of their pricing model and tiers")
    tech_stack_signals: List[str] = Field(default_factory=list, description="Detected technologies or integrations")
    hiring_signals: List[str] = Field(default_factory=list, description="Notable hiring trends or open roles")
    citations: List[str] = Field(default_factory=list, description="Source URLs retrieved via Seltz indexing")


class ICPProfile(BaseModel):
    """Ideal Customer Profile (ICP) breakdown."""
    target_industry: str = Field(description="Primary vertical or industry segment")
    company_size: str = Field(description="Target company size, e.g., 50-500 employees, Enterprise")
    key_decision_makers: List[str] = Field(description="Target job titles (e.g. VP Engineering, Head of Sales)")
    core_pain_points: List[str] = Field(description="Top 3-5 operational pain points experienced by buyer")
    buying_triggers: List[str] = Field(description="Events signaling ready-to-buy status (e.g., funding, hiring, legacy tool decay)")


class ObjectionHandling(BaseModel):
    """Common sales objection and recommended counter-argument."""
    objection: str = Field(description="The customer objection (e.g., 'Competitor X is cheaper')")
    counter_positioning: str = Field(description="Recommended response highlighting unique value")
    proof_point: Optional[str] = Field(default=None, description="Verifiable metric or case study reference")


class SalesBattlecard(BaseModel):
    """Competitive battlecard for sales enablement."""
    competitor_name: str = Field(description="Competitor product or company name")
    win_themes: List[str] = Field(description="Key positioning angles where we win")
    objections_and_handling: List[ObjectionHandling] = Field(description="Common objections and response guides")
    key_differentiators: List[str] = Field(description="Features or capabilities they lack")
    landmines_to_lay: List[str] = Field(description="Questions to prompt prospects to expose competitor flaws")
    verification_confidence: str = Field(default="High", description="Fact-checking confidence level (High/Medium/Low)")


class EmailTemplate(BaseModel):
    """Cold outreach email template."""
    step_number: int = Field(description="Sequence step number (1, 2, 3...)")
    subject_line: str = Field(description="Catchy, relevant subject line")
    body_text: str = Field(description="Cold email body copy")
    call_to_action: str = Field(description="Specific, friction-free CTA")


class OutreachCampaign(BaseModel):
    """Multi-channel GTM outreach campaign blueprint."""
    target_persona: str = Field(description="Job title or persona this campaign targets")
    value_prop_hook: str = Field(description="Core hook/angle for outreach")
    email_sequence: List[EmailTemplate] = Field(description="Sequence of automated emails")
    linkedin_touchpoints: List[str] = Field(description="LinkedIn message angles or connect notes")


class GTMIntelligenceReport(BaseModel):
    """Complete aggregated GTM Intelligence output."""
    target_product_or_domain: str = Field(description="Product or industry domain being analyzed")
    executive_summary: str = Field(description="High-level GTM strategic summary")
    competitors: List[CompetitorProfile] = Field(default_factory=list, description="Competitor profiles")
    icp: ICPProfile = Field(description="Target ICP profile")
    battlecards: List[SalesBattlecard] = Field(default_factory=list, description="Sales battlecards")
    outreach_campaign: OutreachCampaign = Field(description="Outreach execution blueprint")
    source_citations: List[str] = Field(default_factory=list, description="All Seltz indexing source URLs used")
