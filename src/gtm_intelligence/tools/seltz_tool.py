"""Robust Custom CrewAI tool wrapping Seltz Web Indexing API with failure recovery, connection pooling, and circuit breaker."""

import os
import re
import time
import logging
from typing import Type, Optional, List, Dict, Any
import httpx
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

logger = logging.getLogger(__name__)

# Persistent connection pool with strict timeouts
_HTTP_CLIENT = httpx.Client(
    timeout=httpx.Timeout(connect=5.0, read=15.0, write=10.0, pool=10.0),
    limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
    follow_redirects=True
)

# Global Circuit Breaker for Seltz API
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, cooldown_seconds: float = 60.0):
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    def can_execute(self) -> bool:
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.cooldown_seconds:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker entering HALF_OPEN probe state.")
                return True
            return False
        return True

    def record_success(self) -> None:
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self) -> None:
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            logger.warning(f"Circuit breaker tripped to OPEN for {self.cooldown_seconds}s after {self.failure_count} consecutive failures.")

_SELTZ_CIRCUIT_BREAKER = CircuitBreaker(failure_threshold=3, cooldown_seconds=60.0)

# Optional thread/task audit logging context
_ACTIVE_AUDIT_RUN: Optional[Dict[str, Any]] = None
_ACTIVE_AUDIT_LOGGER: Optional[Any] = None

def set_active_audit_context(logger_instance: Any, run_record: Dict[str, Any]) -> None:
    """Register active audit logger and run record for telemetry capture."""
    global _ACTIVE_AUDIT_LOGGER, _ACTIVE_AUDIT_RUN
    _ACTIVE_AUDIT_LOGGER = logger_instance
    _ACTIVE_AUDIT_RUN = run_record

