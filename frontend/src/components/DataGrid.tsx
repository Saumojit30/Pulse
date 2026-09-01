"use client";

import React, { useEffect, useCallback } from "react";
import { GTMAccount, ViewFilter } from "../types/gtm";
import { Zap, AlertTriangle, Loader2, CheckCircle2, Download, Send, RefreshCw } from "lucide-react";

interface DataGridProps {
  accounts: GTMAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelectId: (id: string) => void;
  onToggleSelectAll: () => void;
  activeFilter: ViewFilter;
  onChangeFilter: (filter: ViewFilter) => void;
  onTriggerBatchScan: (ids: string[]) => void;
  onSyncBatchCrm: (ids: string[]) => void;
  onExportBatchApollo: (ids: string[]) => void;
}

export function DataGrid({
  accounts,
  selectedAccountId,
  onSelectAccount,
  selectedIds,
  onToggleSelectId,
  onToggleSelectAll,
  activeFilter,
  onChangeFilter,
  onTriggerBatchScan,
  onSyncBatchCrm,
  onExportBatchApollo
}: DataGridProps) {

  // Keyboard navigation: J/K or Up/Down, Enter/Space
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Avoid triggering when focused in an input
    if (["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName)) {
      return;
    }

    if (accounts.length === 0) return;

    const currentIndex = accounts.findIndex((a) => a.id === selectedAccountId);

    if (e.key === "j" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;
      onSelectAccount(accounts[nextIndex].id);
    } else if (e.key === "k" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : accounts.length - 1;
      onSelectAccount(accounts[prevIndex].id);
    } else if (e.key === "Enter" || e.key === " ") {
      if (selectedAccountId) {
        e.preventDefault();
        onSelectAccount(selectedAccountId);
      }
    }
  }, [accounts, selectedAccountId, onSelectAccount]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const allSelected = accounts.length > 0 && accounts.every((a) => selectedIds.has(a.id));
  const someSelected = accounts.some((a) => selectedIds.has(a.id)) && !allSelected;

  // Filter counts
  const countAll = accounts.length;
  const countDrift = accounts.filter(a => a.intelStatus === "Drift Alert" || a.signals?.length > 0).length;
  const countHighFit = accounts.filter(a => a.icpFitScore >= 85).length;
  const countScanning = accounts.filter(a => a.intelStatus === "Scanning").length;

  return (
    <div className="flex flex-col h-full bg-[#090A0C] select-none text-[12px]">
      {/* View Presets Filter Bar */}
      <div className="h-9 border-b border-[#1F2127] bg-[#101114] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeFilter("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-[#1A1C22] text-[#F4F4F6] border border-[#2D3039]"
                : "text-[#9DA0AA] hover:text-[#F4F4F6] hover:bg-[#15171C]"
            }`}
          >
            All Accounts <span className="font-mono-tabular text-[#565964] ml-1">{countAll}</span>
          </button>
          
          <button
            onClick={() => onChangeFilter("drift")}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeFilter === "drift"
                ? "bg-[#1A1C22] text-white border border-[#2D3039]"
                : "text-[#9DA0AA] hover:text-white hover:bg-[#15171C]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Drift Alerts <span className="font-mono-tabular ml-0.5 text-zinc-500">{countDrift}</span>
          </button>

          <button
            onClick={() => onChangeFilter("high_fit")}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeFilter === "high_fit"
                ? "bg-[#1A1C22] text-white border border-[#2D3039]"
                : "text-[#9DA0AA] hover:text-white hover:bg-[#15171C]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            High Fit (85+) <span className="font-mono-tabular ml-0.5 text-zinc-500">{countHighFit}</span>
          </button>

          <button
            onClick={() => onChangeFilter("scanning")}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeFilter === "scanning"
                ? "bg-[#1A1C22] text-white border border-[#2D3039]"
                : "text-[#9DA0AA] hover:text-white hover:bg-[#15171C]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            Scanning <span className="font-mono-tabular ml-0.5 text-zinc-500">{countScanning}</span>
          </button>
        </div>

        <div className="text-[11px] text-[#565964] font-mono-tabular hidden md:block">
          Navigate: <kbd className="bg-[#15171C] px-1 py-0.5 border border-[#1F2127] rounded text-[#9DA0AA]">J</kbd> / <kbd className="bg-[#15171C] px-1 py-0.5 border border-[#1F2127] rounded text-[#9DA0AA]">K</kbd> • Inspect: <kbd className="bg-[#15171C] px-1 py-0.5 border border-[#1F2127] rounded text-[#9DA0AA]">↵</kbd>
        </div>
      </div>

      {/* 32px Ultra-Dense Data Grid Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="bg-[#101114] border-b border-[#1F2127] text-[#9DA0AA] sticky top-0 z-10 font-medium select-none">
            <tr className="h-8">
              <th className="w-8 px-2.5 text-center border-r border-[#1F2127]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#2D3039] bg-[#15171C] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer h-3.5 w-3.5 accent-white"
                />
              </th>
              <th className="w-10 px-2 text-center border-r border-[#1F2127] font-mono-tabular">#</th>
              <th className="px-3 border-r border-[#1F2127] min-w-[200px]">Account / Domain</th>
              <th className="px-3 border-r border-[#1F2127] w-28">Status</th>
              <th className="px-3 border-r border-[#1F2127] w-32">ICP Fit</th>
              <th className="px-3 border-r border-[#1F2127] w-36">Competitor</th>
              <th className="px-3 border-r border-[#1F2127] min-w-[220px]">Trigger / Intent Signal</th>
              <th className="px-3 w-28">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2127]">
            {accounts.map((acc, idx) => {
              const isSelected = acc.id === selectedAccountId;
              const isChecked = selectedIds.has(acc.id);

              return (
                <tr
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`grid-row-dense cursor-pointer transition-colors ${
                    isSelected ? "row-selected bg-[#17181F]" : "hover:bg-[#101114] bg-[#090A0C]"
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelectId(acc.id);
                    }}
                    className="px-2.5 text-center border-r border-[#1F2127]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelectId(acc.id);
                      }}
                      className="rounded border-[#2D3039] bg-[#15171C] text-white focus:ring-0 cursor-pointer h-3.5 w-3.5 accent-white"
                    />
                  </td>

                  {/* Index */}
                  <td className="px-2 text-center border-r border-[#1F2127] text-[#565964] font-mono-tabular text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Company & Domain */}
                  <td className="px-3 border-r border-[#1F2127]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#F4F4F6] truncate">{acc.name}</span>
                      <span className="text-[11px] text-[#565964] font-mono-tabular truncate">{acc.domain}</span>
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="px-3 border-r border-[#1F2127]">
                    {acc.intelStatus === "Drift Alert" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-tabular font-medium bg-zinc-900 text-zinc-100 border border-zinc-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Drift Alert
                      </span>
                    ) : acc.intelStatus === "Scanning" ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-tabular font-medium bg-zinc-900 text-zinc-300 border border-zinc-700">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-zinc-300" />
                        Scanning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono-tabular font-medium bg-zinc-900/60 text-zinc-400 border border-zinc-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        Ready
                      </span>
                    )}
                  </td>

                  {/* Inline 40px Micro-bar ICP Fit (Clean Monochrome) */}
                  <td className="px-3 border-r border-[#1F2127]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular font-medium text-xs text-[#F4F4F6] w-6">
                        {acc.icpFitScore}
                      </span>
                      <div className="w-10 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full rounded-full bg-zinc-200"
                          style={{ width: `${acc.icpFitScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Primary Competitor */}
                  <td className="px-3 border-r border-[#1F2127] text-[#9DA0AA] truncate font-medium">
                    {acc.primaryCompetitor || "--"}
                  </td>

                  {/* Trigger / Intent Signal */}
                  <td className="px-3 border-r border-[#1F2127] text-[#9DA0AA] truncate">
                    <span className="text-[#F4F4F6]">{acc.triggerEvent}</span>
                  </td>

                  {/* Owner */}
                  <td className="px-3 text-[#565964] truncate text-[11px]">
                    {acc.leadOwner}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar (Linear/Raycast style, Monochrome) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#15171C] border border-[#2D3039] rounded-lg shadow-2xl px-4 py-2 flex items-center gap-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 border-r border-[#2D3039] pr-3 text-xs font-mono-tabular text-[#F4F4F6]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-semibold">{selectedIds.size}</span> selected
          </div>

          <button
            onClick={() => onTriggerBatchScan(Array.from(selectedIds))}
            className="flex items-center gap-1.5 text-xs font-medium bg-[#1F2127] hover:bg-[#2D3039] text-[#F4F4F6] px-2.5 py-1.5 rounded transition-colors border border-[#2D3039]"
          >
            <Zap className="w-3.5 h-3.5 text-zinc-300" />
            Run Deep Scan
          </button>

          <button
            onClick={() => onSyncBatchCrm(Array.from(selectedIds))}
            className="flex items-center gap-1.5 text-xs font-medium bg-[#1F2127] hover:bg-[#2D3039] text-[#F4F4F6] px-2.5 py-1.5 rounded transition-colors border border-[#2D3039]"
          >
            <Send className="w-3.5 h-3.5 text-zinc-300" />
            Sync to CRM
          </button>

          <button
            onClick={() => onExportBatchApollo(Array.from(selectedIds))}
            className="flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-zinc-200 text-black px-2.5 py-1.5 rounded transition-colors font-mono-tabular"
          >
            <Download className="w-3.5 h-3.5" />
            Export Apollo CSV
          </button>

          <button
            onClick={onToggleSelectAll}
            className="text-[11px] text-[#565964] hover:text-[#9DA0AA] transition-colors ml-1"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
