"""Unit tests for Native Seltz GTM Intelligence Engine."""

import pytest
from unittest.mock import MagicMock, patch
from gtm_intelligence.engine.seltz_engine import SeltzGTMEngine

def test_seltz_engine_initialization():
    engine = SeltzGTMEngine(api_key="test_key_123")
    assert engine.api_key == "test_key_123"

def test_seltz_engine_search_fallback():
    engine = SeltzGTMEngine(api_key=None)
    with patch("duckduckgo_search.DDGS") as mock_ddg:
        mock_instance = MagicMock()
        mock_instance.text.return_value = [
            {"title": "Test Cloud", "href": "https://testcloud.io", "body": "Enterprise Cloud Stack"}
        ]
        mock_ddg.return_value.__enter__.return_value = mock_instance
        results = engine._search_web("test query", max_results=2)
        assert len(results) == 1
        assert results[0]["title"] == "Test Cloud"
        assert results[0]["url"] == "https://testcloud.io"

def test_seltz_engine_full_run():
    engine = SeltzGTMEngine(api_key=None)
    with patch.object(engine, "_search_web") as mock_search, patch.object(engine, "_answer_question") as mock_ans:
        mock_search.return_value = [{"title": "Datadog Pricing", "url": "https://datadog.com/pricing", "snippet": "Pricing info"}]
        mock_ans.return_value = {
            "answer": "Datadog competes with modern observability stacks.",
            "citations": ["https://datadog.com/pricing"]
        }
        res = engine.run_gtm_intelligence("datadog.com", mode="deep")
        assert "report_markdown" in res
        assert "structured_data" in res
        assert res["structured_data"]["name"] == "Datadog"
        assert res["structured_data"]["primaryCompetitor"] == "Datadog"
        assert len(res["crawled_urls"]) >= 1
        assert len(res["structured_data"]["intel"]["battlecards"]) > 0
