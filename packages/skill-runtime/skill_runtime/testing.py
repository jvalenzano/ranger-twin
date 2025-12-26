"""
RANGER Skill Runtime - Testing Utilities

Provides lightweight mocking infrastructure for skill testing.
Skills remain pure functions; this module enables fixture injection
for deterministic MCP simulation.

Phase 2 Implementation (Hybrid Approach):
- MCPMockProvider: Mock MCP server responses
- Deferred to Phase 3: Full SkillTestHarness wrapper
"""

import json
from pathlib import Path
from typing import Any


class MCPMockProvider:
    """
    Lightweight MCP mock for skill testing.

    Allows tests to register mock responses for MCP server tools,
    enabling deterministic testing against fixture data without
    real MCP server connections.

    Usage:
        mock = MCPMockProvider()
        mock.register("mcp-nifc", "get_incident", {"acres": 1200})
        response = mock.call("mcp-nifc", "get_incident", {"fire_id": "cedar-creek"})
        assert response["acres"] == 1200
    """

    def __init__(self):
        """Initialize empty mock registry."""
        self._mocks: dict[str, dict[str, Any]] = {}
        self._call_history: list[dict] = []
        self._fixture_paths: list[Path] = []

    def register(
        self,
        server: str,
        tool: str,
        response: dict | list | None = None,
        fixture_path: str | Path | None = None,
        error: str | None = None,
    ) -> "MCPMockProvider":
        """
        Register a mock response for a server/tool combination.

        Args:
            server: MCP server ID (e.g., "mcp-nifc", "mcp-fixtures")
            tool: Tool name (e.g., "get_incident_metadata")
            response: Direct response data to return
            fixture_path: Path to JSON fixture file (alternative to response)
            error: Error message to raise when called (for testing error handling)

        Returns:
            Self for method chaining

        Raises:
            ValueError: If neither response nor fixture_path provided
        """
        if server not in self._mocks:
            self._mocks[server] = {}

        if error:
            self._mocks[server][tool] = {"error": error}
        elif fixture_path:
            path = Path(fixture_path)
            if not path.exists():
                raise FileNotFoundError(f"Fixture not found: {fixture_path}")
            with open(path) as f:
                self._mocks[server][tool] = {"response": json.load(f)}
            self._fixture_paths.append(path)
        elif response is not None:
            self._mocks[server][tool] = {"response": response}
        else:
            raise ValueError("Must provide response, fixture_path, or error")

        return self

    def register_fixture_directory(self, directory: str | Path) -> "MCPMockProvider":
        """
        Register all JSON files in a directory as fixtures.

        Files are registered under server "mcp-fixtures" with tool name
        derived from filename (e.g., "burn-severity.json" -> "burn-severity").

        Args:
            directory: Path to fixture directory

        Returns:
            Self for method chaining
        """
        dir_path = Path(directory)
        if not dir_path.is_dir():
            raise NotADirectoryError(f"Not a directory: {directory}")

        for json_file in dir_path.glob("*.json"):
            tool_name = json_file.stem
            self.register("mcp-fixtures", tool_name, fixture_path=json_file)

        return self

    def call(self, server: str, tool: str, params: dict | None = None) -> Any:
        """
        Simulate an MCP tool call.

        Args:
            server: MCP server ID
            tool: Tool name
            params: Tool parameters (recorded but not used for mock lookup)

        Returns:
            Registered mock response

        Raises:
            KeyError: If no mock registered for server/tool
            RuntimeError: If mock was registered with an error
        """
        self._call_history.append({
            "server": server,
            "tool": tool,
            "params": params or {},
        })

        if server not in self._mocks:
            raise KeyError(f"No mocks registered for server: {server}")

        if tool not in self._mocks[server]:
            raise KeyError(f"No mock registered for {server}/{tool}")

        mock_data = self._mocks[server][tool]

        if "error" in mock_data:
            raise RuntimeError(mock_data["error"])

        return mock_data["response"]

    def get_call_history(self) -> list[dict]:
        """Return history of all mock calls made."""
        return self._call_history.copy()

    def assert_called(self, server: str, tool: str) -> None:
        """
        Assert that a specific server/tool was called.

        Args:
            server: Expected server ID
            tool: Expected tool name

        Raises:
            AssertionError: If the call was not made
        """
        for call in self._call_history:
            if call["server"] == server and call["tool"] == tool:
                return
        raise AssertionError(f"Expected call to {server}/{tool} was not made")

    def assert_called_with(self, server: str, tool: str, params: dict) -> None:
        """
        Assert that a specific call was made with specific parameters.

        Args:
            server: Expected server ID
            tool: Expected tool name
            params: Expected parameters

        Raises:
            AssertionError: If the call was not made with expected params
        """
        for call in self._call_history:
            if (call["server"] == server and
                call["tool"] == tool and
                call["params"] == params):
                return
        raise AssertionError(
            f"Expected call to {server}/{tool} with params {params} was not made"
        )

    def reset(self) -> None:
        """Clear all mocks and call history."""
        self._mocks.clear()
        self._call_history.clear()
        self._fixture_paths.clear()

    @property
    def registered_servers(self) -> list[str]:
        """List all registered server IDs."""
        return list(self._mocks.keys())

    @property
    def registered_tools(self) -> dict[str, list[str]]:
        """Map of server ID to list of registered tools."""
        return {
            server: list(tools.keys())
            for server, tools in self._mocks.items()
        }


class SkillExecutionContext:
    """
    Execution context for skill invocation.

    Provides access to MCP mocks and execution metadata.
    Skills receive this context to access data sources.
    """

    def __init__(self, mcp: MCPMockProvider | None = None):
        """
        Initialize execution context.

        Args:
            mcp: Optional MCP mock provider for testing
        """
        self.mcp = mcp or MCPMockProvider()
        self.metadata: dict[str, Any] = {}

    def get_fixture(self, name: str) -> Any:
        """
        Convenience method to get fixture data.

        Args:
            name: Fixture name (without .json extension)

        Returns:
            Fixture data from mcp-fixtures server
        """
        return self.mcp.call("mcp-fixtures", name)

    def set_metadata(self, key: str, value: Any) -> None:
        """Set execution metadata."""
        self.metadata[key] = value

    def get_metadata(self, key: str, default: Any = None) -> Any:
        """Get execution metadata."""
        return self.metadata.get(key, default)
