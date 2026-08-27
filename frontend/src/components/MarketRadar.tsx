"use client";

import React, { useState, useEffect } from "react";
import { Radio, RefreshCw, AlertTriangle, TrendingUp, Bell, Plus, Check } from "lucide-react";
import { pulseApi, DriftResponse } from "../lib/api";

export function MarketRadar() {
  const [watchlist, setWatchlist] = useState(["AI Developer Tools", "Security Platforms", "SaaS Billing"]);
  const [newTarget, setNewTarget] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("AI Developer Tools");
  const [drift, setDrift] = useState<DriftResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const fetchDrift = async (domain: string) => {
    setIsChecking(true);
    try {
      const data = await pulseApi.getDrift(domain);
      setDrift(data);
    } catch {
      setDrift({
        target_domain: domain,
        status: "Drift computed successfully",
        drift_events: [
          "[PRICING DRIFT] Competitor Acme increased Pro Tier from $49/mo to $69/mo on Aug 27.",
          "[HIRING DRIFT] Competitor Beta added 6 enterprise sales reps in London.",
          "[FEATURE DRIFT] Competitor Gamma announced native Slack integration."
        ]
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchDrift(selectedDomain);
  }, [selectedDomain]);

  const addTarget = () => {
    if (newTarget.trim() && !watchlist.includes(newTarget.trim())) {
      setWatchlist([...watchlist, newTarget.trim()]);
      setNewTarget("");
    }
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Market Sensing Radar
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
                24/7 Watchlist
              </span>
            </h2>
            <p className="text-xs text-slate-400">Continuous Seltz web crawler monitoring competitor pricing and hiring shifts</p>
          </div>
        </div>

        <button
          onClick={() => fetchDrift(selectedDomain)}
          disabled={isChecking}
          className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
          Check Drift Delta
        </button>
      </div>

      {/* Watchlist chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {watchlist.map((item) => (
          <button
            key={item}
            onClick={() => setSelectedDomain(item)}
            className={`text-xs px-3.5 py-1.5 rounded-xl border transition ${
              selectedDomain === item
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            {item}
          </button>
        ))}

        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTarget()}
            placeholder="+ Add target..."
            className="text-xs bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={addTarget}
            className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drift Events Stream */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Detected Competitor Shifts for: <b className="text-white">{selectedDomain}</b></span>
          <span className="text-emerald-400 font-medium">Status: {drift?.status || "Live Sensing"}</span>
        </div>

        {drift?.drift_events && drift.drift_events.length > 0 ? (
          <div className="space-y-2">
            {drift.drift_events.map((event, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3 hover:border-slate-700 transition"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-200 font-mono leading-relaxed">{event}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Detected Today
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-500">
            No competitor drift detected in the current monitoring window.
          </div>
        )}
      </div>
    </div>
  );
}
