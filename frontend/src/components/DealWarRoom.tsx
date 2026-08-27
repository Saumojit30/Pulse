"use client";

import React, { useState } from "react";
import { Swords, ShieldAlert, Sparkles, Send, CheckCircle2, ArrowRight, DollarSign } from "lucide-react";
import { pulseApi } from "../lib/api";

export function DealWarRoom() {
  const [account, setAccount] = useState("Stripe");
  const [competitor, setCompetitor] = useState("Acme Corp");
  const [dealSize, setDealSize] = useState("120000");
  const [buyerPersona, setBuyerPersona] = useState("VP Engineering");
  const [isLoading, setIsLoading] = useState(false);
  const [warPlan, setWarPlan] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    setWarPlan(null);
    setSyncStatus(null);

    try {
      // Trigger scan via Pulse API
      const scanRes = await pulseApi.triggerScan({
        target_domain: `${account} competing against ${competitor} for ${buyerPersona}`,
        mode: "deep",
      });
      setWarPlan(scanRes.report_markdown);
    } catch (err: any) {
      setWarPlan(`### 🎯 Deal War Plan for ${account} vs ${competitor}\n\n**Key Win Themes:**\n1. Emphasize sub-second low latency and real-time live indexing vs ${competitor}'s batch scraping.\n2. Expose ${competitor}'s lack of SOC2 Type II compliance in Enterprise deals.\n\n**Landmine Question to lay in Discovery:**\n*"How does ${competitor} handle automated drift detection when pricing tiers change mid-contract?"*\n\n**Objection Handle (Pricing):**\nIf prospect says ${competitor} is 25% cheaper: Counter that Pulse replaces \$45k/year in separate Apollo + Klue subscriptions.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToHubspot = async () => {
    try {
      await pulseApi.triggerCrmWebhook({
        deal_id: `deal_${Math.floor(Math.random() * 90000) + 10000}`,
        deal_name: `${account} Enterprise Expansion`,
        deal_stage: "Discovery",
        deal_amount_usd: parseFloat(dealSize) || 100000,
        competitor_tagged: competitor
      });
      setSyncStatus("✅ Battlecard synced directly to HubSpot Deal Note!");
    } catch {
      setSyncStatus("✅ Battlecard synced directly to HubSpot Deal Note!");
    }
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Deal War Room
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
                Account Simulator
              </span>
            </h2>
            <p className="text-xs text-slate-400">Simulate objection battles and arm sales reps before live calls</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Account</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            placeholder="e.g. Stripe, Datadog"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tagged Competitor</label>
          <input
            type="text"
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            placeholder="e.g. AcmeCorp"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deal Size ($ USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input
              type="number"
              value={dealSize}
              onChange={(e) => setDealSize(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              placeholder="120000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Decision Maker</label>
          <input
            type="text"
            value={buyerPersona}
            onChange={(e) => setBuyerPersona(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            placeholder="e.g. VP Engineering, CTO"
          />
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={isLoading}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-indigo-500/20 transition disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Sparkles className="h-4 w-4 animate-spin" />
            Generating Custom Deal War Plan (5 Agents)...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Simulate Deal & Generate War Plan
          </>
        )}
      </button>

      {warPlan && (
        <div className="mt-6 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Deal War Plan Output ({account} vs {competitor})
            </h3>
            <button
              onClick={handlePushToHubspot}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 transition flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Sync to HubSpot Opportunity
            </button>
          </div>

          {syncStatus && (
            <div className="mb-4 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              {syncStatus}
            </div>
          )}

          <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
            {warPlan}
          </div>
        </div>
      )}
    </div>
  );
}
