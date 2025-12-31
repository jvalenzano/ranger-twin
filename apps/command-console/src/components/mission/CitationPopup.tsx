/**
 * CitationPopup - Detail popup for citation verification
 *
 * Shows full citation details for transparency. Users click citations
 * to verify information, so this shows excerpt, source, and metadata.
 * Includes "Copy URI" button for power users.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import type { Citation } from '@/types/briefing';

interface CitationPopupProps {
  citation: Citation;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function CitationPopup({ citation, anchorEl, onClose }: CitationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Position popup near anchor element
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl && popupRef.current) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      // Position above the anchor by default
      let top = anchorRect.top - popupRect.height - 8;
      let left = anchorRect.left;

      // If popup would go above viewport, position below
      if (top < 8) {
        top = anchorRect.bottom + 8;
      }

      // Keep popup within viewport horizontally
      if (left + popupRect.width > window.innerWidth - 8) {
        left = window.innerWidth - popupRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }

      setPosition({ top, left });
    }
  }, [anchorEl]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the same click
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Copy URI to clipboard
  const copyUri = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(citation.uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URI:', err);
    }
  }, [citation.uri]);

  // Check if URI is a web link
  const isWebLink = citation.uri.startsWith('http://') || citation.uri.startsWith('https://');

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Popup */}
      <div
        ref={popupRef}
        className="absolute w-80 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
        style={{ top: position.top, left: position.left }}
        role="dialog"
        aria-label={`Citation details for ${citation.id}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-700/50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {citation.source_type || 'Source'}
            </span>
            <span className="text-xs text-slate-400">{citation.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close popup"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Excerpt */}
          {citation.excerpt && (
            <div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Excerpt
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 rounded p-2 border border-white/5">
                "{citation.excerpt}"
              </p>
            </div>
          )}

          {/* URI */}
          <div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Reference URI
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[10px] text-cyan-400 bg-slate-900/50 rounded px-2 py-1 border border-white/5 truncate">
                {citation.uri}
              </code>
              <button
                onClick={copyUri}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                title="Copy URI to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Open link button (if web URL) */}
          {isWebLink && (
            <a
              href={citation.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
            >
              <ExternalLink size={12} />
              <span>Open in New Tab</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default CitationPopup;
