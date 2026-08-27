"""CrewAI Crew setup for GTM Intelligence System."""

import os
from typing import List, Dict, Any, Optional
from pathlib import Path
import yaml
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from gtm_intelligence.tools.seltz_tool import SeltzSearchTool, SeltzAnswerTool
from gtm_intelligence.models.gtm_models import GTMIntelligenceReport, SalesBattlecard, ICPProfile, OutreachCampaign


@CrewBase
class GtmIntelligenceCrew:
    """GTM Intelligence System Crew setup using CrewAI and Seltz Web Indexing."""

    agents_config_path = Path(__file__).parent / "config" / "agents.yaml"
    tasks_config_path = Path(__file__).parent / "config" / "tasks.yaml"

    def __init__(self, mode: str = "deep"):
        self.mode = mode
        self.seltz_search_tool = SeltzSearchTool()
        self.seltz_answer_tool = SeltzAnswerTool()

    @agent
    def market_intelligence_agent(self) -> Agent:
        return Agent(
            config=self.agents_config[self.market_intelligence_agent.__name__],
            tools=[self.seltz_search_tool, self.seltz_answer_tool],
            verbose=True
        )

    @agent
    def competitor_icp_profiler_agent(self) -> Agent:
        return Agent(
            config=self.agents_config[self.competitor_icp_profiler_agent.__name__],
            verbose=True
        )

    @agent
    def fact_checker_auditor_agent(self) -> Agent:
        return Agent(
            config=self.agents_config[self.fact_checker_auditor_agent.__name__],
            tools=[self.seltz_search_tool],
            verbose=True
        )

    @agent
    def gtm_strategist_agent(self) -> Agent:
        return Agent(
            config=self.agents_config[self.gtm_strategist_agent.__name__],
            verbose=True
        )

    @agent
    def outreach_blueprint_agent(self) -> Agent:
        return Agent(
            config=self.agents_config[self.outreach_blueprint_agent.__name__],
            verbose=True
        )

    @task
    def web_intelligence_task(self) -> Task:
        return Task(
            config=self.tasks_config[self.web_intelligence_task.__name__],
        )

    @task
    def competitor_icp_profiling_task(self) -> Task:
        return Task(
            config=self.tasks_config[self.competitor_icp_profiling_task.__name__],
        )

    @task
    def fact_verification_task(self) -> Task:
        return Task(
            config=self.tasks_config[self.fact_verification_task.__name__],
        )

    @task
    def gtm_strategy_task(self) -> Task:
        return Task(
            config=self.tasks_config[self.gtm_strategy_task.__name__],
        )

    @task
    def outreach_blueprint_task(self) -> Task:
        return Task(
            config=self.tasks_config[self.outreach_blueprint_task.__name__],
            output_file="outputs/gtm_outreach_blueprint.md"
        )

    @crew
    def crew(self) -> Crew:
        """Creates the GTM Intelligence Crew with standard or deep-dive task pipelines."""
        if self.mode == "standard":
            # Standard fast 4-task execution pipeline
            task_pipeline = [
                self.web_intelligence_task(),
                self.competitor_icp_profiling_task(),
                self.gtm_strategy_task(),
                self.outreach_blueprint_task()
            ]
        else:
            # Deep-dive enterprise pipeline including Fact Verification Auditor
            task_pipeline = [
                self.web_intelligence_task(),
                self.competitor_icp_profiling_task(),
                self.fact_verification_task(),
                self.gtm_strategy_task(),
                self.outreach_blueprint_task()
            ]

        return Crew(
            agents=self.agents,
            tasks=task_pipeline,
            process=Process.sequential,
            verbose=True
        )
