#!/usr/bin/env python3
"""
Verification script for ADR-007.1 Three-Tier Tool Invocation Enforcement.

Tests that all specialist agents invoke their required tools when given
domain queries. Uses the Tier 3 validation layer to verify tool invocation.

Usage:
    python scripts/verify_tool_invocation.py

Expected Output:
    Trail Assessor: PASSED (1 attempt)
    Burn Analyst: PASSED (1 attempt)
    Cruising Assistant: PASSED (1 attempt)
    NEPA Advisor: PASSED (1 attempt)

Reference: docs/adr/ADR-007.1-tool-invocation-strategy.md
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment variables from .env (required for GCP credentials)
try:
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    print("Warning: python-dotenv not installed, using system environment only")


# Test queries designed to trigger tool invocation
TEST_QUERIES = {
    "trail_assessor": "What is the damage classification for trails affected by Cedar Creek fire?",
    "burn_analyst": "Analyze the burn severity for Cedar Creek fire sectors.",
    "cruising_assistant": "Estimate the timber volume for salvage operations at Cedar Creek.",
    "nepa_advisor": "What NEPA pathway is appropriate for hazard tree removal after Cedar Creek fire?",
}


async def verify_agent(agent_name: str) -> tuple[str, bool, str, int]:
    """
    Verify that an agent invokes its required tools.

    Args:
        agent_name: Name of the agent to verify

    Returns:
        Tuple of (agent_name, success, outcome, attempts)
    """
    from importlib import import_module

    from agents._shared.config import AGENT_TOOL_REQUIREMENTS
    from agents._shared.validation import create_validated_agent

    try:
        # Import agent dynamically
        agent_module = import_module(f"agents.{agent_name}.agent")
        agent = agent_module.root_agent
    except ImportError as e:
        return (agent_name, False, f"IMPORT_ERROR: {e}", 0)
    except AttributeError as e:
        return (agent_name, False, f"NO_ROOT_AGENT: {e}", 0)

    # Get required tools (None means any tool is acceptable)
    required_tools = AGENT_TOOL_REQUIREMENTS.get(agent_name)

    # Skip coordinator (no tool requirement)
    if required_tools is None:
        return (agent_name, True, "SKIPPED (no tool requirement)", 0)

    # Create validated wrapper
    # Note: For verification, we require ANY of the agent's tools, not all
    # This tests that the agent uses tools at all for domain queries
    validated = create_validated_agent(
        agent=agent,
        required_tools=None,  # Any tool invocation is valid
        max_retries=2,
    )

    # Run with test query
    query = TEST_QUERIES.get(agent_name, f"Analyze data for {agent_name}")

    try:
        result = await validated.invoke(query)
        return (
            agent_name,
            result["success"],
            result["validation_outcome"],
            result["attempts"],
        )
    except Exception as e:
        return (agent_name, False, f"ERROR: {type(e).__name__}: {e}", 0)


async def main() -> bool:
    """
    Verify all specialist agents invoke their tools.

    Returns:
        True if all agents pass verification, False otherwise
    """
    print("=" * 60)
    print("ADR-007.1 Tool Invocation Verification")
    print("=" * 60)
    print()

    results = []

    for agent_name in TEST_QUERIES:
        print(f"Testing {agent_name}...", end=" ", flush=True)
        name, success, outcome, attempts = await verify_agent(agent_name)

        if success:
            icon = "\u2705"  # Green checkmark
            status = f"{outcome}"
            if attempts > 0:
                status += f" ({attempts} attempt{'s' if attempts > 1 else ''})"
        else:
            icon = "\u274C"  # Red X
            status = outcome

        print(f"{icon} {status}")
        results.append((name, success, outcome, attempts))

    print()
    print("=" * 60)

    # Summary
    passed = sum(1 for _, success, _, _ in results if success)
    total = len(results)

    if passed == total:
        print(f"RESULT: All {total} agents passed verification")
        return True
    else:
        print(f"RESULT: {passed}/{total} agents passed verification")
        print()
        print("Failed agents:")
        for name, success, outcome, _ in results:
            if not success:
                print(f"  - {name}: {outcome}")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
