"use client";

import React from "react";
import { HealthResponse } from "../lib/api";
import { Search, Zap, Plus, ChevronDown, Activity, Sparkles } from "lucide-react";

interface TopbarProps {
  health: HealthResponse | null;
  isLive: boolean;
  onOpenCommandPalette: () => void;
  onOpenNewScanModal: () => void;
  onOpenAuditLogs: () => void;
  activeScanCount: number;
}

export function Topbar({
  health,
  isLive,
  onOpenCommandPalette,
  onOpenNewScanModal,
  onOpenAuditLogs,
  activeScanCount
}: TopbarProps) {
  return (
    <div className="h-12 border-b border-[#1F2127] bg-[#101114] flex items-center justify-between px-4 flex-shrink-0 text-xs font-sans select-none">
      {/* Left: Branding & Workspace */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#15171C] border border-[#2D3039] rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold tracking-tight text-[#F4F4F6] text-sm">Pulse</span>
          <span className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded bg-[#15171C] text-[#9DA0AA] border border-[#1F2127]">
            GTM OS
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#1F2127] mx-1" />

        {/* Workspace dropdown */}
        <button className="flex items-center gap-1.5 text-xs text-[#9DA0AA] hover:text-[#F4F4F6] px-2 py-1 rounded hover:bg-[#15171C] transition-colors border border-transparent hover:border-[#1F2127]">
          <span>Enterprise Q3</span>
          <ChevronDown className="w-3 h-3 text-[#565964]" />
        </button>

        {/* Command Palette Trigger Pill */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-[#15171C] hover:bg-[#1A1C22] border border-[#1F2127] hover:border-[#2D3039] text-[#565964] hover:text-[#9DA0AA] px-3 py-1.5 rounded-lg text-xs transition-colors ml-2"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search or command...</span>
          <kbd className="text-[10px] font-mono-tabular bg-[#101114] px-1.5 py-0.5 rounded border border-[#1F2127] text-[#9DA0AA] ml-4">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Telemetry, System Health, and Actions */}
      <div className="flex items-center gap-3">
        {/* Active Scan Progress Badge if running */}
        {activeScanCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tabular">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{activeScanCount} Scan{activeScanCount > 1 ? "s" : ""} In Progress</span>
          </div>
        )}

        {/* System Health Ping */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#15171C] border border-[#1F2127]">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-zinc-200" : "bg-zinc-600"}`} />
          <span className="text-[11px] font-mono-tabular text-[#9DA0AA]">
            {isLive ? `Live :8001 (${health?.indexing_mode || "Seltz Index"})` : "Backend Offline"}
          </span>
        </div>

        {/* Audit Logs Trigger */}
        <button
          onClick={onOpenAuditLogs}
          className="flex items-center gap-1 text-xs text-[#9DA0AA] hover:text-[#F4F4F6] px-2.5 py-1.5 rounded bg-[#15171C] hover:bg-[#1A1C22] border border-[#1F2127] hover:border-[#2D3039] transition-colors"
          title="System Audit & Observability Logs"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audit Moat</span>
        </button>

        {/* New Scan CTA */}
        <button
          onClick={onOpenNewScanModal}
          className="flex items-center gap-1.5 bg-[#F4F4F6] hover:bg-white text-[#090A0C] font-medium text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Deep Scan</span>
        </button>
      </div>
    </div>
  );
}
