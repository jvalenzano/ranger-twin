/**
 * Tooltip Component
 *
 * Reusable tooltip with smart positioning and glassmorphism styling.
 * Matches RANGER tactical futurism aesthetic.
 *
 * Features:
 * - **Portal-based rendering** to avoid clipping by parent containers
 * - Smart positioning (auto-adjusts to avoid viewport edges)
 * - Configurable hover delay (default 400ms)
 * - Glassmorphism backdrop blur
 * - Support for title, description, tip, and keyboard shortcut
 * - Accessible (ARIA attributes, keyboard navigation)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { TooltipContent } from '@/config/tooltipContent';
import { useTooltipsEnabled } from '@/stores/preferencesStore';

export interface TooltipProps {
    content: TooltipContent;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    delay?: number;
    maxWidth?: number;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

interface TooltipPosition {
    top: number;
    left: number;
    arrowPosition: 'top' | 'bottom' | 'left' | 'right';
    arrowOffset?: number; // Offset for arrow when tooltip is clamped to viewport edge
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    position = 'auto',
    delay = 400,
    maxWidth = 280,
    children,
    disabled = false,
    className = '',
}) => {
    const tooltipsEnabled = useTooltipsEnabled();
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    // If tooltips are globally disabled, just render children
    const effectivelyDisabled = disabled || !tooltipsEnabled;

    // Calculate tooltip position relative to viewport (for portal rendering)
    const calculateTooltipPosition = useCallback((): TooltipPosition | null => {
        if (!triggerRef.current) return null;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const offset = 10; // Gap between trigger and tooltip
        const tooltipEstimatedHeight = 150; // Estimated height for positioning (increased for tips)
        const viewportPadding = 12; // Minimum distance from viewport edge

        // Determine best position
        let bestPosition: 'top' | 'bottom' | 'left' | 'right' = position !== 'auto' ? position : 'right';

        if (position === 'auto') {
            const spaceAbove = triggerRect.top;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceLeft = triggerRect.left;
            const spaceRight = viewportWidth - triggerRect.right;

            // For sidebar items, prefer right positioning
            if (spaceRight > maxWidth + 20) {
                bestPosition = 'right';
            } else if (spaceLeft > maxWidth + 20) {
                bestPosition = 'left';
            } else if (spaceBelow > tooltipEstimatedHeight) {
                bestPosition = 'bottom';
            } else if (spaceAbove > tooltipEstimatedHeight) {
                bestPosition = 'top';
            }
        }

        let top: number;
        let left: number;
        let arrowOffset: number | undefined;

        switch (bestPosition) {
            case 'right':
            case 'left': {
                // For left/right positioning, we need to handle vertical clamping
                const triggerCenterY = triggerRect.top + (triggerRect.height / 2);
                const halfTooltipHeight = tooltipEstimatedHeight / 2;

                // Calculate ideal top (centered on trigger)
                let idealTop = triggerCenterY;

                // Check if tooltip would go above viewport
                if (triggerCenterY - halfTooltipHeight < viewportPadding) {
                    // Clamp to top edge - position tooltip so its top is at padding
                    idealTop = viewportPadding + halfTooltipHeight;
                    // Calculate arrow offset to point back at trigger
                    arrowOffset = triggerCenterY - idealTop;
                }
                // Check if tooltip would go below viewport
                else if (triggerCenterY + halfTooltipHeight > viewportHeight - viewportPadding) {
                    // Clamp to bottom edge
                    idealTop = viewportHeight - viewportPadding - halfTooltipHeight;
                    arrowOffset = triggerCenterY - idealTop;
                }

                top = idealTop;
                left = bestPosition === 'right'
                    ? triggerRect.right + offset
                    : triggerRect.left - offset;
                break;
            }
            case 'bottom':
                top = triggerRect.bottom + offset;
                left = triggerRect.left + (triggerRect.width / 2);
                break;
            case 'top':
            default:
                top = triggerRect.top - offset;
                left = triggerRect.left + (triggerRect.width / 2);
                break;
        }

        return {
            top,
            left,
            arrowPosition: bestPosition,
            arrowOffset,
        };
    }, [position, maxWidth]);

    const handleMouseEnter = () => {
        if (effectivelyDisabled) return;

        // Clear any pending dismiss timeout
        if (dismissTimeoutRef.current) {
            clearTimeout(dismissTimeoutRef.current);
            dismissTimeoutRef.current = null;
        }

        // Set show timeout
        timeoutRef.current = setTimeout(() => {
            const pos = calculateTooltipPosition();
            if (pos) {
                setTooltipPosition(pos);
                setIsVisible(true);
            }
        }, delay);
    };

    const handleMouseLeave = () => {
        // Clear show timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Dismiss immediately (no delay to prevent stuck tooltips)
        setIsVisible(false);
        setTooltipPosition(null);
    };

    const handleFocus = () => {
        if (effectivelyDisabled) return;
        const pos = calculateTooltipPosition();
        if (pos) {
            setTooltipPosition(pos);
            setIsVisible(true);
        }
    };

    const handleBlur = () => {
        setIsVisible(false);
        setTooltipPosition(null);
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
        };
    }, []);

    // Dismiss tooltip on scroll (prevents stuck tooltips)
    useEffect(() => {
        const handleScroll = () => {
            if (isVisible) {
                setIsVisible(false);
                setTooltipPosition(null);
            }
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [isVisible]);

    // Get transform based on arrow position
    const getTransformStyle = (arrowPos: 'top' | 'bottom' | 'left' | 'right'): string => {
        switch (arrowPos) {
            case 'right':
                return 'translateY(-50%)';
            case 'left':
                return 'translate(-100%, -50%)';
            case 'bottom':
                return 'translateX(-50%)';
            case 'top':
                return 'translate(-50%, -100%)';
        }
    };

    // Render tooltip content
    const renderTooltip = () => {
        if (!isVisible || !tooltipPosition) return null;

        const { top, left, arrowPosition, arrowOffset } = tooltipPosition;

        // Calculate arrow vertical position when tooltip is clamped
        const getArrowTopStyle = () => {
            if (arrowOffset !== undefined && (arrowPosition === 'left' || arrowPosition === 'right')) {
                // Arrow should point to where the trigger actually is
                return `calc(50% + ${arrowOffset}px)`;
            }
            return '50%';
        };

        return createPortal(
            <div
                ref={tooltipRef}
                role="tooltip"
                aria-hidden={!isVisible}
                className="fixed z-[99999] pointer-events-none animate-in fade-in duration-200"
                style={{
                    top: `${top}px`,
                    left: `${left}px`,
                    transform: getTransformStyle(arrowPosition),
                    maxWidth: `${maxWidth}px`,
                }}
            >
                <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-600/50 rounded-lg shadow-xl p-3">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                            {content.title}
                        </span>
                        {content.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-slate-700/50 border border-slate-600/50 rounded text-slate-300">
                                {content.shortcut}
                            </kbd>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-slate-300 leading-relaxed mb-0">
                        {content.description}
                    </p>

                    {/* Optional Tip - uses accentColor if provided */}
                    {content.tip && (
                        <div className="mt-2 pt-2 border-t border-slate-600/30">
                            <p
                                className="text-[11px] italic"
                                style={{ color: content.accentColor || '#22d3ee' }}
                            >
                                {content.tip}
                            </p>
                        </div>
                    )}

                    {/* Optional Metadata */}
                    {content.metadata && (
                        <div className="mt-2 pt-2 border-t border-slate-600/30">
                            <p className="text-[10px] text-slate-400 font-mono">
                                {content.metadata}
                            </p>
                        </div>
                    )}

                    {/* Arrow indicator */}
                    <div
                        className="absolute w-2 h-2 bg-slate-800 rotate-45"
                        style={{
                            ...(arrowPosition === 'top' && {
                                bottom: '-4px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                borderRight: '1px solid rgb(71 85 105 / 0.5)',
                                borderBottom: '1px solid rgb(71 85 105 / 0.5)',
                            }),
                            ...(arrowPosition === 'bottom' && {
                                top: '-4px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                borderLeft: '1px solid rgb(71 85 105 / 0.5)',
                                borderTop: '1px solid rgb(71 85 105 / 0.5)',
                            }),
                            ...(arrowPosition === 'left' && {
                                right: '-4px',
                                top: getArrowTopStyle(),
                                transform: 'translateY(-50%)',
                                borderTop: '1px solid rgb(71 85 105 / 0.5)',
                                borderRight: '1px solid rgb(71 85 105 / 0.5)',
                            }),
                            ...(arrowPosition === 'right' && {
                                left: '-4px',
                                top: getArrowTopStyle(),
                                transform: 'translateY(-50%)',
                                borderBottom: '1px solid rgb(71 85 105 / 0.5)',
                                borderLeft: '1px solid rgb(71 85 105 / 0.5)',
                            }),
                        }}
                    />
                </div>
            </div>,
            document.body
        );
    };

    // Use custom className if provided (allows override of inline-block), otherwise default to inline-block
    const wrapperClass = className || 'inline-block';

    return (
        <div
            ref={triggerRef}
            className={wrapperClass}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            {children}
            {renderTooltip()}
        </div>
    );
};

export default Tooltip;