def clear_active_audit_context() -> None:
    """Clear active audit logger context."""
    global _ACTIVE_AUDIT_LOGGER, _ACTIVE_AUDIT_RUN
    _ACTIVE_AUDIT_LOGGER = None
    _ACTIVE_AUDIT_RUN = None


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
        """Execute web search with retry logic, circuit breaker, and multi-engine fallback."""
        start_time = time.perf_counter()
        clean_q = sanitize_query(query)
        api_key = os.getenv("SELTZ_API_KEY")
        results_count = 0
        status_result = "SUCCESS"

        if api_key and _SELTZ_CIRCUIT_BREAKER.can_execute():
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    documents = []
                    try:
                        from seltz import Seltz
                        client = Seltz(api_key=api_key)
                        response = client.search(query=clean_q, max_results=max_results)
                        documents = getattr(response, "documents", []) or (response if isinstance(response, list) else [])
                    except ImportError:
                        resp = _HTTP_CLIENT.post(
                            "https://api.seltz.ai/v1/search",
                            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                            json={"query": clean_q, "max_results": max_results}
                        )
                        resp.raise_for_status()
                        documents = resp.json().get("documents", [])
                    
                    results = []
                    extracted_urls = []
                    for idx, doc in enumerate(documents, 1):
                        url = getattr(doc, "url", doc.get("url") if isinstance(doc, dict) else "")
                        content = getattr(doc, "content", doc.get("content") if isinstance(doc, dict) else "")
                        title = getattr(doc, "title", doc.get("title", f"Result {idx}") if isinstance(doc, dict) else f"Result {idx}")
                        if url:
                            extracted_urls.append(url)
                        results.append(f"[{idx}] Title: {title}\nURL: {url}\nContent: {content}\n")
                    
                    if results:
                        _SELTZ_CIRCUIT_BREAKER.record_success()
                        results_count = len(results)
                        latency_ms = (time.perf_counter() - start_time) * 1000
                        self._log_telemetry("SeltzSearchTool", clean_q, latency_ms, results_count, "SUCCESS", urls=extracted_urls)
                        return f"### Seltz Live Web Indexing Results for '{clean_q}':\n\n" + "\n---\n".join(results)
                except Exception as e:
                    logger.warning(f"Seltz API attempt {attempt + 1} failed: {str(e)}")
                    _SELTZ_CIRCUIT_BREAKER.record_failure()
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
                        extracted_urls = []
                        for idx, res in enumerate(ddg_results, 1):
                            title = res.get("title", "Untitled")
                            url = res.get("href", "")
                            snippet = res.get("body", "")
                            if url:
                                extracted_urls.append(url)
                            formatted.append(f"[{idx}] Title: {title}\nURL: {url}\nContent: {snippet}\n")
                        
                        results_count = len(formatted)
                        latency_ms = (time.perf_counter() - start_time) * 1000
                        self._log_telemetry("SeltzSearchTool (DDG Fallback)", clean_q, latency_ms, results_count, "SUCCESS", urls=extracted_urls)
                        return f"### [Fallback Search Mode] Web Search Results for '{clean_q}':\n\n" + "\n---\n".join(formatted)
            except Exception as e:
                logger.warning(f"Fallback search attempt {attempt + 1} failed: {str(e)}")
                time.sleep(1)

        latency_ms = (time.perf_counter() - start_time) * 1000
        self._log_telemetry("SeltzSearchTool", clean_q, latency_ms, 0, "FALLBACK_EMPTY")
        return f"Warning: Unable to fetch live web results for query '{clean_q}'. Proceeding with synthesized intelligence."

    def _log_telemetry(self, tool_name: str, query: str, latency_ms: float, results_count: int, status: str, urls: Optional[List[str]] = None):
        if _ACTIVE_AUDIT_LOGGER and _ACTIVE_AUDIT_RUN:
            try:
                _ACTIVE_AUDIT_LOGGER.log_tool_call(
                    _ACTIVE_AUDIT_RUN,
                    tool_name=tool_name,
                    query_or_input=query,
                    latency_ms=latency_ms,
                    results_count=results_count,
                    status=status
                )
                if urls:
                    crawled = _ACTIVE_AUDIT_RUN.setdefault("crawled_urls", [])
                    for u in urls:
                        if u and u not in crawled:
                            crawled.append(u)
            except Exception as e:
                logger.debug(f"Failed to record audit telemetry: {str(e)}")


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
        start_time = time.perf_counter()
        clean_q = sanitize_query(question)
        api_key = os.getenv("SELTZ_API_KEY")

        if api_key and _SELTZ_CIRCUIT_BREAKER.can_execute():
            for attempt in range(2):
                try:
                    answer_text = ""
                    citations = []
                    try:
                        from seltz import Seltz
                        client = Seltz(api_key=api_key)
                        answer_response = client.answer(question=clean_q)
                        answer_text = getattr(answer_response, "answer", str(answer_response))
                        citations = getattr(answer_response, "citations", [])
                    except ImportError:
                        resp = _HTTP_CLIENT.post(
                            "https://api.seltz.ai/v1/answer",
                            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                            json={"question": clean_q}
                        )
                        resp.raise_for_status()
                        data = resp.json()
                        answer_text = data.get("answer", "")
                        citations = data.get("citations", [])
                    
                    _SELTZ_CIRCUIT_BREAKER.record_success()
                    latency_ms = (time.perf_counter() - start_time) * 1000
                    if _ACTIVE_AUDIT_LOGGER and _ACTIVE_AUDIT_RUN:
                        _ACTIVE_AUDIT_LOGGER.log_tool_call(
                            _ACTIVE_AUDIT_RUN,
                            tool_name="SeltzAnswerTool",
                            query_or_input=clean_q,
                            latency_ms=latency_ms,
                            results_count=len(citations),
                            status="SUCCESS"
                        )
                        if citations:
                            crawled = _ACTIVE_AUDIT_RUN.setdefault("crawled_urls", [])
                            for c in citations:
                                if c and c not in crawled:
                                    crawled.append(c)

                    output = f"### Seltz Grounded Answer:\n{answer_text}\n"
                    if citations:
                        output += "\n**Citations:**\n" + "\n".join([f"- {c}" for c in citations])
                    return output
                except Exception as e:
                    logger.warning(f"Seltz Answer attempt {attempt + 1} failed: {str(e)}")
                    _SELTZ_CIRCUIT_BREAKER.record_failure()
                    time.sleep(1)

        search_tool = SeltzSearchTool()
        search_output = search_tool._run(query=clean_q, max_results=3)
        return f"### Grounded Research Response (Fallback Search):\n\nQuestion: {clean_q}\n\nWeb Evidence:\n{search_output}"
