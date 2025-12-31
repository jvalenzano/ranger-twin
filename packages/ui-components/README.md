# ui-components

> Shared React component library for Project RANGER

## Overview

Reusable React components implementing the "Tactical Futurism" design system. Used by both Command Console and Field Companion apps.

## Installation

```bash
pnpm add @cedar-creek/ui-components
```

## Structure

```
src/
├── components/
│   ├── cards/
│   │   ├── GlassCard.tsx        # Glassmorphic card container
│   │   ├── InsightCard.tsx      # Agent insight display
│   │   └── MetricCard.tsx       # KPI display
│   ├── buttons/
│   │   ├── PrimaryButton.tsx
│   │   ├── IconButton.tsx
│   │   └── ToggleButton.tsx
│   ├── inputs/
│   │   ├── SearchInput.tsx
│   │   ├── ChatInput.tsx
│   │   └── RangeSlider.tsx
│   ├── feedback/
│   │   ├── ConfidenceBadge.tsx  # Agent confidence display
│   │   ├── StatusIndicator.tsx  # Green/Amber/Red status
│   │   └── LoadingSpinner.tsx
│   ├── navigation/
│   │   ├── LifecycleRail.tsx    # Vertical workflow stepper
│   │   └── TabBar.tsx
│   └── data/
│       ├── DonutChart.tsx       # Severity breakdown
│       ├── TimelineSlider.tsx   # Temporal navigation
│       └── DataTable.tsx
├── hooks/
│   └── useTheme.ts
├── styles/
│   ├── tokens.css               # Design tokens
│   └── tailwind.config.js       # Tailwind preset
└── index.ts                     # Public exports
```

## Design Tokens

```css
/* colors */
--color-safe: #10B981;
--color-warning: #F59E0B;
--color-severe: #EF4444;
--color-background: #0F172A;
--color-surface: #1E293B;
--color-surface-elevated: #334155;
--color-glass: rgba(30, 41, 59, 0.8);
--color-border: rgba(148, 163, 184, 0.2);

/* typography */
--font-display: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* radii */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 9999px;
```

## Components

### GlassCard

```tsx
import { GlassCard } from '@cedar-creek/ui-components';

<GlassCard title="AI Insight" icon={<SparklesIcon />}>
  <p>Burn severity analysis complete.</p>
</GlassCard>
```

### ConfidenceBadge

```tsx
import { ConfidenceBadge } from '@cedar-creek/ui-components';

<ConfidenceBadge value={0.94} /> // Renders "94%" with color coding
```

### StatusIndicator

```tsx
import { StatusIndicator } from '@cedar-creek/ui-components';

<StatusIndicator status="safe" label="Low Severity" />
<StatusIndicator status="warning" label="Moderate" />
<StatusIndicator status="severe" label="Critical" />
```

### LifecycleRail

```tsx
import { LifecycleRail } from '@cedar-creek/ui-components';

<LifecycleRail
  steps={[
    { id: 'impact', label: 'Impact', icon: <FireIcon /> },
    { id: 'damage', label: 'Damage', icon: <MapIcon /> },
    { id: 'timber', label: 'Timber', icon: <TreeIcon /> },
    { id: 'compliance', label: 'Compliance', icon: <ClipboardIcon /> },
  ]}
  activeStep="damage"
  onStepClick={(id) => navigate(id)}
/>
```

## Development

```bash
# Install dependencies
pnpm install

# Start Storybook
pnpm storybook

# Build
pnpm build

# Test
pnpm test
```

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **CSS** | Cascading Style Sheets | Styling language for web pages |
| **KPI** | Key Performance Indicator | Measurable value for success |
| **UI** | User Interface | Visual elements for user interaction |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
