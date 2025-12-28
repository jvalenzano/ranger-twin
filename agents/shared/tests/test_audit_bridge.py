"""
Unit tests for AuditEventBridge - Proof Layer SSE streaming foundation.

Test Coverage:
    1. Event capture from logging callbacks (tool_invocation, tool_response, tool_error)
    2. Buffer overflow behavior (max_events_per_invocation enforcement)
    3. Session cleanup (clear_invocation and memory management)
    4. Event type classification (correct dataclass usage and serialization)
    5. Thread safety (concurrent event recording)
    6. Singleton pattern (get_audit_bridge)

Reference: docs/architecture/SSE-PROOF-LAYER-SPIKE.md § 5 (Implementation Roadmap)
"""

import pytest
import threading
import time
from datetime import datetime, timezone

from agents.shared.audit_bridge import (
    AuditEventBridge,
    ToolInvocationEvent,
    ToolResponseEvent,
    ToolErrorEvent,
    get_audit_bridge,
)


class TestToolInvocationEvent:
    """Test suite for ToolInvocationEvent dataclass."""

    def test_creates_with_defaults(self):
        """Event creates with sensible defaults."""
        event = ToolInvocationEvent(
            agent="trail_assessor",
            tool="classify_damage",
            invocation_id="test-123"
        )

        assert event.event_type == "tool_invocation"
        assert event.agent == "trail_assessor"
        assert event.tool == "classify_damage"
        assert event.invocation_id == "test-123"
        assert event.session_id == "unknown"
        assert event.enforcement == "API-level mode=ANY"
        assert event.parameters == {}
        assert event.timestamp  # Should be set automatically

    def test_timestamp_is_iso8601(self):
        """Timestamp follows ISO 8601 format."""
        event = ToolInvocationEvent(agent="test", tool="test")
        # Should parse without error
        datetime.fromisoformat(event.timestamp.replace("Z", "+00:00"))

    def test_to_dict_serialization(self):
        """Event serializes to dict correctly."""
        event = ToolInvocationEvent(
            agent="burn_analyst",
            tool="assess_severity",
            parameters={"fire_id": "cedar-creek"},
            invocation_id="uuid-456",
            session_id="session-789"
        )

        d = event.to_dict()

        assert d["event_type"] == "tool_invocation"
        assert d["agent"] == "burn_analyst"
        assert d["tool"] == "assess_severity"
        assert d["parameters"] == {"fire_id": "cedar-creek"}
        assert d["invocation_id"] == "uuid-456"
        assert d["session_id"] == "session-789"
        assert "timestamp" in d


class TestToolResponseEvent:
    """Test suite for ToolResponseEvent dataclass."""

    def test_creates_with_proof_layer_data(self):
        """Event captures proof layer fields."""
        event = ToolResponseEvent(
            agent="trail_assessor",
            tool="classify_damage",
            confidence=0.90,
            data_sources=["Cedar Creek field assessment"],
            reasoning_chain=["Step 1", "Step 2"],
            invocation_id="test-123"
        )

        assert event.event_type == "tool_response"
        assert event.status == "success"
        assert event.confidence == 0.90
        assert event.data_sources == ["Cedar Creek field assessment"]
        assert event.reasoning_chain == ["Step 1", "Step 2"]
        assert event.invocation_id == "test-123"

    def test_to_dict_includes_all_fields(self):
        """Serialization includes all proof layer fields."""
        event = ToolResponseEvent(
            agent="burn_analyst",
            tool="assess_severity",
            confidence=0.87,
            data_sources=["MTBS", "Sentinel-2"],
            reasoning_chain=["Loaded data", "Classified sectors"],
            invocation_id="uuid-789",
            execution_time_ms=5234
        )

        d = event.to_dict()

        assert d["confidence"] == 0.87
        assert d["data_sources"] == ["MTBS", "Sentinel-2"]
        assert d["reasoning_chain"] == ["Loaded data", "Classified sectors"]
        assert d["execution_time_ms"] == 5234


class TestToolErrorEvent:
    """Test suite for ToolErrorEvent dataclass."""

    def test_creates_with_error_details(self):
        """Event captures error metadata."""
        event = ToolErrorEvent(
            agent="cruising_assistant",
            tool="estimate_volume",
            error_type="ValueError",
            error_message="Invalid DBH measurement",
            parameters={"plot_id": "P-001"},
            invocation_id="test-error-123"
        )

        assert event.event_type == "tool_error"
        assert event.error_type == "ValueError"
        assert event.error_message == "Invalid DBH measurement"
        assert event.parameters == {"plot_id": "P-001"}

    def test_to_dict_serialization(self):
        """Error event serializes correctly."""
        event = ToolErrorEvent(
            agent="nepa_advisor",
            tool="pathway_decision",
            error_type="FileNotFoundError",
            error_message="Missing fixture",
            invocation_id="uuid-error"
        )

        d = event.to_dict()

        assert d["event_type"] == "tool_error"
        assert d["error_type"] == "FileNotFoundError"
        assert d["error_message"] == "Missing fixture"


