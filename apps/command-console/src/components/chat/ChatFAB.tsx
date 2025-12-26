/**
 * ChatFAB - Floating Action Button for minimized chat
 *
 * Features:
 * - Compact button with message count badge
 * - Pulsing animation for unread messages
 * - Click to expand chat panel
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useChatMessages } from '@/stores/chatStore';

interface ChatFABProps {
  onClick: () => void;
  hasUnread?: boolean;
}

const ChatFAB: React.FC<ChatFABProps> = ({ onClick, hasUnread = false }) => {
  const messages = useChatMessages();
  const messageCount = messages.length;

  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-full
        bg-accent-cyan text-slate-900
        flex items-center justify-center
        shadow-lg shadow-accent-cyan/20
        hover:scale-105 hover:shadow-xl hover:shadow-accent-cyan/30
        transition-all duration-200
        ${hasUnread ? 'animate-pulse' : ''}
      `}
      title="Open RANGER Chat"
    >
      <MessageCircle size={24} />

      {/* Message count badge */}
      {messageCount > 0 && (
        <span
          className={`
            absolute -top-1 -right-1
            min-w-[20px] h-5 px-1.5
            rounded-full
            bg-slate-900 text-accent-cyan
            text-[10px] font-bold
            flex items-center justify-center
            border-2 border-accent-cyan
          `}
        >
          {messageCount > 99 ? '99+' : messageCount}
        </span>
      )}
    </button>
  );
};

export default ChatFAB;
