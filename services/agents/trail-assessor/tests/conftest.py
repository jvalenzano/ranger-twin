"""Pytest configuration and fixtures for trail-assessor tests."""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """Create test client for the agent API."""
    from app.main import app
    return TestClient(app)


@pytest.fixture
def mock_redis(mocker):
    """Mock Redis client for testing."""
    return mocker.patch("app.main.redis_client")
