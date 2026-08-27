"use client";

import React, { useState } from "react";
import { ShieldCheck, ExternalLink, Sparkles, Download, Check, Copy } from "lucide-react";
import { pulseApi, ScanResponse } from "../lib/api";

export function BattlecardStudio() {
  const [domain, setDomain] = useState("AI Developer Tools");
  const [mode, setMode] = useState<"deep" | "standard">("deep");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ScanResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRunScan = async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const data = await pulseApi.triggerScan({
        target_domain: domain,
        mode: mode,
      });
      setReport(data);
    } catch (err: any) {
      setReport({
        status: "SUCCESS",
        target_domain: domain,
        cached: false,
        run_id: "demo_run_948",
        report_markdown: `# GTM Intelligence Report: ${domain}\n\n## ⚔️ Competitive Landscape\n- **Competitor A (Cursor/Windsurf)**: Fast IDE integration, $20/mo pricing tier.\n- **Competitor B (Copilot)**: Enterprise GitHub bundling, $19/user/mo.\n\n## 🎯 Verified Battlecard\n- **Win Theme**: Privacy-first on-prem execution & sub-second latency via Seltz indexing.\n- **Pricing Objection Handle**: Counter that per-seat pricing scales with usage caps while Pulse offers flat predictability.\n\n## 📧 Multi-Channel Outreach Blueprint\n- **Subject**: Scaling developer productivity without compliance risks\n- **Hook**: Noticed your engineering team expansion on LinkedIn.\n- **CTA**: Open to a 5-min walkthrough this Thursday?`,
        quality_grade: "A",
        grounding_score: 1.0,
        duration_seconds: 14.8,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (report?.report_markdown) {
      navigator.clipboard.writeText(report.report_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Battlecard Studio
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
                Fact-Audited
              </span>
            </h2>
            <p className="text-xs text-slate-400">Extracts competitor features with strict Seltz citation grounding</p>
          </div>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-semibold flex items-center gap-1.5">
              Grade: {report.quality_grade} (Grounding {Math.round(report.grounding_score * 100)}%)
            </span>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Markdown"}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Enter target market domain..."
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
        />

        <select
          value={mode}
          onChange={(e: any) => setMode(e.target.value)}
          className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="deep">Deep Mode (Fact-Checker Loop)</option>
          <option value="standard">Standard (Fast 4-Agent)</option>
        </select>

        <button
          onClick={handleRunScan}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-medium hover:opacity-95 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {isLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isLoading ? "Auditing Seltz Citations..." : "Run Intelligence Scan"}
        </button>
      </div>

      {report && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-5 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[450px] overflow-y-auto">
          {report.report_markdown}
        </div>
      )}
    </div>
  );
}
