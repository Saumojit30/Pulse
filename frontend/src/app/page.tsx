"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { DealWarRoom } from "../components/DealWarRoom";
import { MarketRadar } from "../components/MarketRadar";
import { BattlecardStudio } from "../components/BattlecardStudio";
import { CampaignHub } from "../components/CampaignHub";
import { ObservabilityPanel } from "../components/ObservabilityModal";
import { pulseApi, HealthResponse } from "../lib/api";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"war_room" | "radar" | "battlecards" | "campaigns" | "observability">("war_room");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function checkBackend() {
      try {
        const data = await pulseApi.getHealth();
        setHealth(data);
        setIsLive(true);
      } catch {
        setIsLive(false);
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        isLive={isLive}
      />

      {/* Main App Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Header onQuickScan={() => setActiveTab("battlecards")} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8 space-y-8">
          {activeTab === "war_room" && <DealWarRoom />}
          {activeTab === "radar" && <MarketRadar />}
          {activeTab === "battlecards" && <BattlecardStudio />}
          {activeTab === "campaigns" && <CampaignHub />}
          {activeTab === "observability" && <ObservabilityPanel />}
        </main>
      </div>
    </div>
  );
}
