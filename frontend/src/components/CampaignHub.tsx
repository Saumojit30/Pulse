"use client";

import React, { useState } from "react";
import { Mail, Download, Check, Sparkles, Send, Copy } from "lucide-react";

export function CampaignHub() {
  const [persona, setPersona] = useState("VP Engineering");
  const [triggerEvent, setTriggerEvent] = useState("Competitor Acme raised prices by 30%");

  const sampleCsv = `Step,Touchpoint Type,Subject,Body,Call To Action,Target Persona
Step 1,Email,Quick question regarding developer tooling,"Hi {{first_name}}, noticed your engineering expansion.",Open to a 5-min demo?,VP Engineering
Step 2,Email,Re: Quick question regarding developer tooling,"Following up on how you are managing cloud costs.",Let's chat Thursday?,VP Engineering
LinkedIn Step 1,LinkedIn Connection,Connection Hook,"Saw your recent post on dev productivity.",Connect on LinkedIn,VP Engineering`;

  const handleDownloadCsv = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse_apollo_sequence_${persona.toLowerCase().replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Conquest Campaign Hub
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/50">
                Apollo & Instantly
              </span>
            </h2>
            <p className="text-xs text-slate-400">Turn competitor mistakes and drift events into high-converting outbound sequences</p>
          </div>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="text-xs px-3.5 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 transition flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Download Apollo.io CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Persona</label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Trigger Hook (From Seltz Radar)</label>
          <input
            type="text"
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
          />
        </div>
      </div>

      <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-sans font-semibold">
          Preview: Generated 3-Step Apollo Outreach Sequence
        </div>
        <pre className="whitespace-pre">{sampleCsv}</pre>
      </div>
    </div>
  );
}
