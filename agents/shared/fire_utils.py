"""
RANGER Fire ID Utilities

Shared utilities for normalizing fire identifiers across all agents and skills.
Ensures consistent fire ID handling regardless of input format.
"""

# Fire ID aliases - maps variations to canonical IDs
FIRE_ID_ALIASES = {
    # Cedar Creek Fire variations
    "cedar-creek": "cedar-creek-2022",
    "cedar creek": "cedar-creek-2022",
    "cedar_creek": "cedar-creek-2022",
    "cedarceek": "cedar-creek-2022",  # common typo
    "cc-2022": "cedar-creek-2022",
    "cc2022": "cedar-creek-2022",
    "cedar-creek-2022": "cedar-creek-2022",  # canonical

    # Bootleg Fire variations (for future use)
    "bootleg": "bootleg-2021",
    "bootleg-2021": "bootleg-2021",
}


def normalize_fire_id(fire_id: str) -> str:
    """
    Normalize a fire ID to its canonical form.

    Accepts various formats and returns the standardized fire ID
    that matches fixture data files.

    Args:
        fire_id: Raw fire identifier (e.g., "cedar-creek", "CC-2022")

    Returns:
        Canonical fire ID (e.g., "cedar-creek-2022")

    Examples:
        >>> normalize_fire_id("cedar-creek")
        'cedar-creek-2022'
        >>> normalize_fire_id("Cedar Creek")
        'cedar-creek-2022'
        >>> normalize_fire_id("unknown-fire")
        'unknown-fire'
    """
    if not fire_id:
        return fire_id

    # Lowercase and strip whitespace
    normalized = fire_id.lower().strip()

    # Check aliases
    if normalized in FIRE_ID_ALIASES:
        return FIRE_ID_ALIASES[normalized]

    # Return as-is if not in aliases (may be a valid ID we don't have an alias for)
    return normalized


def is_known_fire(fire_id: str) -> bool:
    """
    Check if a fire ID is known (has fixture data available).

    Args:
        fire_id: Fire identifier to check

    Returns:
        True if fire has fixture data, False otherwise
    """
    canonical = normalize_fire_id(fire_id)
    return canonical in {"cedar-creek-2022", "bootleg-2021"}


def get_available_fires() -> list[str]:
    """
    Get list of fire IDs with available fixture data.

    Returns:
        List of canonical fire IDs
    """
    return ["cedar-creek-2022"]
