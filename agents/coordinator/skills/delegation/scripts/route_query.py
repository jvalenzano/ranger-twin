"""
Query Routing Script for Delegation Skill

Analyzes user queries and determines which specialist agent
should handle them based on domain keywords and context.
"""

import json
import re
from pathlib import Path
from typing import Literal, TypedDict


# Agent type literals
AgentName = Literal[
    "coordinator",
    "burn-analyst",
    "trail-assessor",
    "cruising-assistant",
    "nepa-advisor"
]


class RoutingResult(TypedDict):
    """Output structure for routing decision."""
    target_agent: AgentName
    confidence: float
    reasoning: str
    matched_keywords: list[str]
    fallback_agents: list[AgentName]
    requires_synthesis: bool
    synthesis_agents: list[AgentName]


# Load routing rules from resources
SCRIPT_DIR = Path(__file__).parent
RESOURCES_DIR = SCRIPT_DIR.parent / "resources"


def load_routing_rules() -> dict:
    """Load routing rules from JSON configuration."""
    rules_path = RESOURCES_DIR / "routing-rules.json"
    if rules_path.exists():
        return json.loads(rules_path.read_text())
    # Fallback to embedded rules if file not found
    return get_default_routing_rules()


def get_default_routing_rules() -> dict:
    """Default routing rules embedded in code."""
    return {
        "burn-analyst": {
            "keywords": [
                "burn", "fire severity", "soil burn", "dnbr", "mtbs",
                "burn severity", "fire damage", "burned area", "combustion",
                "char", "scorch", "fire intensity", "heat damage",
                "severity class", "high severity", "moderate severity",
                "low severity", "unburned", "burn classification"
            ],
            "phrases": [
                "how severe", "burn assessment", "fire impact",
                "severity map", "burned acres"
            ],
            "fallback": ["coordinator"]
        },
        "trail-assessor": {
            "keywords": [
                "trail", "trails", "path", "route", "recreation",
                "hiking", "closure", "closed", "hazard tree", "hazard trees",
                "bridge", "culvert", "erosion", "washout", "access",
                "trailhead", "campground", "infrastructure", "damage assessment"
            ],
            "phrases": [
                "trail condition", "can we hike", "is the trail open",
                "recreation access", "trail damage", "trail closure"
            ],
            "fallback": ["coordinator"]
        },
        "cruising-assistant": {
            "keywords": [
                "timber", "salvage", "lumber",
                "merchantable", "board feet", "mbf", "volume",
                "cruise", "cruising", "inventory", "fsveg",
                "stand", "harvest", "logging", "saw timber"
            ],
            "phrases": [
                "how much timber", "salvage operation", "timber value",
                "wood recovery", "can we harvest", "logging potential"
            ],
            "fallback": ["burn-analyst"]
        },
        "nepa-advisor": {
            "keywords": [
                "nepa", "compliance", "environmental", "eis", "ea",
                "categorical exclusion", "ce", "fonsi", "rod",
                "scoping", "public comment", "environmental impact",
                "documentation", "regulation", "legal", "policy"
            ],
            "phrases": [
                "do we need", "what documentation", "is this exempt",
                "environmental review", "compliance pathway", "legal requirement"
            ],
            "fallback": ["coordinator"]
        },
        "coordinator": {
            "keywords": [
                "portfolio", "prioritize", "priority", "triage",
                "which fire", "compare", "rank", "overview",
                "summary", "briefing", "status", "hello", "hi",
                "help", "what can you", "who are you"
            ],
            "phrases": [
                "all fires", "fire portfolio", "which fires",
                "need attention", "full picture", "comprehensive",
                "multiple", "everything about"
            ],
            "fallback": []
        }
    }


def normalize_query(query: str) -> str:
    """Normalize query for matching."""
    return query.lower().strip()


def find_keyword_matches(query: str, rules: dict) -> dict[str, list[str]]:
    """Find all keyword matches for each agent."""
    normalized = normalize_query(query)
    matches: dict[str, list[str]] = {}

    # Short keywords that need word boundary matching to avoid false positives
    # (e.g., "ce" in "Cedar" should not match NEPA's "ce" categorical exclusion)
    SHORT_KEYWORDS = {"ce", "ea", "hi", "rod"}

    for agent, config in rules.items():
        agent_matches = []

        # Check keywords
        for keyword in config.get("keywords", []):
            keyword_lower = keyword.lower()

            # For short keywords, require word boundaries
            if keyword_lower in SHORT_KEYWORDS:
                # Use regex for word boundary matching
                pattern = r'\b' + re.escape(keyword_lower) + r'\b'
                if re.search(pattern, normalized):
                    agent_matches.append(keyword)
            else:
                # Standard substring matching for longer keywords
                if keyword_lower in normalized:
                    agent_matches.append(keyword)

        # Check phrases (always use substring matching)
        for phrase in config.get("phrases", []):
            if phrase.lower() in normalized:
                agent_matches.append(phrase)

        if agent_matches:
            matches[agent] = agent_matches

    return matches


def calculate_match_score(matches: list[str], query: str) -> float:
    """Calculate confidence score based on match quality."""
    if not matches:
        return 0.0

    # Base score from number of matches
    base_score = min(len(matches) * 0.15, 0.6)

    # Bonus for longer/more specific matches
    specificity_bonus = 0.0
    for match in matches:
        if len(match.split()) > 1:  # Multi-word phrase
            specificity_bonus += 0.1
        if len(match) > 8:  # Longer keyword
            specificity_bonus += 0.05

    specificity_bonus = min(specificity_bonus, 0.3)

    # Combined score
    score = base_score + specificity_bonus + 0.1  # Base confidence
    return min(round(score, 2), 0.98)


