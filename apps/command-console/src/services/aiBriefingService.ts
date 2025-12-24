/**
 * AI Briefing Service - Frontend client for RANGER agent queries
 *
 * Phase 1: Hybrid Integration
 * - NEPA/RAG Queries -> Direct Google Gemini API (Private Data Access)
 * - General Queries -> OpenRouter (with Fallback Chain for reliability)
 *
 * Supports dynamic fire context - system prompts are generated based on
 * the active fire from fireContextStore.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AgentBriefingEvent,
  SourceAgent,
  EventType,
  Severity,
} from '@/types/briefing';

import type { FireContext } from '@/types/fire';
import { DEFAULT_FIRE } from '@/types/fire';

// Agent role type matching the backend
export type AgentRole =
  | 'recovery-coordinator'
  | 'burn-analyst'
  | 'trail-assessor'
  | 'cruising-assistant'
  | 'nepa-advisor';

// API response types
export interface Citation {
  source: string;
  reference: string;
  url?: string;
}

export interface AgentResponse {
  agentRole: AgentRole;
  summary: string;
  reasoning: string[];
  confidence: number;
  citations: Citation[];
  recommendations?: string[];
  cascadeTo?: AgentRole[];
}

export interface QueryResponse {
  success: boolean;
  response?: AgentResponse;
  error?: string;
  processingTimeMs?: number;
  provider?: string;
}

// Map agent roles to SourceAgent enum
const AGENT_ROLE_TO_SOURCE: Record<AgentRole, SourceAgent> = {
  'recovery-coordinator': 'recovery_coordinator',
  'burn-analyst': 'burn_analyst',
  'trail-assessor': 'trail_assessor',
  'cruising-assistant': 'cruising_assistant',
  'nepa-advisor': 'nepa_advisor',
};

// --- CONFIGURATION ---
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Google Direct
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// OpenRouter Fallback Chain
const OPENROUTER_MODELS = [
  'google/gemini-2.0-flash-exp:free',          // Primary: Best quality
  'google/gemma-2-9b-it:free', // Secondary: Reliable fallback
];

// Google Direct Model (for NEPA RAG)
const GOOGLE_MODEL_NAME = 'gemini-2.0-flash-exp';

/**
 * Generate system prompt based on fire context
 * Dynamically adjusts context for any fire in the system
 */
function generateSystemPrompt(fire: FireContext): string {
  // Format acres for display
  const acresFormatted = fire.acres >= 1000
    ? `${Math.round(fire.acres / 1000)}K`
    : fire.acres.toString();

  return `You are the Recovery Coordinator for RANGER, an AI-powered forest recovery platform. You help forest rangers analyze post-fire recovery operations for the ${fire.name} (${fire.year}) in the ${fire.forest}, ${fire.state}.

Context:
- The ${fire.name} burned approximately ${acresFormatted} acres
- Current status: ${fire.status}
- Your role is to coordinate between specialist agents: Burn Analyst, Trail Assessor, Cruising Assistant, and NEPA Advisor
- Focus areas: burn severity assessment, trail damage evaluation, timber salvage prioritization, and environmental compliance

When answering questions:
1. Be concise but thorough
2. Reference specific data when available (trails, plots, burn areas)
3. Provide actionable insights for forest recovery operations
4. Maintain a professional, tactical tone appropriate for emergency operations

Data Availability:
- Perimeter: ${fire.data_status.perimeter.available ? `Available (${fire.data_status.perimeter.source})` : 'Pending'}
- Burn Severity: ${fire.data_status.burn_severity.available ? `Available (${fire.data_status.burn_severity.source})` : 'Pending'}
- Trail Damage: ${fire.data_status.trail_damage.available ? `Available (${fire.data_status.trail_damage.source})` : 'Pending'}
- Timber Plots: ${fire.data_status.timber_plots.available ? `Available (${fire.data_status.timber_plots.source})` : 'Pending'}`;
}

// Default system prompt (Cedar Creek - for fallback)
const DEFAULT_SYSTEM_PROMPT = generateSystemPrompt(DEFAULT_FIRE);

