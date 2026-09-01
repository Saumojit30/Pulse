<div align="center">

# Pulse: Autonomous GTM Operating System
### *Event-Driven Competitive Sensing, Fact-Grounded Intelligence, and Closed-Loop Revenue Execution*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-111827?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Package Manager](https://img.shields.io/badge/Package%20Manager-uv%20(Astral)-111827?style=flat-square&logo=python&logoColor=white)](https://github.com/astral-sh/uv)
[![Next.js](https://img.shields.io/badge/Next.js-14.2%20App%20Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI%200.141-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Web Indexing](https://img.shields.io/badge/Web%20Indexing-Seltz%20AI-047857?style=flat-square&logo=google-cloud&logoColor=white)](https://seltz.ai)
[![Multi-Agent](https://img.shields.io/badge/Agents-CrewAI%20v1.15-EA580C?style=flat-square&logo=openai&logoColor=white)](https://crewai.com)
[![Persistence](https://img.shields.io/badge/Database-SQLite%20WAL-0284C7?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Test Suite](https://img.shields.io/badge/Tests-27%2F27%20Passed-16A34A?style=flat-square&logo=pytest&logoColor=white)](tests/)
[![License](https://img.shields.io/badge/License-MIT-374151?style=flat-square)](LICENSE)

<br/>

**Pulse** is a distributed, event-driven Go-To-Market (GTM) intelligence system designed to eliminate manual market research and unverified competitive assertions. Built on a resilient **Dual-Engine Architecture** (Native Seltz AI web indexing + optional CrewAI multi-agent reasoning) and paired with an authentic **2026 Dark Monochrome Workspace** (Linear / Raycast / Clay ergonomics), Pulse continuously senses competitor shifts 24/7, audits facts against live web citations, tracks price and feature drift in SQLite, and automates downstream CRM, Slack, and outbound revenue workflows.

</div>

---

## Table of Contents

- [System Thesis & Problem Statement](#system-thesis--problem-statement)
- [Architecture & Data Flow](#architecture--data-flow)
- [Key Engineering Highlights](#key-engineering-highlights)
  - [1. Dual Intelligence Core (Seltz Native vs. Multi-Agent)](#1-dual-intelligence-core)
  - [2. Anti-Hallucination Citation Verification Moat](#2-anti-hallucination-citation-verification-moat)
  - [3. Concurrency Semaphore & Asynchronous SSE Streaming](#3-concurrency-semaphore--asynchronous-sse-streaming)
  - [4. Embedded SQLite Persistence with WAL Mode](#4-embedded-sqlite-persistence-with-wal-mode)
  - [5. Resilient Indexing with Circuit Breaker & Connection Pooling](#5-resilient-indexing-with-circuit-breaker--connection-pooling)
- [2026 YC-Grade Frontend Workspace](#2026-yc-grade-frontend-workspace)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Deployment (`uv`)](#1-backend-deployment-uv)
  - [2. Frontend Deployment (`Next.js 14`)](#2-frontend-deployment-nextjs-14)
  - [3. Environment Credentials](#3-environment-credentials)
- [REST API & SSE Event Specification](#rest-api--sse-event-specification)
- [Automated Testing & Production Verification](#automated-testing--production-verification)
- [Directory Topology](#directory-topology)
- [License](#license)

---

## System Thesis & Problem Statement

Enterprise Go-To-Market and product marketing teams face three architectural bottlenecks:

1. **Market Intelligence Latency**: Competitor pricing shifts, feature launches, and hiring surges occur continuously, but market intelligence sits trapped in static quarterly PDF decks that decay immediately.
2. **Hallucination Risk in Enterprise Deals**: Off-the-shelf LLMs frequently invent nonexistent compliance accreditations, inaccurate pricing tiers, or fictitious integrations, destroying sales credibility during late-stage enterprise evaluations.
3. **Workflow Disconnect**: Intelligence is isolated in silos rather than automatically feeding active CRM pipeline deals, sales battlecard channels, and SDR outbound cadences.

**Pulse addresses these failure modes by combining sub-second machine web indexing, automated source-URL verification, historical snapshot diffing, and closed-loop revenue triggers.**

---

## Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Ingestion ["1. Event Ingestion & Inbound Triggers"]
        Daemon["24/7 Background Sensing Daemon<br/>(Recurring Cron / Async Loop)"]
        CRMInbound["CRM Deal-Stage Webhooks<br/>(HubSpot, Salesforce)"]
        UIEvent["Live UI Triggers & Command Palette<br/>(Next.js REST & Cmd+K)"]
    end

    Gateway["⚡ Event Gateway (FastAPI :8001)<br/>• Concurrency Semaphore (Max 3 Jobs)<br/>• Non-blocking SSE Event Dispatcher"]
    Daemon --> Gateway
    CRMInbound --> Gateway
    UIEvent --> Gateway

    subgraph DualCore ["2. Dual Intelligence Execution Engine"]
        direction TB
        subgraph SeltzNative ["Mode A: Native Seltz GTM Engine (SELTZ_API_KEY)"]
            SeltzSearch["Live Web Indexing (/v1/search)"]
            SeltzAnswer["Grounded Q&A Synthesis (/v1/answer)"]
            DirectSynth["Structured Dossier & Sequence Compiler"]
            SeltzSearch --> SeltzAnswer --> DirectSynth
        end

        subgraph CrewAgents ["Mode B: Multi-Agent CrewAI (OPENAI_API_KEY)"]
            Agent1["Market Intelligence Agent"]
            Agent2["Competitor ICP Profiler"]
            Agent3["Fact-Checker Quality Auditor"]
            Agent4["Chief GTM Strategist"]
            Agent5["Outreach Blueprint Agent"]
            Agent1 --> Agent2 --> Agent3 --> Agent4 --> Agent5
        end
    end

    Gateway --> DualCore

    subgraph StorageLayer ["3. High-Throughput Embedded Persistence"]
        AccountDB[("SQLite AccountStore<br/>WAL Mode • gtm_accounts.db")]
        DriftDB[("Competitor Drift Engine<br/>Delta & Snapshot Comparator")]
        AuditStore[("Telemetry Audit Moat<br/>JSON Traces & Token Costs")]
    end

    DualCore --> StorageLayer

    subgraph Presentation ["4. 2026 YC-Grade Frontend (:3000)"]
        DataGrid["Full-Width DataGrid (32px Dense Rows)"]
        Inspector["Slide-Over Inspector & Executive Dossier"]
        CmdK["Raycast-Style Command Palette (Cmd+K)"]
        LiveStream["SSE Real-time Step Indicators"]
    end

    StorageLayer --> Presentation

    subgraph RevenueExecution ["5. Downstream Revenue Automation"]
        CRMOut["HubSpot Deal Note Attachment"]
        SlackAlerts["Slack Block Kit Alerts (/pulse)"]
        ApolloExport["1-Click Apollo.io & Instantly Export"]
    end

    Presentation --> RevenueExecution
```

---

## Key Engineering Highlights

### 1. Dual Intelligence Core
Pulse decouples web knowledge acquisition from model reasoning:
* **Native Seltz Engine (`SeltzGTMEngine`)**: Executes 100% against Seltz AI (`seltz.Seltz.search()` and `seltz.Seltz.answer()`). Directly extracts live competitor pricing, ICP pain points, objection counters, and 3-step sequences with zero external LLM token overhead (~3-8s execution).
* **Multi-Agent Orchestration (`GtmIntelligenceCrew`)**: When `OPENAI_API_KEY` is provided, Pulse activates a 5-agent sequential pipeline role-playing across market research, ICP profiling, fact checking, positioning strategy, and cold email copywriting (~25-45s execution).
* **Offline Resiliency**: Includes an automatic fallback to DuckDuckGo Search (`ddgs`) when running in air-gapped or keyless developer environments.

### 2. Anti-Hallucination Citation Verification Moat
Every report undergoes strict grounding validation via `PulseEvaluator`:
* Extracts all claims and matches them against source URLs retrieved during the live web crawl.
* Computes an **Overall Grade (`A`, `B`, `C`, `F`)**, a numerical **Grounding Score ($0.0 \to 1.0$)**, and counts verified versus unverified citations.
* Reports scoring below threshold are flagged with warning indicators before reaching sales representatives.

### 3. Concurrency Semaphore & Asynchronous SSE Streaming
* **Throttling**: A global `asyncio.Semaphore(3)` bounds concurrent agent runs, preventing rate limits and host memory saturation.
* **Non-Blocking SSE**: `POST /api/v1/scan/jobs` returns `202 Accepted` with a `job_id` within 10ms. Clients subscribe to `GET /api/v1/scan/jobs/{job_id}/stream` (`text/event-stream`), receiving progressive execution updates (`step_start`, `tool_call`, `fact_audit`, `job_completed`) with zero HTTP 504 timeouts.

### 4. Embedded SQLite Persistence with WAL Mode
* Eliminates heavy external database dependencies by embedding SQLite with Write-Ahead Logging (`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;`).
* Guarantees concurrent read/write isolation and safe teardown on Windows without file locking (`WinError 32`).
* Automated delta tracking in `CompetitorDriftEngine` detects additions/removals across `key_features`, `tech_stack_signals`, and `pricing_summary`.

### 5. Resilient Indexing with Circuit Breaker & Connection Pooling
* Custom `CircuitBreaker` in `seltz_tool.py` isolates API failures (trips to `OPEN` after 3 consecutive errors; probes via `HALF_OPEN` after a 60s cooldown).
* Persistent `httpx.Client` pool with strict timeouts (5s connect / 15s read) to prevent socket leaks during concurrent crawls.

---

## 2026 YC-Grade Frontend Workspace

The frontend is built with Next.js 14 and Tailwind CSS, adhering to strict enterprise software standards inspired by **Linear**, **Raycast**, and **Clay**:

| Capability | Implementation Details |
| :--- | :--- |
| **Monochrome Design System** | Palette restricted to `#090A0C` (canvas), `#101114` (surfaces), `#1F2127` (hairlines), and high-contrast `#F4F4F6` text. **Zero AI color slop** (no purple gradients or muddy amber/green accents). |
| **Full-Width DataGrid** | 32px dense row height showing 25+ target accounts above the fold. Monospace tabular numbers (`font-mono tabular-nums`), inline 40px micro-bars for ICP fit scores, and multi-row selection for batch operations. |
| **Slide-Over Inspector & Dossier** | Selecting an account opens a sleek slide-over drawer with a subtle backdrop. Click **"Expand to Full Page Dossier"** (`Maximize2` icon) to expand all intelligence tabs across the full viewport. |
| **5 Intelligence Tabs** | **1.** Overview & Decision Makers &nbsp;|&nbsp; **2.** Battlecard Studio &nbsp;|&nbsp; **3.** Drift Feed & Delta Signals &nbsp;|&nbsp; **4.** 3-Step Outreach Cadence &nbsp;|&nbsp; **5.** Factuality Audit & Token Costs |
| **Keyboard Ergonomics** | `J` / `K` (row selection), `Enter` (inspect account), `Esc` (dismiss drawer), and `⌘K` / `Ctrl+K` (Raycast-style command palette). |

---

## Quick Start Guide

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* [uv](https://github.com/astral-sh/uv) (ultra-fast Python package manager)

---

### 1. Backend Deployment (`uv`)

```bash
# Clone the repository
git clone https://github.com/Saumojit30/Pulse.git
cd Pulse

# Sync Python virtual environment & dependencies
uv sync

# Run the complete test suite (27 tests)
uv run pytest tests/

# Launch the FastAPI backend on dedicated port 8001
uv run python main.py
```
* Interactive API Documentation: **`http://127.0.0.1:8001/docs`**
* Health Check Endpoint: **`http://127.0.0.1:8001/health`**

---

### 2. Frontend Deployment (`Next.js 14`)

In a new terminal:

```bash
cd frontend

# Install Node modules
npm install

# Run the Next.js development server
npm run dev
```
* Frontend Workspace: **`http://localhost:3000`**

---

### 3. Environment Credentials

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

```env
# Seltz Web Indexing API Key (https://seltz.ai) - Enables live web indexing
SELTZ_API_KEY=your_seltz_api_key_here

# LLM Provider Key (Optional: enables CrewAI multi-agent reasoning mode)
OPENAI_API_KEY=your_openai_api_key_here

# Slack Webhook URL (Optional: enables real-time deal alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

> **Zero-Key Execution**: Pulse includes an automatic search fallback (DuckDuckGo) and heuristic synthesis so you can evaluate the entire application immediately without external API accounts.

---

## REST API & SSE Event Specification

The backend runs on port `8001` (preventing collisions with port `8000` services):

### 1. Asynchronous Scan Job Creation
```http
POST /api/v1/scan/jobs
Content-Type: application/json

{
  "target_domain": "datadog.com",
  "mode": "deep",
  "force_refresh": false
}
```
**Response (`202 Accepted`):**
```json
{
  "job_id": "job_3810f6029762",
  "target_domain": "datadog.com",
  "mode": "deep",
  "status": "QUEUED",
  "created_at": "2026-09-01T10:15:00.000Z"
}
```

### 2. Real-Time Server-Sent Events Stream
```http
GET /api/v1/scan/jobs/{job_id}/stream
Accept: text/event-stream
```
**Live Stream Payloads:**
```text
event: step_start
data: {"step": "web_intelligence", "message": "Seltz Web Indexing live search for 'datadog.com'..."}

event: tool_call
data: {"tool": "SeltzSearchTool", "query": "datadog.com", "citations_extracted_count": 4, "citations": ["https://datadog.com/pricing"]}

event: fact_audit
data: {"grade": "A", "overall_score": 0.95, "grounding_score": 0.96, "cited_urls_count": 4}

event: job_completed
data: {"status": "SUCCESS", "target_domain": "datadog.com", "quality_grade": "A", "grounding_score": 0.96}
```

### 3. Persistent Account Store Endpoints
* `GET /api/v1/accounts`: Retrieve all accounts saved in SQLite with ICP scores, battlecards, and decision makers.
* `POST /api/v1/accounts`: Insert or update a target account profile.
* `DELETE /api/v1/accounts/{id}`: Delete an account.
* `GET /api/v1/drift/{domain}`: Fetch competitor pricing, hiring, and tech-stack drift signals.
* `GET /api/v1/audit/logs`: Paginated execution traces with token counts and estimated USD cost metrics.

---

## Automated Testing & Production Verification

Pulse maintains **100% pass rate across 27 automated tests** spanning unit, integration, resilience, and concurrency tests:

```bash
uv run pytest tests/ -v
```

```text
tests/test_api.py::test_health_check PASSED                             [  3%]
tests/test_api.py::test_get_drift PASSED                                [  7%]
tests/test_api.py::test_scan_with_ttl_caching PASSED                   [ 11%]
tests/test_api.py::test_create_scan_job_and_stream PASSED                [ 14%]
tests/test_api.py::test_audit_logs_endpoints PASSED                     [ 18%]
tests/test_api.py::test_sse_stream_multi_subscriber PASSED              [ 22%]
tests/test_api.py::test_accounts_crud_endpoints PASSED                  [ 25%]
tests/test_daemon.py::test_daemon_single_cycle PASSED                   [ 29%]
tests/test_daemon.py::test_daemon_graceful_stop PASSED                  [ 33%]
tests/test_drift_engine.py::test_save_snapshot PASSED                   [ 37%]
tests/test_drift_engine.py::test_detect_drift_no_change PASSED          [ 40%]
tests/test_drift_engine.py::test_detect_drift_with_changes PASSED       [ 44%]
tests/test_integrations.py::test_crm_deal_sync PASSED                   [ 48%]
tests/test_integrations.py::test_slack_bot_slash_command PASSED        [ 51%]
tests/test_integrations.py::test_apollo_csv_export PASSED               [ 55%]
tests/test_logging_and_evaluation.py::test_audit_logger_run_lifecycle PASSED [ 59%]
tests/test_logging_and_evaluation.py::test_evaluator_quality_scorecard PASSED [ 62%]
tests/test_robustness.py::test_seltz_search_tool_resilience PASSED     [ 66%]
tests/test_robustness.py::test_seltz_answer_tool_resilience PASSED     [ 70%]
tests/test_robustness.py::test_circuit_breaker_trips_and_recovers PASSED [ 74%]
tests/test_robustness.py::test_http_client_timeouts PASSED             [ 77%]
tests/test_robustness.py::test_concurrency_semaphore PASSED            [ 81%]
tests/test_seltz_engine.py::test_seltz_engine_initialization PASSED    [ 85%]
tests/test_seltz_engine.py::test_seltz_engine_search_fallback PASSED   [ 88%]
tests/test_seltz_engine.py::test_seltz_engine_full_run PASSED          [ 92%]
tests/test_seltz_tool.py::test_seltz_search_tool_fallback PASSED       [ 96%]
tests/test_seltz_tool.py::test_seltz_answer_tool PASSED               [100%]

======================== 27 passed in 14.71s ========================
```

---

## Directory Topology

```
Pulse/
├── main.py                                # Backend entrypoint (:8001)
├── pyproject.toml                         # uv dependencies and pytest configuration
├── README.md                              # Technical system documentation
├── .gitignore                             # Secret, database, and build artifact exclusions
├── .env.example                           # Template environment configuration
├── src/
│   └── gtm_intelligence/
│       ├── api/
│       │   └── server.py                  # FastAPI Event Gateway, SSE streaming, CRUD
│       ├── engine/
│       │   └── seltz_engine.py            # Native Seltz GTM Intelligence Engine
│       ├── storage/
│       │   ├── account_store.py           # SQLite AccountStore (WAL mode)
│       │   └── drift_engine.py            # Competitor Drift & Delta Engine
│       ├── tools/
│       │   └── seltz_tool.py              # Seltz Web Indexing & Circuit Breaker
│       ├── crew.py                        # CrewAI Multi-Agent Orchestrator
│       ├── workers/
│       │   └── daemon.py                  # 24/7 Background Sensing Daemon
│       ├── evaluation/
│       │   └── evaluator.py               # Fact Grounding & Quality Scorecard
│       ├── logging/
│       │   └── audit_logger.py            # JSON Audit Traces & Token Cost Tracker
│       ├── integrations/
│       │   ├── crm_sync.py                # HubSpot / Salesforce Deal Sync
│       │   ├── slack_bot.py               # Slack Block Kit Slash Command Bot
│       │   └── outbound_sync.py           # Apollo.io / Instantly Exporter
│       └── models/
│           └── gtm_models.py              # Pydantic Schemas & Domain Types
├── frontend/                              # Next.js 14 Production Workspace
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css                # 2026 Dark Monochrome Design Tokens
│   │   │   ├── layout.tsx                 # Root layout & font configuration
│   │   │   └── page.tsx                   # Main workspace page
│   │   ├── components/
│   │   │   ├── GtmWorkspace.tsx           # Workspace Coordinator & State
│   │   │   ├── Topbar.tsx                 # System Telemetry & Quick Actions
│   │   │   ├── DataGrid.tsx               # 100% Full-Width Ultra-Dense Table
│   │   │   ├── InspectorDrawer.tsx        # Slide-over & Executive Dossier View
│   │   │   └── CommandPalette.tsx         # Raycast-Style ⌘K Command Palette
│   │   ├── lib/
│   │   │   └── api.ts                     # REST & SSE Streaming Client (:8001)
│   │   └── types/
│   │       └── gtm.ts                     # TypeScript Type Definitions
│   ├── package.json
│   └── tailwind.config.ts
└── tests/                                 # 27 Automated Tests
    ├── test_api.py
    ├── test_daemon.py
    ├── test_drift_engine.py
    ├── test_integrations.py
    ├── test_logging_and_evaluation.py
    ├── test_robustness.py
    ├── test_seltz_engine.py
    └── test_seltz_tool.py
```

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

<div align="center">
<b>Pulse — Autonomous GTM Operating System</b>
</div>
