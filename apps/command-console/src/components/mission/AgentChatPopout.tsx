/**
 * AgentChatPopout - Floating modal wrapper for AgentChat when popped out
 *
 * Features:
 * - Draggable header (future enhancement)
 * - Resizable (future enhancement)
 * - Click outside to dock (optional)
 * - Escape key to dock
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import { AgentChat } from './AgentChat';

interface AgentChatPopoutProps {
  onDock: () => void;
}

export function AgentChatPopout({ onDock }: AgentChatPopoutProps) {
  // Handle escape key to dock
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDock();
      }
    },
    [onDock]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDock}
      />

      {/* Modal */}
      <div className="relative w-[600px] h-[500px] max-w-[90vw] max-h-[80vh] bg-slate-900 rounded-xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
        {/* Modal header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-800/50">
          <span className="text-sm font-medium text-white">Chat - Expanded View</span>
          <button
            onClick={onDock}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Dock chat (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <AgentChat isPopped={true} onTogglePop={onDock} />
        </div>
      </div>
    </div>
  );
}

export default AgentChatPopout;
