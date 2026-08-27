# GTM Intelligence System (CrewAI + Seltz Web Indexing)

An enterprise-grade, multi-agent Go-To-Market (GTM) Intelligence System built with **CrewAI** and **Seltz Web Indexing**.

---

## 🌟 Key Features

1. **Seltz AI Web Indexing**: Uses low-latency, machine-structured web indexing via Seltz AI for live competitor pricing, hiring signals, and tech stack detection.
2. **Fact-Verification Reflection Loop**: Dedicated `FactCheckerAgent` audits competitive claims against raw web source citations to eliminate hallucinations in sales battlecards.
3. **Structured Sales Enablement Outputs**: Generates Pydantic-validated `CompetitorMatrix`, `SalesBattlecards`, and multi-channel `OutreachCampaign` blueprints.
4. **Competitor Drift Engine**: Persists historical snapshots and computes delta changes over time (e.g. pricing increases, hiring surges, feature launches).
5. **Dual Execution Modes**:
   - `standard`: Fast 4-agent flow for rapid research.
   - `deep`: Fact-audited 5-agent enterprise pipeline.

---

## 🚀 Quick Start with `uv`

### 1. Prerequisites
- Python 3.10+
- [uv](https://github.com/astral-sh/uv) package manager

### 2. Environment Setup
Copy `.env.example` to `.env` and set your API keys:
```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=your_openai_api_key
SELTZ_API_KEY=your_seltz_api_key  # Optional: System defaults to fallback search if key is omitted
```

### 3. Run GTM Intelligence Run
Run via `uv`:
```bash
uv run python -m gtm_intelligence.main --target "AI-powered Developer Tools" --mode deep
```

Outputs will be generated in `outputs/gtm_intelligence_report.md` and historical snapshots saved to `gtm_history/`.

---

## 🧪 Running Tests

```bash
uv run pytest
```