def detect_multi_agent_query(matches: dict[str, list[str]]) -> tuple[bool, list[str]]:
    """Detect if query needs multiple specialists.

    Only triggers synthesis when multiple agents have meaningful matches,
    not when one agent has a dominant match count.
    """
    specialist_agents = [a for a in matches.keys() if a != "coordinator"]

    if len(specialist_agents) < 2:
        return False, []

    # Get match counts for each specialist
    match_counts = {agent: len(matches[agent]) for agent in specialist_agents}

    # Find the agent with the most matches
    max_matches = max(match_counts.values())
    max_agent = [a for a, c in match_counts.items() if c == max_matches][0]

    # Calculate total matches from other agents
    other_agents = [a for a in specialist_agents if a != max_agent]
    other_total = sum(match_counts[a] for a in other_agents)

    # If one agent has significantly more matches (>= 3x total of others)
    # AND has at least 3 matches, route to that agent (no synthesis)
    if max_matches >= 3 and max_matches >= 3 * other_total:
        return False, []

    # If 2+ specialists have matches, trigger synthesis
    return True, specialist_agents


def route_query(query: str, context: dict | None = None) -> RoutingResult:
    """
    Route a query to the appropriate agent.

    Args:
        query: User's natural language query
        context: Optional session context

    Returns:
        RoutingResult with target agent and metadata
    """
    if not query or not query.strip():
        return {
            "target_agent": "coordinator",
            "confidence": 1.0,
            "reasoning": "Empty query - defaulting to Coordinator",
            "matched_keywords": [],
            "fallback_agents": [],
            "requires_synthesis": False,
            "synthesis_agents": [],
        }

    rules = load_routing_rules()
    matches = find_keyword_matches(query, rules)

    # Check for multi-agent synthesis need
    needs_synthesis, synthesis_agents = detect_multi_agent_query(matches)

    if needs_synthesis:
        all_keywords = []
        for agent_matches in matches.values():
            all_keywords.extend(agent_matches)

        return {
            "target_agent": "coordinator",
            "confidence": 0.88,
            "reasoning": f"Comprehensive query requiring multiple specialists ({', '.join(synthesis_agents)}) - Coordinator will synthesize",
            "matched_keywords": all_keywords,
            "fallback_agents": [],
            "requires_synthesis": True,
            "synthesis_agents": synthesis_agents,
        }

    # Find best single-agent match
    best_agent: AgentName = "coordinator"
    best_score = 0.0
    best_matches: list[str] = []

    for agent, agent_matches in matches.items():
        score = calculate_match_score(agent_matches, query)
        if score > best_score:
            best_score = score
            best_agent = agent
            best_matches = agent_matches

    # If no strong match, default to coordinator
    if best_score < 0.3:
        best_agent = "coordinator"
        best_score = 0.7
        reasoning = "No strong domain match - Coordinator will handle general query"
    else:
        # Generate reasoning based on matches
        if best_agent == "coordinator":
            if any(kw in best_matches for kw in ["portfolio", "prioritize", "triage", "which fire"]):
                reasoning = "Portfolio-level prioritization question - Coordinator's Portfolio Triage skill"
            elif any(kw in best_matches for kw in ["hello", "hi", "help", "who are you"]):
                reasoning = "Greeting or general inquiry - Coordinator handles directly"
            else:
                reasoning = "General coordination query - Coordinator handles directly"
        elif best_agent == "burn-analyst":
            reasoning = f"Query about fire/burn severity ({', '.join(best_matches[:2])}) - Burn Analyst domain"
        elif best_agent == "trail-assessor":
            reasoning = f"Query about trails/recreation ({', '.join(best_matches[:2])}) - Trail Assessor domain"
        elif best_agent == "cruising-assistant":
            reasoning = f"Query about timber/salvage ({', '.join(best_matches[:2])}) - Cruising Assistant domain"
        elif best_agent == "nepa-advisor":
            reasoning = f"Query about NEPA/compliance ({', '.join(best_matches[:2])}) - NEPA Advisor expertise"
        else:
            reasoning = f"Matched domain keywords: {', '.join(best_matches[:3])}"

    # Get fallback agents
    fallback_agents = rules.get(best_agent, {}).get("fallback", ["coordinator"])
    if best_agent in fallback_agents:
        fallback_agents = [a for a in fallback_agents if a != best_agent]

    return {
        "target_agent": best_agent,
        "confidence": best_score,
        "reasoning": reasoning,
        "matched_keywords": best_matches,
        "fallback_agents": fallback_agents,
        "requires_synthesis": False,
        "synthesis_agents": [],
    }


def execute(inputs: dict) -> dict:
    """
    Execute query routing.

    This is the main entry point called by the skill runtime.

    Args:
        inputs: Dictionary with:
            - query: User's natural language query
            - context: Optional session context

    Returns:
        RoutingResult dictionary
    """
    query = inputs.get("query", "")
    context = inputs.get("context", {})

    return route_query(query, context)


if __name__ == "__main__":
    # Quick test
    test_queries = [
        "What is the soil burn severity in the northwest sector?",
        "Which trails are closed due to hazard trees?",
        "Do we need an EIS or can this qualify for a categorical exclusion?",
        "How much merchantable timber can we salvage?",
        "Which fires in our portfolio need the most attention?",
        "Give me the full recovery picture including burn damage and trail impacts",
        "Hello, what can you help me with?",
    ]

    for query in test_queries:
        result = execute({"query": query})
        print(f"\nQuery: {query}")
        print(f"  → {result['target_agent']} (confidence: {result['confidence']})")
        print(f"    Reasoning: {result['reasoning']}")
