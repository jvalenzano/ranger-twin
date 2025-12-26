"""
Tests for MCPMockProvider.

Verifies mock registration, fixture injection, and call tracking.
"""

import json
import tempfile
from pathlib import Path

import pytest

from skill_runtime.testing import MCPMockProvider, SkillExecutionContext


class TestMCPMockProvider:
    """Test MCPMockProvider functionality."""

    def test_register_direct_response(self):
        """Can register a direct response for a server/tool."""
        mock = MCPMockProvider()
        mock.register("mcp-nifc", "get_incident", {"acres": 1200})

        result = mock.call("mcp-nifc", "get_incident")
        assert result["acres"] == 1200

    def test_register_chaining(self):
        """Registration methods support chaining."""
        mock = MCPMockProvider()
        result = (
            mock
            .register("server1", "tool1", {"a": 1})
            .register("server1", "tool2", {"b": 2})
            .register("server2", "tool1", {"c": 3})
        )

        assert result is mock
        assert mock.call("server1", "tool1") == {"a": 1}
        assert mock.call("server1", "tool2") == {"b": 2}
        assert mock.call("server2", "tool1") == {"c": 3}

    def test_register_from_fixture_file(self):
        """Can register response from a fixture JSON file."""
        # Create temp fixture
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump({"fire_id": "test-fire", "acres": 500}, f)
            fixture_path = f.name

        try:
            mock = MCPMockProvider()
            mock.register("mcp-fixtures", "test-data", fixture_path=fixture_path)

            result = mock.call("mcp-fixtures", "test-data")
            assert result["fire_id"] == "test-fire"
            assert result["acres"] == 500
        finally:
            Path(fixture_path).unlink()

    def test_register_fixture_not_found(self):
        """Raises FileNotFoundError for missing fixture."""
        mock = MCPMockProvider()
        with pytest.raises(FileNotFoundError):
            mock.register("server", "tool", fixture_path="/nonexistent/path.json")

    def test_register_requires_response_or_fixture(self):
        """Raises ValueError if no response source provided."""
        mock = MCPMockProvider()
        with pytest.raises(ValueError):
            mock.register("server", "tool")

    def test_register_error_response(self):
        """Can register an error to be raised."""
        mock = MCPMockProvider()
        mock.register("mcp-nifc", "failing_tool", error="Connection timeout")

        with pytest.raises(RuntimeError, match="Connection timeout"):
            mock.call("mcp-nifc", "failing_tool")

    def test_call_unregistered_server(self):
        """Raises KeyError for unregistered server."""
        mock = MCPMockProvider()
        with pytest.raises(KeyError, match="No mocks registered for server"):
            mock.call("unknown-server", "tool")

    def test_call_unregistered_tool(self):
        """Raises KeyError for unregistered tool."""
        mock = MCPMockProvider()
        mock.register("mcp-nifc", "tool1", {"data": 1})

        with pytest.raises(KeyError, match="No mock registered for mcp-nifc/unknown"):
            mock.call("mcp-nifc", "unknown")

    def test_call_history_tracking(self):
        """Tracks all calls made through the mock."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"result": "ok"})

        mock.call("server", "tool", {"param1": "value1"})
        mock.call("server", "tool", {"param2": "value2"})

        history = mock.get_call_history()
        assert len(history) == 2
        assert history[0]["params"] == {"param1": "value1"}
        assert history[1]["params"] == {"param2": "value2"}

    def test_assert_called(self):
        """Can assert a tool was called."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"result": "ok"})
        mock.call("server", "tool")

        mock.assert_called("server", "tool")  # Should not raise

    def test_assert_called_fails(self):
        """assert_called raises if call was not made."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"result": "ok"})

        with pytest.raises(AssertionError, match="was not made"):
            mock.assert_called("server", "tool")

    def test_assert_called_with(self):
        """Can assert a call was made with specific params."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"result": "ok"})
        mock.call("server", "tool", {"fire_id": "cedar-creek"})

        mock.assert_called_with("server", "tool", {"fire_id": "cedar-creek"})

    def test_reset(self):
        """Can reset all mocks and history."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"result": "ok"})
        mock.call("server", "tool")

        mock.reset()

        assert len(mock.registered_servers) == 0
        assert len(mock.get_call_history()) == 0

    def test_registered_servers(self):
        """Can list registered servers."""
        mock = MCPMockProvider()
        mock.register("server1", "tool", {})
        mock.register("server2", "tool", {})

        assert set(mock.registered_servers) == {"server1", "server2"}

    def test_registered_tools(self):
        """Can list registered tools per server."""
        mock = MCPMockProvider()
        mock.register("server", "tool1", {})
        mock.register("server", "tool2", {})

        assert mock.registered_tools == {"server": ["tool1", "tool2"]}


class TestSkillExecutionContext:
    """Test SkillExecutionContext functionality."""

    def test_default_mcp_provider(self):
        """Creates default MCP provider if none given."""
        ctx = SkillExecutionContext()
        assert ctx.mcp is not None
        assert isinstance(ctx.mcp, MCPMockProvider)

    def test_custom_mcp_provider(self):
        """Accepts custom MCP provider."""
        mock = MCPMockProvider()
        mock.register("server", "tool", {"data": 1})

        ctx = SkillExecutionContext(mcp=mock)
        result = ctx.mcp.call("server", "tool")
        assert result["data"] == 1

    def test_get_fixture_convenience(self):
        """get_fixture is shorthand for mcp-fixtures server."""
        mock = MCPMockProvider()
        mock.register("mcp-fixtures", "burn-severity", {"high": 80})

        ctx = SkillExecutionContext(mcp=mock)
        result = ctx.get_fixture("burn-severity")
        assert result["high"] == 80

    def test_metadata_storage(self):
        """Can store and retrieve execution metadata."""
        ctx = SkillExecutionContext()
        ctx.set_metadata("start_time", "2025-12-25T10:00:00")
        ctx.set_metadata("user_id", "ranger-001")

        assert ctx.get_metadata("start_time") == "2025-12-25T10:00:00"
        assert ctx.get_metadata("user_id") == "ranger-001"
        assert ctx.get_metadata("missing", "default") == "default"
