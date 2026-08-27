"use client";

import React, { useEffect, useState } from "react";
import { Zap, Activity, ShieldCheck, Database, Radio } from "lucide-react";
import { pulseApi, HealthResponse } from "../lib/api";

export function Header() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await pulseApi.getHealth();
        setHealth(data);
        setIsLive(true);
      } catch (err) {
        setIsLive(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-[#0c111d]/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Pulse</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">
                Autonomous GTM OS
              </span>
            </div>
            <p className="text-xs text-slate-400">Market Sensing • Seltz Web Indexing • Revenue Execution</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span>Indexer: <b>{health?.indexing_mode || "Seltz Live API"}</b></span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Anti-Hallucination: <b>Active</b></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={isLive ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
              {isLive ? "Backend Live" : "Offline Mode"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
