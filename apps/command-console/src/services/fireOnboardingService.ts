/**
 * Fire Onboarding Service
 *
 * Orchestrates the simulated agent workflow during fire onboarding.
 * Controls the timing and progress updates for each agent as they
 * "analyze" the new fire.
 *
 * In Phase 1, this is a simulation. In Phase 2+, this will coordinate
 * real API calls to data sources and agent services.
 */

import type { FireContext, AgentType } from '@/types/fire';
import { useFireContextStore } from '@/stores/fireContextStore';
import { DEFAULT_FIRE } from '@/types/fire';

// Agent simulation configuration
interface AgentSimulation {
  agent: AgentType;
  startDelay: number; // ms after simulation starts
  duration: number; // total ms for this agent
  messages: { progress: number; message: string }[];
}

const AGENT_SIMULATIONS: AgentSimulation[] = [
  {
    agent: 'burn_analyst',
    startDelay: 0,
    duration: 4000,
    messages: [
      { progress: 0, message: 'Fetching MTBS burn severity data...' },
      { progress: 25, message: 'Processing satellite imagery...' },
      { progress: 50, message: 'Classifying burn severity zones...' },
      { progress: 75, message: 'Generating severity statistics...' },
      { progress: 100, message: 'Burn analysis complete' },
    ],
  },
  {
    agent: 'trail_assessor',
    startDelay: 2000,
    duration: 3500,
    messages: [
      { progress: 0, message: 'Loading trail network from TRACS...' },
      { progress: 30, message: 'Correlating trails with burn zones...' },
      { progress: 60, message: 'Assessing infrastructure damage...' },
      { progress: 85, message: 'Generating work orders...' },
      { progress: 100, message: 'Trail assessment complete' },
    ],
  },
  {
    agent: 'cruising_assistant',
    startDelay: 4000,
    duration: 3000,
    messages: [
      { progress: 0, message: 'Querying FSVeg timber plots...' },
      { progress: 35, message: 'Calculating salvage volumes...' },
      { progress: 70, message: 'Prioritizing harvest units...' },
      { progress: 100, message: 'Timber analysis complete' },
    ],
  },
  {
    agent: 'nepa_advisor',
    startDelay: 5500,
    duration: 2500,
    messages: [
      { progress: 0, message: 'Indexing FSM/FSH regulations...' },
      { progress: 40, message: 'Identifying applicable requirements...' },
      { progress: 75, message: 'Generating compliance checklist...' },
      { progress: 100, message: 'NEPA guidance ready' },
    ],
  },
  {
    agent: 'recovery_coordinator',
    startDelay: 7500,
    duration: 2000,
    messages: [
      { progress: 0, message: 'Synthesizing agent findings...' },
      { progress: 50, message: 'Building recovery timeline...' },
      { progress: 100, message: 'Recovery plan ready' },
    ],
  },
];

class FireOnboardingService {
  private timers: NodeJS.Timeout[] = [];
  private isRunning = false;

  /**
   * Start the agent simulation for a new fire
   */
  startSimulation(_fireInput: Partial<FireContext>): void {
    if (this.isRunning) {
      this.stopSimulation();
    }

    this.isRunning = true;
    const store = useFireContextStore.getState();

    // Schedule each agent's simulation
    AGENT_SIMULATIONS.forEach((sim) => {
      // Start agent
      const startTimer = setTimeout(() => {
        if (!this.isRunning) return;

        store.updateAgentProgress(sim.agent, {
          status: 'working',
          message: sim.messages[0]?.message || 'Starting...',
          progress: 0,
          startedAt: Date.now(),
        });

        // Schedule progress updates
        sim.messages.forEach((msg, index) => {
          if (index === 0) return; // Already set above

          const progressDelay = (msg.progress / 100) * sim.duration;
          const progressTimer = setTimeout(() => {
            if (!this.isRunning) return;

            const isComplete = msg.progress === 100;
            store.updateAgentProgress(sim.agent, {
              status: isComplete ? 'complete' : 'working',
              message: msg.message,
              progress: isComplete ? undefined : msg.progress,
              completedAt: isComplete ? Date.now() : undefined,
            });
          }, progressDelay);

          this.timers.push(progressTimer);
        });
      }, sim.startDelay);

      this.timers.push(startTimer);
    });
  }

  /**
   * Stop any running simulation
   */
  stopSimulation(): void {
    this.isRunning = false;
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];
  }

  /**
   * Create a FireContext from the user input
   * In Phase 1, this uses Cedar Creek as a template
   */
  createFireContext(input: Partial<FireContext>): FireContext {
    // Generate a unique ID
    const fireId = this.generateFireId(input.name || 'new-fire', input.year || new Date().getFullYear());

    // Use Cedar Creek as template, override with user input
    const newFire: FireContext = {
      ...DEFAULT_FIRE,
      fire_id: fireId,
      name: input.name || 'New Fire',
      year: input.year || new Date().getFullYear(),
      forest: input.forest || 'Unknown Forest',
      state: input.state || 'OR',
      acres: input.acres || 0,
      status: 'contained',
      isDemo: false, // User-created fires are not demos
      // In Phase 1, still use Cedar Creek fixtures as template
      fixturesPath: 'cedar-creek',
      // Use input data_status if provided, otherwise use defaults
      data_status: input.data_status || {
        perimeter: { available: true, source: 'NIFC' },
        burn_severity: { available: true, source: 'MTBS' },
        trail_damage: { available: true, source: 'TRACS', coverage: 0.75 },
        timber_plots: { available: true, source: 'FSVeg', coverage: 0.6 },
      },
      // Centroid - in Phase 2, this would come from the fire perimeter
      centroid: input.centroid || DEFAULT_FIRE.centroid,
      bounds: input.bounds || DEFAULT_FIRE.bounds,
    };

    return newFire;
  }

  /**
   * Generate a URL-safe fire ID
   */
  private generateFireId(name: string, year: number): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${slug}-${year}`;
  }

  /**
   * Check if simulation is currently running
   */
  isSimulationRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
const fireOnboardingService = new FireOnboardingService();
export default fireOnboardingService;
