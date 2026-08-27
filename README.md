<div align="center">

# ⚡ Pulse: Autonomous GTM Operating System

### *The Always-On Market Sensing & Revenue Intelligence Engine*

[![Python Version](https://img.shields.io/badge/python-3.10%20%7C%203.11%20%7C%203.12-blue.svg)](https://www.python.org/)
[![Package Manager](https://img.shields.io/badge/uv-fast%20python%20pkg%20manager-purple.svg)](https://github.com/astral-sh/uv)
[![CrewAI](https://img.shields.io/badge/Agents-CrewAI%20v1.15-orange.svg)](https://crewai.com)
[![Web Indexing](https://img.shields.io/badge/Web%20Knowledge-Seltz%20AI-green.svg)](https://seltz.ai)
[![FastAPI](https://img.shields.io/badge/API-FastAPI%20%26%20Uvicorn-009688.svg)](https://fastapi.tiangolo.com)
[![Streamlit](https://img.shields.io/badge/Dashboard-Streamlit-FF4B4B.svg)](https://streamlit.io)
[![Tests](https://img.shields.io/badge/Tests-18%2F18%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<br/>

**Pulse** is an enterprise-grade, event-driven **Autonomous Go-To-Market (GTM) Operating System**. Powered by **CrewAI** multi-agent reasoning and **Seltz AI** low-latency web indexing, Pulse moves beyond passive dashboards to act as an active nervous system: continuously sensing competitor moves 24/7, auditing assertions against raw web citations to eliminate hallucinations, and automatically triggering revenue workflows across your CRM, Slack, and outbound sales platforms.

</div>

---

## 📑 Table of Contents

- [🌟 Why Pulse?](#-why-pulse)
- [🏗️ System Architecture](#️-system-architecture)
- [🤖 Multi-Agent Pipeline & Anti-Hallucination Moat](#-multi-agent-pipeline--anti-hallucination-moat)
- [🚀 Quick Start (via `uv`)](#-quick-start-via-uv)
- [🖥️ Control Center (Streamlit UI)](#️-control-center-streamlit-ui)
- [⚡ Event Gateway & REST API (FastAPI)](#-event-gateway--rest-api-fastapi)
- [⏰ 24/7 Background Sensing Daemon](#-247-background-sensing-daemon)
- [🔗 Integrations & Revenue Workflows](#-integrations--revenue-workflows)
  - [HubSpot & Salesforce Deal-Stage Sync](#hubspot--salesforce-deal-stage-sync)
  - [Interactive Slack Bot](#interactive-slack-bot)
  - [Apollo / Instantly Outbound Sequence Dispatcher](#apollo--instantly-outbound-sequence-dispatcher)
- [🔍 Observability, Token Cost Tracking & Quality Evaluation](#-observability-token-cost-tracking--quality-evaluation)
- [🧪 Automated Test Suite](#-automated-test-suite)
- [📁 Project Structure](#-project-structure)
- [📄 License](#-license)

---

## 🌟 Why Pulse?

Most GTM intelligence tools fail for three reasons:
1. **Passive Dashboards**: Reps and founders have to remember to log in, read paragraphs, and copy-paste text. After 2 weeks, nobody logs in.
2. **Hallucination Risk**: Generic LLMs hallucinate competitor features or pricing, causing sales reps to lose credibility during live pitches.
3. **Point-in-Time Stale Reports**: Competitor pricing and hiring change weekly, but static reports sit untouched for months.

### How Pulse Solves This:
* **Always-On Sensing (24/7 Daemon)**: Monitors target competitors continuously using sub-200ms machine web indexing via **Seltz AI**.
* **Zero-Hallucination Guarantee**: A dedicated `FactCheckerAuditorAgent` audits every competitive assertion against raw source citations. Claims without verified URLs are rejected.
* **Closed-Loop Automated Actions**: Injects battlecards directly into active CRM deals, pushes drift alerts to Slack, and generates cold outbound conquest campaigns automatically.

---

## 🏗️ System Architecture

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

## 🤖 Multi-Agent Pipeline & Anti-Hallucination Moat

Pulse orchestrates 5 specialized CrewAI agents in sequential and reflective loops:

1. **`MarketIntelligenceAgent` (Senior GTM Web Intelligence Specialist)**:
   * Interfaces with Seltz AI API to extract machine-structured competitor news, pricing matrices, hiring sprees, and tech stack tags.
2. **`CompetitorICPProfilerAgent` (Strategic PMM Analyst)**:
   * Synthesizes web data into structured feature matrices, target ICP definitions, buyer pain points, and buying triggers.
3. **`FactCheckerAuditorAgent` (GTM Fact Verification & Quality Auditor)**:
   * Cross-checks every feature claim and pricing quote against raw Seltz source URLs. Assigns confidence scores (`High`, `Medium`, `Unverified`).
4. **`GTMStrategistAgent` (Chief GTM Strategist)**:
   * Formulates high-impact positioning hooks, win themes, objection handling scripts, and sales battlecards.
5. **`OutreachBlueprintAgent` (Sales Enablement & Outbound Director)**:
   * Generates persona-tailored cold email sequences (subjects, copy, friction-free CTAs) and LinkedIn touchpoint angles.

---

## 🚀 Quick Start (via `uv`)

### 1. Prerequisites
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) (ultra-fast Python package manager)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/Saumojit30/Pulse-GTM-Intelligence-System.git
cd Pulse-GTM-Intelligence-System

# uv automatically syncs virtual environment and dependencies
uv sync
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API credentials:
```bash
cp .env.example .env
```

```env
# LLM Provider Key (OpenAI / Gemini / Anthropic)
OPENAI_API_KEY=your_openai_api_key

# Seltz Web Indexing API Key (https://seltz.ai)
SELTZ_API_KEY=your_seltz_api_key

# Slack Webhook URL (Optional: for real-time alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

> **Note**: Pulse includes an automatic resilient fallback search engine (via DuckDuckGo / DDGS) to ensure offline testing works seamlessly even without a Seltz API key.

---

## 🖥️ Control Center (Streamlit UI)

Launch the visual command center:
```bash
uv run streamlit run src/gtm_intelligence/ui/app.py
```

### Dashboard Tabs:
* **🚀 Run GTM Scan**: On-demand execution with live markdown report viewer and file downloads.
* **📈 Drift & Watchlist Daemon**: Manage target competitor watchlists, trigger background monitoring cycles, and view delta drift timelines.
* **🔍 Quality & Grounding Scorecard**: Real-time evaluation metrics displaying Overall Grade (A/B/C/F), Grounding Score, and Citation recall.
* **📊 Observability & Cost Logs**: Structured execution traces with tool call latencies, Seltz API count, and estimated dollar costs per run.
* **🔗 Integrations**: CRM webhook instructions and one-click Apollo.io / Instantly campaign sequence downloads.

---

## ⚡ Event Gateway & REST API (FastAPI)

Start the headless Event Gateway:
```bash
uv run uvicorn gtm_intelligence.api.server:app --reload --port 8000
```

Interactive Swagger documentation available at: `http://localhost:8000/docs`

### Core API Endpoints:

#### 1. `POST /api/v1/scan`
Trigger an on-demand market intelligence scan (with automatic 24h TTL cache check).
```json
// Request
{
  "target_domain": "AI Developer Tools",
  "mode": "deep",
  "force_refresh": false
}

// Response
{
  "status": "SUCCESS",
  "target_domain": "AI Developer Tools",
  "cached": false,
  "run_id": "pulse_20260827_150111_c10193",
  "report_markdown": "# GTM Intelligence Report...",
  "quality_grade": "A",
  "grounding_score": 1.0,
  "duration_seconds": 18.2
}
```

#### 2. `GET /api/v1/drift/{target_domain}`
Get competitor drift and pricing/feature change delta since the last scan.

#### 3. `POST /api/v1/crm/webhook`
Ingest CRM deal-stage updates from HubSpot/Salesforce.

#### 4. `POST /api/v1/slack/command`
Respond to Slack `/pulse intel <competitor>` slash commands.

#### 5. `GET /api/v1/audit/logs`
Retrieve recent structured JSON execution traces and token cost metrics.

---

## ⏰ 24/7 Background Sensing Daemon

Pulse includes a headless background daemon (`src/gtm_intelligence/workers/daemon.py`) that monitors a watchlist of target competitors on a recurring schedule.

### Programmatic Usage:
```python
from gtm_intelligence.workers.daemon import PulseSensingDaemon

# Initialize daemon with custom targets
daemon = PulseSensingDaemon(
    watchlist=["Snowflake", "Datadog", "Linear"],
    check_interval_seconds=86400 # 24 hours
)

# Run a single monitoring cycle
results = daemon.run_single_cycle()
print(results)
```

---

## 🔗 Integrations & Revenue Workflows

### HubSpot & Salesforce Deal-Stage Sync
Whenever an opportunity is tagged with a competitor in your CRM, Pulse automatically constructs a battlecard engagement note and attaches it to the deal record:
```python
from gtm_intelligence.integrations.crm_sync import CRMSyncEngine, CRMDealWebhookPayload

deal = CRMDealWebhookPayload(
    deal_id="deal_98412",
    deal_name="Enterprise Cloud Migration",
    deal_stage="Proposal",
    deal_amount_usd=120000.0,
    competitor_tagged="CompetitorX",
    owner_email="rep@company.com"
)

engine = CRMSyncEngine()
payload = engine.process_deal_event(deal)
```

### Interactive Slack Bot
Enables sales reps to trigger real-time battlecards directly from Slack:
```bash
/pulse intel AcmeCorp
/pulse drift SaaS
```

### Apollo / Instantly Outbound Sequence Dispatcher
Automatically exports generated cold email sequences into Apollo.io CSV or Instantly.ai JSON campaign formats.

---

## 🔍 Observability, Token Cost Tracking & Quality Evaluation

Every run generates a structured audit log stored in `gtm_history/audit_logs/`:
```json
{
  "run_id": "pulse_20260827_150111_c10193",
  "target_domain": "AI Developer Tools",
  "mode": "deep",
  "status": "SUCCESS",
  "duration_seconds": 18.2,
  "tokens_and_cost": {
    "estimated_input_tokens": 4250,
    "estimated_output_tokens": 1600,
    "estimated_cost_usd": 0.0266,
    "seltz_api_calls_count": 4
  },
  "quality_grade": "A",
  "quality_evaluation": {
    "overall_score": 0.95,
    "grade": "A",
    "passed": true,
    "grounding": {
      "grounding_score": 1.0,
      "status": "PASS"
    }
  }
}
```

---

## 🧪 Automated Test Suite

Pulse features comprehensive test coverage across 7 test suites (18 tests total), verifying API endpoints, daemon scheduling, integrations, drift calculations, rate-limit resilience, and anti-hallucination evaluation:

```bash
uv run pytest
```

```text
tests/test_api.py ...                                                    [ 16%]
tests/test_daemon.py ..                                                  [ 27%]
tests/test_drift_engine.py .                                             [ 33%]
tests/test_integrations.py ...                                           [ 50%]
tests/test_logging_and_evaluation.py ..                                  [ 61%]
tests/test_robustness.py .....                                           [ 88%]
tests/test_seltz_tool.py ..                                              [100%]

======================= 18 passed in 43.02s =======================
```

---

## 📁 Project Structure

```
gtm_intelligence_system/
├── pyproject.toml                         # uv dependencies and pytest config
├── README.md                              # Complete product documentation
├── .env.example                           # Sample environment credentials
├── src/
│   └── gtm_intelligence/
│       ├── __init__.py
│       ├── main.py                        # CLI entrypoint
│       ├── crew.py                        # CrewAI Agent & Task orchestration
│       ├── api/
│       │   ├── __init__.py
│       │   └── server.py                  # FastAPI Event Gateway & Webhooks
│       ├── workers/
│       │   ├── __init__.py
│       │   └── daemon.py                  # 24/7 Sensing Daemon
│       ├── integrations/
│       │   ├── __init__.py
│       │   ├── crm_sync.py                # HubSpot / Salesforce Deal Sync
│       │   ├── slack_bot.py               # Slack Block Kit Slash Command Bot
│       │   └── outbound_sync.py           # Apollo & Instantly Dispatcher
│       ├── logging/
│       │   ├── __init__.py
│       │   └── audit_logger.py            # JSON Audit Traces & Cost Tracker
│       ├── evaluation/
│       │   ├── __init__.py
│       │   └── evaluator.py               # Grounding & Quality Scorecard
│       ├── tools/
│       │   ├── __init__.py
│       │   └── seltz_tool.py              # Seltz Web Indexing & Retries
│       ├── storage/
│       │   ├── __init__.py
│       │   └── drift_engine.py            # Competitor Snapshot & Drift Engine
│       ├── models/
│       │   ├── __init__.py
│       │   └── gtm_models.py              # Pydantic Schemas
│       └── ui/
│           └── app.py                     # Streamlit Control Center
└── tests/
    ├── test_api.py
    ├── test_daemon.py
    ├── test_drift_engine.py
    ├── test_integrations.py
    ├── test_logging_and_evaluation.py
    ├── test_robustness.py
    └── test_seltz_tool.py
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
<b>Built with ⚡ Pulse — Autonomous GTM Operating System</b>
</div>
