# Phase 2: Real AI Integration Spec

**For:** Anti-Gravity (coding agent)
**From:** Claude (senior AI dev)
**Date:** 2024-12-20
**Prerequisite:** Phase 1 static demo validated

---

## Objective

Replace the static fixture-based demo with real Gemini AI responses. Users type natural language queries, the Recovery Coordinator routes them to the appropriate agent, and Gemini generates contextual responses with reasoning chains.

---

## Architecture Overview

```
User Query
    │
    ▼
Vercel Edge Function (/api/query)
    │
    ├── Parse intent
    ├── Select agent prompt
    ├── Inject fixture data as context
    │
    ▼
Google Generative AI API (gemini-2.0-flash-exp)  # Updated per ADR-003 & ADR-004
    │
    ▼
Structured AgentBriefingEvent
    │
    ▼
Frontend renders via BriefingObserver
```

**Key Insight:** We're not building a full backend. Vercel Edge Functions act as a thin orchestration layer that calls Gemini directly.

---

## Tasks

### Task 1: Set Up Vercel Project Structure

Create the API route structure for Vercel Edge Functions:

```
apps/command-console/
├── api/
│   ├── query.ts          # Main query endpoint
│   └── _lib/
│       ├── agents/
│       │   ├── burn-analyst.ts
│       │   ├── trail-assessor.ts
│       │   ├── cruising-assistant.ts
│       │   └── nepa-advisor.ts
│       ├── coordinator.ts    # Routing logic
│       ├── gemini.ts         # API client
│       └── fixtures.ts       # Load fixture data
└── ...
```

---

### Task 2: Create Gemini Client

**File:** `apps/command-console/api/_lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateContent(
  systemPrompt: string,
  userQuery: string,
  context: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });  // Updated per ADR-003

  const prompt = `${systemPrompt}

## Context Data
${context}

## User Query
${userQuery}

## Instructions
Respond with a valid JSON object matching the AgentBriefingEvent schema.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

### Task 3: Create Agent Prompt Templates

Each agent needs a system prompt that defines its role and output format.

**File:** `apps/command-console/api/_lib/agents/burn-analyst.ts`

```typescript
export const BURN_ANALYST_PROMPT = `
You are the Burn Analyst agent for RANGER, an AI system supporting post-fire forest recovery.

## Your Role
- Analyze burn severity data (dNBR values, MTBS classifications)
- Identify high-priority areas for intervention
- Explain the ecological implications of burn patterns
- Recommend which other agents should be consulted

## Output Format
Return a JSON object with this structure:
{
  "event_id": "evt_burn_<timestamp>",
  "type": "insight",
  "source_agent": "burn_analyst",
  "timestamp": "<ISO 8601>",
  "content": {
    "summary": "<2-3 sentence summary>",
    "detail": "<detailed analysis with reasoning>",
    "suggested_actions": [
      {
        "label": "<action button text>",
        "action_type": "trigger_agent",
        "target_agent": "<agent to trigger>",
        "payload": {}
      }
    ]
  },
  "proof_layer": {
    "confidence_score": <0.0-1.0>,
    "reasoning_chain": ["<step 1>", "<step 2>", "..."],
    "citations": [
      {
        "source": "<data source name>",
        "reference": "<specific reference>",
        "url": "<optional URL>"
      }
    ],
    "data_tier": {
      "tier": <1|2|3>,
      "description": "<tier explanation>"
    }
  },
  "ui_binding": {
    "target": "panel_inject",
    "geo_reference": {
      "type": "polygon",
      "coordinates": [[...]]
    }
  }
}

## Confidence Tiers
- Tier 1 (0.85-1.0): Official USFS data, peer-reviewed sources
- Tier 2 (0.65-0.84): Validated field observations, cross-referenced data
- Tier 3 (0.40-0.64): Preliminary assessments, single-source data

Always explain your reasoning. Never hallucinate data points not in the provided context.
`;

export function getBurnAnalystContext(fixtureData: any): string {
  return JSON.stringify(fixtureData.burnSeverity, null, 2);
}
```

Create similar files for:
- `trail-assessor.ts`
- `cruising-assistant.ts`
- `nepa-advisor.ts`

---

### Task 4: Create Recovery Coordinator Router

**File:** `apps/command-console/api/_lib/coordinator.ts`