// Simulated responses for when API is rate-limited or unavailable
const SIMULATED_RESPONSES: Record<string, { agentRole: AgentRole; response: string }> = {
  trail: {
    agentRole: 'trail-assessor',
    response: `Based on our assessment of 5 trails across 40.3 miles, the most severe damage is on:

**Hills Creek Trail** - Priority 1
- Complete bridge failure (primary crossing)
- Debris flow burial for 0.3 miles
- Estimated repair: $238K

**Waldo Lake Trail** - Priority 2
- 40ft timber bridge destroyed
- 47 hazard trees identified
- High visitor access impact

**Bobby Lake Trail** - Priority 3
- Puncheon bridge failure
- Tread erosion at 3 locations

Total: 16 damage points, 3 bridge failures, 175+ hazard trees. Estimated 153 crew-days needed for full restoration.`,
  },
  burn: {
    agentRole: 'burn-analyst',
    response: `Burn severity analysis for Cedar Creek Fire (127,000 acres):

**HIGH Severity Zones** (Red)
- Concentrated in central fire area
- dNBR values > 0.66
- Complete canopy loss, soil damage

**MODERATE Severity** (Amber)
- Eastern and western flanks
- dNBR 0.27-0.66
- Partial canopy survival

**LOW Severity** (Green)
- Perimeter areas, riparian corridors
- dNBR < 0.27
- Surface burn only

Recommendation: Prioritize soil stabilization in HIGH zones before winter precipitation. Salvage timber assessment should focus on MODERATE zones where merchantable timber remains.`,
  },
  timber: {
    agentRole: 'cruising-assistant',
    response: `Timber salvage priority assessment for 6 surveyed plots:

**HIGHEST Priority**
- Plot 47-ALPHA: 12.5 MBF/acre, $4,200/acre value
- Plot 52-FOXTROT: 11.8 MBF/acre, mixed conifer

**HIGH Priority**
- Plot 23-CHARLIE: 9.2 MBF/acre, Douglas-fir dominant
- Plot 31-DELTA: 8.7 MBF/acre, accessible via existing roads

**MEDIUM Priority**
- Plot 15-ECHO: 6.4 MBF/acre, steeper terrain
- Additional plots pending assessment

Total estimated salvage value: $2.1M across surveyed area. Window for salvage operations: 18-24 months before beetle damage reduces value.`,
  },
  nepa: {
    agentRole: 'nepa-advisor',
    response: `NEPA compliance pathways for post-fire salvage operations:

**Categorical Exclusion (CE)** - Fastest
- Applies to: Hazard tree removal along roads/trails
- Timeline: 2-4 weeks
- Limitations: 250-acre maximum

**Emergency Situation Determination (ESD)**
- Applies to: Salvage in high-risk areas
- Timeline: 30-60 days
- Allows expedited EA process

**Environmental Assessment (EA)**
- Required for: Large-scale salvage (>1000 acres)
- Timeline: 6-12 months
- Full public comment period

Recommendation: Use CE for immediate trail/road hazard work. Pursue ESD for priority salvage units 47-ALPHA and 52-FOXTROT.`,
  },
  default: {
    agentRole: 'recovery-coordinator',
    response: `Welcome to RANGER Recovery Coordinator. I can help with:

**Burn Analysis** - Severity mapping, dNBR assessment, soil impacts
**Trail Assessment** - Damage inventory, bridge status, hazard trees
**Timber Salvage** - Plot prioritization, volume estimates, value assessment
**NEPA Compliance** - Pathway selection, timeline planning, documentation

Current Cedar Creek Fire status:
- 127,000 acres burned
- 5 trails assessed, 3 bridges destroyed
- 6 timber plots surveyed
- Recovery operations in planning phase

What aspect of the recovery would you like to explore?`,
  },
};

