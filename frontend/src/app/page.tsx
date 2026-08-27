"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { DealWarRoom } from "../components/DealWarRoom";
import { MarketRadar } from "../components/MarketRadar";
import { BattlecardStudio } from "../components/BattlecardStudio";
import { CampaignHub } from "../components/CampaignHub";
import { ObservabilityPanel } from "../components/ObservabilityModal";
import { Swords, Radio, ShieldCheck, Mail, Activity, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"war_room" | "radar" | "battlecards" | "campaigns" | "observability">("war_room");

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Hero Banner */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                Revenue Command Center
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-300 font-semibold">
                  v1.0 Live
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Autonomous market sensing, sub-200ms Seltz web indexing, and instant revenue workflow dispatchers.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Seltz Latency</div>
                <div className="text-xs font-bold text-cyan-400 font-mono">185 ms</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Grounding Rate</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">100% Verified</div>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Avg Scan Cost</div>
                <div className="text-xs font-bold text-indigo-400 font-mono">~$0.02 / run</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("war_room")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "war_room"
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Swords className="h-4 w-4 text-amber-400" />
            Deal War Room
          </button>

          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "radar"
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Radio className="h-4 w-4 text-cyan-400" />
            Market Sensing Radar
          </button>

          <button
            onClick={() => setActiveTab("battlecards")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "battlecards"
                ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            Battlecard Studio
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "campaigns"
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Mail className="h-4 w-4 text-purple-400" />
            Conquest Outbound Hub
          </button>

          <button
            onClick={() => setActiveTab("observability")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              activeTab === "observability"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10"
                : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Activity className="h-4 w-4 text-emerald-400" />
            Observability & Costs
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {activeTab === "war_room" && <DealWarRoom />}
          {activeTab === "radar" && <MarketRadar />}
          {activeTab === "battlecards" && <BattlecardStudio />}
          {activeTab === "campaigns" && <CampaignHub />}
          {activeTab === "observability" && <ObservabilityPanel />}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-[#060910] py-6 px-6 text-center text-xs text-slate-500">
        <p>⚡ Pulse Autonomous GTM Operating System • Powered by CrewAI & Seltz AI Web Indexing</p>
      </footer>
    </div>
  );
}
