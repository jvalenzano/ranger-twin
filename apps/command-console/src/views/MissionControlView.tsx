/**
 * MissionControlView - National portfolio view
 *
 * Shows all fires across USFS regions with:
 * - US map with fire markers
 * - Incident list with filtering
 * - Season timeline
 * - Watchlist management
 */


import {
  MissionControlLayout,
  MissionStack,
  MissionHeader,
  NationalMap,
  IncidentRail,
  SeasonSlider,
} from '@/components/mission';

export function MissionControlView() {
  return (
    <MissionControlLayout
      header={<MissionHeader />}
      stack={<MissionStack />}
      map={<NationalMap />}
      rail={<IncidentRail />}
      slider={<SeasonSlider />}
    />
  );
}

export default MissionControlView;
