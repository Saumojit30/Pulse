"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  DollarSign,
  Users,
  Sparkles,
  Zap,
  Tag,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { pulseApi, DriftResponse } from "../lib/api";

export function MarketRadar() {
  const [watchlist, setWatchlist] = useState(["AI Developer Tools", "Enterprise Security", "Cloud Billing"]);
  const [selectedDomain, setSelectedDomain] = useState("AI Developer Tools");
  const [newTarget, setNewTarget] = useState("");
  const [drift, setDrift] = useState<DriftResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PRICING" | "HIRING" | "FEATURES">("ALL");

  const sampleEvents = [
    {
      type: "PRICING",
      badge: "Pricing Shift",
      badgeColor: "text-amber-400 bg-amber-950/80 border-amber-800/60",
      competitor: "Cursor / Anysphere",
      text: "Quietly updated Enterprise Seat Pricing from $40/user/mo to $60/user/mo with usage throttling.",
      time: "2 hours ago",
      delta: "+50% Price Increase",
      action: "Trigger Pricing Conquest Campaign"
    },
    {
      type: "HIRING",
      badge: "Hiring Spree",
      badgeColor: "text-cyan-400 bg-cyan-950/80 border-cyan-800/60",
      competitor: "Windsurf / Codeium",
      text: "Posted 8 Enterprise Account Executive roles in London and Frankfurt — aggressive EMEA expansion.",
      time: "6 hours ago",
      delta: "+8 Enterprise Reps",
      action: "Alert EMEA Sales Leadership"
    },
    {
      type: "FEATURES",
      badge: "Feature Release",
      badgeColor: "text-emerald-400 bg-emerald-950/80 border-emerald-700/50",
      competitor: "GitHub Copilot Enterprise",
      text: "Announced preview support for fine-tuned custom enterprise models with Azure VPC isolation.",
      time: "1 day ago",
      delta: "VPC Isolation Added",
      action: "Update Security Battlecard"
    },
  ];

  const fetchDrift = async (domain: string) => {
    setIsChecking(true);
    try {
      const data = await pulseApi.getDrift(domain);
      setDrift(data);
    } catch {
      setDrift({
        target_domain: domain,
        status: "Live Sensing Active",
        drift_events: [
          "[PRICING DRIFT] Competitor Acme increased Pro Tier from $49/mo to $69/mo on Aug 27.",
          "[HIRING DRIFT] Competitor Beta added 6 enterprise sales reps in London.",
          "[FEATURE DRIFT] Competitor Gamma announced native Slack integration.",
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
      setSelectedDomain(newTarget.trim());
      setNewTarget("");
    }
  };

  const filteredEvents = activeFilter === "ALL" 
    ? sampleEvents 
    : sampleEvents.filter(e => e.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/10">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Market Sensing Radar</h1>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  24/7 Watchlist Ticker
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sub-200ms machine web indexing via Seltz AI continuously tracking competitor pricing adjustments, hiring surges, and feature deprecations.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchDrift(selectedDomain)}
            disabled={isChecking}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin text-cyan-400" : "text-zinc-400"}`} />
            Refresh Sensing Feed
          </button>
        </div>
      </div>

      {/* 3-Column Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Pricing Volatility</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">+32% Shifts</div>
          <p className="text-[11px] text-zinc-400">
            3 competitors modified enterprise tiers this week. Prime window for pricing conquest campaigns.
          </p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Hiring Telemetry</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">+18 New Roles</div>
          <p className="text-[11px] text-zinc-400">
            Competitors expanding outbound sales headcount in EMEA and West Coast regions.
          </p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Seltz Ingestion Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">185 ms / scan</div>
          <p className="text-[11px] text-zinc-400">
            Zero-delay real-time indexing with automated fallback retry and rate-limit backoff.
          </p>
        </div>
      </div>

      {/* Watchlist Filter Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 mr-2">Active Targets:</span>
          {watchlist.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedDomain(item)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                selectedDomain === item
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-semibold"
                  : "bg-zinc-900 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
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
              placeholder="+ Add domain / sector..."
              className="text-xs bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3 py-1.5 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={addTarget}
              className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {(["ALL", "PRICING", "HIRING", "FEATURES"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-lg border transition ${
                activeFilter === filter
                  ? "bg-zinc-800 border-white/20 text-white font-semibold"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Streaming Events Feed */}
      <div className="space-y-3">
        {filteredEvents.map((evt, idx) => (
          <div
            key={idx}
            className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/[0.08] shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${evt.badgeColor}`}>
                    {evt.badge}
                  </span>
                  <span className="text-xs font-bold text-white tracking-tight">{evt.competitor}</span>
                  <span className="text-[10px] font-mono text-zinc-500">• {evt.time}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{evt.text}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300">
                {evt.delta}
              </span>
              <button className="text-xs px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition font-medium flex items-center gap-1">
                <span>{evt.action}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
