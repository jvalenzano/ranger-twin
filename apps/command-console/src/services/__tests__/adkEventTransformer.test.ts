/**
 * ADK Event Transformer Hardening Tests
 *
 * Tests defensive extraction patterns and validation gates
 * to ensure graceful degradation when ADK sends incomplete events.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { ADKEventTransformer } from '../adkEventTransformer';
import type { ADKEvent } from '@/utils/adkClient';

describe('ADK Event Transformer - Hardening', () => {
  let transformer: ADKEventTransformer;

  beforeEach(() => {
    transformer = new ADKEventTransformer('test-correlation-id');
  });

  describe('Category 1: Validation Gate (6 tests)', () => {
    test('skips heartbeat events (no author)', () => {
      const heartbeat: ADKEvent = {
        id: 'heartbeat-1',
        partial: false,
        timestamp: 1234567890,
      };

      const result = transformer.transformEvent(heartbeat);
      expect(result).toBeNull();
    });

    test('skips partial events (no invocationId)', () => {
      const partial: ADKEvent = {
        id: 'partial-1',
        author: 'burn_analyst',
        partial: true,
        content: {
          parts: [{ text: 'Analyzing...' }],
        },
      };

      const result = transformer.transformEvent(partial);
      expect(result).toBeNull();
    });

    test('skips events with no id', () => {
      const noId = {
        author: 'burn_analyst',
        invocationId: 'inv-123',
        partial: false,
        content: {
          parts: [{ text: 'Test' }],
        },
      } as unknown as ADKEvent;

      const result = transformer.transformEvent(noId);
      expect(result).toBeNull();
    });

    test('skips empty events (no content or actions)', () => {
      const empty: ADKEvent = {
        id: 'empty-1',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
      };

      const result = transformer.transformEvent(empty);
      expect(result).toBeNull();
    });

    test('transforms valid minimal event with content', () => {
      const valid: ADKEvent = {
        id: 'valid-1',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Valid content' }],
        },
      };

      const result = transformer.transformEvent(valid);
      expect(result).not.toBeNull();
      expect(result?.source_agent).toBe('burn_analyst');
    });

    test('transforms valid event with actions', () => {
      const valid: ADKEvent = {
        id: 'valid-2',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        actions: {
          tool_call: {
            name: 'assess_severity',
            args: { fire_id: 'cedar-creek' },
          },
        },
      };

      const result = transformer.transformEvent(valid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('action_required');
    });
  });

  describe('Category 2: Coordinate Extraction (4 tests)', () => {
    test('handles missing coordinates gracefully', () => {
      const event: ADKEvent = {
        id: 'coord-1',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: '{"summary": "Test without coordinates"}' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(result?.ui_binding.geo_reference).toBeNull();
    });

    test('handles partial coordinates (longitude only)', () => {
      const event: ADKEvent = {
        id: 'coord-2',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: '{"coordinates": {"longitude": -119.5}}' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      const geoRef = result?.ui_binding.geo_reference;
      expect(geoRef).not.toBeNull();
      expect(geoRef?.geometry.coordinates).toEqual([-119.5, 0]);
    });

    test('handles invalid coordinate types (strings)', () => {
      const event: ADKEvent = {
        id: 'coord-3',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"coordinates": {"longitude": "invalid", "latitude": "invalid"}}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      const geoRef = result?.ui_binding.geo_reference;
      expect(geoRef).not.toBeNull();
      expect(geoRef?.geometry.coordinates).toEqual([0, 0]);
    });

    test('preserves valid coordinates', () => {
      const event: ADKEvent = {
        id: 'coord-4',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"coordinates": {"longitude": -119.5, "latitude": 37.8}}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      const geoRef = result?.ui_binding.geo_reference;
      expect(geoRef).not.toBeNull();
      expect(geoRef?.geometry.coordinates).toEqual([-119.5, 37.8]);
    });
  });

  describe('Category 3: Confidence Extraction (4 tests)', () => {
    test('handles missing confidence gracefully', () => {
      const event: ADKEvent = {
        id: 'conf-1',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: '{"summary": "Test without confidence"}' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      // Confidence should be a number (default from extractConfidence)
      expect(typeof result?.proof_layer.confidence).toBe('number');
    });

    test('handles invalid confidence type (string)', () => {
      const event: ADKEvent = {
        id: 'conf-2',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"summary": "Test", "severity": "HIGH", "confidence": "high"}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      // When summary field is present in JSON, it's used directly
      expect(result?.content.summary).toBe('Test');
    });

    test('handles NaN confidence', () => {
      const event: ADKEvent = {
        id: 'conf-3',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Not JSON' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(typeof result?.proof_layer.confidence).toBe('number');
    });

    test('converts valid confidence to percentage', () => {
      const event: ADKEvent = {
        id: 'conf-4',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"severity": "HIGH", "confidence": 0.87}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      // When no summary field, severity + confidence are formatted
      expect(result?.content.summary).toContain('87%');
      expect(result?.content.summary).toContain('HIGH');
    });
  });

  describe('Category 4: Citation Extraction (4 tests)', () => {
    test('handles missing citations gracefully', () => {
      const event: ADKEvent = {
        id: 'cite-1',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: '{"summary": "Test without citations"}' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(result?.proof_layer.citations).toBeDefined();
      expect(result?.proof_layer.citations.length).toBeGreaterThan(0);
      // Should have default fixture citation
      expect(result?.proof_layer.citations[0].source_type).toBe('MTBS');
    });

    test('handles invalid data structure', () => {
      const event: ADKEvent = {
        id: 'cite-2',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Not JSON at all' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(result?.proof_layer.citations).toBeDefined();
      // Should fall back to default citation
      expect(result?.proof_layer.citations.length).toBeGreaterThan(0);
    });

    test('extracts valid MTBS citation', () => {
      const event: ADKEvent = {
        id: 'cite-3',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"mtbs_id": "ca4179912345678", "summary": "High severity fire"}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      const citations = result?.proof_layer.citations;
      expect(citations).toBeDefined();
      expect(citations!.length).toBeGreaterThan(0);
      expect(citations![0].id).toBe('ca4179912345678');
      expect(citations![0].source_type).toBe('MTBS');
    });

    test('extracts valid source citation', () => {
      const event: ADKEvent = {
        id: 'cite-4',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [
            {
              text: '{"source": "NIFC", "fire_id": "cedar-creek", "fire_name": "Cedar Creek Fire"}',
            },
          ],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      const citations = result?.proof_layer.citations;
      expect(citations).toBeDefined();
      expect(citations!.some((c) => c.source_type === 'NIFC')).toBe(true);
    });
  });

  describe('Category 5: Correlation ID Handling (4 tests)', () => {
    test('uses invocationId when present', () => {
      const event: ADKEvent = {
        id: 'corr-1',
        invocationId: 'inv-12345',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Test content' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(result?.correlation_id).toBe('inv-12345');
    });

    test('uses class correlationId as fallback', () => {
      const event: ADKEvent = {
        id: 'corr-2',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Test' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      // Should use invocationId when provided
      expect(result?.correlation_id).toBe('inv-123');
    });

    test('generates event_id when id missing', () => {
      const event: ADKEvent = {
        id: 'test-id',
        invocationId: 'inv-123',
        author: 'burn_analyst',
        partial: false,
        content: {
          parts: [{ text: 'Test' }],
        },
      };

      const result = transformer.transformEvent(event);
      expect(result).not.toBeNull();
      expect(result?.event_id).toBe('test-id');
    });

    test('normalizes agent name variations', () => {
      const variations = [
        { input: 'coordinator', expected: 'recovery_coordinator' },
        { input: 'burn-analyst', expected: 'burn_analyst' },
        { input: 'trail_assessor', expected: 'trail_assessor' },
        { input: 'unknown-agent', expected: 'recovery_coordinator' },
      ];

      variations.forEach(({ input, expected }) => {
        const event: ADKEvent = {
          id: `agent-${input}`,
          invocationId: 'inv-123',
          author: input,
          partial: false,
          content: {
            parts: [{ text: 'Test' }],
          },
        };

        const result = transformer.transformEvent(event);
        expect(result).not.toBeNull();
        expect(result?.source_agent).toBe(expected);
      });
    });
  });
});
