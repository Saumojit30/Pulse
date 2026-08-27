"""Streamlit Control Center for Pulse: Autonomous GTM Operating System."""

import os
import sys
import json
from pathlib import Path
import streamlit as st

# Add src directory to pythonpath
src_path = Path(__file__).parent.parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from gtm_intelligence.crew import GtmIntelligenceCrew
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine
from gtm_intelligence.exporters.slack_exporter import SlackExporter
from gtm_intelligence.logging.audit_logger import PulseAuditLogger
from gtm_intelligence.evaluation.evaluator import PulseEvaluator
from gtm_intelligence.workers.daemon import PulseSensingDaemon
from gtm_intelligence.integrations.outbound_sync import OutboundCampaignDispatcher
from gtm_intelligence.models.gtm_models import OutreachCampaign, EmailTemplate

st.set_page_config(
    page_title="Pulse - Autonomous GTM Operating System",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("⚡ Pulse: Autonomous GTM Operating System")
st.caption("24/7 Market Sensing, Seltz AI Web Indexing, Anti-Hallucination Audit, and Closed-Loop Revenue Execution")

# Sidebar Configuration
st.sidebar.header("⚙️ Configuration & Credentials")
target_domain = st.sidebar.text_input(
    "Target Domain / Vertical",
    value="AI Developer Tools",
    help="Enter the market vertical or product domain to analyze."
)

mode = st.sidebar.selectbox(
    "Execution Mode",
    options=["deep", "standard"],
    format_func=lambda x: "Deep Enterprise (Fact-Audited & Grounded)" if x == "deep" else "Standard (Fast 4-Agent)",
    help="Deep mode includes the FactCheckerAuditorAgent reflection loop."
)

seltz_key = st.sidebar.text_input(
    "Seltz API Key",
    type="password",
    value=os.getenv("SELTZ_API_KEY", ""),
    help="Optional: System defaults to resilient fallback search if not provided."
)

if seltz_key:
    os.environ["SELTZ_API_KEY"] = seltz_key

slack_webhook = st.sidebar.text_input(
    "Slack Webhook URL",
    type="password",
    value=os.getenv("SLACK_WEBHOOK_URL", ""),
    help="Optional: Post drift alerts & report summaries directly to Slack."
)

st.sidebar.divider()
st.sidebar.markdown("### Engine Status")
st.sidebar.success(f"🌐 Indexer: {'Seltz Live API' if seltz_key else 'Fallback Web Search'}")
st.sidebar.info("🛡️ Fact Auditor: Active (3-Layer Grounding)")

# Main Navigation Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🚀 Run GTM Scan",
    "📈 Drift & Watchlist Daemon",
    "🔍 Quality & Grounding Scorecard",
    "📊 Observability & Cost Logs",
    "🔗 Integrations (CRM & Apollo)"
])

audit_logger = PulseAuditLogger()
evaluator = PulseEvaluator()
drift_engine = CompetitorDriftEngine()
daemon = PulseSensingDaemon()

# ----------------- TAB 1: GTM SCAN -----------------
with tab1:
    st.markdown("### Generate Fact-Audited GTM Intelligence")
    st.write("Trigger the autonomous multi-agent pipeline with live Seltz web indexing and fact verification.")

    if st.button("▶️ Launch Pulse GTM Crew", type="primary"):
        with st.spinner(f"Running Pulse Crew ({mode} mode) for '{target_domain}'..."):
            run_log = audit_logger.create_run_log(target_domain, mode)
            try:
                crew_instance = GtmIntelligenceCrew(mode=mode)
                result = crew_instance.crew().kickoff(inputs={"target_domain": target_domain})
                result_text = str(result)

                # Save report
                outputs_dir = Path("outputs")
                outputs_dir.mkdir(parents=True, exist_ok=True)
                with open(outputs_dir / "gtm_intelligence_report.md", "w", encoding="utf-8") as f:
                    f.write(result_text)

                # Evaluate quality & finalize log
                scorecard = evaluator.generate_quality_scorecard(result_text)
                audit_logger.finalize_run(run_log, status="SUCCESS", quality_scorecard=scorecard)

                # Save snapshot
                drift_engine.save_snapshot(target_domain, {"output_summary": result_text[:500], "full_report": result_text})

                st.success(f"✅ Scan Completed! Quality Grade: **{scorecard['grade']}** (Grounding: {scorecard['grounding']['grounding_score']*100:.0f}%)")
                st.markdown("---")
                st.markdown("### 📊 Generated GTM Battlecard & Report")
                st.markdown(result_text)

                st.download_button(
                    label="📥 Download Full Markdown Report",
                    data=result_text,
                    file_name="pulse_gtm_report.md",
                    mime="text/markdown"
                )
            except Exception as e:
                audit_logger.finalize_run(run_log, status=f"FAILED: {str(e)}")
                st.error(f"❌ Execution Error: {str(e)}")
                st.info("Tip: Ensure your OPENAI_API_KEY is set in your environment or .env file.")

