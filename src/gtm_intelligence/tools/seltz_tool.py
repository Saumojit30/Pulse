"""Robust Custom CrewAI tool wrapping Seltz Web Indexing API with failure recovery and retries."""

import os
import re
import time
import logging
from typing import Type, Optional, List, Dict, Any
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

logger = logging.getLogger(__name__)


def sanitize_query(query: str) -> str:
    """Sanitize and clean search query input."""
    if not query or not query.strip():
        return "GTM Intelligence market research"
    cleaned = re.sub(r"[^\w\s\-\.\?]", " ", query)
    cleaned = " ".join(cleaned.split())
    return cleaned[:300]


class SeltzSearchInput(BaseModel):
    """Input schema for SeltzSearchTool."""
    query: str = Field(description="Search query or keyword for web indexing (e.g. 'Competitor X pricing features enterprise')")
    max_results: int = Field(default=5, description="Maximum number of web index results to return")


class SeltzSearchTool(BaseTool):
    """Tool for performing real-time agentic web search and indexing via Seltz AI with failure resilience."""
    name: str = "Seltz Web Indexing Search"
    description: str = (
        "Indexes and searches the live web for structured company intelligence, competitor updates, "
        "pricing pages, hiring signals, and tech stack details using Seltz AI Web Knowledge API."
    )
    args_schema: Type[BaseModel] = SeltzSearchInput

    def _run(self, query: str, max_results: int = 5) -> str:
        """Execute web search with retry logic and multi-engine fallback."""
        clean_q = sanitize_query(query)
        api_key = os.getenv("SELTZ_API_KEY")

        if api_key:
            # Retry loop with exponential backoff for Seltz API
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    from seltz import Seltz
                    client = Seltz(api_key=api_key)
                    response = client.search(query=clean_q, max_results=max_results)
                    
                    results = []
                    documents = getattr(response, "documents", []) or (response if isinstance(response, list) else [])
                    
                    for idx, doc in enumerate(documents, 1):
                        url = getattr(doc, "url", doc.get("url") if isinstance(doc, dict) else "")
                        content = getattr(doc, "content", doc.get("content") if isinstance(doc, dict) else "")
                        title = getattr(doc, "title", doc.get("title", f"Result {idx}") if isinstance(doc, dict) else f"Result {idx}")
                        results.append(f"[{idx}] Title: {title}\nURL: {url}\nContent: {content}\n")
                    
                    if results:
                        return f"### Seltz Live Web Indexing Results for '{clean_q}':\n\n" + "\n---\n".join(results)
                except Exception as e:
                    logger.warning(f"Seltz API attempt {attempt + 1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(1.5 ** attempt)

        # Fallback search engine (DuckDuckGo / DDGS)
        for attempt in range(2):
            try:
                from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    ddg_results = list(ddgs.text(clean_q, max_results=max_results))
                    if ddg_results:
                        formatted = []
                        for idx, res in enumerate(ddg_results, 1):
                            title = res.get("title", "Untitled")
                            url = res.get("href", "")
                            snippet = res.get("body", "")
                            formatted.append(f"[{idx}] Title: {title}\nURL: {url}\nContent: {snippet}\n")
                        return f"### [Fallback Search Mode] Web Search Results for '{clean_q}':\n\n" + "\n---\n".join(formatted)
            except Exception as e:
                logger.warning(f"Fallback search attempt {attempt + 1} failed: {str(e)}")
                time.sleep(1)

        return f"Warning: Unable to fetch live web results for query '{clean_q}'. Proceeding with synthesized intelligence."


class SeltzAnswerInput(BaseModel):
    """Input schema for SeltzAnswerTool."""
    question: str = Field(description="Grounded question to answer using live web data (e.g. 'What is Competitor X's latest pricing tier?')")


class SeltzAnswerTool(BaseTool):
    """Tool for getting grounded answers with citations using Seltz Answer API with retry handling."""
    name: str = "Seltz Grounded Answer Tool"
    description: str = (
        "Answers specific questions using live web data grounded in verified sources and citations via Seltz AI."
    )
    args_schema: Type[BaseModel] = SeltzAnswerInput

    def _run(self, question: str) -> str:
        clean_q = sanitize_query(question)
        api_key = os.getenv("SELTZ_API_KEY")

        if api_key:
            for attempt in range(2):
                try:
                    from seltz import Seltz
                    client = Seltz(api_key=api_key)
                    answer_response = client.answer(question=clean_q)
                    answer_text = getattr(answer_response, "answer", str(answer_response))
                    citations = getattr(answer_response, "citations", [])
                    
                    output = f"### Seltz Grounded Answer:\n{answer_text}\n"
                    if citations:
                        output += "\n**Citations:**\n" + "\n".join([f"- {c}" for c in citations])
                    return output
                except Exception as e:
                    logger.warning(f"Seltz Answer attempt {attempt + 1} failed: {str(e)}")
                    time.sleep(1)

        search_tool = SeltzSearchTool()
        search_output = search_tool._run(query=clean_q, max_results=3)
        return f"### Grounded Research Response (Fallback Search):\n\nQuestion: {clean_q}\n\nWeb Evidence:\n{search_output}"
