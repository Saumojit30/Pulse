# ⚡ Pulse: Autonomous GTM Operating System

**Pulse** is an **Autonomous Go-To-Market (GTM) Operating System** powered by **CrewAI** multi-agent reasoning and **Seltz AI Web Indexing**.

Unlike passive dashboards, Pulse acts as an **always-on market sensing nervous system** that monitors competitor moves 24/7, audits assertions against raw web citations to eliminate hallucinations, and automatically triggers sales enablement across your CRM, Slack, and outbound tools.

---

## 🌟 Key Product Capabilities

1. **Autonomous 24/7 Sensing Daemon**: Headless background monitor continuously indexing watchlist competitors and firing alerts when pricing, features, or hiring trends shift.
2. **Anti-Hallucination & Grounding Engine**: 3-layer verification system with a dedicated `FactCheckerAuditorAgent` auditing every competitive claim against raw Seltz source URLs.
3. **Event Gateway & REST API (FastAPI)**: Webhook ingestion for CRM deal-stage updates (`/api/v1/crm/webhook`) and Slack slash commands (`/api/v1/slack/command`).
4. **CRM Bi-Directional Deal Sync**: Ingests HubSpot & Salesforce deals and automatically attaches fresh sales battlecards to active opportunities when competitors are tagged.
5. **Outbound Sales Dispatcher**: Exports cold outreach sequences and LinkedIn touchpoints directly into Apollo, Instantly, and Smartlead CSV/JSON formats.
6. **Structured Audit Logs & Token Cost Tracking**: Detailed JSON execution traces logging Seltz API call latencies, token consumption, and estimated dollar costs per scan.
7. **Streamlit Control Center**: Visual command center for manual scans, watchlist management, quality scorecards, and audit logs.

---

## 🏗️ Architecture

```
                                  +---------------------------------------+
                                  |     Pulse Event Gateway (FastAPI)     |
                                  +---------------------------------------+
                                                     |
             +---------------------------------------+---------------------------------------+
             |                                                                               |
             v                                                                               v
   [24/7 Sensing Daemon]                                                           [CRM & Slack Webhooks]
   • Continuous Seltz indexing                                                     • HubSpot / Salesforce deals
   • Drift & delta calculation                                                     • /pulse slash commands
             \                                                                               /
              \                                                                             /
               v                                                                           v
         +-------------------------------------------------------------------------------------+
         |                        Pulse Agentic Reasoning & Audit Core                         |
         |                                                                                     |
         |  [MarketIntelligenceAgent]  -->  [CompetitorDriftEngine]                            |
         |             |                               |                                       |
         |             v                               v                                       |
         |  [FactCheckerAuditorAgent] -->   [GTMStrategistAgent]                                |
         +-------------------------------------------------------------------------------------+
                                                     |
             +---------------------------------------+---------------------------------------+
             |                                                                               |
             v                                                                               v
   [Sales Enablement (CRM / Slack)]                                                [Outbound Dispatcher]
   • Deal-stage battlecards                                                        • Apollo / Instantly campaigns
   • Real-time Slack cards                                                         • Jira feature gap alerts
```

---

## 🚀 Quick Start with `uv`

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=your_openai_api_key
SELTZ_API_KEY=your_seltz_api_key       # Seltz Web Indexing API (seltz.ai)
SLACK_WEBHOOK_URL=your_slack_webhook   # Optional: For Slack alerts
```

### 2. Launch Streamlit Control Center
```bash
uv run streamlit run src/gtm_intelligence/ui/app.py
```

### 3. Start FastAPI Event Gateway
```bash
uv run uvicorn gtm_intelligence.api.server:app --reload --port 8000
```

### 4. Run CLI Scan
```bash
uv run python -m gtm_intelligence.main --target "AI Developer Tools" --mode deep
```

---

## 🧪 Automated Test Suite

Run the full pytest suite:
```bash
uv run pytest
```
