/**
 * Briefing Components - Public exports
 */

// Main observer
export { BriefingObserver } from './BriefingObserver';

// Cards and display components
export { InsightCard } from './InsightCard';

// Renderers
export { ModalInterrupt } from './renderers/ModalInterrupt';
export { RailPulseProvider, useRailPulse } from './renderers/RailPulseManager';
export { PanelInjector, usePanelInjectedEvents } from './renderers/PanelInjectManager';
export {
  MapHighlightProvider,
  useMapHighlights,
  useHighlightsBySeverity,
} from './renderers/MapHighlightManager';
