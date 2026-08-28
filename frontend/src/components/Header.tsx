"use client";

import React from "react";
import { Search, Command, Plus, Radio, Sparkles, Filter, Bell } from "lucide-react";

interface HeaderProps {
  onQuickScan: () => void;
}

export function Header({ onQuickScan }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#07090e]/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search & Command Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search active opportunities, competitors, pricing drift, or battlecards..."
            className="w-full bg-zinc-900/70 border border-white/[0.08] rounded-xl pl-10 pr-16 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
          />
          <div className="absolute right-3 top-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-zinc-400">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-zinc-400">Sensing Daemon:</span>
          <span className="font-mono text-cyan-400 font-semibold">Active (Watchlist: 3 Targets)</span>
        </div>

        <button
          onClick={onQuickScan}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-95 shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>New GTM Scan</span>
        </button>
      </div>
    </header>
  );
}
