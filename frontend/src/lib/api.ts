/**
 * API client for communicating with Pulse FastAPI Backend (http://localhost:8000).
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScanRequest {
  target_domain: string;
  mode?: "deep" | "standard";
  force_refresh?: boolean;
}

export interface ScanResponse {
  status: string;
  target_domain: string;
  cached: boolean;
  run_id: string;
  report_markdown: string;
  quality_grade: string;
  grounding_score: number;
  duration_seconds: number;
}

export interface DriftResponse {
  target_domain: string;
  status: string;
  drift_events: string[];
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  indexing_mode: string;
}

export interface AuditLog {
  run_id: string;
  target_domain: string;
  status: string;
  duration_seconds: number;
  quality_grade: string;
  tokens_and_cost?: {
    estimated_cost_usd: number;
    estimated_input_tokens: number;
    estimated_output_tokens: number;
    seltz_api_calls_count: number;
  };
  started_at: string;
}

export const pulseApi = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async triggerScan(payload: ScanRequest): Promise<ScanResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Scan request failed: ${res.statusText}`);
    }
    return res.json();
  },

  async getDrift(domain: string): Promise<DriftResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/drift/${encodeURIComponent(domain)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Drift query failed: ${res.statusText}`);
    return res.json();
  },

  async getAuditLogs(): Promise<{ count: number; logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/audit/logs`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
    return res.json();
  },

  async triggerCrmWebhook(dealPayload: {
    deal_id: string;
    deal_name: string;
    deal_stage: string;
    deal_amount_usd: number;
    competitor_tagged: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/crm/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dealPayload),
    });
    if (!res.ok) throw new Error(`CRM webhook failed: ${res.statusText}`);
    return res.json();
  }
};
