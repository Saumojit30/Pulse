"""Unit tests for Pulse FastAPI Event Gateway."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from gtm_intelligence.api.server import app, _CACHE, _JOBS, ScanJob, JobStatus


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
    """Test /api/v1/scan with mock intelligence execution and cache hit."""
    mock_intel = {
        "report_markdown": "# GTM Report for Test\nPricing is $50/mo. Battlecard details here. https://datadog.com",
        "crawled_urls": ["https://datadog.com"],
        "structured_data": None,
        "duration_seconds": 0.1
    }
    with patch("gtm_intelligence.api.server.seltz_engine.run_gtm_intelligence", return_value=mock_intel):
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


def test_create_scan_job_and_stream(client):
    """Test POST /api/v1/scan/jobs returns 202 and GET /stream returns SSE events."""
    mock_intel = {
        "report_markdown": "# Report for Async\nPricing is $99/mo.",
        "crawled_urls": ["https://example.com"],
        "structured_data": None,
        "duration_seconds": 0.1
    }
    with patch("gtm_intelligence.api.server.seltz_engine.run_gtm_intelligence", return_value=mock_intel):
        # 1. Create async job
        res = client.post("/api/v1/scan/jobs", json={"target_domain": "AsyncTestDomain", "mode": "standard"})
        assert res.status_code == 202
        data = res.json()
        assert "job_id" in data
        assert data["status"] in ("QUEUED", "RUNNING", "COMPLETED")
        job_id = data["job_id"]

        # 2. Test stream endpoint
        stream_res = client.get(f"/api/v1/scan/jobs/{job_id}/stream")
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")


def test_audit_logs_endpoints(client):
    """Test GET /api/v1/audit/logs."""
    res = client.get("/api/v1/audit/logs")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "logs" in data
    assert isinstance(data["logs"], list)

    # 404 for non-existent log
    bad_res = client.get("/api/v1/audit/logs/non_existent_run_99999")
    assert bad_res.status_code == 404


def test_sse_stream_multi_subscriber(client):
    """Test that multiple subscribers can read the same SSE job stream without event stealing."""
    job_id = "test_multi_sub_job"
    job = ScanJob(job_id=job_id, target_domain="MultiSubTest", mode="standard")
    job.status = JobStatus.COMPLETED
    import asyncio
    asyncio.run(job.push_event("step_start", {"message": "Initializing"}))
    asyncio.run(job.push_event("job_completed", {"status": "SUCCESS"}))
    _JOBS[job_id] = job

    # Subscriber 1
    res1 = client.get(f"/api/v1/scan/jobs/{job_id}/stream")
    assert res1.status_code == 200
    content1 = res1.text
    assert "event: step_start" in content1
    assert "event: job_completed" in content1

    # Subscriber 2 (re-reading completed job)
    res2 = client.get(f"/api/v1/scan/jobs/{job_id}/stream")
    assert res2.status_code == 200
    content2 = res2.text
    assert "event: step_start" in content2
    assert "event: job_completed" in content2
    # Ensure no duplicates within a single stream
    assert content1.count("event: step_start") == 1
    assert content1.count("event: job_completed") == 1


def test_accounts_crud_endpoints(client):
    """Test persistent SQLite accounts CRUD endpoints."""
    # 1. List accounts
    res = client.get("/api/v1/accounts")
    assert res.status_code == 200
    data = res.json()
    assert "accounts" in data
    initial_count = data["count"]

    # 2. Create account
    new_acc = {
        "domain": "testenterprise.com",
        "name": "TestEnterprise",
        "industry": "Cloud Infrastructure",
        "icp_fit_score": 92
    }
    create_res = client.post("/api/v1/accounts", json=new_acc)
    assert create_res.status_code == 200
    created_data = create_res.json()
    assert created_data["status"] == "SUCCESS"
    assert created_data["account"]["domain"] == "testenterprise.com"

    # 3. Verify in list
    res_after = client.get("/api/v1/accounts")
    assert res_after.json()["count"] >= initial_count + 1

    # 4. Delete account
    del_res = client.delete("/api/v1/accounts/testenterprise.com")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "DELETED"


