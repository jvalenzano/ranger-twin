/**
 * PreviewCarousel - Auto-rotating carousel with 5 slides
 *
 * Features:
 * - 10-second auto-rotation
 * - Opacity crossfade transitions
 * - CSS gradient backgrounds (no external images)
 * - Tactical paginator with progress bar
 */

import React, { useState, useEffect } from 'react';
import type { CarouselSlide } from '@/types/splash';

const SLIDES: CarouselSlide[] = [
  {
    id: 'context',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', // Slate
    visual: (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <div className="text-6xl">🔥</div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-teal-400 font-mono tracking-tight">
              CEDAR CREEK FIRE
            </div>
            <div className="text-xl text-slate-300 font-mono">
              Willamette National Forest · Oregon
            </div>
            <div className="text-4xl font-bold text-red-400 mt-4">127,000</div>
            <div className="text-sm text-slate-400 uppercase tracking-widest">
              Acres Burned · 2022
            </div>
            <div className="text-xs text-slate-500 italic mt-4 max-w-md">
              "Assessment took 2 weeks. Recovery planning took another 3 weeks. <br/>
              We needed faster answers."
            </div>
          </div>
        </div>
      </div>
    ),
    text: 'Cedar Creek Fire · Willamette National Forest | 127,000 acres burned · 2022 | 2,000+ evacuated · PCT impacted | $58M damages · 3 years recovering',
  },
  {
    id: 'problem',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #0c1e42 100%)', // Dark blue
    visual: (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-red-400 font-mono tracking-tight">
              THE COORDINATION PROBLEM
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {['📁', '📂', '📊', '📑', '🗓️', '🛰️', '🗺️', '📥', '📋', '📑', '🔍', '⚙️', '⚠️', '📡'].map(
              (icon, idx) => (
                <div
                  key={idx}
                  className="w-12 h-12 flex items-center justify-center bg-slate-900/80 rounded border border-red-500/30 text-2xl grayscale opacity-60"
                >
                  {icon}
                </div>
              )
            )}
          </div>
          <div className="text-center space-y-2 mt-2">
            <div className="text-5xl font-bold text-red-400 font-mono">14</div>
            <div className="text-lg text-slate-300 uppercase tracking-widest">
              Disconnected Workflows
            </div>
            <div className="text-xs text-slate-500 italic mt-3 max-w-md">
              "Burn severity, trails, timber, compliance — all separate.<br/>
              2+ hours every morning just checking status."
            </div>
          </div>
        </div>
      </div>
    ),
    text: 'Traditional Recovery: 14 disconnected workflows · 2+ hours every morning · Siloed expertise · Compliance bottlenecks',
  },
  {
    id: 'solution',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0a3d3a 100%)', // Teal
    visual: (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-teal-400 font-mono tracking-tight">
              ORCHESTRATED AI AGENTS
            </div>
            <div className="text-base text-slate-400 uppercase tracking-widest">
              Burn · Trails · Timber · Compliance · Coordination
            </div>
          </div>
          <div className="flex gap-5">
            {['🔥', '🥾', '🌲', '📋', '🎯'].map((icon, idx) => (
              <div
                key={idx}
                className="w-20 h-20 flex items-center justify-center bg-slate-900 border-2 border-teal-400 rounded-lg text-4xl shadow-[0_0_30px_rgba(45,212,191,0.3)]"
              >
                {icon}
              </div>
            ))}
          </div>
          <div className="text-center space-y-2 mt-2">
            <div className="text-4xl font-bold text-teal-400 font-mono">2h → 5min</div>
            <div className="text-xs text-slate-500 italic mt-3 max-w-md">
              "Each agent has domain expertise through Skills.<br/>
              The Recovery Coordinator synthesizes all insights into one briefing."
            </div>
          </div>
        </div>
      </div>
    ),
    text: 'RANGER Network: 5 orchestrated AI agents with domain-specific Skills | Recovery Coordinator synthesizes unified briefings | 2 hours → 5 minutes',
  },
  {
    id: 'proof',
    gradient: 'linear-gradient(135deg, #581c87 0%, #2e1065 100%)', // Purple
    visual: (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-5">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-purple-400 font-mono tracking-tight">
              TRUST THROUGH TRANSPARENCY
            </div>
          </div>
          <div className="w-full bg-black/40 rounded-xl border-2 border-purple-500/30 p-6 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-purple-400 font-bold">LOG: 2025-12-29 06:00:01 Z</div>
            <div>&gt; ANALYZING BURN_SEVERITY_RASTER_V4...</div>
            <div>&gt; CROSS-REF: 36 CFR § 220.6(e)(13)...</div>
            <div className="text-emerald-400">&gt; [PASS] CATEGORICAL EXCLUSION VALIDATED</div>
            <div>&gt; REASONING: HIGH-RISK SLOPE OVERLAP</div>
            <div className="text-teal-400 text-base font-bold mt-2">&gt; CONFIDENCE: 98.42%</div>
          </div>
          <div className="flex gap-8 text-center text-slate-300">
            <div>
              <div className="text-2xl">✓</div>
              <div className="text-xs text-slate-400">Source Citations</div>
            </div>
            <div>
              <div className="text-2xl">✓</div>
              <div className="text-xs text-slate-400">Reasoning Chain</div>
            </div>
            <div>
              <div className="text-2xl">✓</div>
              <div className="text-xs text-slate-400">Human Review</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 italic mt-1 max-w-md text-center">
            "AI-assisted analysis with full audit trails.<br/>You validate, you decide."
          </div>
        </div>
      </div>
    ),
    text: 'Trust Through Transparency: Confidence scores · Source citations · Reasoning chains · Human-in-the-loop validation',
  },
  {
    id: 'impact',
    gradient: 'linear-gradient(135deg, #155e75 0%, #083344 100%)', // Cyan
    visual: (
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-cyan-400 font-mono tracking-tight">
              RECOVERY AT THE SPEED OF INSIGHT
            </div>
          </div>
          <div className="w-full space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono text-slate-300 font-bold">Decision Latency</span>
                <span className="text-xl text-teal-400 font-bold">96% ↓</span>
              </div>
              <div className="flex gap-2 h-8 items-center">
                <div className="flex-1 bg-slate-800/50 rounded-lg relative border border-slate-700">
                  <div className="absolute top-0 left-0 h-full w-[4%] bg-teal-400 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.6)]"></div>
                </div>
                <span className="text-sm text-slate-400 font-mono whitespace-nowrap">2h → 5m</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono text-slate-300 font-bold">Compliance Cite-Checking</span>
                <span className="text-xl text-teal-400 font-bold">8× Faster</span>
              </div>
              <div className="flex gap-2 h-8 items-center">
                <div className="flex-1 bg-slate-800/50 rounded-lg relative border border-slate-700">
                  <div className="absolute top-0 left-0 h-full w-[87.5%] bg-teal-400 rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.6)]"></div>
                </div>
                <span className="text-sm text-slate-400 font-mono whitespace-nowrap">8h → 1h</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 italic mt-2 max-w-md text-center">
            "Draft BAER assessments in 48 hours vs. 2 weeks.<br/>
            Your teams focus on decisions, not data entry."
          </div>
        </div>
      </div>
    ),
    text: 'Recovery at the Speed of Insight: Draft assessments 48h vs 2 weeks · NEPA cite-checking 30s vs 3 weeks · Coordinated recovery planning',
  },
];

const PreviewCarousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-[600px] relative group rounded-2xl overflow-hidden border border-teal-400/20 shadow-[0_0_20px_rgba(45,212,191,0.1)] bg-slate-900/30">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col ${
            index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Gradient Background */}
          <div
            className="absolute inset-0 transition-transform duration-[10000ms] ease-linear"
            style={{
              background: slide.gradient,
              transform: index === activeSlide ? 'scale(1)' : 'scale(1.05)',
            }}
          />

          {/* Main Visual Area */}
          <div className="flex-grow flex flex-col p-12 z-10">{slide.visual}</div>

          {/* Text Overlay Card */}
          <div className="p-12 pt-0 z-10">
            <div className="backdrop-blur-md bg-slate-800/30 p-6 rounded-xl border border-slate-300/10 relative overflow-hidden">
              {/* Internal Progress Bar */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-slate-700/30">
                <div
                  className="h-full bg-teal-400 transition-all duration-[10000ms] ease-linear shadow-[0_0_5px_rgba(45,212,191,0.5)]"
                  style={{ width: index === activeSlide ? '100%' : '0%' }}
                />
              </div>

              <p className="text-slate-200 text-sm font-medium leading-relaxed font-mono">
                {slide.text}
              </p>
            </div>
          </div>
        </div>
      ))}

    </div>
  );
};

export default PreviewCarousel;
