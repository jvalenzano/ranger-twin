"""Basic endpoint tests for recovery-coordinator agent."""
import pytest


def test_health_check(client):
    """Test health endpoint returns 200."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_agent_info(client):
    """Test agent info endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "agent" in response.json()
