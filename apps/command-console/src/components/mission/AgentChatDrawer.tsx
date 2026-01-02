/**
 * AgentChatDrawer - Mobile bottom sheet wrapper for AgentChat
 *
 * Behavior:
 * - Collapsed: Fixed bottom bar with chat icon + "Ask AI" label
 * - Expanded: Slides up to 60vh, overlays incident rail
 * - Tap bar or X to toggle
 */

import { useState } from 'react';
import { MessageSquare, X, ChevronUp } from 'lucide-react';

import { AgentChat } from './AgentChat';

export function AgentChatDrawer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Collapsed bar - always visible at bottom */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl"
        >
          <MessageSquare size={18} className="text-cyan-400" />
          <span className="text-sm font-medium text-white">Ask AI</span>
          <ChevronUp size={16} className="text-slate-500" />
        </button>
      )}

      {/* Expanded drawer */}
      {isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-slate-900/95 border-t border-white/10 backdrop-blur-xl z-30 flex flex-col rounded-t-xl overflow-hidden transition-transform duration-300 ease-out">
          {/* Drawer handle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-white">Ask AI</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 overflow-hidden">
            <AgentChat />
          </div>
        </div>
      )}
    </>
  );
}

export default AgentChatDrawer;
