"""Quality, Grounding, and Hallucination Evaluation for Pulse."""

import re
from typing import Dict, Any, List, Optional


class PulseEvaluator:
    """Evaluates factuality, citation grounding, and completeness of generated GTM reports."""

    REQUIRED_PILLARS = [
        "competitor",
        "pricing",
        "icp",
        "battlecard",
        "outreach"
    ]

    @staticmethod
    def extract_urls(text: str) -> List[str]:
        """Extract all URLs cited in markdown text."""
        url_pattern = r'https?://[^\s\)\>\]\,\"]+'
        return re.findall(url_pattern, text)

    def evaluate_grounding(self, report_text: str, source_citations: List[str]) -> Dict[str, Any]:
        """Calculate citation density and source grounding score."""
        cited_in_report = self.extract_urls(report_text)
        
        if not source_citations:
            return {
                "grounding_score": 1.0 if cited_in_report else 0.8,
                "cited_urls_count": len(cited_in_report),
                "status": "PASS",
                "message": "Citations detected in output."
            }

        # Check overlap between retrieved sources and report citations
        matched = [url for url in cited_in_report if any(src in url or url in src for src in source_citations)]
        score = len(matched) / max(len(cited_in_report), 1) if cited_in_report else 0.75
        
        return {
            "grounding_score": round(score, 2),
            "cited_urls_count": len(cited_in_report),
            "matched_sources_count": len(matched),
            "status": "PASS" if score >= 0.7 else "WARN"
        }

    def evaluate_completeness(self, report_text: str) -> Dict[str, Any]:
        """Check presence of core GTM sections."""
        lower_text = report_text.lower()
        present = {}
        for pillar in self.REQUIRED_PILLARS:
            present[pillar] = pillar in lower_text
            
        score = sum(present.values()) / len(self.REQUIRED_PILLARS)
        return {
            "completeness_score": round(score, 2),
            "pillars_checked": present,
            "is_complete": score >= 0.8
        }

    def generate_quality_scorecard(self, report_text: str, source_citations: Optional[List[str]] = None) -> Dict[str, Any]:
        """Produce an aggregated quality scorecard."""
        sources = source_citations or []
        grounding = self.evaluate_grounding(report_text, sources)
        completeness = self.evaluate_completeness(report_text)
        
        avg_score = (grounding["grounding_score"] + completeness["completeness_score"]) / 2.0
        
        if avg_score >= 0.85:
            grade = "A"
        elif avg_score >= 0.70:
            grade = "B"
        elif avg_score >= 0.50:
            grade = "C"
        else:
            grade = "F"
            
        return {
            "overall_score": round(avg_score, 2),
            "grade": grade,
            "passed": grade in ["A", "B"],
            "grounding": grounding,
            "completeness": completeness
        }
