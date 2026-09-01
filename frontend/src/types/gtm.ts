export type BuyingStage = 
  | "Discovery" 
  | "Evaluation" 
  | "Competitor Renewal" 
  | "Budget Approved" 
  | "Closing";

export type IntelStatus = "Ready" | "Scanning" | "Drift Alert" | "Needs Refresh";

export interface DecisionMaker {
  name: string;
  title: string;
  linkedinUrl?: string;
  relevanceHook: string;
  emailStatus: "Verified" | "Extrapolated" | "Unavailable";
}

export interface DriftSignal {
  id: string;
  timestamp: string;
  type: "Pricing Change" | "Hiring Surge" | "New Feature" | "Tech Stack" | "Competitor Removed";
  description: string;
  severity: "High" | "Medium" | "Low";
}

export interface ObjectionHandler {
  objection: string;
  counterPositioning: string;
  proofPoint?: string;
}

export interface Battlecard {
  competitorName: string;
  winThemes: string[];
  keyDifferentiators: string[];
  objectionsAndHandling: ObjectionHandler[];
  landminesToLay: string[];
  verificationConfidence: "High" | "Medium" | "Low";
}

export interface EmailTemplate {
  stepNumber: number;
  subjectLine: string;
  bodyText: string;
  callToAction: string;
}

export interface OutreachCampaign {
  targetPersona: string;
  valuePropHook: string;
  emailSequence: EmailTemplate[];
  linkedinTouchpoints: string[];
}

export interface QualityScorecard {
  overallScore: number;
  grade: "A" | "B" | "C" | "F";
  passed: boolean;
  groundingScore: number;
  citedUrlsCount: number;
  citedUrls?: string[];
  pillarsChecked?: Record<string, boolean>;
}

export interface AccountIntel {
  executiveSummary: string;
  painPoints: string[];
  buyingTriggers: string[];
  battlecards: Battlecard[];
  outreach: OutreachCampaign;
  quality: QualityScorecard;
  tokensCostUsd: number;
  lastScannedAt: string;
}

export interface GTMAccount {
  id: string;
  name: string;
  domain: string;
  industry: string;
  headquarters: string;
  employees: string;
  estimatedArr: string;
  icpFitScore: number;
  stage: BuyingStage;
  primaryCompetitor: string;
  triggerEvent: string;
  intelStatus: IntelStatus;
  leadOwner: string;
  selected?: boolean;
  intel?: AccountIntel;
  decisionMakers: DecisionMaker[];
  signals: DriftSignal[];
}

export interface ScanJobEvent {
  event: "step_start" | "tool_call" | "fact_audit" | "job_completed" | "error";
  data: any;
  timestamp?: string;
}

export interface AuditLog {
  run_id: string;
  target_domain: string;
  status: string;
  mode: string;
  duration_seconds: number;
  quality_grade: string;
  started_at: string;
  completed_at?: string;
  tokens_and_cost?: {
    estimated_cost_usd: number;
    estimated_input_tokens: number;
    estimated_output_tokens: number;
    seltz_api_calls_count: number;
  };
  fact_check_metrics?: {
    claims_audited: number;
    claims_verified: number;
    grounding_score: number;
  };
  tool_calls?: Array<{
    timestamp: string;
    tool_name: string;
    input: string;
    latency_ms: number;
    results_count: number;
    status: string;
  }>;
}

export type ViewFilter = "all" | "drift" | "high_fit" | "scanning";
