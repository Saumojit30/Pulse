"""Streamlit Web UI Dashboard for GTM Intelligence System."""

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

st.set_page_config(
    page_title="GTM Intelligence Dashboard",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🎯 Enterprise GTM Intelligence Dashboard")
st.caption("Powered by CrewAI Autonomous Agents & Seltz AI Web Indexing")

# Sidebar Configuration
st.sidebar.header("⚙️ Configuration")
target_domain = st.sidebar.text_input(
    "Target Domain / Product",
    value="AI-powered Developer Tools",
    help="Enter the market vertical or product domain to analyze."
)

mode = st.sidebar.selectbox(
    "Execution Mode",
    options=["deep", "standard"],
    format_func=lambda x: "Deep Enterprise (Fact-Audited)" if x == "deep" else "Standard (Fast 4-Agent)",
    help="Deep mode includes the FactCheckerAuditorAgent reflection loop."
)

seltz_key = st.sidebar.text_input(
    "Seltz API Key",
    type="password",
    value=os.getenv("SELTZ_API_KEY", ""),
    help="Optional: System uses fallback search mode if not provided."
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
st.sidebar.markdown("### Status")
st.sidebar.info(f"Indexing Engine: {'Seltz Live Web Indexing' if seltz_key else 'Fallback Web Search Mode'}")

# Main Navigation Tabs
tab1, tab2, tab3 = st.tabs(["🚀 Run GTM Scan", "📈 Competitor Drift Timeline", "🔗 Exporters & Integrations"])

with tab1:
    st.markdown("### Generate Go-To-Market Intelligence")
    st.write("Kick off autonomous multi-agent research to produce battlecards, ICP triggers, and outreach blueprints.")

    if st.button("▶️ Launch GTM Intelligence Crew", type="primary"):
        with st.spinner(f"Running GTM Crew ({mode} mode) for '{target_domain}'..."):
            try:
                crew_instance = GtmIntelligenceCrew(mode=mode)
                result = crew_instance.crew().kickoff(inputs={"target_domain": target_domain})
                result_text = str(result)

                # Save report
                outputs_dir = Path("outputs")
                outputs_dir.mkdir(parents=True, exist_ok=True)
                with open(outputs_dir / "gtm_intelligence_report.md", "w", encoding="utf-8") as f:
                    f.write(result_text)

                # Save snapshot
                drift_engine = CompetitorDriftEngine()
                drift_engine.save_snapshot(target_domain, {"output_summary": result_text[:500], "full_report": result_text})

                st.success("✅ GTM Scan Completed Successfully!")
                st.markdown("---")
                st.markdown("### 📊 Report Output")
                st.markdown(result_text)

                st.download_button(
                    label="📥 Download Markdown Report",
                    data=result_text,
                    file_name="gtm_intelligence_report.md",
                    mime="text/markdown"
                )
            except Exception as e:
                st.error(f"❌ Execution Error: {str(e)}")
                st.info("Tip: Ensure your OPENAI_API_KEY (or LLM API Key) is set in your environment or .env file.")

with tab2:
    st.markdown("### 📈 Historical Competitor Drift Analysis")
    drift_engine = CompetitorDriftEngine()
    snapshots = drift_engine.get_latest_snapshots(target_domain, limit=5)

    if not snapshots:
        st.warning(f"No historical runs found for target domain '{target_domain}'. Run a GTM scan first!")
    else:
        st.info(f"Found {len(snapshots)} historical snapshot(s) for '{target_domain}'.")
        drift_res = drift_engine.detect_drift(target_domain)
        st.markdown(f"**Drift Engine Status**: `{drift_res['status']}`")

        if drift_res.get("drift_events"):
            st.error(f"⚠️ **{len(drift_res['drift_events'])} Drift Event(s) Detected:**")
            for event in drift_res["drift_events"]:
                st.write(f"- {event}")
        else:
            st.success("No competitor drift detected since the previous scan.")

with tab3:
    st.markdown("### 🔗 Integrations & Webhook Exporters")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("#### 💬 Slack Integration")
        if st.button("📤 Test Slack Webhook Dispatch"):
            if not slack_webhook:
                st.error("Please provide a Slack Webhook URL in the sidebar configuration.")
            else:
                exporter = SlackExporter(webhook_url=slack_webhook)
                res = exporter.send_gtm_summary(target_domain, "Test report dispatch from GTM Intelligence Dashboard.")
                if res.get("status") == "success":
                    st.success("Test message dispatched to Slack successfully!")
                else:
                    st.error(f"Slack Dispatch Failed: {res}")

    with col2:
        st.markdown("#### 📑 CRM Export")
        st.write("Download formatted CRM payloads for HubSpot / Salesforce integration.")
        crm_data = {
            "target_domain": target_domain,
            "export_type": "HubSpot_Note",
            "payload": f"GTM Intelligence Report for {target_domain}"
        }
        st.download_button(
            label="📥 Download HubSpot CRM JSON",
            data=json.dumps(crm_data, indent=2),
            file_name="gtm_hubspot_payload.json",
            mime="application/json"
        )
