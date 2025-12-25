/**
 * App.tsx - Root application component and view orchestrator
 *
 * Manages:
 * - View switching between NATIONAL and TACTICAL modes
 * - Initial fixture loading
 * - Lab route handling
 * - View transitions (swoop animation)
 */

import React, { useEffect, useState, Suspense, lazy } from 'react';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import mockBriefingService from '@/services/mockBriefingService';
import { useBriefingStore } from '@/stores/briefingStore';
import {
  useMissionStore,
  useViewMode,
  useTransitionState,
} from '@/stores/missionStore';
import { useFireContextStore } from '@/stores/fireContextStore';
import { TacticalView, MissionControlView } from '@/views';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const viewMode = useViewMode();
  const transitionState = useTransitionState();
  const addEvent = useBriefingStore((state) => state.addEvent);
  const { setViewMode, setTransitionState } = useMissionStore();
  const { selectFire } = useFireContextStore();

  // Connect to gateway on mount and load fixtures for active fire
  useEffect(() => {
    // Load fixture data for the active fire
    mockBriefingService.loadFixtures()
      .then(() => {
        setIsReady(true);
      })
      .catch(() => {
        // Still set ready to true so we can see the UI even if fixtures fail
        setIsReady(true);
      });

    // Subscribe to incoming events
    const unsubscribe = mockBriefingService.subscribe((event) => {
      addEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [addEvent]);

  // Handle transition completion
  useEffect(() => {
    if (transitionState === 'swooping_in') {
      // Get the selected fire ID from mission store
      const selectedFireId = useMissionStore.getState().selectedFireId;

      // After transition animation, switch to tactical view
      const timer = setTimeout(() => {
        if (selectedFireId) {
          selectFire(selectedFireId);
        }
        setViewMode('TACTICAL');
        setTransitionState('idle');
      }, 1500); // Match animation duration

      return () => clearTimeout(timer);
    }

    if (transitionState === 'swooping_out') {
      // After transition animation, switch to national view
      const timer = setTimeout(() => {
        setViewMode('NATIONAL');
        setTransitionState('idle');
      }, 1500); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [transitionState, setViewMode, setTransitionState, selectFire]);

  // Simple URL-based routing for experiments
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Show loading state while fixtures load
  if (!isReady) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-text-muted text-sm mono">Loading RANGER...</div>
      </div>
    );
  }

  // Lab Route (isolated)
  if (currentPath === '/lab/forensic-insight') {
    const ForensicInsightLab = lazy(() => import('@/prototypes/ForensicInsightLab'));
    return (
      <Suspense fallback={<div className="p-10 mono text-xs">Initializing Lab...</div>}>
        <ForensicInsightLab />
      </Suspense>
    );
  }

  // View orchestration based on mission store state
  return (
    <ErrorBoundary>
      {viewMode === 'NATIONAL' ? (
        <MissionControlView />
      ) : (
        <TacticalView />
      )}
    </ErrorBoundary>
  );
};

export default App;