# ----------------- TAB 2: DRIFT & WATCHLIST -----------------
with tab2:
    st.markdown("### 📈 24/7 Watchlist Sensing Daemon & Drift Monitor")
    
    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown("#### 🎯 Active Watchlist Targets")
        watchlist_items = st.text_area("Edit Watchlist (one per line)", value="\n".join(daemon.watchlist), height=150)
        if st.button("💾 Update Watchlist"):
            new_items = [line.strip() for line in watchlist_items.split("\n") if line.strip()]
            daemon.save_watchlist(new_items)
            st.success("Watchlist updated successfully!")

    with col2:
        st.markdown("#### ⚡ Single-Cycle Daemon Trigger")
        st.write("Trigger a background check across all watchlist items now.")
        if st.button("🔄 Run Daemon Cycle"):
            with st.spinner("Daemon sensing watchlist targets..."):
                cycle_res = daemon.run_single_cycle()
                st.success(f"Completed monitoring cycle for {len(cycle_res)} targets.")
                st.json(cycle_res)

    st.divider()
    st.markdown("#### 📊 Drift Delta for Target")
    drift_res = drift_engine.detect_drift(target_domain)
    st.markdown(f"**Drift Status**: `{drift_res['status']}`")
    if drift_res.get("drift_events"):
        st.warning(f"⚠️ **{len(drift_res['drift_events'])} Drift Events Detected:**")
        for event in drift_res["drift_events"]:
            st.write(f"- {event}")
    else:
        st.info("No competitor drift detected for this target.")

# ----------------- TAB 3: QUALITY & GROUNDING -----------------
with tab3:
    st.markdown("### 🔍 Anti-Hallucination & Grounding Scorecard")
    st.write("Pulse enforces strict source grounding against Seltz web indexing citations.")
    
    report_file = Path("outputs") / "gtm_intelligence_report.md"
    if report_file.exists():
        with open(report_file, "r", encoding="utf-8") as f:
            text = f.read()
        scorecard = evaluator.generate_quality_scorecard(text)
        
        c1, c2, c3 = st.columns(3)
        c1.metric("Overall Grade", scorecard["grade"])
        c2.metric("Grounding Score", f"{scorecard['grounding']['grounding_score']*100:.1f}%")
        c3.metric("Completeness", f"{scorecard['completeness']['completeness_score']*100:.1f}%")
        
        st.markdown("#### Detailed Checks")
        st.json(scorecard)
    else:
        st.info("Run a GTM Scan in Tab 1 to view live Quality and Grounding metrics.")

# ----------------- TAB 4: OBSERVABILITY & LOGS -----------------
with tab4:
    st.markdown("### 📊 Structured Audit Logs & Token Cost Tracking")
    log_files = sorted(audit_logger.log_dir.glob("pulse_*.json"), reverse=True)
    
    if log_files:
        st.write(f"Showing last {min(len(log_files), 10)} execution traces.")
        for log_f in log_files[:10]:
            with open(log_f, "r", encoding="utf-8") as f:
                data = json.load(f)
            with st.expander(f"📌 {data.get('run_id')} | Status: {data.get('status')} | Grade: {data.get('quality_grade', 'N/A')} | Cost: ${data.get('tokens_and_cost', {}).get('estimated_cost_usd', 0):.5f}"):
                st.json(data)
    else:
        st.info("No execution audit logs found yet. Run a scan to generate traces.")

# ----------------- TAB 5: INTEGRATIONS -----------------
with tab5:
    st.markdown("### 🔗 CRM & Outbound Sales Dispatchers")
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 🏢 HubSpot / Salesforce Deal Sync")
        st.write("When a deal stage moves in your CRM, Pulse attaches the battlecard directly to the deal.")
        st.code("""
# FastAPI Webhook Endpoint
POST /api/v1/crm/webhook
Payload: {
  "deal_id": "10984",
  "deal_name": "Enterprise Deal",
  "deal_stage": "Proposal",
  "competitor_tagged": "CompetitorX"
}
        """, language="json")

    with col2:
        st.markdown("#### 🚀 Apollo / Instantly Sequence Export")
        st.write("Export cold outreach sequences formatted for Apollo & Instantly.")
        
        sample_campaign = OutreachCampaign(
            target_persona="VP Engineering",
            value_prop_hook="Automate your GTM intelligence",
            email_sequence=[
                EmailTemplate(
                    step_number=1,
                    subject_line="Quick note on your GTM strategy",
                    body_text="Hi {{first_name}},\nNoticed your competitor just raised prices.",
                    call_to_action="Let's chat for 5 mins?"
                )
            ],
            linkedin_touchpoints=["Saw your team expansion."]
        )
        
        apollo_csv = OutboundCampaignDispatcher.export_apollo_csv(sample_campaign)
        st.download_button(
            label="📥 Download Apollo.io Sequence CSV",
            data=apollo_csv,
            file_name="pulse_apollo_sequence.csv",
            mime="text/csv"
        )
