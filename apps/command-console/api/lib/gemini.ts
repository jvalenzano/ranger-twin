/**
 * Gemini Client Utility
 *
 * Provides a configured Gemini client for agent interactions.
 * Uses Gemini 3 Flash for fast responses suitable for demo.
 * Updated per ADR-003 (2025-12-22)
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Default generation config optimized for RANGER responses
const DEFAULT_CONFIG: GenerationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
};

/**
 * Get a configured Gemini model instance
 */
export function getGeminiModel(config?: Partial<GenerationConfig>): GenerativeModel {
  return genAI.getGenerativeModel({
    model: 'gemini-3-flash',
    generationConfig: {
      ...DEFAULT_CONFIG,
      ...config,
    },
  });
}

/**
 * Generate a response from Gemini
 */
export async function generateResponse(
  prompt: string,
  systemInstruction?: string,
  config?: Partial<GenerationConfig>
): Promise<string> {
  const model = getGeminiModel(config);

  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

export type { GenerativeModel, GenerationConfig };