class TestAuditEventBridge:
    """Test suite for AuditEventBridge core functionality."""

    @pytest.fixture
    def bridge(self):
        """Create a fresh bridge instance for each test."""
        bridge = AuditEventBridge(max_events_per_invocation=10)
        yield bridge
        bridge.clear_all()  # Cleanup after test

    def test_records_tool_invocation(self, bridge):
        """Bridge captures tool invocation events."""
        event = ToolInvocationEvent(
            agent="trail_assessor",
            tool="classify_damage",
            invocation_id="test-001"
        )

        bridge.record_tool_invocation(event)

        audit_trail = bridge.get_audit_trail("test-001")
        assert len(audit_trail) == 1
        assert audit_trail[0]["event_type"] == "tool_invocation"
        assert audit_trail[0]["tool"] == "classify_damage"

    def test_records_tool_response(self, bridge):
        """Bridge captures tool response events with proof layer data."""
        event = ToolResponseEvent(
            agent="burn_analyst",
            tool="assess_severity",
            confidence=0.92,
            data_sources=["MTBS"],
            reasoning_chain=["Step 1", "Step 2"],
            invocation_id="test-002"
        )

        bridge.record_tool_response(event)

        audit_trail = bridge.get_audit_trail("test-002")
        assert len(audit_trail) == 1
        assert audit_trail[0]["event_type"] == "tool_response"
        assert audit_trail[0]["confidence"] == 0.92
        assert audit_trail[0]["data_sources"] == ["MTBS"]
        assert audit_trail[0]["reasoning_chain"] == ["Step 1", "Step 2"]

    def test_records_tool_error(self, bridge):
        """Bridge captures tool error events."""
        event = ToolErrorEvent(
            agent="cruising_assistant",
            tool="estimate_volume",
            error_type="ValueError",
            error_message="Invalid input",
            invocation_id="test-003"
        )

        bridge.record_tool_error(event)

        audit_trail = bridge.get_audit_trail("test-003")
        assert len(audit_trail) == 1
        assert audit_trail[0]["event_type"] == "tool_error"
        assert audit_trail[0]["error_message"] == "Invalid input"

    def test_multiple_events_same_invocation(self, bridge):
        """Bridge buffers multiple events for same invocation."""
        invocation_id = "test-multi"

        # Record invocation
        bridge.record_tool_invocation(
            ToolInvocationEvent(
                agent="nepa_advisor",
                tool="pathway_decision",
                invocation_id=invocation_id
            )
        )

        # Record response
        bridge.record_tool_response(
            ToolResponseEvent(
                agent="nepa_advisor",
                tool="pathway_decision",
                confidence=0.85,
                invocation_id=invocation_id
            )
        )

        audit_trail = bridge.get_audit_trail(invocation_id)
        assert len(audit_trail) == 2
        assert audit_trail[0]["event_type"] == "tool_invocation"
        assert audit_trail[1]["event_type"] == "tool_response"

    def test_buffer_overflow_enforcement(self, bridge):
        """Bridge enforces max_events_per_invocation (FIFO eviction)."""
        invocation_id = "test-overflow"

        # Record 15 events (max is 10)
        for i in range(15):
            bridge.record_tool_invocation(
                ToolInvocationEvent(
                    agent="test",
                    tool=f"tool_{i}",
                    invocation_id=invocation_id
                )
            )

        audit_trail = bridge.get_audit_trail(invocation_id)

        # Should only have 10 events (oldest 5 evicted)
        assert len(audit_trail) == 10

        # First event should be tool_5 (0-4 evicted)
        assert audit_trail[0]["tool"] == "tool_5"
        assert audit_trail[-1]["tool"] == "tool_14"

    def test_get_audit_trail_returns_copy(self, bridge):
        """get_audit_trail returns a copy to prevent external mutation."""
        event = ToolInvocationEvent(
            agent="test",
            tool="test",
            invocation_id="test-copy"
        )
        bridge.record_tool_invocation(event)

        # Get trail and modify it
        trail1 = bridge.get_audit_trail("test-copy")
        trail1.append({"event_type": "malicious"})

        # Original should be unaffected
        trail2 = bridge.get_audit_trail("test-copy")
        assert len(trail2) == 1
        assert trail2[0]["event_type"] == "tool_invocation"

    def test_clear_invocation_removes_events(self, bridge):
        """clear_invocation removes all events for an invocation."""
        invocation_id = "test-clear"

        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id=invocation_id)
        )
        bridge.record_tool_response(
            ToolResponseEvent(agent="test", tool="test", invocation_id=invocation_id)
        )

        # Before clear
        assert len(bridge.get_audit_trail(invocation_id)) == 2

        # After clear
        bridge.clear_invocation(invocation_id)
        assert len(bridge.get_audit_trail(invocation_id)) == 0

    def test_clear_invocation_handles_missing_id(self, bridge):
        """clear_invocation gracefully handles non-existent invocation_id."""
        # Should not raise exception
        bridge.clear_invocation("nonexistent-id")

    def test_get_latest_tool_response(self, bridge):
        """get_latest_tool_response returns most recent response event."""
        invocation_id = "test-latest"

        # Record invocation
        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id=invocation_id)
        )

        # Record first response
        bridge.record_tool_response(
            ToolResponseEvent(
                agent="test", tool="test", confidence=0.80, invocation_id=invocation_id
            )
        )

        # Record second response
        bridge.record_tool_response(
            ToolResponseEvent(
                agent="test", tool="test", confidence=0.95, invocation_id=invocation_id
            )
        )

        latest = bridge.get_latest_tool_response(invocation_id)
        assert latest is not None
        assert latest["confidence"] == 0.95

    def test_get_latest_tool_response_none_if_no_response(self, bridge):
        """get_latest_tool_response returns None if no response events."""
        invocation_id = "test-no-response"

        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id=invocation_id)
        )

        latest = bridge.get_latest_tool_response(invocation_id)
        assert latest is None

    def test_get_invocation_count(self, bridge):
        """get_invocation_count tracks active invocations."""
        assert bridge.get_invocation_count() == 0

        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id="inv-1")
        )
        assert bridge.get_invocation_count() == 1

        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id="inv-2")
        )
        assert bridge.get_invocation_count() == 2

        bridge.clear_invocation("inv-1")
        assert bridge.get_invocation_count() == 1

    def test_clear_all_removes_everything(self, bridge):
        """clear_all removes all buffered events."""
        for i in range(5):
            bridge.record_tool_invocation(
                ToolInvocationEvent(agent="test", tool="test", invocation_id=f"inv-{i}")
            )

        assert bridge.get_invocation_count() == 5

        bridge.clear_all()
        assert bridge.get_invocation_count() == 0

    def test_handles_none_invocation_id(self, bridge):
        """Bridge handles events with invocation_id=None (uses 'default' key)."""
        event = ToolInvocationEvent(agent="test", tool="test", invocation_id=None)
        bridge.record_tool_invocation(event)

        # Should be stored under 'default' key
        trail = bridge.get_audit_trail("default")
        assert len(trail) == 1


