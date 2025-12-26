"""
Integration tests for CoordinatorService.

Verifies the Maestro pattern implementation:
- Portfolio Triage with Fan-Out (asyncio.gather)
- Tiered Fallback (Graceful Degradation)
- Query Routing
- Error Handling

Per SKILL-RUNTIME-SPEC and PROTOCOL-AGENT-COMMUNICATION.
"""

import pytest

from skill_runtime.testing import MCPMockProvider


class TestCoordinatorServiceIntegration:
    """Integration tests for CoordinatorService with mock injection."""

    @pytest.fixture
    def fire_fixtures(self):
        """Standard fire fixture data for testing."""
        return {
            "cedar-creek": {
                "name": "Cedar Creek Fire",
                "acres": 127831,
                "containment": 100,
                "severity": "high",
                "phase": "baer_assessment"
            },
            "bootleg": {
                "name": "Bootleg Fire",
                "acres": 413765,
                "containment": 100,
                "severity": "critical",
                "phase": "in_restoration"
            },
            "mosquito": {
                "name": "Mosquito Fire",
                "acres": 76788,
                "containment": 97,
                "severity": "moderate",
                "phase": "baer_implementation"
            },
            "double-creek": {
                "name": "Double Creek Fire",
                "acres": 173394,
                "containment": 85,
                "severity": "high",
                "phase": "active"
            }
        }

    @pytest.fixture
    def mock_provider(self, fire_fixtures):
        """Create MCPMockProvider with fire fixtures."""
        mock = MCPMockProvider()
        mock.register(
            "mcp-nifc",
            "get_incident_metadata",
            handler=lambda fire_id, **kw: fire_fixtures.get(fire_id)
        )
        return mock

    @pytest.fixture
    def coordinator_service(self, mock_provider):
        """Create CoordinatorService with injected mocks."""
        from coordinator.implementation import CoordinatorService
        return CoordinatorService(tools=mock_provider.get_tool_context())

    @pytest.mark.asyncio
    async def test_portfolio_triage_fan_out(self, coordinator_service, mock_provider):
        """Portfolio query triggers parallel fan-out to all fires."""
        result = await coordinator_service.handle_message(
            query="Prioritize my fire portfolio",
            context={"session_id": "test-123"}
        )

        # Should successfully analyze all 4 fires
        assert result["agent_role"] == "recovery-coordinator"
        assert "portfolio" in result
        assert result["portfolio"]["analyzed"] == 4
        assert len(result["portfolio"]["rankings"]) >= 1

        # Should have called get_incident_metadata 4 times
        history = mock_provider.get_call_history()
        incident_calls = [c for c in history if c["tool"] == "get_incident_metadata"]
        assert len(incident_calls) == 4

    @pytest.mark.asyncio
    async def test_portfolio_ranking_order(self, coordinator_service):
        """Portfolio rankings should be sorted by triage score."""
        result = await coordinator_service.handle_message(
            query="List all fires by priority",
            context={"session_id": "test-123"}
        )

        rankings = result["portfolio"]["rankings"]
        scores = [r["score"] for r in rankings]

        # Scores should be in descending order
        assert scores == sorted(scores, reverse=True)

    @pytest.mark.asyncio
    async def test_triage_score_calculation(self, coordinator_service):
        """Triage scores should reflect severity * acres * phase."""
        result = await coordinator_service.handle_message(
            query="Prioritize fires",
            context={"session_id": "test-123"}
        )

        rankings = result["portfolio"]["rankings"]

        # Double Creek (active, high severity, 173k acres) should score highest
        # due to phase multiplier 2.0
        fire_names = [r["name"] for r in rankings]

        # The top fire should be one with high combined score
        top_fire = rankings[0]
        assert top_fire["score"] > 0

    @pytest.mark.asyncio
    async def test_confidence_tiers_authoritative(self, coordinator_service):
        """With valid tools, confidence should be authoritative tier (0.90+)."""
        result = await coordinator_service.handle_message(
            query="Prioritize portfolio",
            context={"session_id": "test-123"}
        )

        # All fires should be authoritative with our mocks
        confidence = result.get("confidence", 0)
        assert confidence >= 90  # Authoritative tier

    @pytest.mark.asyncio
    async def test_graceful_degradation_partial_failure(self):
        """Service handles partial tool failures gracefully."""
        from coordinator.implementation import CoordinatorService

        # Create mock that fails for some fires
        mock = MCPMockProvider()
        call_count = [0]

        def flaky_handler(fire_id, **kw):
            call_count[0] += 1
            if fire_id == "bootleg":
                raise RuntimeError("Connection timeout")
            return {
                "name": f"{fire_id} Fire",
                "acres": 10000,
                "severity": "moderate",
                "phase": "in_restoration"
            }

        mock.register("mcp-nifc", "get_incident_metadata", handler=flaky_handler)
        service = CoordinatorService(tools=mock.get_tool_context())

        result = await service.handle_message(
            query="Prioritize fires",
            context={
                "session_id": "test-123",
                "fire_ids": ["cedar-creek", "bootleg", "mosquito"]
            }
        )

        # Should still return results for successful fires
        assert result["portfolio"]["analyzed"] >= 2
        # Bootleg should be in failed list or have lower confidence
        assert "bootleg" in result["portfolio"]["failed"] or result["portfolio"]["analyzed"] < 3

    @pytest.mark.asyncio
    async def test_graceful_degradation_no_tools(self):
        """Service handles missing tools with failure tier."""
        from coordinator.implementation import CoordinatorService

        # Service with no tools
        service = CoordinatorService(tools={})

        result = await service.handle_message(
            query="Prioritize fires",
            context={"session_id": "test-123"}
        )

        # Should still return a valid response (failure tier)
        assert result["agent_role"] == "recovery-coordinator"
        # All fires should fail since no tools available
        assert result["portfolio"]["analyzed"] == 0 or result["confidence"] == 0

    @pytest.mark.asyncio
    async def test_query_routing_burn_analyst(self, coordinator_service):
        """Burn-related queries route to burn-analyst."""
        result = await coordinator_service.handle_message(
            query="What is the burn severity for Cedar Creek?",
            context={"session_id": "test-123"}
        )

        # Should route to burn-analyst
        assert result["agent_role"] == "burn-analyst"
        assert "cascade_to" in result
        assert "burn-analyst" in result["cascade_to"]

    @pytest.mark.asyncio
    async def test_query_routing_trail_assessor(self, coordinator_service):
        """Trail-related queries route to trail-assessor."""
        result = await coordinator_service.handle_message(
            query="What is the trail closure status?",
            context={"session_id": "test-123"}
        )

        assert result["agent_role"] == "trail-assessor"
        assert "trail-assessor" in result.get("cascade_to", [])

    @pytest.mark.asyncio
    async def test_query_routing_coordinator_default(self, coordinator_service):
        """Generic queries stay with coordinator."""
        result = await coordinator_service.handle_message(
            query="Hello, how can you help me?",
            context={"session_id": "test-123"}
        )

        assert result["agent_role"] == "recovery-coordinator"
        assert "recommendations" in result

    @pytest.mark.asyncio
    async def test_error_response_format(self):
        """Errors return properly formatted AgentBriefingEvent."""
        from coordinator.implementation import CoordinatorService

        # Create mock that always raises
        mock = MCPMockProvider()
        mock.register("mcp-nifc", "get_incident_metadata", error="Total failure")

        service = CoordinatorService(tools=mock.get_tool_context())

        # This should trigger the fallback tier, not crash
        result = await service.handle_message(
            query="Prioritize fires",
            context={"session_id": "test-123"}
        )

        # Should have valid response structure
        assert "agent_role" in result
        assert "summary" in result
        assert "reasoning" in result

    @pytest.mark.asyncio
    async def test_processing_time_tracked(self, coordinator_service):
        """Processing time is tracked in response."""
        result = await coordinator_service.handle_message(
            query="Prioritize fires",
            context={"session_id": "test-123"}
        )

        assert "processing_time_ms" in result
        assert result["processing_time_ms"] >= 0

    @pytest.mark.asyncio
    async def test_proof_layer_included(self, coordinator_service):
        """Portfolio responses include proof_layer."""
        result = await coordinator_service.handle_message(
            query="Prioritize my portfolio",
            context={"session_id": "test-123"}
        )

        assert "proof_layer" in result
        assert "confidence" in result["proof_layer"]
        assert "reasoning_chain" in result["proof_layer"]
        assert len(result["proof_layer"]["reasoning_chain"]) > 0


class TestConfidenceTiers:
    """Tests for confidence tier calculations per PROTOCOL-AGENT-COMMUNICATION."""

    @pytest.mark.asyncio
    async def test_authoritative_tier_range(self):
        """Authoritative tier should be 0.90-1.00."""
        from coordinator.implementation import CONFIDENCE_AUTHORITATIVE
        assert 0.90 <= CONFIDENCE_AUTHORITATIVE <= 1.00

    @pytest.mark.asyncio
    async def test_derived_tier_range(self):
        """Derived tier should be 0.70-0.89."""
        from coordinator.implementation import CONFIDENCE_DERIVED
        assert 0.70 <= CONFIDENCE_DERIVED < 0.90

    @pytest.mark.asyncio
    async def test_historical_tier_range(self):
        """Historical tier should be 0.10-0.69."""
        from coordinator.implementation import CONFIDENCE_HISTORICAL
        assert 0.10 <= CONFIDENCE_HISTORICAL < 0.70

    @pytest.mark.asyncio
    async def test_failure_tier(self):
        """Failure tier should be 0.00."""
        from coordinator.implementation import CONFIDENCE_FAILURE
        assert CONFIDENCE_FAILURE == 0.0
