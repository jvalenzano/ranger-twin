/**
 * BriefingObserver - Root observer for AgentBriefingEvents
 *
 * This component sits at the App level and:
 * 1. Establishes WebSocket connection for briefing events
 * 2. Routes events to appropriate UI target renderers
 * 3. Renders the ModalInterrupt overlay for critical alerts
 *
 * Usage:
 * <BriefingObserver>
 *   <App />
 * </BriefingObserver>
 */

import React, { useEffect } from 'react';

import { useBriefingEventsConnection } from '@/hooks/useBriefingEvents';
import { useActiveModal, useBriefingStore } from '@/stores/briefingStore';

import { ModalInterrupt } from './renderers/ModalInterrupt';

interface BriefingObserverProps {
  children: React.ReactNode;
  /**
   * Optional session ID for the WebSocket connection.
   */
  sessionId?: string;
  /**
   * Whether to auto-connect on mount.
   * @default true
   */
  autoConnect?: boolean;
}

export const BriefingObserver: React.FC<BriefingObserverProps> = ({
  children,
  sessionId,
  autoConnect = true,
}) => {
  const { isConnected } = useBriefingEventsConnection({
    sessionId,
    autoConnect,
    onEvent: (event) => {
      console.log('[BriefingObserver] Received event:', event.type, event.source_agent);
    },
    onConnectionChange: (connected) => {
      console.log('[BriefingObserver] Connection changed:', connected);
    },
  });

  const activeModal = useActiveModal();
  const dismissModal = useBriefingStore((state) => state.dismissModal);

  // Log connection status changes
  useEffect(() => {
    console.log('[BriefingObserver] Connection status:', isConnected);
  }, [isConnected]);

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
