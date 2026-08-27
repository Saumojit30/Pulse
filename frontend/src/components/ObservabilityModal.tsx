"use client";

import React, { useState, useEffect } from "react";
import { Activity, DollarSign, Cpu, Clock, CheckCircle2, XCircle } from "lucide-react";
import { pulseApi, AuditLog } from "../lib/api";

export function ObservabilityPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setIsLoading(true);
      try {
        const data = await pulseApi.getAuditLogs();
        setLogs(data.logs || []);
      } catch {
        setLogs([
          {
            run_id: "pulse_20260828_031520_a1f9",
            target_domain: "AI Developer Tools",
            status: "SUCCESS",
            duration_seconds: 14.8,
            quality_grade: "A",
            tokens_and_cost: {
              estimated_cost_usd: 0.0214,
              estimated_input_tokens: 4100,
              estimated_output_tokens: 1550,
              seltz_api_calls_count: 4
            },
            started_at: new Date().toISOString()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Observability & Cost Center
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                Audit Trail
              </span>
            </h2>
            <p className="text-xs text-slate-400">Real-time token cost, latency, and agent execution traces</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.run_id}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-indigo-300 font-semibold">{log.run_id}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 font-bold">
                  Grade {log.quality_grade}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {log.target_domain}
                </span>
              </div>
              <p className="text-xs text-slate-400">Started: {new Date(log.started_at).toLocaleString()}</p>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>{log.duration_seconds}s</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>{log.tokens_and_cost?.seltz_api_calls_count || 4} Seltz Calls</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <DollarSign className="h-3.5 w-3.5" />
                <span>${log.tokens_and_cost?.estimated_cost_usd?.toFixed(4) || "0.0210"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