```typescript
type AgentType = 'burn_analyst' | 'trail_assessor' | 'cruising_assistant' | 'nepa_advisor';

interface RoutingResult {
  agent: AgentType;
  confidence: number;
}

const ROUTING_PATTERNS: Record<AgentType, RegExp[]> = {
  burn_analyst: [
    /burn/i, /severity/i, /fire/i, /dnbr/i, /mtbs/i, /heat/i, /scorch/i
  ],
  trail_assessor: [
    /trail/i, /path/i, /hik/i, /damage/i, /access/i, /route/i, /washout/i
  ],
  cruising_assistant: [
    /timber/i, /tree/i, /wood/i, /salvage/i, /harvest/i, /lumber/i, /mortality/i
  ],
  nepa_advisor: [
    /nepa/i, /compliance/i, /regulation/i, /permit/i, /environmental/i, /legal/i, /review/i
  ],
};

export function routeQuery(query: string): RoutingResult {
  const scores: Record<AgentType, number> = {
    burn_analyst: 0,
    trail_assessor: 0,
    cruising_assistant: 0,
    nepa_advisor: 0,
  };

  for (const [agent, patterns] of Object.entries(ROUTING_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        scores[agent as AgentType]++;
      }
    }
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topAgent, topScore] = sorted[0];

  // Default to burn_analyst if no clear match
  if (topScore === 0) {
    return { agent: 'burn_analyst', confidence: 0.5 };
  }

  return {
    agent: topAgent as AgentType,
    confidence: Math.min(topScore / 3, 1.0),
  };
}
```

---

### Task 5: Create Main Query Endpoint

**File:** `apps/command-console/api/query.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { routeQuery } from './_lib/coordinator';
import { generateContent } from './_lib/gemini';
import { BURN_ANALYST_PROMPT, getBurnAnalystContext } from './_lib/agents/burn-analyst';
// ... import other agents

// Load fixtures (in production, these would come from a database)
import burnSeverity from '../../public/fixtures/burn-severity.json';
import trailDamage from '../../public/fixtures/trail-damage.json';
import timberPlots from '../../public/fixtures/timber-plots.json';

const AGENT_CONFIG = {
  burn_analyst: {
    prompt: BURN_ANALYST_PROMPT,
    getContext: () => getBurnAnalystContext({ burnSeverity }),
  },
  // ... other agents
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, session_id } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    // Route to appropriate agent
    const { agent, confidence } = routeQuery(query);
    const config = AGENT_CONFIG[agent];

    // Generate response via Gemini
    const response = await generateContent(
      config.prompt,
      query,
      config.getContext()
    );

    // Parse and validate the response
    const event = JSON.parse(response);

    return res.status(200).json({
      event,
      routing: { agent, confidence },
    });
  } catch (error) {
    console.error('Query error:', error);
    return res.status(500).json({ error: 'Failed to process query' });
  }
}
```

---

### Task 6: Update Frontend to Use API

**File:** `apps/command-console/src/services/aiBriefingService.ts` (new file)

```typescript
import type { AgentBriefingEvent } from '@/types/briefing';

const API_URL = '/api/query';

class AIBriefingService {
  private listeners: Set<(event: AgentBriefingEvent) => void> = new Set();
  private sessionId: string;

  constructor() {
    this.sessionId = localStorage.getItem('ranger_session_id') || this.generateSessionId();
    localStorage.setItem('ranger_session_id', this.sessionId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  subscribe(callback: (event: AgentBriefingEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: AgentBriefingEvent): void {
    this.listeners.forEach((callback) => callback(event));
  }

  async query(userQuery: string): Promise<AgentBriefingEvent> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: userQuery,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.status}`);
    }

    const { event } = await response.json();
    this.emit(event);
    return event;
  }
}

export const aiBriefingService = new AIBriefingService();
export default aiBriefingService;
```

---

### Task 7: Add Chat Input Component

**File:** `apps/command-console/src/components/chat/ChatInput.tsx`

```typescript
import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import aiBriefingService from '@/services/aiBriefingService';

const ChatInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await aiBriefingService.query(query);
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about Cedar Creek recovery..."
        className="flex-1 bg-slate-900/50 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan/50"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-3 py-2 bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan rounded hover:bg-accent-cyan/30 disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </form>
  );
};

export default ChatInput;
```

---

## Environment Setup

Create `.env.local` in `apps/command-console/`:

```
GEMINI_API_KEY=your_api_key_here  # For Google Generative AI API
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

---

## Testing Checklist

- [ ] Vercel dev server starts: `vercel dev`
- [ ] POST to /api/query returns valid AgentBriefingEvent
- [ ] Routing correctly identifies agent based on query keywords
- [ ] Gemini generates contextual responses with reasoning chains
- [ ] Frontend displays AI-generated events in InsightPanel
- [ ] Response latency < 5 seconds
- [ ] Error states handled gracefully

---

## Success Criteria

1. User types "What's the burn severity near Waldo Lake?"
2. Coordinator routes to Burn Analyst
3. Gemini generates response with:
   - Summary of dNBR values from fixture data
   - Reasoning chain explaining the analysis
   - Citations to MTBS/Sentinel-2 sources
   - Suggested action to trigger Trail Assessor
4. Event renders in InsightPanel with full proof layer
5. Clicking suggested action triggers next agent query

---

## Notes

- **Start simple:** Get one agent working end-to-end before building all four
- **Fixture injection:** The magic is that Gemini reasons over real fixture data
- **Prompt engineering:** Iterate on prompts to get well-structured JSON output
- **Fallback:** Keep mockBriefingService as fallback if API fails
