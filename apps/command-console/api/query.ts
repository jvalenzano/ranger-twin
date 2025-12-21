/**
 * /api/query - Main API endpoint for RANGER agent queries
 *
 * Vercel Edge Function that routes queries to appropriate agents
 * and returns structured responses.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { coordinateQuery } from './lib/agents/coordinator';
import type { QueryRequest, AgentRole } from './lib/agents/types';

// CORS headers for local development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { query, targetAgent } = req.body as {
      query?: string;
      targetAgent?: AgentRole;
    };

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    // Validate target agent if provided
    const validAgents: AgentRole[] = [
      'recovery-coordinator',
      'burn-analyst',
      'trail-assessor',
      'cruising-assistant',
      'nepa-advisor',
    ];

    if (targetAgent && !validAgents.includes(targetAgent)) {
      return res.status(400).json({
        success: false,
        error: `Invalid target agent. Valid options: ${validAgents.join(', ')}`,
      });
    }

    // Execute the query
    const request: QueryRequest = {
      query,
      targetAgent,
    };

    const response = await coordinateQuery(request);

    return res.status(200).json(response);
  } catch (error) {
    console.error('[API] Query error:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
