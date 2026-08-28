"use client";

import React from "react";
import {
  Swords,
  Radio,
  ShieldCheck,
  Mail,
  Activity,
  Zap,
  Layers,
  ChevronRight,
  Sparkles,
  Command,
  Database,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { HealthResponse } from "../lib/api";

interface SidebarProps {
  activeTab: "war_room" | "radar" | "battlecards" | "campaigns" | "observability";
  setActiveTab: (tab: "war_room" | "radar" | "battlecards" | "campaigns" | "observability") => void;
  health: HealthResponse | null;
  isLive: boolean;
}

export function Sidebar({ activeTab, setActiveTab, health, isLive }: SidebarProps) {
  const navItems = [
    {
      id: "war_room" as const,
      label: "Deal War Room",
      badge: "Account Simulator",
      badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/40",
      icon: Swords,
      iconColor: "text-amber-400",
      description: "Custom objection sparring & discovery landmines"
    },
    {
      id: "radar" as const,
      label: "Market Radar",
      badge: "24/7 Live Ticker",
      badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-800/40",
      icon: Radio,
      iconColor: "text-cyan-400",
      description: "Pricing shifts & competitor hiring telemetry"
    },
    {
      id: "battlecards" as const,
      label: "Battlecard Studio",
      badge: "Fact-Audited",
      badgeColor: "text-indigo-400 bg-indigo-950/60 border-indigo-800/40",
      icon: ShieldCheck,
      iconColor: "text-indigo-400",
      description: "Matrix with 3-layer Seltz citation grounding"
    },
    {
      id: "campaigns" as const,
      label: "Conquest Outbound",
      badge: "Apollo & Instantly",
      badgeColor: "text-purple-400 bg-purple-950/60 border-purple-800/40",
      icon: Mail,
      iconColor: "text-purple-400",
      description: "Event-triggered cold email sequences"
    },
    {
      id: "observability" as const,
      label: "Audit & Costs",
      badge: "Zero-Hallucination",
      badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40",
      icon: Activity,
      iconColor: "text-emerald-400",
      description: "Execution traces, latencies & token spend"
    },
  ];

  return (
    <aside className="w-72 bg-[#0a0d14] border-r border-white/[0.08] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white font-sans">Pulse</span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  GTM OS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono tracking-tight">Autonomous Revenue Engine</p>
            </div>
          </div>

          {/* Workspace Pill */}
          <div className="mt-4 p-2 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
              <span className="text-xs font-medium text-zinc-300">Enterprise Revenue Hub</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">v1.0</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
            Revenue Workspaces
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-start gap-3 group ${
                  isActive
                    ? "bg-zinc-800/90 border-white/20 shadow-lg shadow-black/40 text-white"
                    : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 hover:border-white/[0.04]"
                }`}
              >
                <div
                  className={`p-2 rounded-lg border shrink-0 transition-colors ${
                    isActive
                      ? "bg-zinc-900 border-white/10 text-white"
                      : "bg-zinc-900/50 border-white/[0.04] text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-tight truncate">{item.label}</span>
                    <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Telemetry Footer */}
      <div className="p-4 border-t border-white/[0.06] space-y-3 bg-[#080a10]">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Database className="h-3 w-3 text-cyan-400" />
              Seltz Engine
            </span>
            <span className="font-mono text-zinc-300 font-semibold">{health?.indexing_mode || "Seltz Live API"}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              Audit Moat
            </span>
            <span className="font-mono text-emerald-400 font-semibold">100% Grounded</span>
          </div>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`text-xs font-mono font-medium ${isLive ? "text-emerald-400" : "text-amber-400"}`}>
              {isLive ? "Backend Active :8000" : "Reconnecting API..."}
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">⚡ 185ms</span>
        </div>
      </div>
    </aside>
  );
}
