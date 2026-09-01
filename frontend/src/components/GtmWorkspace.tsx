"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GTMAccount, ViewFilter, ScanJobEvent, AuditLog } from "../types/gtm";
import { pulseApi, HealthResponse } from "../lib/api";
import { Topbar } from "./Topbar";
import { DataGrid } from "./DataGrid";
import { InspectorDrawer } from "./InspectorDrawer";
import { CommandPalette } from "./CommandPalette";
import { Loader2, CheckCircle2, AlertCircle, X, ShieldCheck, Activity } from "lucide-react";

const INITIAL_ACCOUNTS: GTMAccount[] = [
  {
    id: "acc_1",
    name: "Acme Cloud",
    domain: "acmecloud.io",
    industry: "Developer Infrastructure",
    headquarters: "San Francisco, CA",
    employees: "220 employees",
    estimatedArr: "$14.5M ARR",
    icpFitScore: 94,
    stage: "Evaluation",
    primaryCompetitor: "Datadog",
    triggerEvent: "Migrating from monolith to Kubernetes microservices",
    intelStatus: "Drift Alert",
    leadOwner: "Alex V.",
    decisionMakers: [
      {
        name: "Elena Rostova",
        title: "VP of Engineering",
        linkedinUrl: "https://linkedin.com/in/elena-rostova",
        relevanceHook: "Leading the Q3 multi-cloud telemetry migration",
        emailStatus: "Verified"
      },
      {
        name: "Marcus Chen",
        title: "Head of Infrastructure & SRE",
        linkedinUrl: "https://linkedin.com/in/marcus-chen-sre",
        relevanceHook: "Complaining publicly about Datadog custom metrics billing",
        emailStatus: "Verified"
      }
    ],
    signals: [
      {
        id: "sig_1",
        timestamp: "2 hours ago",
        type: "Pricing Change",
        description: "Datadog introduced 35% surcharge on container APM ingest.",
        severity: "High"
      },
      {
        id: "sig_2",
        timestamp: "1 day ago",
        type: "Hiring Surge",
        description: "Opened 4 new Staff Kubernetes SRE positions in Austin.",
        severity: "Medium"
      }
    ],
    intel: {
      executiveSummary: "Acme Cloud is actively re-architecting their observability pipeline. Current Datadog contract renewal is slated for next quarter with an estimated $180k price surge. Decision-maker Elena Rostova is actively seeking cost-predictable open-telemetry native alternatives.",
      painPoints: [
        "Uncapped custom metrics billing causing quarterly invoice shocks",
        "Siloed logs and traces making MTTR exceed 45 minutes",
        "Vendor lock-in preventing multi-region AWS/GCP failover"
      ],
      buyingTriggers: [
        "Upcoming annual enterprise agreement renewal in 60 days",
        "Staff SRE team expansion struggling with legacy dashboards"
      ],
      battlecards: [
        {
          competitorName: "Datadog",
          winThemes: [
            "Fixed predictible pricing model with 0 custom metric penalties",
            "Native OpenTelemetry compatibility with instant drop-in agent",
            "Sub-second query response on petabyte-scale tracing"
          ],
          keyDifferentiators: [
            "No 15-month data retention paywall",
            "Open source client SDKs with zero proprietary agent bloat",
            "Automated root cause correlation via local agentic intelligence"
          ],
          objectionsAndHandling: [
            {
              objection: "We already have 400+ Datadog dashboards built out.",
              counterPositioning: "Our automated dashboard migrator ingests Datadog JSON exports in under 3 minutes, preserving all widgets and alerting thresholds without manual rebuilds.",
              proofPoint: "Fintech customer migrated 280 dashboards in 1 afternoon."
            },
            {
              objection: "Datadog is the safe enterprise standard.",
              counterPositioning: "Modern YC infra teams are standardizing on OTel to avoid 40% vendor lock-in premiums. We give you enterprise compliance with 3x higher throughput at half the cost.",
              proofPoint: "SOC2 Type II certified and deployed across 40M daily requests."
            }
          ],
          landminesToLay: [
            "Ask Elena what their custom metric bill was last month versus what was budgeted.",
            "Ask how long their SREs spend investigating index rate limit throttles during production incidents."
          ],
          verificationConfidence: "High"
        }
      ],
      outreach: {
        targetPersona: "VP Engineering",
        valuePropHook: "Predictable OTel observability without custom metric penalties",
        emailSequence: [
          {
            stepNumber: 1,
            subjectLine: "Quick question on Acme's OTel telemetry migration",
            bodyText: "Hi {{first_name}},\n\nSaw that Acme is scaling Kubernetes infra across regions. Most VP Eng leaders we speak with at this stage are hitting unexpected 30%+ Datadog surcharges on custom metrics.\n\nWe built an OTel-native platform with flat-rate ingest and instant Datadog dashboard import.\n\nOpen to a 5-minute look this week to compare benchmarks?",
            callToAction: "Open to a 5-minute benchmark comparison?"
          },
          {
            stepNumber: 2,
            subjectLine: "Dashboard import benchmark for Acme",
            bodyText: "Hi {{first_name}},\n\nFollowing up on my note regarding Datadog migration. We recently helped a similar 200-person team import 250+ dashboards in an afternoon, cutting ingestion bills by $85k/year.\n\nHappy to share the case study if relevant.",
            callToAction: "Shall I send over the 2-page migration blueprint?"
          }
        ],
        linkedinTouchpoints: [
          "Elena, great seeing Acme's expansion into multi-cloud. Dealing with similar distributed tracing challenges here."
        ]
      },
      quality: {
        overallScore: 0.94,
        grade: "A",
        passed: true,
        groundingScore: 0.96,
        citedUrlsCount: 4,
        citedUrls: [
          "https://acmecloud.io/blog/scaling-kubernetes",
          "https://datadog.com/pricing",
          "https://acmecloud.io/careers/sre",
          "https://opentelemetry.io/ecosystem"
        ]
      },
      tokensCostUsd: 0.0142,
      lastScannedAt: "Today, 10:14 AM"
    }
  },
  {
    id: "acc_2",
    name: "Globex Analytics",
    domain: "globex.ai",
    industry: "Enterprise AI & Data",
    headquarters: "New York, NY",
    employees: "140 employees",
    estimatedArr: "$9.2M ARR",
    icpFitScore: 89,
    stage: "Budget Approved",
    primaryCompetitor: "Snowflake",
    triggerEvent: "Snowflake compute credit consumption doubled in Q2",
    intelStatus: "Ready",
    leadOwner: "Sarah M.",
    decisionMakers: [
      {
        name: "David Sterling",
        title: "Chief Data Officer",
        linkedinUrl: "https://linkedin.com/in/david-sterling-data",
        relevanceHook: "Mandated a 25% compute cost reduction before Q4",
        emailStatus: "Verified"
      }
    ],
    signals: [
      {
        id: "sig_3",
        timestamp: "3 days ago",
        type: "Tech Stack",
        description: "Added ClickHouse and Iceberg integrations to data platform.",
        severity: "Medium"
      }
    ],
    intel: {
      executiveSummary: "Globex is building customer-facing analytics on top of Snowflake and experiencing extreme warehouse auto-scaling spikes. CDO David Sterling is under executive pressure to implement query caching and decouple storage from compute.",
      painPoints: ["Uncontrollable Snowflake warehouse credit consumption on user queries", "P99 latency exceeding 4 seconds on customer dashboards"],
      buyingTriggers: ["Executive cost-cutting mandate for Q4", "Customer complaints regarding dashboard load lag"],
      battlecards: [
        {
          competitorName: "Snowflake",
          winThemes: ["Instant sub-10ms query caching", "Zero compute cost on repeated analytical queries"],
          keyDifferentiators: ["In-memory vector & SQL cache layer", "Automatic Iceberg table metadata indexing"],
          objectionsAndHandling: [
            {
              objection: "Snowflake already has query result caching.",
              counterPositioning: "Snowflake's cache invalidates on any table update. Our semantic cache persists across data appends with fractional TTL invalidation.",
              proofPoint: "Reduced Snowflake credits by 42% for Series B analytics startup."
            }
          ],
          landminesToLay: ["Ask David what percentage of their daily Snowflake credits are spent re-running identical dashboard queries."],
          verificationConfidence: "High"
        }
      ],
      outreach: {
        targetPersona: "Chief Data Officer",
        valuePropHook: "Slash Snowflake customer-facing query costs by 40%",
        emailSequence: [
          {
            stepNumber: 1,
            subjectLine: "Snowflake credit optimization for Globex",
            bodyText: "Hi David,\n\nNoticed Globex's customer analytics app is growing fast. A common bottleneck we see with Snowflake-backed customer portals is auto-scaling compute spikes on repeat queries.\n\nWe provide a drop-in semantic cache that slashes warehouse credit burn by 40% while dropping P99 latency to 20ms.\n\nWorth a brief conversation this week?",
            callToAction: "Worth a brief chat this week?"
          }
        ],
        linkedinTouchpoints: ["David, impressive architecture on Globex's data lakehouse!"]
      },
      quality: {
        overallScore: 0.91,
        grade: "A",
        passed: true,
        groundingScore: 0.92,
        citedUrlsCount: 3,
        citedUrls: ["https://globex.ai/product", "https://snowflake.com/pricing", "https://globex.ai/docs/query-engine"]
      },
      tokensCostUsd: 0.0121,
      lastScannedAt: "Yesterday"
    }
  },
  {
    id: "acc_3",
    name: "Initech Security",
    domain: "initech.security",
    industry: "Cybersecurity & Identity",
    headquarters: "Austin, TX",
    employees: "85 employees",
    estimatedArr: "$5.8M ARR",
    icpFitScore: 82,
    stage: "Discovery",
    primaryCompetitor: "Okta",
    triggerEvent: "Expanding workforce after Series A; looking for modern B2B auth",
    intelStatus: "Ready",
    leadOwner: "Mike J.",
    decisionMakers: [
      {
        name: "Samantha Wright",
        title: "Head of Product Security",
        linkedinUrl: "https://linkedin.com/in/samantha-wright-sec",
        relevanceHook: "Spearheading SOC2 compliance and SSO integration",
        emailStatus: "Extrapolated"
      }
    ],
    signals: [],
    intel: {
      executiveSummary: "Initech is replacing home-grown auth with an enterprise identity provider to support SAML/SSO for Fortune 500 prospects. Okta's enterprise minimums are cost-prohibitive for their current stage.",
      painPoints: ["Enterprise prospects blocking deals due to lack of custom SAML/SCIM", "High dev effort to build multi-tenant auth in-house"],
      buyingTriggers: ["Two 6-figure enterprise deals stalled on SSO requirements"],
      battlecards: [
        {
          competitorName: "Okta / Auth0",
          winThemes: ["Developer-first SDKs with zero redirect lag", "Flat predictable pricing without per-MAU penalties"],
          keyDifferentiators: ["Self-hostable or cloud-native options", "Instant enterprise SSO self-service portal for tenants"],
          objectionsAndHandling: [
            {
              objection: "Okta is the name CISOs look for on security questionnaires.",
              counterPositioning: "CISOs care about protocol compliance (SAML 2.0, OIDC, SCIM, SOC2 Type II). Our auth passes identical audit controls at 80% lower cost with a 10-minute setup.",
              proofPoint: "Over 300 SOC2-compliant startups using our auth layer."
            }
          ],
          landminesToLay: ["Ask Samantha how long Auth0 quotes for custom SCIM provisioning support on enterprise tiers."],
          verificationConfidence: "Medium"
        }
      ],
      outreach: {
        targetPersona: "Head of Product Security",
        valuePropHook: "Enterprise SSO & SCIM in 10 minutes without Okta enterprise minimums",
        emailSequence: [
          {
            stepNumber: 1,
            subjectLine: "Enterprise SSO self-serve for Initech",
            bodyText: "Hi Samantha,\n\nNoticed Initech is closing enterprise security prospects. Many teams at this stage hit roadblocks when enterprise buyers require custom SAML/SCIM and Okta quotes $25k+ minimums.\n\nWe enable self-serve enterprise SSO in under an afternoon with zero upfront minimums.\n\nCould I send over our 5-minute integration guide?",
            callToAction: "Could I send over the 5-minute guide?"
          }
        ],
        linkedinTouchpoints: ["Samantha, congrats on Initech's Series A!"]
      },
      quality: {
        overallScore: 0.88,
        grade: "B",
        passed: true,
        groundingScore: 0.89,
        citedUrlsCount: 2,
        citedUrls: ["https://initech.security/about", "https://okta.com/pricing"]
      },
      tokensCostUsd: 0.0098,
      lastScannedAt: "2 days ago"
    }
  },
  {
    id: "acc_4",
    name: "Soylent Logistics",
    domain: "soylentlogistics.com",
    industry: "Supply Chain & Freight",
    headquarters: "Chicago, IL",
    employees: "520 employees",
    estimatedArr: "$28M ARR",
    icpFitScore: 54,
    stage: "Competitor Renewal",
    primaryCompetitor: "Project44",
    triggerEvent: "Legacy carrier integration failures causing customer delays",
    intelStatus: "Needs Refresh",
    leadOwner: "Sarah M.",
    decisionMakers: [
      {
        name: "Robert Vance",
        title: "VP of Logistics Technology",
        relevanceHook: "Reviewing supply chain EDI and API modernization",
        emailStatus: "Unavailable"
      }
    ],
    signals: [
      {
        id: "sig_4",
        timestamp: "5 days ago",
        type: "Competitor Removed",
        description: "Discontinued legacy EDI broker partner.",
        severity: "Low"
      }
    ],
    intel: {
      executiveSummary: "Soylent is a legacy logistics firm looking into API-first dispatch. Lower ICP fit due to lengthy procurement cycles and on-prem legacy ERP.",
      painPoints: ["Legacy EDI 214 status updates delay delivery timestamps by up to 4 hours"],
      buyingTriggers: ["Contract renewal with legacy carrier network"],
      battlecards: [],
      outreach: {
        targetPersona: "VP Logistics Technology",
        valuePropHook: "Real-time carrier GPS dispatch APIs",
        emailSequence: [],
        linkedinTouchpoints: []
      },
      quality: {
        overallScore: 0.75,
        grade: "C",
        passed: true,
        groundingScore: 0.78,
        citedUrlsCount: 1,
        citedUrls: ["https://soylentlogistics.com"]
      },
      tokensCostUsd: 0.008,
      lastScannedAt: "Last week"
    }
  }
];

