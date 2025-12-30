/**
 * Splash Screen Constants
 *
 * Hardcoded Cedar Creek Fire briefing data for Phase 0 demo
 */

import type { BriefingItem } from '@/types/splash';

export const BRIEFING_DATA: BriefingItem[] = [
  {
    id: '1',
    agent: 'BURN ANALYST',
    icon: '🔥',
    content: 'Burn severity updated · 3 new high-risk slopes flagged',
    severity: 'HIGH',
    delay: 150,
  },
  {
    id: '2',
    agent: 'TRAIL ASSESSOR',
    icon: '🥾',
    content: '2 trail segments unsafe · reroute suggested',
    severity: 'HIGH',
    delay: 300,
  },
  {
    id: '3',
    agent: 'CRUISING ASSISTANT',
    icon: '🌲',
    content: 'Salvage window: 9 days · priority units pre-sorted',
    severity: 'LOW',
    delay: 450,
  },
  {
    id: '4',
    agent: 'NEPA ADVISOR',
    icon: '📋',
    content: 'Compliance: 18 memos pre-screened with citations',
    severity: 'MEDIUM',
    delay: 600,
  },
  {
    id: '5',
    agent: 'RECOVERY COORDINATOR',
    icon: '🎯',
    content: 'Ops plan ready in 5 minutes · 14 data sources unified',
    severity: 'LOW',
    delay: 750,
  },
];
