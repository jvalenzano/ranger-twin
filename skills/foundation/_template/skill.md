# Echo Skill

## Description
A minimal demonstration skill that echoes input with metadata.
Used for testing the skill runtime and verifying skill structure.
This template shows the required format for all RANGER skills.

## Triggers
When should the agent invoke this skill?
- Testing skill runtime functionality
- Verifying skill loading and execution
- Template for creating new skills

## Instructions
Step-by-step reasoning for the agent:
1. First, receive the input message
2. Then, add metadata (timestamp, skill version)
3. Finally, return the echoed response with proof layer

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | Message to echo back |
| uppercase | boolean | No | Whether to uppercase the message |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| echo | string | The echoed message |
| metadata | object | Execution metadata |
| reasoning_chain | array | Step-by-step reasoning |

## Reasoning Chain
1. Parse input message and options
2. Apply transformations if requested
3. Generate response with metadata

## Resources
- `config.json` - Skill configuration

## Scripts
- `echo.py` - Main echo logic with execute() entry point

## Examples

### Example 1: Basic Echo
**Input:**
```json
{
  "message": "Hello, RANGER!"
}
```

**Output:**
```json
{
  "echo": "Hello, RANGER!",
  "metadata": {
    "skill": "echo",
    "version": "1.0.0"
  },
  "reasoning_chain": [
    "Received message: Hello, RANGER!",
    "No transformations requested",
    "Returning echoed message"
  ]
}
```

### Example 2: Uppercase Transform
**Input:**
```json
{
  "message": "testing",
  "uppercase": true
}
```

**Output:**
```json
{
  "echo": "TESTING",
  "metadata": {
    "skill": "echo",
    "version": "1.0.0",
    "transformed": true
  },
  "reasoning_chain": [
    "Received message: testing",
    "Uppercase transformation requested",
    "Returning transformed message: TESTING"
  ]
}
```

## References
- RANGER Skill Format Spec: docs/specs/skill-format.md
- Skill Runtime Spec: docs/specs/SKILL-RUNTIME-SPEC.md