class TestThreadSafety:
    """Test suite for thread safety of AuditEventBridge."""

    @pytest.fixture
    def bridge(self):
        """Create a fresh bridge instance for each test."""
        bridge = AuditEventBridge(max_events_per_invocation=1000)
        yield bridge
        bridge.clear_all()

    def test_concurrent_writes(self, bridge):
        """Bridge handles concurrent event recording without corruption."""
        invocation_id = "concurrent-test"
        num_threads = 10
        events_per_thread = 20

        def record_events(thread_id):
            for i in range(events_per_thread):
                bridge.record_tool_invocation(
                    ToolInvocationEvent(
                        agent=f"agent_{thread_id}",
                        tool=f"tool_{i}",
                        invocation_id=invocation_id
                    )
                )

        threads = [
            threading.Thread(target=record_events, args=(i,))
            for i in range(num_threads)
        ]

        for t in threads:
            t.start()
        for t in threads:
            t.join()

        audit_trail = bridge.get_audit_trail(invocation_id)
        assert len(audit_trail) == num_threads * events_per_thread

    def test_concurrent_reads_and_writes(self, bridge):
        """Bridge handles concurrent reads and writes safely."""
        invocation_id = "read-write-test"
        num_writers = 5
        num_readers = 5
        events_per_writer = 10
        reads_per_reader = 10

        def write_events(thread_id):
            for i in range(events_per_writer):
                bridge.record_tool_response(
                    ToolResponseEvent(
                        agent=f"writer_{thread_id}",
                        tool="test",
                        confidence=0.9,
                        invocation_id=invocation_id
                    )
                )
                time.sleep(0.001)  # Small delay to interleave with reads

        def read_events(thread_id):
            for _ in range(reads_per_reader):
                trail = bridge.get_audit_trail(invocation_id)
                # Trail should always be a valid list
                assert isinstance(trail, list)
                time.sleep(0.001)

        writers = [
            threading.Thread(target=write_events, args=(i,))
            for i in range(num_writers)
        ]
        readers = [
            threading.Thread(target=read_events, args=(i,))
            for i in range(num_readers)
        ]

        all_threads = writers + readers
        for t in all_threads:
            t.start()
        for t in all_threads:
            t.join()

        # All writes should be captured
        final_trail = bridge.get_audit_trail(invocation_id)
        assert len(final_trail) == num_writers * events_per_writer


