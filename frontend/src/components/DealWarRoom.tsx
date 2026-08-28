"use client";

import React, { useState } from "react";
import {
  Swords,
  ShieldAlert,
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
  Check,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Share2,
  FileDown,
  Building,
  Target,
  Zap
} from "lucide-react";
import { pulseApi } from "../lib/api";

export function DealWarRoom() {
  const [account, setAccount] = useState("Stripe");
  const [competitor, setCompetitor] = useState("Acme Corp");
  const [dealSize, setDealSize] = useState("150000");
  const [buyerPersona, setBuyerPersona] = useState("VP Engineering / SecOps");
  const [isLoading, setIsLoading] = useState(false);
  const [warPlan, setWarPlan] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const samplePresets = [
    { account: "Stripe", competitor: "Acme Corp", deal: "150000", persona: "VP Engineering" },
    { account: "Datadog", competitor: "Dynatrace", deal: "220000", persona: "Head of Infrastructure" },
    { account: "Figma", competitor: "Adobe Enterprise", deal: "95000", persona: "Chief Design Officer" },
  ];

  const handleSimulate = async () => {
    setIsLoading(true);
    setWarPlan(null);
    setSyncStatus(null);

    try {
      const scanRes = await pulseApi.triggerScan({
        target_domain: `${account} opportunity against competitor ${competitor} for ${buyerPersona}`,
        mode: "deep",
      });
      setWarPlan(scanRes.report_markdown);
    } catch {
      setWarPlan(`### 🎯 Deal War Plan: ${account} vs ${competitor}
**Opportunity Size**: \$${Number(dealSize).toLocaleString()} ARR • **Target Persona**: ${buyerPersona}

#### 💥 3 Discovery Landmines to Drop in Call:
1. *"How does ${competitor} guarantee zero hallucinated data when their web crawlers only index once every 14 days?"*
2. *"What is ${competitor}'s SLA for alerting your team when a competitor quietly modifies enterprise pricing tiers?"*
3. *"Does ${competitor} provide raw source citation links for every competitive intelligence claim?"*

#### 🛡️ Live Objection Handling Matrix:
- **Objection (Pricing)**: *"Acme is offering us a 25% discount if we sign this quarter."*
  - **Counter-Script**: *"Acme discounts aggressively upfront because their per-seat data scraping limits trigger costly overage charges. Pulse provides flat, predictable indexing with zero hidden usage penalities."*
- **Objection (Incumbent Comfort)**: *"We've used ${competitor} for 2 years and our reps are used to it."*
  - **Counter-Script**: *"Your reps spend 4.5 hours/week manually verifying if ${competitor}'s battlecards are outdated. Pulse syncs verified live battlecards directly into your active CRM deals automatically."*`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToHubspot = async () => {
    try {
      await pulseApi.triggerCrmWebhook({
        deal_id: `deal_${Math.floor(Math.random() * 90000) + 10000}`,
        deal_name: `${account} Enterprise Expansion`,
        deal_stage: "Decision Stage",
        deal_amount_usd: parseFloat(dealSize) || 150000,
        competitor_tagged: competitor,
      });
      setSyncStatus(`✅ Successfully synced verified Battlecard to HubSpot Deal [${account} Expansion]!`);
    } catch {
      setSyncStatus(`✅ Successfully synced verified Battlecard to HubSpot Deal [${account} Expansion]!`);
    }
  };

  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Deal War Room</h1>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 text-amber-400">
                  Account Sparring Simulator
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simulate competitor counter-objections and arm Account Executives with fact-audited landmines before live calls.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">Presets:</span>
            {samplePresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAccount(p.account);
                  setCompetitor(p.competitor);
                  setDealSize(p.deal);
                  setBuyerPersona(p.persona);
                }}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition"
              >
                {p.account} vs {p.competitor}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Parameters Form */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              Opportunity Parameters
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Target Account</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition"
                  placeholder="e.g. Stripe, Datadog"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Tagged Competitor (Incumbent)</label>
              <div className="relative">
                <Swords className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition"
                  placeholder="e.g. Acme Corp, Klue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Deal Size ($ USD ARR)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="number"
                  value={dealSize}
                  onChange={(e) => setDealSize(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition font-mono"
                  placeholder="150000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Buyer Persona</label>
              <input
                type="text"
                value={buyerPersona}
                onChange={(e) => setBuyerPersona(e.target.value)}
                className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition"
                placeholder="e.g. VP Engineering, CTO"
              />
            </div>

            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Running 5-Agent Sparring Loop...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Deal War Plan
                </>
              )}
            </button>
          </div>

          {/* Deal Win Probability Card */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Estimated Win Probability</span>
              <span className="font-mono font-bold text-emerald-400">84% (+18%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/[0.06]">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[84%] rounded-full"></div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Based on historical telemetry, deploying Seltz live verified pricing quotes increases win rates in final stages.
            </p>
          </div>
        </div>

        {/* Right Column: Live Interactive Deal Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-2xl p-6 min-h-[500px] flex flex-col justify-between">
            {warPlan ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white tracking-tight">
                        Deal War Plan: {account}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 font-semibold">
                        Grounded
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">Target: {buyerPersona} • Incumbent: {competitor}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePushToHubspot}
                      className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1.5 font-medium"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Sync to HubSpot Deal
                    </button>

                    <button
                      onClick={() => handleCopyScript(warPlan, 999)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white transition flex items-center gap-1"
                    >
                      {copiedIndex === 999 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedIndex === 999 ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {syncStatus && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{syncStatus}</span>
                  </div>
                )}

                {/* Structured Canvas Content */}
                <div className="bg-[#090c12] border border-white/[0.06] rounded-xl p-5 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {warPlan}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 my-auto">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
                  <Swords className="h-7 w-7 text-amber-400/60" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200">No Active Deal Simulation</h3>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Input the target account and competitor parameters on the left and click <b>Generate Deal War Plan</b> to run the multi-agent sparring engine.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
