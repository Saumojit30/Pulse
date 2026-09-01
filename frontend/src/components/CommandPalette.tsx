"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GTMAccount } from "../types/gtm";
import { Search, Zap, Send, Download, ArrowRight, X, Sparkles, Filter } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: GTMAccount[];
  onSelectAccount: (id: string) => void;
  onTriggerScan: (domain: string) => void;
  onSyncCrm: (accounts: GTMAccount[]) => void;
  onExportApollo: (accounts: GTMAccount[]) => void;
  onFilterChange: (filter: "all" | "drift" | "high_fit" | "scanning") => void;
  selectedAccount: GTMAccount | null;
}

interface CommandItem {
  id: string;
  category: "Actions" | "Accounts" | "Navigation";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  accounts,
  onSelectAccount,
  onTriggerScan,
  onSyncCrm,
  onExportApollo,
  onFilterChange,
  selectedAccount
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Build command list based on query
  const commands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // 1. Actions
    list.push({
      id: "act_scan_selected",
      category: "Actions",
      title: selectedAccount ? `Deep Scan: ${selectedAccount.name}` : "Run Deep Scan on Selected",
      subtitle: "Execute multi-agent research pipeline & fact audit",
      icon: <Zap className="w-4 h-4 text-white" />,
      action: () => {
        if (selectedAccount) onTriggerScan(selectedAccount.domain);
        onClose();
      }
    });

    list.push({
      id: "act_sync_crm",
      category: "Actions",
      title: "Sync Selected to CRM",
      subtitle: "Push battlecard & deal stage payload to HubSpot",
      icon: <Send className="w-4 h-4 text-zinc-300" />,
      action: () => {
        onSyncCrm(accounts);
        onClose();
      }
    });

    list.push({
      id: "act_export_apollo",
      category: "Actions",
      title: "Export All Accounts to Apollo CSV",
      subtitle: "Generate formatted multi-touch outreach CSV for Apollo.io",
      icon: <Download className="w-4 h-4 text-zinc-300" />,
      action: () => {
        onExportApollo(accounts);
        onClose();
      }
    });

    // 2. Navigation / Filters
    list.push({
      id: "nav_drift",
      category: "Navigation",
      title: "Filter: ⚡ Drift Alerts",
      subtitle: "Show accounts with competitor pricing/feature shifts",
      icon: <Filter className="w-4 h-4 text-zinc-300" />,
      action: () => {
        onFilterChange("drift");
        onClose();
      }
    });

    list.push({
      id: "nav_high_fit",
      category: "Navigation",
      title: "Filter: 🎯 High Fit (85+ Score)",
      subtitle: "Show top ICP accounts with active buying intent",
      icon: <Filter className="w-4 h-4 text-zinc-300" />,
      action: () => {
        onFilterChange("high_fit");
        onClose();
      }
    });

    // 3. Accounts matching query
    accounts.forEach((acc) => {
      list.push({
        id: `acc_${acc.id}`,
        category: "Accounts",
        title: acc.name,
        subtitle: `${acc.domain} • ${acc.icpFitScore} ICP Fit • ${acc.primaryCompetitor || "No competitor"}`,
        icon: <Sparkles className="w-4 h-4 text-[#9DA0AA]" />,
        action: () => {
          onSelectAccount(acc.id);
          onClose();
        }
      });
    });

    if (!query.trim()) {
      return list.slice(0, 10);
    }

    const lower = query.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(lower))
    );
  }, [accounts, query, selectedAccount, onTriggerScan, onSyncCrm, onExportApollo, onFilterChange, onSelectAccount, onClose]);

  // Handle arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < commands.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : commands.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (commands[selectedIndex]) {
        commands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-xl bg-[#101114] border border-[#2D3039] rounded-xl shadow-2xl overflow-hidden font-sans text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-12 border-b border-[#1F2127] flex items-center px-4 gap-3 bg-[#15171C]">
          <Search className="w-4 h-4 text-[#565964]" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search accounts... (e.g. 'Deep Scan', 'Acme', 'Filter')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[#F4F4F6] placeholder:text-[#565964] text-xs font-medium"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[#1F2127] border border-[#2D3039] text-[#9DA0AA] text-[10px] font-mono-tabular">
            ESC
          </kbd>
        </div>

        {/* Command Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#1F2127]/40">
          {commands.length === 0 ? (
            <div className="py-8 text-center text-[#565964] font-medium">
              No matching commands or accounts found.
            </div>
          ) : (
            commands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-[#1A1C22] text-[#F4F4F6]" : "text-[#9DA0AA] hover:bg-[#15171C]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#15171C] border border-[#1F2127] flex items-center justify-center flex-shrink-0">
                      {cmd.icon}
                    </div>
                    <div>
                      <div className="font-medium text-[#F4F4F6]">{cmd.title}</div>
                      {cmd.subtitle && (
                        <div className="text-[11px] text-[#565964] truncate max-w-sm">
                          {cmd.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono-tabular text-[#565964] px-1.5 py-0.5 rounded bg-[#15171C] border border-[#1F2127]">
                      {cmd.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#F4F4F6]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="h-8 border-t border-[#1F2127] bg-[#15171C] px-4 flex items-center justify-between text-[11px] text-[#565964] font-mono-tabular">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Pulse GTM Operating System</span>
        </div>
      </div>
    </div>
  );
}
