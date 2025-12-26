"""
Echo Skill Script

Minimal skill implementation demonstrating the execute() pattern.
Used for testing skill runtime and as a template for new skills.
"""

from typing import Any


SKILL_VERSION = "1.0.0"


def execute(inputs: dict[str, Any]) -> dict[str, Any]:
    """
    Execute the echo skill.

    This is the standard entry point for RANGER skills.
    All skills must implement execute(inputs: dict) -> dict.

    Args:
        inputs: Dictionary containing:
            - message (str): Required message to echo
            - uppercase (bool): Optional flag to uppercase

    Returns:
        Dictionary containing:
            - echo: The echoed/transformed message
            - metadata: Skill execution metadata
            - reasoning_chain: Step-by-step reasoning
    """
    message = inputs.get("message", "")
    uppercase = inputs.get("uppercase", False)

    reasoning_chain = []

    # Step 1: Parse input
    reasoning_chain.append(f"Received message: {message}")

    # Step 2: Apply transformations
    result = message
    metadata = {
        "skill": "echo",
        "version": SKILL_VERSION,
    }

    if uppercase:
        result = message.upper()
        metadata["transformed"] = True
        reasoning_chain.append("Uppercase transformation requested")
        reasoning_chain.append(f"Returning transformed message: {result}")
    else:
        reasoning_chain.append("No transformations requested")
        reasoning_chain.append("Returning echoed message")

    return {
        "echo": result,
        "metadata": metadata,
        "reasoning_chain": reasoning_chain,
    }


if __name__ == "__main__":
    # Quick test
    import json
    test_input = {"message": "Hello, RANGER!", "uppercase": True}
    result = execute(test_input)
    print(json.dumps(result, indent=2))
