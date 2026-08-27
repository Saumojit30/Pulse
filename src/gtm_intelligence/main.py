"""Main CLI entrypoint for GTM Intelligence System."""

import os
import json
import click
from pathlib import Path
from dotenv import load_dotenv

from gtm_intelligence.crew import GtmIntelligenceCrew
from gtm_intelligence.storage.drift_engine import CompetitorDriftEngine

load_dotenv()


@click.command()
@click.option(
    "--target",
    "-t",
    default="AI-powered Developer Security Tools",
    help="Target product or market domain to perform GTM Intelligence on.",
)
@click.option(
    "--mode",
    "-m",
    type=click.Choice(["standard", "deep"], case_sensitive=False),
    default="deep",
    help="Execution mode: 'standard' (fast 4-agent flow) or 'deep' (fact-audited enterprise flow).",
)
@click.option(
    "--detect-drift/--no-detect-drift",
    default=True,
    help="Detect competitor drift against previous historical runs.",
)
def run(target: str, mode: str, detect_drift: bool):
    """Run GTM Intelligence System with Seltz Web Indexing."""
    click.echo(click.style("==================================================", fg="cyan", bold=True))
    click.echo(click.style("     GTM Intelligence System (CrewAI + Seltz)     ", fg="green", bold=True))
    click.echo(click.style("==================================================", fg="cyan", bold=True))
    click.echo(f"[*] Target Domain : {target}")
    click.echo(f"[*] Execution Mode: {mode.upper()}")
    click.echo(f"[*] Seltz API Key : {'Configured' if os.getenv('SELTZ_API_KEY') else 'Fallback Search Mode (No Key Set)'}")
    click.echo("--------------------------------------------------")

    # Create outputs directory
    outputs_dir = Path("outputs")
    outputs_dir.mkdir(parents=True, exist_ok=True)

    inputs = {"target_domain": target}

    click.echo("[*] Kicking off CrewAI agents pipeline...")
    try:
        crew_instance = GtmIntelligenceCrew(mode=mode)
        result = crew_instance.crew().kickoff(inputs=inputs)
        result_text = str(result)

        # Save main report
        report_path = outputs_dir / "gtm_intelligence_report.md"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(result_text)

        click.echo(click.style(f"[+] GTM Intelligence Report saved to: {report_path.resolve()}", fg="green", bold=True))

        # Save snapshot & compute drift
        drift_engine = CompetitorDriftEngine()
        snapshot_path = drift_engine.save_snapshot(target, {"output_summary": result_text[:500], "full_report": result_text})
        click.echo(f"[+] Historical snapshot saved to: {snapshot_path}")

        if detect_drift:
            drift_res = drift_engine.detect_drift(target)
            click.echo("\n--------------------------------------------------")
            click.echo(click.style("Competitor Drift Analysis:", fg="yellow", bold=True))
            click.echo(f"Status: {drift_res['status']}")
            if drift_res.get("drift_events"):
                for event in drift_res["drift_events"]:
                    click.echo(f"  - {event}")
            else:
                click.echo("  (First run completed. Run again later to track competitor drift.)")

    except Exception as e:
        click.echo(click.style(f"[!] Error running GTM Intelligence Crew: {str(e)}", fg="red"), err=True)


if __name__ == "__main__":
    run()
