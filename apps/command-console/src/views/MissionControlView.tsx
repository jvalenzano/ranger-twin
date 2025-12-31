/**
 * MissionControlView - National portfolio view
 *
 * Layout matches TacticalView for visual consistency:
 * - Full-screen map background
 * - Left sidebar with RANGER branding
 * - Top header with filters
 * - Briefing strip with portfolio metrics
 * - Right rail with incident list
 */

import { useState } from 'react';

import { CommandSidebar } from '@/components/mission/CommandSidebar';
import { CommandHeader } from '@/components/mission/CommandHeader';
import { BriefingStrip } from '@/components/mission/BriefingStrip';
import { NationalMap } from '@/components/mission/NationalMap';
import { IncidentRail } from '@/components/mission/IncidentRail';

export function MissionControlView() {
  const [sidebarWidth, setSidebarWidth] = useState(200);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-text-primary">
      {/* National Map - Full screen background */}
      <NationalMap />

      {/* Sidebar - Left side with RANGER branding (matches Tactical) */}
      <CommandSidebar onWidthChange={setSidebarWidth} />

      {/* Header - Top bar starting after sidebar (matches Tactical) */}
      <header
        className="absolute top-0 right-0 h-[48px] glass-header z-30 flex items-center transition-[left] duration-300 ease-out"
        style={{ left: sidebarWidth }}
      >
        <CommandHeader />
      </header>

      {/* Briefing Strip - Portfolio metrics bar below header */}
      <div
        className="absolute top-[48px] right-[320px] h-[48px] z-25 transition-[left] duration-300 ease-out"
        style={{ left: sidebarWidth }}
      >
        <BriefingStrip />
      </div>

      {/* Incident Rail - Right side (matches InsightPanel position in Tactical) */}
      <aside
        className="absolute top-[48px] right-0 bottom-0 w-[320px] z-20 bg-[#0a0f1a]/65 backdrop-blur-2xl border-l border-white/[0.1] overflow-hidden"
      >
        <IncidentRail />
      </aside>
    </div>
  );
}

export default MissionControlView;
