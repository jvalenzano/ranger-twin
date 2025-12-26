/**
 * TechnicalTooltip - Developer-focused contextual documentation (DX Tooltips)
 *
 * Shows detailed technical explanations when dxTooltipsEnabled is true.
 * Designed for:
 * - Developer onboarding
 * - Living documentation
 * - Technical demos
 * - Domain learning
 *
 * Usage:
 *   // Option 1: Direct props
 *   <TechnicalTooltip title="..." summary="..." details="...">
 *     <Button>Click me</Button>
 *   </TechnicalTooltip>
 *
 *   // Option 2: Registry lookup (recommended)
 *   <TechnicalTooltip tooltipId="ui-triage-score">
 *     <span>165.5</span>
 *   </TechnicalTooltip>
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Code2, X, ChevronRight } from 'lucide-react';
import { useDxTooltipsEnabled } from '@/stores/preferencesStore';
import { getDxTooltip, type DxTooltipContent } from '@/config/tooltips';

// Props when using direct content
interface DirectProps {
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Title of the technical explanation */
  title: string;
  /** Brief one-line description */
  summary: string;
  /** Detailed technical flow/explanation (supports code blocks) */
  details: string;
  /** Optional: Source file reference */
  sourceFile?: string;
  /** Optional: Key data points */
  dataPoints?: { label: string; value: string }[];
  /** Position preference (auto-adjusts if would overflow viewport) */
  position?: 'top' | 'bottom' | 'left' | 'right';
  tooltipId?: never;
}

// Props when using registry lookup
interface RegistryProps {
  /** The element that triggers the tooltip */
  children: ReactNode;
  /** Tooltip ID from the DX registry */
  tooltipId: string;
  /** Position preference (auto-adjusts if would overflow viewport) */
  position?: 'top' | 'bottom' | 'left' | 'right';
  title?: never;
  summary?: never;
  details?: never;
  sourceFile?: never;
  dataPoints?: never;
}

type TechnicalTooltipProps = DirectProps | RegistryProps;

export function TechnicalTooltip(props: TechnicalTooltipProps) {
  const { children } = props;
  // Note: position prop reserved for future enhancement (explicit positioning preference)

  // Resolve content from registry or direct props
  let content: Pick<DxTooltipContent, 'title' | 'summary' | 'details' | 'sourceFile' | 'dataPoints'>;

  if ('tooltipId' in props && props.tooltipId) {
    content = getDxTooltip(props.tooltipId);
  } else {
    content = {
      title: (props as DirectProps).title,
      summary: (props as DirectProps).summary,
      details: (props as DirectProps).details,
      sourceFile: (props as DirectProps).sourceFile,
      dataPoints: (props as DirectProps).dataPoints,
    };
  }

  const { title, summary, details, sourceFile, dataPoints } = content;
  const isEnabled = useDxTooltipsEnabled();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Fixed position in top-left corner - consistent location for all DX tooltips
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: '16px',
    top: '60px', // Below header
    maxHeight: 'calc(100vh - 80px)',
    width: '400px',
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't render tooltip functionality if disabled
  if (!isEnabled) {
    return <>{children}</>;
  }

  // Format details with code block styling
  const formatDetails = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Check if it's a code/diagram line (starts with spaces or special chars)
      const isCodeLine = /^[\s│├└┌┐┘┬┴┼─↓↑→←]/.test(line) || line.includes('→');
      return (
        <div
          key={i}
          className={isCodeLine ? 'font-mono text-[11px] text-cyan-300' : 'text-slate-300'}
        >
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {/* Trigger wrapper with indicator */}
      <div
        className="relative cursor-help"
        onClick={() => setIsOpen(!isOpen)}
      >
        {children}
        {/* Dev mode indicator dot */}
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      </div>

      {/* Tooltip panel - dynamically positioned to stay in viewport */}
      {isOpen && (
        <div
          ref={tooltipRef}
          className="z-[100] bg-slate-950 border border-purple-500/30 rounded-lg shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col"
          style={tooltipStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-purple-500/10 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                Technical Docs
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content - scrollable */}
          <div className="p-3 space-y-3 overflow-y-auto flex-1">
            {/* Title & Summary */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
              <p className="text-xs text-slate-400">{summary}</p>
            </div>

            {/* Source file reference */}
            {sourceFile && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                <span className="text-purple-400">@</span>
                {sourceFile}
              </div>
            )}

            {/* Data points */}
            {dataPoints && dataPoints.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {dataPoints.map((dp, i) => (
                  <div key={i} className="bg-slate-900/50 rounded px-2 py-1.5">
                    <div className="text-[10px] text-slate-500 uppercase">{dp.label}</div>
                    <div className="text-xs text-cyan-400 font-mono">{dp.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Expandable details */}
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
                {isExpanded ? 'Hide' : 'Show'} Technical Flow
              </button>

              {isExpanded && (
                <div className="mt-2 p-2 bg-slate-900/70 rounded border border-slate-800 text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                  {formatDetails(details)}
                </div>
              )}
            </div>
          </div>

          {/* Footer - fixed at bottom */}
          <div className="px-3 py-1.5 bg-slate-900/50 border-t border-slate-800 flex-shrink-0">
            <span className="text-[10px] text-slate-600">
              DX Tooltips enabled • Profile → DX Tooltips
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicalTooltip;
