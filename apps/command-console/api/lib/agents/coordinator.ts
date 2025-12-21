/**
 * Recovery Coordinator - Routes queries to specialist agents
 *
 * Uses keyword analysis and Gemini to determine the best agent(s) to handle a query.
 */

import { generateResponse } from '../gemini';
import { buildAgentPrompt, AGENT_PROMPTS } from './prompts';
import type { AgentRole, AgentResponse, QueryRequest, QueryResponse } from './types';

// Keyword patterns for routing
const ROUTING_PATTERNS: Record<AgentRole, RegExp[]> = {
  'burn-analyst': [
    /burn\s*severity/i,
    /dNBR/i,
    /fire\s*intensity/i,
    /satellite\s*imagery/i,
    /impact\s*assessment/i,
    /recovery\s*trajectory/i,
    /canopy\s*loss/i,
    /soil\s*heating/i,
  ],
  'trail-assessor': [
    /trail/i,
    /bridge/i,
    /debris/i,
    /hazard\s*tree/i,
    /infrastructure/i,
    /damage/i,
    /crew\s*deployment/i,
    /recreational/i,
  ],
  'cruising-assistant': [
    /timber/i,
    /salvage/i,
    /mbf/i,
    /board\s*feet/i,
    /harvest/i,
    /stand/i,
    /cruise/i,
    /lumber/i,
    /wood/i,
  ],
  'nepa-advisor': [
    /nepa/i,
    /categorical\s*exclusion/i,
    /environmental/i,
    /compliance/i,
    /cfr/i,
    /regulation/i,
    /section\s*7/i,
    /esa/i,
    /permit/i,
  ],
  'recovery-coordinator': [
    /overview/i,
    /summary/i,
    /overall/i,
    /coordinate/i,
    /status/i,
    /everything/i,
  ],
};

/**
 * Route a query to the appropriate agent(s) based on content analysis
 */
export function routeQuery(query: string, targetAgent?: AgentRole): AgentRole[] {
  // If target agent specified, use it directly
  if (targetAgent) {
    return [targetAgent];
  }

  const lowerQuery = query.toLowerCase();
  const matchedAgents: AgentRole[] = [];
  const scores: Record<AgentRole, number> = {
    'recovery-coordinator': 0,
    'burn-analyst': 0,
    'trail-assessor': 0,
    'cruising-assistant': 0,
    'nepa-advisor': 0,
  };

  // Score each agent based on pattern matches
  for (const [role, patterns] of Object.entries(ROUTING_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerQuery)) {
        scores[role as AgentRole] += 1;
      }
    }
  }

  // Get agents with scores above threshold
  for (const [role, score] of Object.entries(scores)) {
    if (score > 0) {
      matchedAgents.push(role as AgentRole);
    }
  }

  // If no specific agents matched, use coordinator
  if (matchedAgents.length === 0) {
    return ['recovery-coordinator'];
  }

  // Sort by score (highest first) and return top matches
  return matchedAgents.sort((a, b) => scores[b] - scores[a]);
}

/**
 * Parse agent response from Gemini output
 */
function parseAgentResponse(text: string, role: AgentRole): AgentResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      agentRole: role,
      summary: parsed.summary || 'Analysis complete.',
      reasoning: parsed.reasoning || [],
      confidence: parsed.confidence || 75,
      citations: parsed.citations || [],
      recommendations: parsed.recommendations,
      cascadeTo: parsed.cascadeTo,
    };
  } catch (error) {
    // Fallback: Create structured response from plain text
    return {
      agentRole: role,
      summary: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
      reasoning: ['Analysis completed based on available data.'],
      confidence: 70,
      citations: [],
      recommendations: [],
    };
  }
}

/**
 * Execute a query against a specific agent
 */
export async function executeAgentQuery(
  role: AgentRole,
  query: string
): Promise<AgentResponse> {
  const prompt = buildAgentPrompt(role, query);

  const responseText = await generateResponse(prompt);

  return parseAgentResponse(responseText, role);
}

/**
 * Main coordinator function - routes and executes queries
 */
export async function coordinateQuery(request: QueryRequest): Promise<QueryResponse> {
  const startTime = Date.now();

  try {
    // Determine which agents should handle this query
    const targetAgents = routeQuery(request.query, request.targetAgent);

    // For now, use the primary (first) agent
    const primaryAgent = targetAgents[0];

    // Execute the query
    const response = await executeAgentQuery(primaryAgent, request.query);

    // Add any additional agents that should be cascaded to
    if (targetAgents.length > 1 && !response.cascadeTo) {
      response.cascadeTo = targetAgents.slice(1);
    }

    return {
      success: true,
      response,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[Coordinator] Query failed:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Query processing failed',
      processingTimeMs: Date.now() - startTime,
    };
  }
}
