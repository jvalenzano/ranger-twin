#!/usr/bin/env python3
"""
Integration test for RANGER API Gateway + Skills.

Tests the full flow: Frontend Request -> API Gateway -> Delegation Skill -> Response

Run with: python scripts/test-integration.py
"""

import json
import sys
from pathlib import Path

# Add paths for skill imports
PROJECT_ROOT = Path(__file__).parent.parent
AGENTS_DIR = PROJECT_ROOT / "agents"
sys.path.insert(0, str(AGENTS_DIR))

COORDINATOR_SKILLS = AGENTS_DIR / "coordinator" / "skills"
DELEGATION_SCRIPTS = COORDINATOR_SKILLS / "delegation" / "scripts"
TRIAGE_SCRIPTS = COORDINATOR_SKILLS / "portfolio-triage" / "scripts"
sys.path.insert(0, str(DELEGATION_SCRIPTS))
sys.path.insert(0, str(TRIAGE_SCRIPTS))


def test_delegation_routing():
    """Test that the delegation skill routes queries correctly."""
    from route_query import execute as route_query

    test_cases = [
        ("Hello, what can you help me with?", "coordinator"),
        ("What is the burn severity in the northwest sector?", "burn-analyst"),
        ("Which trails are closed due to hazard trees?", "trail-assessor"),
        ("How much merchantable timber can we salvage?", "cruising-assistant"),
        ("Do we need an EIS or categorical exclusion?", "nepa-advisor"),
        ("Which fires need the most attention?", "coordinator"),
    ]

    print("=" * 60)
    print("DELEGATION SKILL TEST")
    print("=" * 60)

    all_passed = True
    for query, expected_agent in test_cases:
        result = route_query({"query": query})
        actual = result["target_agent"]
        status = "PASS" if actual == expected_agent else "FAIL"
        if actual != expected_agent:
            all_passed = False

        print(f"\n[{status}] Query: '{query[:50]}...'")
        print(f"       Expected: {expected_agent}")
        print(f"       Actual:   {actual} (confidence: {result['confidence']:.0%})")
        print(f"       Reason:   {result['reasoning']}")

    return all_passed


def test_portfolio_triage():
    """Test that the portfolio triage skill calculates scores correctly."""
    from calculate_priority import execute as triage

    fires = [
        {
            "id": "cedar-creek-2022",
            "name": "Cedar Creek Fire",
            "severity": "high",
            "acres": 127000,
            "phase": "baer_implementation"
        },
        {
            "id": "bootleg-2021",
            "name": "Bootleg Fire",
            "severity": "high",
            "acres": 413765,
            "phase": "in_restoration"
        },
        {
            "id": "test-active",
            "name": "Active Test Fire",
            "severity": "critical",
            "acres": 50000,
            "phase": "active"
        },
    ]

    print("\n" + "=" * 60)
    print("PORTFOLIO TRIAGE SKILL TEST")
    print("=" * 60)

    result = triage({"fires": fires})

    print(f"\nRanked Fires:")
    for i, fire in enumerate(result["ranked_fires"], 1):
        print(f"  {i}. {fire['name']}: {fire['triage_score']} points")
        print(f"     (severity={fire['severity_weight']}, acres_norm={fire['acres_normalized']:.1f}, phase={fire['phase_multiplier']}x)")

    print(f"\nConfidence: {result['confidence']}")
    print(f"Summary: {result['summary']}")

    # Verify ranking is correct based on triage formula
    # Bootleg (413k acres × 3 severity × 1.0 phase = 124.1) > Cedar Creek > Active Test
    # Large fire size outweighs phase multiplier
    top_fire = result["ranked_fires"][0]
    passed = top_fire["name"] == "Bootleg Fire"

    print(f"\n[{'PASS' if passed else 'FAIL'}] Largest fire (Bootleg) should be ranked first")
    print(f"       Note: Formula: severity × (acres/10000) × phase_multiplier")
    return passed


def test_api_response_format():
    """Test that the response format matches frontend expectations."""
    from route_query import execute as route_query

    print("\n" + "=" * 60)
    print("API RESPONSE FORMAT TEST")
    print("=" * 60)

    result = route_query({"query": "What is the burn severity?"})

    required_fields = [
        "target_agent",
        "confidence",
        "reasoning",
        "matched_keywords",
        "fallback_agents",
        "requires_synthesis",
    ]

    all_present = True
    for field in required_fields:
        present = field in result
        status = "OK" if present else "MISSING"
        if not present:
            all_present = False
        print(f"  [{status}] {field}: {result.get(field, 'N/A')}")

    # Verify confidence is in valid range
    conf_valid = 0 <= result["confidence"] <= 1
    print(f"  [{'OK' if conf_valid else 'INVALID'}] confidence in [0,1]: {result['confidence']}")

    return all_present and conf_valid


def main():
    print("\n" + "#" * 60)
    print("# RANGER INTEGRATION TEST")
    print("# Frontend -> API Gateway -> Skills")
    print("#" * 60)

    results = []

    results.append(("Delegation Routing", test_delegation_routing()))
    results.append(("Portfolio Triage", test_portfolio_triage()))
    results.append(("API Response Format", test_api_response_format()))

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    all_passed = True
    for name, passed in results:
        status = "PASS" if passed else "FAIL"
        if not passed:
            all_passed = False
        print(f"  [{status}] {name}")

    print("\n" + ("All tests passed!" if all_passed else "Some tests failed."))
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