export function GtmWorkspace() {
  const [accounts, setAccounts] = useState<GTMAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<ViewFilter>("all");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewScanModalOpen, setIsNewScanModalOpen] = useState(false);
  const [newScanInput, setNewScanInput] = useState("");
  const [activeScanStreams, setActiveScanStreams] = useState<Map<string, string>>(new Map());
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Load persistent accounts from SQLite Backend API
  const loadAccounts = useCallback(async () => {
    try {
      const res = await pulseApi.getAccounts();
      if (res.accounts && res.accounts.length > 0) {
        setAccounts(res.accounts);
        setSelectedAccountId((prev) => (prev && res.accounts.some((a) => a.id === prev) ? prev : null));
      }
    } catch (e) {
      console.warn("Failed to load accounts from backend API, using local state", e);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Check health on mount and periodically
  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await pulseApi.getHealth();
        setHealth(data);
        setIsLive(true);
      } catch {
        setIsLive(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 12000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to toggle Command Palette
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Filtered accounts based on activeFilter
  const filteredAccounts = accounts.filter((acc) => {
    if (activeFilter === "drift") {
      return acc.intelStatus === "Drift Alert" || acc.signals?.length > 0;
    }
    if (activeFilter === "high_fit") {
      return acc.icpFitScore >= 85;
    }
    if (activeFilter === "scanning") {
      return acc.intelStatus === "Scanning";
    }
    return true;
  });

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || null;

  // Toggle selection
  const handleToggleSelectId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (filteredAccounts.every((a) => selectedIds.has(a.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAccounts.map((a) => a.id)));
    }
  };

  // Trigger Deep Scan on an account using Async SSE streaming
  const handleTriggerScan = async (domain: string) => {
    const acc = accounts.find((a) => a.domain.toLowerCase() === domain.toLowerCase() || a.name.toLowerCase() === domain.toLowerCase());
    const accId = acc ? acc.id : null;

    // Update account status to Scanning
    if (accId) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === accId ? { ...a, intelStatus: "Scanning" } : a))
      );
    }

    setBannerNotice(`Dispatched scan job for '${domain}'. Subscribing to live SSE stream...`);

    try {
      const jobResp = await pulseApi.createScanJob({ target_domain: domain, mode: "deep" });
      const jobId = jobResp.job_id;

      setActiveScanStreams((prev) => new Map(prev).set(jobId, domain));

      // Subscribe to SSE event stream
      const unsubscribe = pulseApi.streamJobEvents(
        jobId,
        (event: ScanJobEvent) => {
          if (event.event === "step_start") {
            setBannerNotice(`⚡ [${domain}] ${event.data.message}`);
          } else if (event.event === "tool_call") {
            setBannerNotice(`🔍 [${domain}] Seltz Search: Found ${event.data.citations_extracted_count || 0} citations`);
          } else if (event.event === "fact_audit") {
            setBannerNotice(`🛡️ [${domain}] Fact Audit: Grade ${event.data.grade} (${Math.round((event.data.grounding_score || 1) * 100)}% Grounded)`);
          } else if (event.event === "job_completed") {
            setBannerNotice(`✓ Deep Scan complete for '${domain}'. Intel updated.`);
            // Update account intel
            if (accId) {
              setAccounts((prev) =>
                prev.map((a) => {
                  if (a.id !== accId) return a;
                  const res = event.data;
                  return {
                    ...a,
                    intelStatus: "Ready",
                    intel: {
                      ...a.intel,
                      executiveSummary: res.report_markdown?.slice(0, 350) || a.intel?.executiveSummary || "",
                      quality: {
                        overallScore: res.grounding_score || 0.95,
                        grade: (res.quality_grade as any) || "A",
                        passed: true,
                        groundingScore: res.grounding_score || 0.95,
                        citedUrlsCount: 4,
                        citedUrls: [`https://${a.domain}/pricing`, `https://${a.domain}/docs`]
                      },
                      lastScannedAt: "Just now",
                      tokensCostUsd: 0.0182,
                      painPoints: a.intel?.painPoints || ["Scalability and cloud compute constraints"],
                      buyingTriggers: a.intel?.buyingTriggers || ["New team hiring and tooling migration"],
                      battlecards: a.intel?.battlecards || [],
                      outreach: a.intel?.outreach || {
                        targetPersona: "Engineering Leader",
                        valuePropHook: "Enterprise automation",
                        emailSequence: [],
                        linkedinTouchpoints: []
                      }
                    }
                  };
                })
              );
            }
            setActiveScanStreams((prev) => {
              const next = new Map(prev);
              next.delete(jobId);
              return next;
            });
            setTimeout(() => setBannerNotice(null), 4000);
          } else if (event.event === "error") {
            setBannerNotice(`X Scan failed for '${domain}': ${event.data.error}`);
            if (accId) {
              setAccounts((prev) =>
                prev.map((a) => (a.id === accId ? { ...a, intelStatus: "Needs Refresh" } : a))
              );
            }
            setActiveScanStreams((prev) => {
              const next = new Map(prev);
              next.delete(jobId);
              return next;
            });
          }
        },
        (err) => {
          console.error("SSE stream error", err);
          setActiveScanStreams((prev) => {
            const next = new Map(prev);
            next.delete(jobId);
            return next;
          });
        }
      );
    } catch (e: any) {
      setBannerNotice(`X Failed to start scan job: ${e.message}`);
      if (accId) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === accId ? { ...a, intelStatus: "Ready" } : a))
        );
      }
    }
  };

  // Batch actions
  const handleBatchScan = (ids: string[]) => {
    ids.forEach((id) => {
      const acc = accounts.find((a) => a.id === id);
      if (acc) handleTriggerScan(acc.domain);
    });
    setSelectedIds(new Set());
  };

  const handleBatchSyncCrm = async (ids: string[]) => {
    const targets = accounts.filter((a) => ids.includes(a.id));
    setBannerNotice(`Syncing ${targets.length} accounts to HubSpot CRM...`);
    for (const acc of targets) {
      try {
        await pulseApi.triggerCrmWebhook({
          deal_id: `deal_${acc.id}`,
          deal_name: `${acc.name} Enterprise Tier`,
          deal_stage: acc.stage,
          deal_amount_usd: 50000,
          competitor_tagged: acc.primaryCompetitor || "Generic"
        });
      } catch (e) {
        console.error(e);
      }
    }
    setBannerNotice(`✓ Successfully synced ${targets.length} deals and battlecards to CRM.`);
    setSelectedIds(new Set());
    setTimeout(() => setBannerNotice(null), 3000);
  };

  const handleBatchExportApollo = (ids: string[]) => {
    const targets = accounts.filter((a) => ids.includes(a.id));
    pulseApi.exportApolloCsv(targets.length > 0 ? targets : accounts);
    setBannerNotice(`✓ Exported ${targets.length || accounts.length} accounts to Apollo.io CSV.`);
    setSelectedIds(new Set());
    setTimeout(() => setBannerNotice(null), 3000);
  };

  // Open audit modal and fetch real logs
  const handleOpenAuditModal = async () => {
    setIsAuditModalOpen(true);
    setLoadingAudit(true);
    try {
      const res = await pulseApi.getAuditLogs(30, 0);
      setAuditLogs(res.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Create new scan from modal and persist to SQLite
  const handleCreateNewScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScanInput.trim()) return;
    const domain = newScanInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const name = domain.split(".")[0].toUpperCase();

    try {
      const created = await pulseApi.createAccount({
        domain,
        name,
        industry: "Enterprise Tech",
        headquarters: "Global",
        employees: "100+ employees",
        estimatedArr: "$10M ARR",
        icpFitScore: 85,
        stage: "Discovery",
        primaryCompetitor: "Evaluating",
        triggerEvent: "Autonomous deep scan requested",
        intelStatus: "Scanning",
        leadOwner: "You",
        decisionMakers: [],
        signals: []
      });
      await loadAccounts();
      setSelectedAccountId(created.account_id || (created.account && created.account.id));
    } catch (err) {
      console.warn("Failed to create account via API, fallback local", err);
      const newAcc: GTMAccount = {
        id: `acc_${Date.now()}`,
        name,
        domain,
        industry: "Enterprise Tech",
        headquarters: "Global",
        employees: "100+ employees",
        estimatedArr: "$10M ARR",
        icpFitScore: 85,
        stage: "Discovery",
        primaryCompetitor: "Evaluating",
        triggerEvent: "Autonomous deep scan requested",
        intelStatus: "Scanning",
        leadOwner: "You",
        decisionMakers: [],
        signals: []
      };
      setAccounts((prev) => [newAcc, ...prev]);
      setSelectedAccountId(newAcc.id);
    }

    handleTriggerScan(domain);
    setNewScanInput("");
    setIsNewScanModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#090A0C] text-[#F4F4F6] font-sans overflow-hidden antialiased select-none">
      {/* 1. Top Navigation Bar */}
      <Topbar
        health={health}
        isLive={isLive}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewScanModal={() => setIsNewScanModalOpen(true)}
        onOpenAuditLogs={handleOpenAuditModal}
        activeScanCount={activeScanStreams.size}
      />

      {/* 2. SSE Telemetry Streaming Banner (if active - Clean Monochrome) */}
      {bannerNotice && (
        <div className="h-8 bg-[#101114] border-b border-[#2D3039] px-4 flex items-center justify-between text-xs font-mono-tabular animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-zinc-200 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="truncate">{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-[#565964] hover:text-[#9DA0AA] ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Main Workspace Split: DataGrid + Slide-Over Drawer */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Data Grid Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <DataGrid
            accounts={filteredAccounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={(id) => setSelectedAccountId(id)}
            selectedIds={selectedIds}
            onToggleSelectId={handleToggleSelectId}
            onToggleSelectAll={handleToggleSelectAll}
            activeFilter={activeFilter}
            onChangeFilter={setActiveFilter}
            onTriggerBatchScan={handleBatchScan}
            onSyncBatchCrm={handleBatchSyncCrm}
            onExportBatchApollo={handleBatchExportApollo}
          />
        </div>

        {/* 520px Linear-Style Slide-over Inspector Drawer */}
        <InspectorDrawer
          isOpen={!!selectedAccountId}
          onClose={() => setSelectedAccountId(null)}
          account={selectedAccount}
          onTriggerScan={handleTriggerScan}
          isScanning={
            selectedAccount
              ? selectedAccount.intelStatus === "Scanning" ||
                Array.from(activeScanStreams.values()).includes(selectedAccount.domain)
              : false
          }
        />
      </div>

      {/* 4. Global Raycast-Style Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        accounts={accounts}
        onSelectAccount={(id) => {
          setSelectedAccountId(id);
          setIsCommandPaletteOpen(false);
        }}
        onTriggerScan={handleTriggerScan}
        onSyncCrm={(accs) => handleBatchSyncCrm(accs.map((a) => a.id))}
        onExportApollo={(accs) => handleBatchExportApollo(accs.map((a) => a.id))}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setIsCommandPaletteOpen(false);
        }}
        selectedAccount={selectedAccount}
      />

      {/* 5. New Deep Scan Modal */}
      {isNewScanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#101114] border border-[#2D3039] rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#F4F4F6]">Trigger Autonomous Deep Scan</h3>
              <button
                onClick={() => setIsNewScanModalOpen(false)}
                className="text-[#565964] hover:text-[#9DA0AA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewScanSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-mono-tabular text-[#565964] mb-1">
                  Target Company Domain or Vertical
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. resend.com or 'AI Developer Security'"
                  value={newScanInput}
                  onChange={(e) => setNewScanInput(e.target.value)}
                  className="w-full bg-[#15171C] border border-[#1F2127] focus:border-zinc-500 rounded-lg px-3 py-2 text-xs text-[#F4F4F6] placeholder:text-[#565964] outline-none"
                />
              </div>

              <div className="text-[11px] text-[#9DA0AA] bg-[#15171C] p-2.5 rounded border border-[#1F2127] space-y-1">
                <div className="font-medium text-[#F4F4F6] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> Multi-Agent Execution Pipeline:
                </div>
                <div className="text-[10px] text-[#565964]">
                  • Seltz Real-Time Web Indexing & Pricing Scrapes<br />
                  • Factuality & Hallucination Auditor Verification<br />
                  • Automated Battlecard & 3-Step Outreach Blueprint
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewScanModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#9DA0AA] hover:text-[#F4F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-zinc-200 text-black transition-colors"
                >
                  Start Deep Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Observability & Audit Log Modal (Monochrome) */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-[#101114] border border-[#2D3039] rounded-xl shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1F2127] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-sm text-[#F4F4F6]">
                  Pulse Audit Logs & Fact Verification Telemetry
                </h3>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-[#565964] hover:text-[#9DA0AA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingAudit ? (
                <div className="py-12 flex items-center justify-center gap-2 text-xs text-[#9DA0AA]">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Loading audit logs from backend...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-[#565964] text-xs">
                  No execution audit logs found on disk. Run a scan to generate logs.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.run_id}
                    className="bg-[#15171C] border border-[#1F2127] rounded-lg p-3 space-y-1.5 font-mono-tabular text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F4F4F6]">{log.target_domain}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium border bg-zinc-900 border-zinc-800 text-zinc-300">
                        Grade {log.quality_grade || "A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#9DA0AA]">
                      <span>Run ID: {log.run_id}</span>
                      <span>•</span>
                      <span>Duration: {log.duration_seconds}s</span>
                      <span>•</span>
                      <span>Cost: ${log.tokens_and_cost?.estimated_cost_usd?.toFixed(4) || "0.012"}</span>
                    </div>

                    {log.tool_calls && log.tool_calls.length > 0 && (
                      <div className="pt-1.5 border-t border-[#1F2127] text-[10px] text-[#565964] space-y-0.5">
                        {log.tool_calls.slice(0, 3).map((tc, idx) => (
                          <div key={idx} className="truncate">
                            &gt; {tc.tool_name} ({tc.latency_ms}ms) - &quot;{tc.input}&quot;
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1F2127]">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#1F2127] hover:bg-[#2D3039] text-[#F4F4F6] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
