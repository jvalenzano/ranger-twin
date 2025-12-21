/**
 * BriefingObserver - Root observer for AgentBriefingEvents
 *
 * This component sits at the App level and:
 * 1. Optionally establishes WebSocket connection for briefing events (Phase 2+)
 * 2. Renders the ModalInterrupt overlay for critical alerts
 *
 * For Phase 1 static demo, use autoConnect={false} to skip WebSocket entirely.
 * Events are pushed via mockBriefingService instead.
 *
 * Usage:
 * <BriefingObserver autoConnect={false}>
 *   <App />
 * </BriefingObserver>
 */

import React from 'react';

import { useActiveModal, useBriefingStore } from '@/stores/briefingStore';

import { ModalInterrupt } from './renderers/ModalInterrupt';

interface BriefingObserverProps {
  children: React.ReactNode;
  /**
   * Whether to auto-connect WebSocket on mount.
   * Set to false for static demo (Phase 1).
   * @default false
   */
  autoConnect?: boolean;
}

export const BriefingObserver: React.FC<BriefingObserverProps> = ({
  children,
  autoConnect = false,
}) => {
  const activeModal = useActiveModal();
  const dismissModal = useBriefingStore((state) => state.dismissModal);

  // Phase 1: Skip WebSocket connection entirely
  // Events are pushed via mockBriefingService.subscribe() in App.tsx
  // Phase 2+: Will re-enable WebSocket via useBriefingEventsConnection hook
  if (autoConnect) {
    console.warn('[BriefingObserver] autoConnect=true requires WebSocket backend (Phase 2+)');
  }

  return (
    <>
      {children}

      {/* Critical alert modal overlay */}
      {activeModal && (
        <ModalInterrupt event={activeModal} onDismiss={dismissModal} />
      )}
    </>
  );
};

export default BriefingObserver;
