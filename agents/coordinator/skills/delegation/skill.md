# Delegation

## Description
Routes user queries to the appropriate specialist agent based on domain expertise.
Analyzes the query content and determines whether it should be handled by the
Coordinator directly or delegated to a specialist: Burn Analyst, Trail Assessor,
Cruising Assistant, or NEPA Advisor. Returns routing recommendation with confidence.

## Triggers
When should the agent invoke this skill?
- User asks a domain-specific question about post-fire recovery
- Query mentions specific technical topics (burn severity, trail damage, timber, NEPA)
- User requests analysis or assessment that requires specialist knowledge
- Multi-part queries that may need multiple specialists
- When the Coordinator needs to decide how to route a request

## Instructions
Step-by-step reasoning for the agent:
1. **Parse Query Intent**: Identify the primary topic and action requested
2. **Match Domain Keywords**: Check for domain-specific terms that indicate specialist routing:
   - Burn/fire terms → Burn Analyst
   - Trail/recreation terms → Trail Assessor
   - Timber/salvage terms → Cruising Assistant
   - NEPA/compliance terms → NEPA Advisor
3. **Check for Self-Routing**: Some queries should stay with Coordinator:
   - Greetings and introductions
   - Portfolio-level questions (use Portfolio Triage skill)
   - General platform questions
   - Multi-specialist synthesis requests
4. **Calculate Confidence**: Based on keyword match strength and query clarity
5. **Return Recommendation**: Include target agent, reasoning, and fallback options

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | The user's natural language query |
| context | object | No | Optional session context (active_fire, previous_agent, etc.) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| target_agent | string | Recommended agent: coordinator, burn-analyst, trail-assessor, cruising-assistant, nepa-advisor |
| confidence | number | Routing confidence (0-1) |
| reasoning | string | Explanation of routing decision |
| matched_keywords | array | Domain keywords found in query |
| fallback_agents | array | Alternative agents if primary is unavailable |
| requires_synthesis | boolean | Whether response needs multi-agent synthesis |

## Resources
- `resources/routing-rules.json` - Domain keywords and agent mappings
- `resources/agent-capabilities.json` - Detailed agent expertise descriptions

## Scripts
- `scripts/route_query.py` - Query analysis and routing logic
  - Function: `execute(inputs: dict) -> dict`
  - Inputs: `{"query": "...", "context": {...}}`
  - Returns: `{"target_agent": "...", "confidence": 0.85, ...}`

## Examples

### Example 1: Burn Severity Query
**Input:**
```json
{
  "query": "What is the soil burn severity in the northwest sector of Cedar Creek?",
  "context": {"active_fire": "cedar-creek-2022"}
}
```

**Output:**
```json
{
  "target_agent": "burn-analyst",
  "confidence": 0.95,
  "reasoning": "Query explicitly mentions 'soil burn severity' - core Burn Analyst domain",
  "matched_keywords": ["soil burn severity", "sector"],
  "fallback_agents": ["coordinator"],
  "requires_synthesis": false
}
```

### Example 2: Trail Closure Query
**Input:**
```json
{
  "query": "Which trails are closed due to hazard trees?",
  "context": {}
}
```

**Output:**
```json
{
  "target_agent": "trail-assessor",
  "confidence": 0.92,
  "reasoning": "Query about trail closures and hazard trees - Trail Assessor specialty",
  "matched_keywords": ["trails", "closed", "hazard trees"],
  "fallback_agents": ["coordinator"],
  "requires_synthesis": false
}
```

### Example 3: NEPA Pathway Query
**Input:**
```json
{
  "query": "Do we need an EIS or can this qualify for a categorical exclusion?",
  "context": {}
}
```

**Output:**
```json
{
  "target_agent": "nepa-advisor",
  "confidence": 0.98,
  "reasoning": "Direct question about NEPA pathway (EIS vs CE) - NEPA Advisor expertise",
  "matched_keywords": ["EIS", "categorical exclusion"],
  "fallback_agents": ["coordinator"],
  "requires_synthesis": false
}
```

### Example 4: Timber Salvage Query
**Input:**
```json
{
  "query": "How much merchantable timber can we salvage from the high severity areas?",
  "context": {}
}
```

**Output:**
```json
{
  "target_agent": "cruising-assistant",
  "confidence": 0.90,
  "reasoning": "Query about timber salvage and merchantable volume - Cruising Assistant domain",
  "matched_keywords": ["merchantable timber", "salvage", "high severity"],
  "fallback_agents": ["burn-analyst"],
  "requires_synthesis": false
}
```

### Example 5: Portfolio Triage (Self-Route)
**Input:**
```json
{
  "query": "Which fires in our portfolio need the most attention?",
  "context": {}
}
```

**Output:**
```json
{
  "target_agent": "coordinator",
  "confidence": 0.95,
  "reasoning": "Portfolio-level prioritization question - Coordinator's Portfolio Triage skill",
  "matched_keywords": ["portfolio", "fires", "attention", "prioritize"],
  "fallback_agents": [],
  "requires_synthesis": false
}
```

### Example 6: Multi-Specialist Query
**Input:**
```json
{
  "query": "What's the full recovery picture for Cedar Creek including burn damage, trail impacts, and salvage potential?",
  "context": {"active_fire": "cedar-creek-2022"}
}
```

**Output:**
```json
{
  "target_agent": "coordinator",
  "confidence": 0.88,
  "reasoning": "Comprehensive query requiring multiple specialists - Coordinator will synthesize",
  "matched_keywords": ["burn damage", "trail impacts", "salvage"],
  "fallback_agents": [],
  "requires_synthesis": true,
  "synthesis_agents": ["burn-analyst", "trail-assessor", "cruising-assistant"]
}
```

## References
- RANGER Agent Roster: `docs/specs/agent-interface.md`
- Specialist Domains: `CLAUDE.md` (Skills-First Agent Architecture section)
