/**
 * API client for communicating with Pulse FastAPI Backend (http://localhost:8000).
 */

import { GTMAccount, ScanJobEvent, AuditLog } from "../types/gtm";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export interface ScanRequest {
  target_domain: string;
  mode?: "deep" | "standard";
  force_refresh?: boolean;
}

export interface ScanJobResponse {
  job_id: string;
  target_domain: string;
  mode: string;
  status: string;
  created_at: string;
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

  async createScanJob(payload: ScanRequest): Promise<ScanJobResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/scan/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Scan job creation failed: ${res.statusText}`);
    }
    return res.json();
  },

  streamJobEvents(
    jobId: string,
    onEvent: (event: ScanJobEvent) => void,
    onError?: (err: any) => void
  ): () => void {
    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/scan/jobs/${jobId}/stream`);

    const eventTypes: Array<ScanJobEvent["event"]> = [
      "step_start",
      "tool_call",
      "fact_audit",
      "job_completed",
      "error",
    ];

    eventTypes.forEach((type) => {
      eventSource.addEventListener(type, (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          onEvent({ event: type, data: parsed });
          if (type === "job_completed" || type === "error") {
            eventSource.close();
          }
        } catch (parseErr) {
          console.error("Failed to parse SSE payload", parseErr);
        }
      });
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },

  async getDrift(domain: string): Promise<DriftResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/drift/${encodeURIComponent(domain)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Drift query failed: ${res.statusText}`);
    return res.json();
  },

  async getAuditLogs(limit: number = 50, offset: number = 0): Promise<{ total: number; count: number; logs: AuditLog[] }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/audit/logs?limit=${limit}&offset=${offset}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
    return res.json();
  },

  async getAuditLogDetail(runId: string): Promise<AuditLog> {
    const res = await fetch(`${API_BASE_URL}/api/v1/audit/logs/${encodeURIComponent(runId)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch audit log detail: ${res.statusText}`);
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
  },

  exportApolloCsv(accounts: GTMAccount[]) {
    const rows = [
      ["First Name", "Last Name", "Company", "Website", "Title", "Email Status", "Outreach Hook", "Email Step 1 Subject", "Email Step 1 Body"]
    ];

    accounts.forEach((acc) => {
      const dm = acc.decisionMakers?.[0];
      const nameParts = (dm?.name || "GTM Leader").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const emailStep1 = acc.intel?.outreach?.emailSequence?.[0];

      rows.push([
        `"${firstName}"`,
        `"${lastName}"`,
        `"${acc.name}"`,
        `"${acc.domain}"`,
        `"${dm?.title || "Executive"}"`,
        `"${dm?.emailStatus || "Verified"}"`,
        `"${(dm?.relevanceHook || acc.triggerEvent || "").replace(/"/g, '""')}"`,
        `"${(emailStep1?.subjectLine || "").replace(/"/g, '""')}"`,
        `"${(emailStep1?.bodyText || "").replace(/"/g, '""')}"`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apollo_gtm_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async getAccounts(): Promise<{ count: number; accounts: GTMAccount[] }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/accounts`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.statusText}`);
    return res.json();
  },

  async createAccount(payload: Partial<GTMAccount>): Promise<{ status: string; account_id: string; account: GTMAccount }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to create account: ${res.statusText}`);
    return res.json();
  },

  async deleteAccount(accountId: string): Promise<{ status: string; account_id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/accounts/${encodeURIComponent(accountId)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete account: ${res.statusText}`);
    return res.json();
  }
};
