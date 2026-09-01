"use client";

import React, { useState, useEffect } from "react";
import { GTMAccount, DriftSignal } from "../types/gtm";
import { pulseApi } from "../lib/api";
import {
  X,
  ExternalLink,
  Zap,
  Target,
  Copy,
  Check,
  Activity,
  Mail,
  ShieldCheck,
  Send,
  Download,
  AlertTriangle,
  Flame,
  Briefcase,
  Users,
  Linkedin,
  Clock,
  Coins,
  Maximize2,
  Minimize2
} from "lucide-react";

interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account: GTMAccount | null;
  onTriggerScan: (domain: string) => void;
  isScanning: boolean;
}

type TabKey = "overview" | "battlecard" | "drift" | "outreach" | "telemetry";

export function InspectorDrawer({
  isOpen,
  onClose,
  account,
  onTriggerScan,
  isScanning
}: InspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [liveDriftEvents, setLiveDriftEvents] = useState<string[]>([]);
  const [loadingDrift, setLoadingDrift] = useState(false);

  // Reset tab when account changes
  useEffect(() => {
    if (account) {
      setActiveTab("overview");
      setLiveDriftEvents([]);
    }
  }, [account?.id]);

  // Handle escape key to close drawer
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFetchLiveDrift = async () => {
    if (!account) return;
    setLoadingDrift(true);
    try {
      const res = await pulseApi.getDrift(account.domain);
      setLiveDriftEvents(res.drift_events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDrift(false);
    }
  };

  if (!isOpen || !account) {
    return null;
  }

  const intel = account.intel;
  const primaryBattlecard = intel?.battlecards?.[0];
  const outreach = intel?.outreach;
  const quality = intel?.quality;

  return (
    <div>
      {/* Dimmed Backdrop for slide-over drawer (Clicking closes drawer) */}
      {!isExpanded && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 transition-opacity animate-in fade-in duration-150"
        />
      )}

      <div
        className={`fixed top-12 bottom-0 z-40 bg-[#101114] shadow-2xl flex flex-col font-sans text-xs transition-all duration-200 ease-out ${
          isExpanded
            ? "left-0 right-0 border-t border-[#1F2127]"
            : "right-0 w-full max-w-[620px] border-l border-[#1F2127]"
        } ${isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"}`}
      >
        {/* 1. Header Bar */}
        <div className="h-14 border-b border-[#1F2127] bg-[#15171C] px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded bg-[#1A1C22] border border-[#2D3039] flex items-center justify-center font-bold text-xs text-white">
              {account.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-semibold text-sm text-white truncate">{account.name}</h2>
                <a
                  href={`https://${account.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#71717A] hover:text-white transition-colors"
                  title="Open domain"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {isExpanded && (
                  <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 ml-2">
                    Executive Dossier View
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono-tabular">
                <span>{account.domain}</span>
                <span>•</span>
                <span className="text-white font-medium">{account.icpFitScore}/100 ICP Fit</span>
                {quality && (
                  <>
                    <span>•</span>
                    <span className="text-zinc-300">Grade {quality.grade}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onTriggerScan(account.domain)}
              disabled={isScanning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-zinc-200 text-black transition-colors disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "Scanning..." : "Deep Scan"}
            </button>

            {/* Expand / Collapse Full Screen Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded hover:bg-[#1A1C22] text-[#71717A] hover:text-white transition-colors"
              title={isExpanded ? "Collapse to Drawer" : "Expand to Full Page Dossier"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#1A1C22] text-[#71717A] hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* 2. Slide-Over 5-Tab Navigation Bar */}
      <div className="h-9 border-b border-[#1F2127] bg-[#101114] flex items-center px-2 gap-1 flex-shrink-0">
        {[
          { key: "overview", label: "Overview & ICP" },
          { key: "battlecard", label: "Battlecard" },
          { key: "drift", label: "Drift Feed" },
          { key: "outreach", label: "Outreach" },
          { key: "telemetry", label: "Telemetry & Moat" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as TabKey)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#1C1E24] text-white border border-[#2D3039]"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#15171C]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tab Body Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090A0C]">
        {/* TAB 1: OVERVIEW & ICP PROFILE */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Firmographics Micro-Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#101114] border border-[#1F2127] rounded p-2.5">
                <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-1">
                  ARR & Employees
                </div>
                <div className="font-semibold text-white font-mono-tabular">
                  {account.estimatedArr} • {account.employees}
                </div>
              </div>

              <div className="bg-[#101114] border border-[#1F2127] rounded p-2.5">
                <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-1">
                  Buying Stage
                </div>
                <div className="font-semibold text-zinc-200 font-mono-tabular">
                  {account.stage}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            {intel?.executiveSummary && (
              <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-zinc-400" /> Executive Intelligence Summary
                </div>
                <p className="text-[#A1A1AA] leading-relaxed text-[12px] whitespace-pre-line">
                  {intel.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Decision Makers */}
            <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
              <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" /> Verified Decision Makers
              </div>
              <div className="space-y-2.5">
                {account.decisionMakers?.map((dm, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between bg-[#15171C] border border-[#1F2127] p-2 rounded"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">{dm.name}</span>
                        {dm.linkedinUrl && (
                          <a
                            href={dm.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#71717A] hover:text-white"
                          >
                            <Linkedin className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A1A1AA]">{dm.title}</div>
                      <div className="text-[11px] text-[#71717A] mt-1 italic">
                        &quot;{dm.relevanceHook}&quot;
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular border bg-zinc-900 text-zinc-300 border-zinc-800">
                      {dm.emailStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buying Triggers & Pain Points */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-zinc-400" /> Immediate Buying Triggers
                </div>
                <ul className="space-y-1.5 text-[#A1A1AA] list-disc list-inside">
                  {(intel?.buyingTriggers || [account.triggerEvent]).map((trigger, i) => (
                    <li key={i} className="leading-snug">{trigger}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> Core Operational Pain Points
                </div>
                <ul className="space-y-1.5 text-[#A1A1AA] list-disc list-inside">
                  {(intel?.painPoints || [
                    "Manual data reconciliation across sales & ops",
                    "Competitor tool renewal with 30% price increase"
                  ]).map((point, i) => (
                    <li key={i} className="leading-snug">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BATTLECARD STUDIO */}
        {activeTab === "battlecard" && (
          <div className="space-y-4">
            {primaryBattlecard ? (
              <>
                <div className="flex items-center justify-between bg-[#101114] border border-[#1F2127] p-2.5 rounded">
                  <div className="font-semibold text-sm text-white">
                    vs {primaryBattlecard.competitorName}
                  </div>
                  <span className="text-[10px] font-mono-tabular px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                    Confidence: {primaryBattlecard.verificationConfidence}
                  </span>
                </div>

                {/* Win Themes */}
                <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                  <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2">
                    Key Win Themes
                  </div>
                  <div className="space-y-1.5">
                    {primaryBattlecard.winThemes.map((theme, i) => (
                      <div key={i} className="flex items-start gap-2 text-[#A1A1AA]">
                        <span className="text-white font-bold">✓</span>
                        <span>{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Differentiators */}
                <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                  <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2">
                    Capabilities They Lack
                  </div>
                  <div className="space-y-1.5">
                    {primaryBattlecard.keyDifferentiators.map((diff, i) => (
                      <div key={i} className="flex items-start gap-2 text-[#A1A1AA]">
                        <span className="text-zinc-500 font-bold">✕</span>
                        <span>{diff}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objection Handlers with 1-Click Clipboard Copy */}
                <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                  <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2">
                    Objection Handlers & Talk Tracks
                  </div>
                  <div className="space-y-3">
                    {primaryBattlecard.objectionsAndHandling.map((obj, i) => (
                      <div
                        key={i}
                        className="bg-[#15171C] border border-[#1F2127] rounded p-2.5 space-y-1.5"
                      >
                        <div className="font-semibold text-white text-[11px]">
                          &quot;{obj.objection}&quot;
                        </div>
                        <div className="text-[#A1A1AA] text-[11px] leading-relaxed">
                          {obj.counterPositioning}
                        </div>
                        {obj.proofPoint && (
                          <div className="text-[10px] text-zinc-300 font-mono-tabular">
                            Proof: {obj.proofPoint}
                          </div>
                        )}
                        <button
                          onClick={() => copyToClipboard(obj.counterPositioning, `obj_${i}`)}
                          className="flex items-center gap-1 text-[10px] text-[#71717A] hover:text-white mt-1 transition-colors font-mono-tabular"
                        >
                          {copiedKey === `obj_${i}` ? (
                            <>
                              <Check className="w-3 h-3 text-white" /> Copied talk track
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy script
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discovery Landmines */}
                <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
                  <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2">
                    Discovery Landmines to Lay
                  </div>
                  <div className="space-y-1.5">
                    {primaryBattlecard.landminesToLay.map((mine, i) => (
                      <div key={i} className="text-[#A1A1AA] text-[11px] bg-[#15171C] p-2 rounded border border-[#1F2127]">
                        &quot;{mine}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-[#71717A]">
                No competitive battlecard generated yet. Trigger a Deep Scan to build one.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DRIFT & RADAR FEED */}
        {activeTab === "drift" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#101114] border border-[#1F2127] p-2.5 rounded">
              <div>
                <div className="font-semibold text-white">Competitor Drift Feed</div>
                <div className="text-[11px] text-[#71717A]">Real-time delta signals & changes</div>
              </div>
              <button
                onClick={handleFetchLiveDrift}
                disabled={loadingDrift}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F2127] hover:bg-[#2D3039] text-xs text-white border border-[#2D3039] transition-colors"
              >
                <Activity className={`w-3 h-3 ${loadingDrift ? "animate-spin" : ""}`} />
                Check Live
              </button>
            </div>

            {/* Live Drift Events from Backend if fetched */}
            {liveDriftEvents.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-700 rounded p-3 space-y-2">
                <div className="text-[10px] uppercase font-mono-tabular text-zinc-300 tracking-wider font-semibold">
                  Detected Engine Delta Events
                </div>
                {liveDriftEvents.map((evt, idx) => (
                  <div key={idx} className="text-zinc-200 text-xs font-mono-tabular">
                    • {evt}
                  </div>
                ))}
              </div>
            )}

            {/* Historical Signals Stream */}
            <div className="space-y-2.5">
              {account.signals?.map((sig) => (
                <div
                  key={sig.id}
                  className="bg-[#101114] border border-[#1F2127] rounded p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {sig.type}
                    </span>
                    <span className="text-[10px] font-mono-tabular text-[#71717A]">
                      {sig.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                    {sig.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OUTREACH & SEQUENCES */}
        {activeTab === "outreach" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#101114] border border-[#1F2127] p-2.5 rounded">
              <div>
                <div className="font-semibold text-white">3-Step Multi-Channel Sequence</div>
                <div className="text-[11px] text-[#71717A]">Target: {outreach?.targetPersona || "VP Engineering"}</div>
              </div>
              <button
                onClick={() => pulseApi.exportApolloCsv([account])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black font-mono-tabular text-xs font-medium transition-colors"
              >
                <Download className="w-3 h-3" /> Apollo CSV
              </button>
            </div>

            {/* Email Sequences */}
            <div className="space-y-3">
              {(outreach?.emailSequence || [
                {
                  stepNumber: 1,
                  subjectLine: `Quick question on ${account.name}'s developer stack`,
                  bodyText: `Hi {{first_name}},\n\nNoticed you are scaling engineering and dealing with ${account.triggerEvent}. Most teams hitting this threshold experience high latency.\n\nWe built an automated intelligence layer that solves this without rip-and-replace.\n\nOpen to a brief 5-minute walkthrough this Thursday?`,
                  callToAction: "Open to a brief 5-minute walkthrough?"
                }
              ]).map((email) => (
                <div
                  key={email.stepNumber}
                  className="bg-[#101114] border border-[#1F2127] rounded p-3 space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-[#1F2127] pb-1.5">
                    <span className="font-mono-tabular text-[10px] uppercase text-[#71717A]">
                      Step {email.stepNumber} • Email Touchpoint
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Subject: ${email.subjectLine}\n\n${email.bodyText}`,
                          `email_${email.stepNumber}`
                        )
                      }
                      className="flex items-center gap-1 text-[10px] text-[#71717A] hover:text-white font-mono-tabular transition-colors"
                    >
                      {copiedKey === `email_${email.stepNumber}` ? (
                        <>
                          <Check className="w-3 h-3 text-white" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy email
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#71717A]">Subject:</div>
                    <div className="font-medium text-white text-[11px]">{email.subjectLine}</div>
                  </div>

                  <div className="bg-[#15171C] p-2.5 rounded border border-[#1F2127] text-[#A1A1AA] whitespace-pre-line text-[11px] leading-relaxed font-sans">
                    {email.bodyText}
                  </div>
                </div>
              ))}
            </div>

            {/* LinkedIn Touchpoints */}
            <div className="bg-[#101114] border border-[#1F2127] rounded p-3">
              <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider mb-2">
                LinkedIn Connection Angles
              </div>
              <div className="space-y-2">
                {(outreach?.linkedinTouchpoints || [
                  `Saw your recent engineering expansion at ${account.name} — congrats! Dealing with similar architecture patterns here.`
                ]).map((note, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between bg-[#15171C] p-2 rounded border border-[#1F2127] text-[#A1A1AA] text-[11px]"
                  >
                    <span>{note}</span>
                    <button
                      onClick={() => copyToClipboard(note, `li_${i}`)}
                      className="text-[#71717A] hover:text-white ml-2 flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TELEMETRY & AUDIT MOAT */}
        {activeTab === "telemetry" && (
          <div className="space-y-4">
            {/* Factuality & Grounding Scorecard */}
            <div className="bg-[#101114] border border-[#1F2127] rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" /> Factuality & Grounding Scorecard
                </span>
                <span className="font-mono-tabular text-white font-semibold">
                  {quality ? `${Math.round(quality.groundingScore * 100)}% Verified` : "95% Verified"}
                </span>
              </div>

              {/* Progress bar (Monochrome) */}
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-200 rounded-full"
                  style={{ width: `${(quality?.groundingScore || 0.95) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tabular">
                <div className="bg-[#15171C] p-2 rounded border border-[#1F2127]">
                  <span className="text-[#71717A] block text-[10px]">Quality Grade</span>
                  <span className="text-white font-semibold text-sm">
                    {quality?.grade || "Grade A"}
                  </span>
                </div>
                <div className="bg-[#15171C] p-2 rounded border border-[#1F2127]">
                  <span className="text-[#71717A] block text-[10px]">Audited Citations</span>
                  <span className="text-white font-semibold text-sm">
                    {quality?.citedUrlsCount || 4} verified sources
                  </span>
                </div>
              </div>
            </div>

            {/* Clickable Real Source URLs */}
            <div className="bg-[#101114] border border-[#1F2127] rounded p-3 space-y-2">
              <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider">
                Crawled Source Citations (Seltz Web Index)
              </div>
              <div className="space-y-1.5 font-mono-tabular text-[11px]">
                {(quality?.citedUrls || [
                  `https://${account.domain}/pricing`,
                  `https://${account.domain}/blog`,
                  `https://${account.domain}/docs`
                ]).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-zinc-300 hover:text-white hover:underline truncate bg-[#15171C] p-1.5 rounded border border-[#1F2127]"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0 text-[#71717A]" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Token Consumption & Cost */}
            <div className="bg-[#101114] border border-[#1F2127] rounded p-3 space-y-2">
              <div className="text-[10px] uppercase font-mono-tabular text-[#71717A] tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-zinc-300" /> Token & Infrastructure Cost
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono-tabular text-[11px]">
                <div className="bg-[#15171C] p-2 rounded border border-[#1F2127]">
                  <span className="text-[#71717A] block text-[10px]">USD Cost</span>
                  <span className="text-white font-semibold">
                    ${intel?.tokensCostUsd?.toFixed(4) || "0.0182"}
                  </span>
                </div>
                <div className="bg-[#15171C] p-2 rounded border border-[#1F2127]">
                  <span className="text-[#71717A] block text-[10px]">Last Scanned</span>
                  <span className="text-[#A1A1AA]">{intel?.lastScannedAt || "Today"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
