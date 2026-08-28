"use client";

import React, { useState } from "react";
import {
  Mail,
  Download,
  Check,
  Sparkles,
  Send,
  Copy,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  ArrowRight,
  FileSpreadsheet,
  FileCode
} from "lucide-react";

export function CampaignHub() {
  const [persona, setPersona] = useState("VP Engineering");
  const [triggerEvent, setTriggerEvent] = useState("Cursor / Anysphere increased pricing by +50%");
  const [copied, setCopied] = useState(false);

  const presetPlays = [
    { name: "Price Hike Conquest", trigger: "Competitor increased enterprise tier pricing by +35%" },
    { name: "Outage / Latency Conquest", trigger: "Competitor experienced downtime on primary API" },
    { name: "Feature Deprecation", trigger: "Competitor sunsetted legacy integration support" },
  ];

  const sequenceSteps = [
    {
      step: "Step 1 (Day 1)",
      channel: "Cold Email",
      subject: "Quick question on {{company}}'s developer tooling costs",
      body: "Hi {{first_name}},\n\nSaw that your engineering team has been scaling rapidly on LinkedIn.\n\nWith several developer AI tools quietly increasing their enterprise tier pricing by +35-50% this month, wanted to share how teams are locking in flat, predictable consumption without surprise overage charges.\n\nOpen to a 5-minute teardown this Thursday?",
      cta: "Open to a 5-min teardown this Thursday?"
    },
    {
      step: "Step 2 (Day 3)",
      channel: "LinkedIn Touchpoint",
      subject: "Connection Hook",
      body: "Hi {{first_name}} — enjoyed your recent post on engineering velocity. Sent a quick note on dev tooling economics earlier, wanted to connect here as well.",
      cta: "Connect on LinkedIn"
    },
    {
      step: "Step 3 (Day 7)",
      channel: "Email Follow-up",
      subject: "Re: Quick question on {{company}}'s developer tooling costs",
      body: "Hi {{first_name}},\n\nFollowing up with a quick 1-page benchmark comparing sub-200ms real-time indexing vs legacy batch scrapers.\n\nLet me know if you'd like the full PDF breakdown.",
      cta: "Let me know if you'd like the full PDF breakdown"
    }
  ];

  const generateCsv = () => {
    return sequenceSteps
      .map(
        (s) =>
          `"${s.step}","${s.channel}","${s.subject.replace(/"/g, '""')}","${s.body.replace(/"/g, '""')}","${s.cta}","${persona}"`
      )
      .join("\n");
  };

  const handleDownloadCsv = () => {
    const csvContent = `"Step","Channel","Subject","Body","Call To Action","Target Persona"\n${generateCsv()}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse_apollo_sequence_${persona.toLowerCase().replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(sequenceSteps, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/10">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Conquest Outbound Hub</h1>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-400">
                  Apollo & Instantly Dispatcher
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automatically transform competitor drift events into hyper-personalized, 3-step outbound campaigns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="text-xs px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition flex items-center gap-2 font-medium"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Export Apollo.io CSV
            </button>

            <button
              onClick={handleCopyJson}
              className="text-xs px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-300 hover:text-white transition flex items-center gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileCode className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied JSON" : "Copy Instantly.ai JSON"}</span>
            </button>
          </div>
        </div>

        {/* Preset Plays Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 mr-1">Playbooks:</span>
          {presetPlays.map((play, idx) => (
            <button
              key={idx}
              onClick={() => setTriggerEvent(play.trigger)}
              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:border-purple-500/40 hover:text-purple-300 transition"
            >
              {play.name}
            </button>
          ))}
        </div>
      </div>

      {/* Target Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <label className="block text-xs font-medium text-zinc-300">Target Persona</label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/80 transition"
          />
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <label className="block text-xs font-medium text-zinc-300">Trigger Event (From Seltz Radar)</label>
          <input
            type="text"
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value)}
            className="w-full bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/80 transition"
          />
        </div>
      </div>

      {/* Sequence Timeline Cards */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
          Multi-Touchpoint Outbound Sequence
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sequenceSteps.map((step, idx) => (
            <div key={idx} className="glass-card glass-card-hover rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-400">
                    {step.step}
                  </span>
                  <span className="text-xs font-semibold text-white">{step.channel}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">CTA: {step.cta}</span>
              </div>

              <div className="text-xs font-medium text-zinc-200">
                <span className="text-zinc-500 font-mono">Subject: </span>
                {step.subject}
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.04] text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed">
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
