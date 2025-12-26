# Greeting Skill

## Description
A demonstration skill that shows proper skill structure. This skill helps agents
greet users appropriately and provide an introduction to the RANGER platform.
This is a Foundation Skill - usable across all RANGER agents.

## Triggers
When should the agent invoke this skill?
- User initiates conversation with a greeting (hello, hi, hey, good morning, etc.)
- User asks "who are you" or similar identity questions
- User asks "what can you do" or "how can you help"
- Beginning of a new session with no prior context

## Instructions
Step-by-step reasoning for the agent:
1. First, identify the type of greeting or inquiry:
   - Simple greeting → Respond with platform introduction
   - Identity question → Explain agent role and capabilities
   - Capability question → List available services
2. Then, determine appropriate formality based on context:
   - First interaction → More formal, comprehensive introduction
   - Returning user → Briefer, focus on how to help
3. Finally, provide response with:
   - Professional RANGER branding
   - Clear statement of capabilities
   - Invitation to ask questions

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| user_message | string | Yes | The user's greeting or query |
| agent_name | string | No | The specific agent responding (defaults to "Recovery Coordinator") |
| session_is_new | boolean | No | Whether this is a new session (defaults to true) |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| greeting | string | The formatted greeting response |
| agent_role | string | Brief description of agent's role |
| suggested_topics | array | List of topics user might want to explore |

## Resources
None required for this skill.

## Scripts
None required for this skill.

## Examples

### Example 1: Simple Greeting
**Input:**
```json
{
  "user_message": "Hello",
  "agent_name": "Recovery Coordinator",
  "session_is_new": true
}
```

**Output:**
```json
{
  "greeting": "Welcome to RANGER - the Recovery and Assessment Nerve-center for Geographic Emergency Response. I'm the Recovery Coordinator, here to help you navigate post-fire forest recovery operations. How can I assist you today?",
  "agent_role": "Root orchestrator coordinating burn analysis, trail assessment, timber inventory, and NEPA compliance",
  "suggested_topics": [
    "Fire severity assessment",
    "Trail closures and conditions",
    "Salvage timber estimates",
    "NEPA pathway guidance"
  ]
}
```

### Example 2: Capability Question
**Input:**
```json
{
  "user_message": "What can you help me with?",
  "agent_name": "Recovery Coordinator",
  "session_is_new": false
}
```

**Output:**
```json
{
  "greeting": "I can assist you with the full spectrum of post-fire recovery planning:",
  "agent_role": "Recovery Coordinator",
  "suggested_topics": [
    "Burn severity mapping and MTBS classification",
    "Trail damage assessment and closure recommendations",
    "Timber salvage volume estimation",
    "NEPA compliance pathway determination"
  ]
}
```

### Example 3: Specialist Agent Greeting
**Input:**
```json
{
  "user_message": "Hi there",
  "agent_name": "Burn Analyst",
  "session_is_new": true
}
```

**Output:**
```json
{
  "greeting": "Hello! I'm the RANGER Burn Analyst, specializing in fire severity assessment and burn impact analysis. I can help you understand burn severity classifications, interpret dNBR data, and assess soil burn conditions. What fire or burned area would you like to analyze?",
  "agent_role": "Fire severity and burn analysis specialist",
  "suggested_topics": [
    "MTBS severity classification",
    "Soil burn severity indicators",
    "dNBR interpretation",
    "Burn perimeter analysis"
  ]
}
```

## References
- RANGER Platform Overview (internal)
- USFS Communication Guidelines