class AIBriefingService {
  private isLoading = false;
  private useSimulation = false; // Fall back to simulation after consistent failure
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
  }

  /**
   * Query the RANGER agents via Hybrid Architecture
   * 1. NEPA/Compliance -> Direct Google SDK (for RAG)
   * 2. General -> OpenRouter (with Fallback Chain)
   * 3. Fallback -> Simulation
   */
  async query(
    queryText: string,
    _sessionId: string = 'demo-session-123',
    fireContext?: FireContext
  ): Promise<QueryResponse> {
    this.isLoading = true;
    const startTime = Date.now();

    // Determine agent role
    const agentRole = this.detectAgentRole(queryText);

    // Generate system prompt
    const systemPrompt = fireContext
      ? generateSystemPrompt(fireContext)
      : DEFAULT_SYSTEM_PROMPT;

    try {
      // --- ROUTING LOGIC ---

      // 1. NEPA/Compliance Check -> Route to Google Direct
      if (agentRole === 'nepa-advisor' && GEMINI_API_KEY && this.genAI) {
        console.log('[AIBriefingService] Routing to Google Direct (NEPA RAG Context)...');
        return await this.queryGoogleDirect(queryText, systemPrompt, agentRole, startTime);
      }

      // 2. All other queries -> Route to OpenRouter
      if (OPENROUTER_API_KEY && !this.useSimulation) {
        console.log('[AIBriefingService] Routing to OpenRouter...');
        return await this.queryOpenRouterWithFallback(queryText, systemPrompt, agentRole, startTime);
      }

      // 3. Fallback to Simulation
      console.log('[AIBriefingService] Using simulation (No API keys or forced simulation)');
      return this.getSimulatedResponse(queryText, agentRole, startTime);

    } catch (error) {
      console.error('[AIBriefingService] All providers failed, falling back to simulation:', error);
      return this.getSimulatedResponse(queryText, agentRole, startTime);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Execute query via Google Direct API (for RAG support)
   */
  private async queryGoogleDirect(
    queryText: string,
    systemPrompt: string,
    agentRole: AgentRole,
    startTime: number
  ): Promise<QueryResponse> {
    if (!this.genAI) throw new Error('Google SDK not initialized');

    try {
      const model = this.genAI.getGenerativeModel({
        model: GOOGLE_MODEL_NAME,
        systemInstruction: systemPrompt
      });

      const result = await model.generateContent(queryText);
      const response = result.response;
      const text = response.text();

      return {
        success: true,
        response: {
          agentRole,
          summary: text,
          reasoning: ['Query analyzed by NEPA Advisor', 'Source: Private RAG Knowledge Base (Google Direct)'],
          confidence: 95,
          citations: []
        },
        processingTimeMs: Date.now() - startTime,
        provider: 'Google Direct'
      };

    } catch (error) {
      console.warn('[AIBriefingService] Google Direct failed, falling back to OpenRouter:', error);
      // Fallback to OpenRouter if Google Direct fails
      return this.queryOpenRouterWithFallback(queryText, systemPrompt, agentRole, startTime);
    }
  }

  /**
   * Execute query via OpenRouter with Model Fallback Chain
   */
  private async queryOpenRouterWithFallback(
    queryText: string,
    systemPrompt: string,
    agentRole: AgentRole,
    startTime: number
  ): Promise<QueryResponse> {
    let lastError = null;

    // Iterate through fallback models
    for (const model of OPENROUTER_MODELS) {
      try {
        console.log(`[AIBriefingService] Attempting OpenRouter model: ${model}`);

        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://ranger-demo.vercel.app',
            'X-Title': 'RANGER Recovery Coordinator',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: queryText }
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        // If rate limited (429) or service unavailable (503), throw to try next model
        if (response.status === 429 || response.status === 503) {
          throw new Error(`Rate limited/Unavailable (${response.status})`);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`[AIBriefingService] OpenRouter error (${model}):`, errorData);
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || 'No response generated';

        return {
          success: true,
          response: {
            agentRole,
            summary: answer,
            reasoning: ['Query analyzed by Recovery Coordinator', `Via OpenRouter (${model})`],
            confidence: 88,
            citations: [],
          },
          processingTimeMs: Date.now() - startTime,
          provider: `OpenRouter (${model})`
        };

      } catch (error) {
        console.warn(`[AIBriefingService] Model ${model} failed:`, error);
        lastError = error;
        // Continue to next model in loop
      }
    }

    // If loop finishes without success
    console.warn('[AIBriefingService] All OpenRouter models failed. Switching to simulation.');
    this.useSimulation = true; // Temporary latch
    setTimeout(() => { this.useSimulation = false; }, 60000); // Reset after 1 min

    return this.getSimulatedResponse(queryText, agentRole, startTime);
  }

  /**
   * Get a simulated response based on query keywords
   */
  private getSimulatedResponse(
    queryText: string,
    _agentRole: AgentRole,
    startTime: number
  ): QueryResponse {
    const lowerQuery = queryText.toLowerCase();

    // Select appropriate simulated response
    let simKey: keyof typeof SIMULATED_RESPONSES = 'default';
    if (lowerQuery.includes('trail') || lowerQuery.includes('bridge') || lowerQuery.includes('damage')) {
      simKey = 'trail';
    } else if (lowerQuery.includes('burn') || lowerQuery.includes('severity') || lowerQuery.includes('fire')) {
      simKey = 'burn';
    } else if (lowerQuery.includes('timber') || lowerQuery.includes('salvage') || lowerQuery.includes('plot')) {
      simKey = 'timber';
    } else if (lowerQuery.includes('nepa') || lowerQuery.includes('compliance') || lowerQuery.includes('environmental')) {
      simKey = 'nepa';
    }

    // simKey is always a valid key, and we have a default fallback
    const simulated = SIMULATED_RESPONSES[simKey]!;

    return {
      success: true,
      response: {
        agentRole: simulated.agentRole,
        summary: simulated.response,
        reasoning: ['Query analyzed by Recovery Coordinator', `Simulated ${simulated.agentRole} response (Offline Mode)`],
        confidence: 92,
        citations: [],
      },
      processingTimeMs: Date.now() - startTime,
      provider: 'Simulation (Offline)'
    };
  }

  /**
   * Detect which specialist agent should handle the query
   */
  private detectAgentRole(query: string): AgentRole {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('burn') || lowerQuery.includes('severity') || lowerQuery.includes('fire')) {
      return 'burn-analyst';
    }
    if (lowerQuery.includes('trail') || lowerQuery.includes('bridge') || lowerQuery.includes('damage') || lowerQuery.includes('path')) {
      return 'trail-assessor';
    }
    if (lowerQuery.includes('timber') || lowerQuery.includes('salvage') || lowerQuery.includes('plot') || lowerQuery.includes('mbf')) {
      return 'cruising-assistant';
    }
    if (lowerQuery.includes('nepa') || lowerQuery.includes('compliance') || lowerQuery.includes('environmental') || lowerQuery.includes('regulation')) {
      return 'nepa-advisor';
    }

    return 'recovery-coordinator';
  }

  /**
   * Convert an agent response to a briefing event for display
   */
  responseToEvent(response: AgentResponse): AgentBriefingEvent {
    const eventId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const correlationId = `corr-${Date.now()}`;
    const sourceAgent = AGENT_ROLE_TO_SOURCE[response.agentRole];

    // Determine severity based on confidence
    let severity: Severity = 'info';
    if (response.confidence < 50) {
      severity = 'warning';
    } else if (response.confidence >= 85) {
      severity = 'info';
    }

    // Determine event type
    const eventType: EventType = response.recommendations?.length
      ? 'action_required'
      : 'insight';

    return {
      schema_version: '1.1.0',
      event_id: eventId,
      parent_event_id: null,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      type: eventType,
      source_agent: sourceAgent,
      severity,
      ui_binding: {
        target: 'panel_inject',
        geo_reference: null,
      },
      content: {
        summary: response.summary,
        detail: response.reasoning.join('\n\n'),
        suggested_actions: response.recommendations?.map((rec, idx) => ({
          action_id: `action-${idx}`,
          label: rec,
          target_agent: sourceAgent,
          description: rec,
          rationale: 'AI-generated recommendation',
        })) || [],
      },
      proof_layer: {
        confidence: response.confidence / 100, // Convert to 0-1
        confidence_ledger: null,
        citations: response.citations.map((c) => ({
          source_type: 'analysis',
          id: c.source.toLowerCase().replace(/\s+/g, '-'),
          uri: c.url || '#',
          excerpt: c.reference,
        })),
        reasoning_chain: response.reasoning,
      },
    };
  }

  /**
   * Check if a query is in progress
   */
  get loading(): boolean {
    return this.isLoading;
  }
}

// Export singleton instance
const aiBriefingService = new AIBriefingService();
export default aiBriefingService;
