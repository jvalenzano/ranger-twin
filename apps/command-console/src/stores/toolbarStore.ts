/**
 * Toolbar Store
 *
 * Manages user preferences for the map controls toolbar.
 * Supports pinning/unpinning tools and persists to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// All available toolbar tools
export type ToolId =
  | 'layer-sat'
  | 'layer-ter'
  | 'layer-ir'
  | 'zoom-in'
  | 'zoom-out'
  | 'reset-north'
  | 'layer-switch';

export interface ToolConfig {
  id: ToolId;
  label: string;
  shortLabel: string;
  description: string;
  category: 'layers' | 'navigation';
  defaultPinned: boolean;
}

// Tool definitions - this is the source of truth for available tools
export const TOOLBAR_TOOLS: ToolConfig[] = [
  // Layer tools
  {
    id: 'layer-sat',
    label: 'Satellite',
    shortLabel: 'SAT',
    description: 'High-resolution aerial photography',
    category: 'layers',
    defaultPinned: true,
  },
  {
    id: 'layer-ter',
    label: 'Terrain',
    shortLabel: 'TER',
    description: '3D elevation model',
    category: 'layers',
    defaultPinned: true,
  },
  {
    id: 'layer-ir',
    label: 'Infrared',
    shortLabel: 'IR',
    description: 'Thermal burn severity view',
    category: 'layers',
    defaultPinned: true,
  },
  // Navigation tools
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    shortLabel: '−',
    description: 'Decrease magnification',
    category: 'navigation',
    defaultPinned: true,
  },
  {
    id: 'zoom-in',
    label: 'Zoom In',
    shortLabel: '+',
    description: 'Increase magnification',
    category: 'navigation',
    defaultPinned: true,
  },
  {
    id: 'reset-north',
    label: 'Reset North',
    shortLabel: 'N',
    description: 'Reset map to north-up orientation',
    category: 'navigation',
    defaultPinned: true,
  },
];

interface ToolbarState {
  // Which tools are pinned (visible in main toolbar)
  pinnedTools: ToolId[];

  // Actions
  pinTool: (toolId: ToolId) => void;
  unpinTool: (toolId: ToolId) => void;
  togglePin: (toolId: ToolId) => void;
  resetToDefaults: () => void;

  // Helpers
  isPinned: (toolId: ToolId) => boolean;
}

const getDefaultPinnedTools = (): ToolId[] =>
  TOOLBAR_TOOLS.filter(t => t.defaultPinned).map(t => t.id);

export const useToolbarStore = create<ToolbarState>()(
  persist(
    (set, get) => ({
      pinnedTools: getDefaultPinnedTools(),

      pinTool: (toolId) => {
        const { pinnedTools } = get();
        if (!pinnedTools.includes(toolId)) {
          set({ pinnedTools: [...pinnedTools, toolId] });
        }
      },

      unpinTool: (toolId) => {
        const { pinnedTools } = get();
        set({ pinnedTools: pinnedTools.filter(id => id !== toolId) });
      },

      togglePin: (toolId) => {
        const { pinnedTools, pinTool, unpinTool } = get();
        if (pinnedTools.includes(toolId)) {
          unpinTool(toolId);
        } else {
          pinTool(toolId);
        }
      },

      resetToDefaults: () => {
        set({ pinnedTools: getDefaultPinnedTools() });
      },

      isPinned: (toolId) => {
        return get().pinnedTools.includes(toolId);
      },
    }),
    {
      name: 'ranger-toolbar-preferences',
    }
  )
);

// Selector hooks for cleaner component usage
export const usePinnedTools = () => useToolbarStore((state) => state.pinnedTools);
export const useIsPinned = (toolId: ToolId) =>
  useToolbarStore((state) => state.pinnedTools.includes(toolId));