class TestSingletonPattern:
    """Test suite for get_audit_bridge singleton pattern."""

    def test_returns_same_instance(self):
        """get_audit_bridge returns the same instance on multiple calls."""
        bridge1 = get_audit_bridge()
        bridge2 = get_audit_bridge()

        assert bridge1 is bridge2

    def test_singleton_is_shared_across_threads(self):
        """Singleton instance is shared across threads."""
        bridges = []

        def get_bridge():
            bridges.append(get_audit_bridge())

        threads = [threading.Thread(target=get_bridge) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # All threads should get the same instance
        assert len(set(id(b) for b in bridges)) == 1


class TestEventTypeClassification:
    """Test suite for event type classification and usage patterns."""

    @pytest.fixture
    def bridge(self):
        """Create a fresh bridge instance."""
        bridge = AuditEventBridge()
        yield bridge
        bridge.clear_all()

    def test_tool_lifecycle_event_sequence(self, bridge):
        """Complete tool lifecycle produces correct event sequence."""
        invocation_id = "lifecycle-test"

        # 1. Tool invocation
        bridge.record_tool_invocation(
            ToolInvocationEvent(
                agent="trail_assessor",
                tool="classify_damage",
                parameters={"fire_id": "cedar-creek"},
                invocation_id=invocation_id
            )
        )

        # 2. Tool response
        bridge.record_tool_response(
            ToolResponseEvent(
                agent="trail_assessor",
                tool="classify_damage",
                status="success",
                confidence=0.90,
                data_sources=["Field assessment"],
                reasoning_chain=["Loaded trails", "Classified damage"],
                invocation_id=invocation_id
            )
        )

        audit_trail = bridge.get_audit_trail(invocation_id)

        assert len(audit_trail) == 2
        assert audit_trail[0]["event_type"] == "tool_invocation"
        assert audit_trail[1]["event_type"] == "tool_response"

        # Verify proof layer data in response
        assert audit_trail[1]["confidence"] == 0.90
        assert audit_trail[1]["data_sources"] == ["Field assessment"]
        assert audit_trail[1]["reasoning_chain"] == ["Loaded trails", "Classified damage"]

    def test_tool_error_lifecycle(self, bridge):
        """Tool error lifecycle produces correct event sequence."""
        invocation_id = "error-lifecycle"

        # 1. Tool invocation
        bridge.record_tool_invocation(
            ToolInvocationEvent(
                agent="burn_analyst",
                tool="assess_severity",
                invocation_id=invocation_id
            )
        )

        # 2. Tool error (instead of response)
        bridge.record_tool_error(
            ToolErrorEvent(
                agent="burn_analyst",
                tool="assess_severity",
                error_type="FileNotFoundError",
                error_message="MTBS data missing",
                invocation_id=invocation_id
            )
        )

        audit_trail = bridge.get_audit_trail(invocation_id)

        assert len(audit_trail) == 2
        assert audit_trail[0]["event_type"] == "tool_invocation"
        assert audit_trail[1]["event_type"] == "tool_error"
        assert audit_trail[1]["error_type"] == "FileNotFoundError"

    def test_event_classification_by_type(self, bridge):
        """Events can be filtered by event_type."""
        invocation_id = "classification-test"

        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test", invocation_id=invocation_id)
        )
        bridge.record_tool_response(
            ToolResponseEvent(agent="test", tool="test", invocation_id=invocation_id)
        )
        bridge.record_tool_invocation(
            ToolInvocationEvent(agent="test", tool="test2", invocation_id=invocation_id)
        )

        audit_trail = bridge.get_audit_trail(invocation_id)

        invocations = [e for e in audit_trail if e["event_type"] == "tool_invocation"]
        responses = [e for e in audit_trail if e["event_type"] == "tool_response"]

        assert len(invocations) == 2
        assert len(responses) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
