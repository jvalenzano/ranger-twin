#!/usr/bin/env python3
"""
RANGER ADK Verification Script

Verifies that the Google ADK is properly installed and agents are configured correctly.
Run this script to validate your Phase 0 setup.

Usage:
    python scripts/verify-adk.py
"""

import sys
import os
from pathlib import Path


def check_python_version() -> bool:
    """Check Python version meets requirements."""
    print(f"Python version: {sys.version}")
    if sys.version_info < (3, 10):
        print("  ERROR: Python 3.10+ required")
        return False
    print("  OK: Python version meets requirements")
    return True


def check_adk_installation() -> bool:
    """Check if google-adk is installed."""
    try:
        import google.adk
        print(f"google-adk: installed")
        print("  OK: google-adk package found")
        return True
    except ImportError:
        print("google-adk: NOT INSTALLED")
        print("  ERROR: Run 'pip install google-adk' to install")
        return False


def check_agent_import() -> bool:
    """Check if Agent class can be imported."""
    try:
        from google.adk.agents import Agent
        print("Agent class: importable")
        print("  OK: google.adk.agents.Agent available")
        return True
    except ImportError as e:
        print(f"Agent class: IMPORT FAILED")
        print(f"  ERROR: {e}")
        return False


def check_vertex_env() -> bool:
    """Check if Vertex AI environment variables are set."""
    project = os.environ.get("GOOGLE_CLOUD_PROJECT")
    location = os.environ.get("GOOGLE_CLOUD_LOCATION")
    use_vertex = os.environ.get("GOOGLE_GENAI_USE_VERTEXAI")

    missing = []
    if not project:
        missing.append("GOOGLE_CLOUD_PROJECT")
    if not location:
        missing.append("GOOGLE_CLOUD_LOCATION")
    
    if missing:
        print(f"Vertex AI Env: MISSING {', '.join(missing)}")
        print("  WARNING: Set these variables for Vertex AI")
        return False

    print(f"Vertex AI Env: configured")
    print(f"  Project: {project}")
    print(f"  Location: {location}")
    if use_vertex:
        print(f"  Use Vertex: {use_vertex}")
    
    return True


def check_agent_structure(agent_name: str) -> bool:
    """Check if an agent has the required structure."""
    agent_path = Path(__file__).parent.parent / "agents" / agent_name

    required_files = [
        "agent.py",
        "config.yaml",
        "__init__.py",
        ".env.example",
    ]

    required_dirs = [
        "skills",
        "tests",
    ]

    all_present = True

    for file in required_files:
        file_path = agent_path / file
        if file_path.exists():
            print(f"  {file}: present")
        else:
            print(f"  {file}: MISSING")
            all_present = False

    for dir_name in required_dirs:
        dir_path = agent_path / dir_name
        if dir_path.exists() and dir_path.is_dir():
            print(f"  {dir_name}/: present")
        else:
            print(f"  {dir_name}/: MISSING")
            all_present = False

    return all_present


def check_coordinator_agent() -> bool:
    """Check if coordinator agent can be loaded."""
    try:
        # Add project root to path
        project_root = Path(__file__).parent.parent
        sys.path.insert(0, str(project_root))

        from agents.coordinator.agent import root_agent
        print(f"Coordinator agent: loaded")
        print(f"  Name: {root_agent.name}")
        print(f"  Model: {root_agent.model}")
        if hasattr(root_agent, 'description') and root_agent.description:
            print(f"  Description: {root_agent.description[:50]}...")
        print("  OK: Coordinator agent configured correctly")
        return True
    except ImportError as e:
        print(f"Coordinator agent: LOAD FAILED")
        print(f"  ERROR: {e}")
        return False
    except Exception as e:
        print(f"Coordinator agent: ERROR")
        print(f"  ERROR: {e}")
        return False


def check_skills_structure() -> bool:
    """Check if skills directory has correct structure."""
    skills_path = Path(__file__).parent.parent / "skills"

    if not skills_path.exists():
        print("skills/: MISSING")
        return False

    foundation_path = skills_path / "foundation"
    if not foundation_path.exists():
        print("skills/foundation/: MISSING")
        return False

    # Check for at least one skill
    skills = [d for d in foundation_path.iterdir() if d.is_dir() and not d.name.startswith("_")]
    if skills:
        print(f"skills/foundation/: {len(skills)} skill(s) found")
        for skill in skills:
            skill_md = skill / "skill.md"
            if skill_md.exists():
                print(f"  - {skill.name}/skill.md: present")
            else:
                print(f"  - {skill.name}/skill.md: MISSING")
        return True
    else:
        print("skills/foundation/: no skills found (only template)")
        return True  # Template is acceptable for Phase 0


def main() -> int:
    """Run all verification checks."""
    print("=" * 60)
    print("RANGER ADK Verification")
    print("=" * 60)
    print()

    results = []

    # Check 1: Python version
    print("1. Python Version")
    print("-" * 40)
    results.append(("Python version", check_python_version()))
    print()

    # Check 2: ADK installation
    print("2. Google ADK Installation")
    print("-" * 40)
    results.append(("ADK installed", check_adk_installation()))
    print()

    # Check 3: Agent class import
    print("3. Agent Class Import")
    print("-" * 40)
    results.append(("Agent import", check_agent_import()))
    print()

    # Check 4: Vertex AI Env
    print("4. Vertex AI Configuration")
    print("-" * 40)
    results.append(("Vertex AI Env", check_vertex_env()))
    print()

    # Check 5: Agent structure
    print("5. Agent Directory Structure")
    print("-" * 40)
    agents = ["coordinator", "burn-analyst", "trail-assessor", "cruising-assistant", "nepa-advisor"]
    for agent in agents:
        print(f"\n{agent}/")
        results.append((f"{agent} structure", check_agent_structure(agent)))
    print()

    # Check 6: Coordinator agent
    print("6. Coordinator Agent Load")
    print("-" * 40)
    results.append(("Coordinator loads", check_coordinator_agent()))
    print()

    # Check 7: Skills structure
    print("7. Skills Library Structure")
    print("-" * 40)
    results.append(("Skills structure", check_skills_structure()))
    print()

    # Summary
    print("=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  [{status}] {name}")

    print()
    print(f"Results: {passed}/{total} checks passed")

    if passed == total:
        print("\nPhase 0 setup complete!")
        print("Next steps:")
        print("  1. Ensure you have run: gcloud auth application-default login")
        print("  2. Run: cd agents && adk run coordinator")
        return 0
    else:
        print("\nSome checks failed. Please address the issues above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
