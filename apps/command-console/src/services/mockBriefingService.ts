/**
 * Mock Briefing Service
 *
 * For Phase 1, this service simulates the backend by:
 * 1. Loading fixture data from /fixtures/briefing-events.json
 * 2. Firing AgentBriefingEvents based on user interactions
 * 3. Simulating the cascade pattern (agent → agent triggers)
 *
 * In Phase 2, this will be replaced by real API calls to Gemini.
 */

import type { AgentBriefingEvent, SourceAgent } from '@/types/briefing';

/**
 * Lifecycle phases map to agents
 */
export type LifecyclePhase = 'IMPACT' | 'DAMAGE' | 'TIMBER' | 'COMPLIANCE' | 'SUMMARY';

const PHASE_TO_AGENT: Record<LifecyclePhase, SourceAgent> = {
  IMPACT: 'burn_analyst',
  DAMAGE: 'trail_assessor',
  TIMBER: 'cruising_assistant',
  COMPLIANCE: 'nepa_advisor',
  SUMMARY: 'recovery_coordinator',
};

const AGENT_TO_EVENT_ID: Record<SourceAgent, string> = {
  burn_analyst: 'evt_burn_001',
  trail_assessor: 'evt_trail_001',
  cruising_assistant: 'evt_timber_001',
  nepa_advisor: 'evt_nepa_001',
  recovery_coordinator: 'evt_coordinator_001',
};

/**
 * Fixture data structure
 */
interface FixtureData {
  metadata: {
    fire_id: string;
    generated_at: string;
    source: string;
    schema_version: string;
    description: string;
  };
  events: AgentBriefingEvent[];
  demo_sequence: {
    description: string;
    steps: Array<{
      event_id: string;
      trigger: string;
      delay_ms: number;
    }>;
  };
}

/**
 * Mock service class for managing event dispatch
 */
class MockBriefingService {
  private listeners: Set<(event: AgentBriefingEvent) => void> = new Set();
  private firedEventIds: Set<string> = new Set();
  private fixtureData: FixtureData | null = null;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load fixture data from the public directory
   */
  async loadFixtures(): Promise<void> {
    if (this.fixtureData) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = fetch('/fixtures/briefing-events.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load fixtures: ${response.status}`);
        }
        return response.json();
      })
      .then((data: FixtureData) => {
        this.fixtureData = data;
        console.log('[MockBriefingService] Loaded fixtures:', data.events.length, 'events');
      })
      .catch((error) => {
        console.error('[MockBriefingService] Failed to load fixtures:', error);
        throw error;
      });

    return this.loadPromise;
  }

  /**
   * Get all events from fixture data
   */
  getAllEvents(): AgentBriefingEvent[] {
    return this.fixtureData?.events ?? [];
  }

  /**
   * Get a specific event by ID
   */
  getEventById(eventId: string): AgentBriefingEvent | undefined {
    return this.getAllEvents().find((e) => e.event_id === eventId);
  }

  /**
   * Get event for a lifecycle phase
   */
  getEventForPhase(phase: LifecyclePhase): AgentBriefingEvent | undefined {
    const agent = PHASE_TO_AGENT[phase];
    const eventId = AGENT_TO_EVENT_ID[agent];
    return this.getEventById(eventId);
  }

  /**
   * Subscribe to events
   */
  subscribe(callback: (event: AgentBriefingEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Fire an event to all subscribers
   */
  private emit(event: AgentBriefingEvent): void {
    this.listeners.forEach((callback) => callback(event));
  }

  /**
   * Trigger event for a lifecycle phase
   * Returns the event that was fired, or undefined if not found
   */
  triggerPhase(phase: LifecyclePhase): AgentBriefingEvent | undefined {
    const event = this.getEventForPhase(phase);
    if (!event) {
      console.warn(`[MockBriefingService] No event found for phase: ${phase}`);
      return undefined;
    }

    this.firedEventIds.add(event.event_id);
    this.emit(event);

    console.log(`[MockBriefingService] Fired event for ${phase}:`, event.event_id);
    return event;
  }

  /**
   * Trigger an event by its ID (for suggested action clicks)
   */
  triggerEventById(eventId: string): AgentBriefingEvent | undefined {
    const event = this.getEventById(eventId);
    if (!event) {
      console.warn(`[MockBriefingService] No event found with ID: ${eventId}`);
      return undefined;
    }

    this.firedEventIds.add(event.event_id);
    this.emit(event);

    console.log(`[MockBriefingService] Fired event:`, event.event_id);
    return event;
  }

  /**
   * Run the full cascade demo with delays
   */
  async runCascadeDemo(delayMs: number = 1500): Promise<void> {
    await this.loadFixtures();

    const sequence = this.fixtureData?.demo_sequence;
    if (!sequence) return;

    for (const step of sequence.steps) {
      const event = this.getEventById(step.event_id);
      if (event) {
        this.emit(event);
        this.firedEventIds.add(event.event_id);
        console.log(`[MockBriefingService] Cascade step:`, step.event_id);

        // Wait before next event (except for the last one)
        if (step !== sequence.steps[sequence.steps.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, step.delay_ms || delayMs));
        }
      }
    }
  }

  /**
   * Reset the service (clear fired events)
   */
  reset(): void {
    this.firedEventIds.clear();
    console.log('[MockBriefingService] Reset');
  }

  /**
   * Check if fixtures are loaded
   */
  isReady(): boolean {
    return this.fixtureData !== null;
  }

  /**
   * Check if an event has been fired
   */
  hasEventFired(eventId: string): boolean {
    return this.firedEventIds.has(eventId);
  }

  /**
   * Get all fired event IDs
   */
  getFiredEventIds(): string[] {
    return Array.from(this.firedEventIds);
  }
}

// Export singleton instance
export const mockBriefingService = new MockBriefingService();

export default mockBriefingService;
