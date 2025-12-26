"""
Coordinator Service Implementation

Implements the 'Maestro' pattern for RANGER recovery coordination:
- Graceful Degradation (Tiered Fallback)
- Multi-Incident Triage (Fan-Out)
- Delegation Routing

Aligned with:
- ADR-005: Skills-First Architecture
- PROTOCOL-AGENT-COMMUNICATION.md: Confidence Tiers
- SKILL-RUNTIME-SPEC.md: Explicit Tool Injection
"""

import asyncio
import logging
import time
from typing import Any, Callable, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Confidence Tiers per PROTOCOL-AGENT-COMMUNICATION.md
CONFIDENCE_AUTHORITATIVE = 0.95  # Tier 1: Direct, verified data
CONFIDENCE_DERIVED = 0.75       # Tier 2: Proxy or aggregated data
CONFIDENCE_HISTORICAL = 0.40    # Tier 3: Cached or stale data (>24h)
CONFIDENCE_FAILURE = 0.0        # Tier 4: Unable to answer


class CoordinatorService:
    """
    Core logic for the Recovery Coordinator.

    Implements the 'Maestro' pattern:
    - Degraded Mode handling (Tiered Fallback)
    - Multi-Incident Triage (Fan-Out)
    - Delegation Routing

    Args:
        tools: Optional dict of tool callables for explicit injection.
               Keys are tool names, values are async callables.
    """

    def __init__(self, tools: Optional[dict[str, Callable]] = None):
        """
        Initialize CoordinatorService.

        Args:
            tools: Dict of tool callables (from MCPMockProvider.get_tool_context())
        """
        self.tools = tools or {}
        self._cache: dict[str, tuple[Any, float]] = {}  # fire_id -> (data, timestamp)
        self._cache_ttl = 86400  # 24 hours in seconds

        logger.info(
            "CoordinatorService initialized",
            extra={"tools_available": list(self.tools.keys())}
        )

    async def handle_message(
        self,
        query: str,
        context: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Main entry point for processing a user message.

        Args:
            query: User's natural language query
            context: Session context (session_id, fire_context, etc.)

        Returns:
            AgentBriefingEvent-compatible response dict
        """
        start_time = time.time()

        logger.info(
            "Processing query",
            extra={"query": query[:100], "session_id": context.get("session_id")}
        )

        try:
            # 1. Parse Intent (using Delegation Skill)
            routing = await self._route_query(query, context)
            target = routing.get("target_agent", "coordinator")

            logger.debug(
                "Query routed",
                extra={"target": target, "confidence": routing.get("confidence")}
            )

            if target == "coordinator":
                # Check for portfolio/triage intent
                if self._is_portfolio_query(routing, query):
                    response = await self.handle_portfolio_query(query, context)
                else:
                    # Default coordinator response
                    response = self._build_coordinator_response(query, routing)
            else:
                # Delegation to specialist (Phase 1: placeholder)
                response = self._build_delegation_response(target, routing)

            # Add processing metadata
            processing_time_ms = int((time.time() - start_time) * 1000)
            response["processing_time_ms"] = processing_time_ms

            logger.info(
                "Query completed",
                extra={
                    "target": target,
                    "confidence": response.get("confidence"),
                    "processing_time_ms": processing_time_ms
                }
            )

            return response

        except Exception as e:
            logger.exception("Error processing query")
            return self._build_error_response(str(e))

    async def handle_portfolio_query(
        self,
        query: str,
        context: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Execute Multi-Incident Triage with Fan-Out.

        Implements parallel assessment of multiple fires with
        graceful degradation for individual failures.

        Args:
            query: User's query
            context: Session context

        Returns:
            Aggregated portfolio response with triage rankings
        """
        logger.info("Executing portfolio triage with fan-out")

        # 1. Get fire list (from context or default fixtures)
        fire_ids = context.get("fire_ids", [
            "cedar-creek",
            "bootleg",
            "mosquito",
            "double-creek"
        ])

        # 2. Fan-Out: Assess each fire in parallel
        tasks = [self._assess_fire_priority(fid) for fid in fire_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 3. Process results with graceful degradation
        valid_results = []
        failed_fires = []
        degradation_notices = []

        for fire_id, result in zip(fire_ids, results):
            if isinstance(result, Exception):
                logger.warning(f"Fire assessment failed: {fire_id}", exc_info=result)
                failed_fires.append(fire_id)
            elif result.get("tier") == "failure":
                failed_fires.append(fire_id)
            else:
                valid_results.append(result)
                if result.get("tier") != "authoritative":
                    degradation_notices.append(
                        f"{result['name']}: {result.get('degradation_notice', 'Using fallback data')}"
                    )

        # 4. Sort by priority score
        valid_results.sort(key=lambda x: x.get("score", 0), reverse=True)

        # 5. Calculate aggregate confidence
        if valid_results:
            avg_confidence = sum(r.get("confidence", 0) for r in valid_results) / len(valid_results)
        else:
            avg_confidence = CONFIDENCE_FAILURE

        # 6. Build response
        top_fire = valid_results[0] if valid_results else None

        summary = self._build_portfolio_summary(
            total=len(fire_ids),
            analyzed=len(valid_results),
            failed=len(failed_fires),
            top_fire=top_fire
        )

        reasoning_chain = [
            f"Initiated fan-out to {len(fire_ids)} fires",
            f"Successfully analyzed {len(valid_results)} fires",
            f"Failed to analyze {len(failed_fires)} fires" if failed_fires else None,
            "Ranked by Severity * Acres * Phase multiplier",
            f"Top priority: {top_fire['name']} (score: {top_fire['score']:.1f})" if top_fire else None
        ]
        reasoning_chain = [r for r in reasoning_chain if r]  # Remove None entries

        response = {
            "agent_role": "recovery-coordinator",
            "summary": summary,
            "reasoning": reasoning_chain,
            "confidence": int(avg_confidence * 100),
            "proof_layer": {
                "confidence": avg_confidence,
                "reasoning_chain": reasoning_chain,
            },
            "portfolio": {
                "rankings": [
                    {"fire_id": r["id"], "name": r["name"], "score": r["score"]}
                    for r in valid_results[:5]  # Top 5
                ],
                "total_fires": len(fire_ids),
                "analyzed": len(valid_results),
                "failed": failed_fires
            }
        }

        # Add degradation notice if applicable
        if degradation_notices:
            response["content"] = {
                "summary": summary,
                "degradation_notice": "; ".join(degradation_notices)
            }

        return response

    async def _assess_fire_priority(self, fire_id: str) -> dict[str, Any]:
        """
        Assess a single fire's priority using Tiered Fallback.

        Implements Graceful Degradation:
        - Tier 1 (Authoritative): Direct MCP tool call
        - Tier 2 (Derived): Aggregated/proxy data
        - Tier 3 (Historical): Cached data (>24h)
        - Tier 4 (Failure): Unable to assess

        Args:
            fire_id: Fire incident identifier

        Returns:
            Fire assessment dict with tier, confidence, and score
        """
        logger.debug(f"Assessing fire priority: {fire_id}")

        # Tier 1: Try Authoritative Tool
        if "get_incident_metadata" in self.tools:
            try:
                metadata = await self.tools["get_incident_metadata"](fire_id=fire_id)

                if metadata:
                    score = self._calculate_triage_score(metadata)
                    return {
                        "id": fire_id,
                        "name": metadata.get("name", fire_id.replace("-", " ").title() + " Fire"),
                        "score": score,
                        "tier": "authoritative",
                        "confidence": CONFIDENCE_AUTHORITATIVE,
                        "acres": metadata.get("acres", 0),
                        "containment": metadata.get("containment", 0),
                        "phase": metadata.get("phase", "unknown")
                    }
            except Exception as e:
                logger.warning(f"Tier 1 failed for {fire_id}: {e}")

        # Tier 2: Try Derived/Fixture Data
        if "get_fire_summary" in self.tools:
            try:
                summary = await self.tools["get_fire_summary"](fire_id=fire_id)

                if summary:
                    score = self._calculate_triage_score(summary)
                    return {
                        "id": fire_id,
                        "name": summary.get("name", fire_id.replace("-", " ").title() + " Fire"),
                        "score": score,
                        "tier": "derived",
                        "confidence": CONFIDENCE_DERIVED,
                        "degradation_notice": "Using derived data from fixture summaries",
                        "acres": summary.get("acres", 0),
                        "phase": summary.get("phase", "unknown")
                    }
            except Exception as e:
                logger.warning(f"Tier 2 failed for {fire_id}: {e}")

        # Tier 3: Try Cache
        cached = self._get_cached(fire_id)
        if cached:
            score = self._calculate_triage_score(cached)
            cache_age_hours = (time.time() - cached.get("cached_at", 0)) / 3600
            return {
                "id": fire_id,
                "name": cached.get("name", fire_id.replace("-", " ").title() + " Fire"),
                "score": score,
                "tier": "historical",
                "confidence": CONFIDENCE_HISTORICAL,
                "degradation_notice": f"Using cached data ({cache_age_hours:.1f}h old)",
                "acres": cached.get("acres", 0)
            }

        # Tier 4: Failure - Return minimal stub for graceful degradation
        logger.warning(f"All tiers failed for {fire_id}, using failure mode")
        return {
            "id": fire_id,
            "name": fire_id.replace("-", " ").title() + " Fire",
            "score": 0,
            "tier": "failure",
            "confidence": CONFIDENCE_FAILURE,
            "degradation_notice": "Unable to fetch fire data from any source"
        }

    def _calculate_triage_score(self, data: dict) -> float:
        """
        Calculate triage priority score.

        Formula: severity_weight * normalized_acres * phase_multiplier

        Args:
            data: Fire data with acres, severity, phase

        Returns:
            Triage score (0-100)
        """
        # Severity weights
        severity_weights = {
            "critical": 4.0,
            "high": 3.0,
            "moderate": 2.0,
            "low": 1.0
        }

        # Phase multipliers per domain model
        phase_multipliers = {
            "active": 2.0,
            "baer_assessment": 1.75,
            "baer_implementation": 1.25,
            "in_restoration": 1.0
        }

        severity = data.get("severity", "moderate")
        phase = data.get("phase", "in_restoration")
        acres = data.get("acres", 0)

        severity_weight = severity_weights.get(severity, 2.0)
        phase_mult = phase_multipliers.get(phase, 1.0)
        normalized_acres = min(acres, 500000) / 500000 * 100  # Cap at 500k, scale to 100

        score = severity_weight * normalized_acres * phase_mult
        return min(score, 100)  # Cap at 100

    def _get_cached(self, fire_id: str) -> Optional[dict]:
        """Get cached fire data if still valid."""
        if fire_id in self._cache:
            data, timestamp = self._cache[fire_id]
            if time.time() - timestamp < self._cache_ttl:
                return data
            else:
                del self._cache[fire_id]
        return None

    def _cache_fire_data(self, fire_id: str, data: dict) -> None:
        """Cache fire data with timestamp."""
        self._cache[fire_id] = (data, time.time())

    async def _route_query(
        self,
        query: str,
        context: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Invoke the delegation skill to route query.

        Args:
            query: User's query
            context: Session context

        Returns:
            Routing decision with target_agent and confidence
        """
        # Try to import delegation skill
        try:
            import sys
            from pathlib import Path

            delegation_path = Path(__file__).parent / "skills" / "delegation" / "scripts"
            if str(delegation_path) not in sys.path:
                sys.path.insert(0, str(delegation_path))

            from route_query import execute
            return execute({"query": query, "context": context})

        except ImportError as e:
            logger.debug(f"Delegation skill not available: {e}")
            # Fallback: simple keyword routing
            return self._simple_route(query)

    def _simple_route(self, query: str) -> dict[str, Any]:
        """Simple keyword-based routing fallback."""
        query_lower = query.lower()

        routing_keywords = {
            "burn-analyst": ["burn", "severity", "dnbr", "mtbs", "soil", "fire damage"],
            "trail-assessor": ["trail", "path", "bridge", "closure", "recreation"],
            "cruising-assistant": ["timber", "cruise", "salvage", "volume", "board feet"],
            "nepa-advisor": ["nepa", "environmental", "compliance", "ea", "eis", "ce"]
        }

        for agent, keywords in routing_keywords.items():
            if any(kw in query_lower for kw in keywords):
                return {
                    "target_agent": agent,
                    "confidence": 0.7,
                    "matched_keywords": [kw for kw in keywords if kw in query_lower],
                    "reasoning": f"Matched keywords for {agent}"
                }

        return {
            "target_agent": "coordinator",
            "confidence": 0.6,
            "matched_keywords": [],
            "reasoning": "No specialist keywords matched"
        }

    def _is_portfolio_query(self, routing: dict, query: str) -> bool:
        """Detect if query is about portfolio/triage."""
        keywords = routing.get("matched_keywords", [])
        trigger_words = {"portfolio", "prioritize", "priority", "triage", "fires", "list", "all fires"}
        return (
            any(w in trigger_words for w in keywords) or
            any(w in query.lower() for w in trigger_words)
        )

    def _build_coordinator_response(
        self,
        query: str,
        routing: dict
    ) -> dict[str, Any]:
        """Build response for coordinator-handled queries."""
        return {
            "agent_role": "recovery-coordinator",
            "summary": "I can help you prioritize fires or delegate to specialists.",
            "reasoning": [
                "Query handled by Coordinator",
                f"Routing confidence: {routing.get('confidence', 0):.0%}"
            ],
            "confidence": int(routing.get("confidence", 0.5) * 100),
            "recommendations": [
                "Ask about specific fires in your portfolio",
                "Request a triage prioritization",
                "Ask about burn severity, trails, timber, or NEPA"
            ]
        }

    def _build_delegation_response(
        self,
        target: str,
        routing: dict
    ) -> dict[str, Any]:
        """Build response for delegated queries (Phase 1 placeholder)."""
        return {
            "agent_role": target,
            "summary": f"Delegating to {target.replace('-', ' ').title()}...",
            "reasoning": [
                f"Routed to {target}",
                f"Confidence: {routing.get('confidence', 0):.0%}",
                f"Matched: {', '.join(routing.get('matched_keywords', []))}"
            ],
            "confidence": int(routing.get("confidence", 0.8) * 100),
            "cascade_to": [target]
        }

    def _build_portfolio_summary(
        self,
        total: int,
        analyzed: int,
        failed: int,
        top_fire: Optional[dict]
    ) -> str:
        """Build human-readable portfolio summary."""
        if not top_fire:
            return f"Unable to analyze any of the {total} fires in your portfolio."

        summary = f"Analyzed {analyzed} of {total} fires."
        if failed > 0:
            summary += f" ({failed} unavailable)"
        summary += f" **{top_fire['name']}** is top priority"
        summary += f" with score {top_fire['score']:.1f}."

        return summary

    def _build_error_response(self, error_message: str) -> dict[str, Any]:
        """Build error response matching AgentBriefingEvent."""
        return {
            "agent_role": "recovery-coordinator",
            "summary": "An error occurred while processing your request.",
            "reasoning": [
                "Error encountered during processing",
                f"Details: {error_message}"
            ],
            "confidence": 0,
            "error": error_message,
            "content": {
                "summary": "Processing error",
                "degradation_notice": error_message
            }
        }
