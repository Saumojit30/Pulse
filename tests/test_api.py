"""Unit tests for Pulse FastAPI Event Gateway."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from gtm_intelligence.api.server import app, _CACHE


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    """Test /health endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Pulse GTM Operating System"


def test_get_drift(client):
    """Test /api/v1/drift/{domain} endpoint."""
    response = client.get("/api/v1/drift/TestDomain")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["target_domain"] == "TestDomain"


def test_scan_with_ttl_caching(client):
    """Test /api/v1/scan with mock crew execution and cache hit."""
    # Mock Crew execution
    with patch("gtm_intelligence.api.server.GtmIntelligenceCrew") as mock_crew_cls:
        mock_crew = MagicMock()
        mock_crew.kickoff.return_value = "# GTM Report for Test\nPricing is $50/mo. Battlecard details here."
        mock_instance = MagicMock()
        mock_instance.crew.return_value = mock_crew
        mock_crew_cls.return_value = mock_instance
        
        # First call (fresh run)
        res1 = client.post("/api/v1/scan", json={"target_domain": "CacheTestDomain", "mode": "standard"})
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["status"] == "SUCCESS"
        assert data1["cached"] is False
        
        # Second call (cache hit)
        res2 = client.post("/api/v1/scan", json={"target_domain": "CacheTestDomain", "mode": "standard"})
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["status"] == "SUCCESS_CACHED"
        assert data2["cached"] is True
