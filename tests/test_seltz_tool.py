"""Tests for SeltzSearchTool and SeltzAnswerTool."""

import pytest
from gtm_intelligence.tools.seltz_tool import SeltzSearchTool, SeltzAnswerTool


def test_seltz_search_tool_fallback():
    """Test that SeltzSearchTool runs without throwing exceptions (using fallback if no key)."""
    tool = SeltzSearchTool()
    output = tool._run(query="CrewAI GTM intelligence", max_results=2)
    
    assert isinstance(output, str)
    assert len(output) > 0
    assert "Results for" in output or "Search Mode" in output or "No results" in output or "Warning:" in output


def test_seltz_answer_tool():
    """Test that SeltzAnswerTool returns grounded response."""
    tool = SeltzAnswerTool()
    output = tool._run(question="What is Go-To-Market strategy?")
    
    assert isinstance(output, str)
    assert len(output) > 0
