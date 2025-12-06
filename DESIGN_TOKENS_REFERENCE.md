# Design Tokens Quick Reference

Quick lookup for all design tokens and standard patterns in SKiTCH Controller.

---

## Colors

### Semantic Colors

```css
/* Primary - Blue (Actions, Branding) */
--color-primary: #2563eb;        /* blue-600 */
--color-primary-light: #3b82f6;  /* blue-500 */
--color-primary-dark: #1d4ed8;   /* blue-700 */

/* Secondary - Slate (Secondary actions) */
--color-secondary: #64748b;      /* slate-600 */
--color-secondary-light: #94a3b8; /* slate-400 */

/* Success - Green (Complete, Good) */
--color-success: #16a34a;        /* green-600 */
--color-success-bg: #dcfce7;     /* green-100 */

/* Warning - Amber (Wait, Caution) */
--color-warning: #d97706;        /* amber-600 */
--color-warning-bg: #fef3c7;     /* amber-100 */

/* Danger - Red (Errors, Destructive) */
--color-danger: #dc2626;         /* red-600 */
--color-danger-bg: #fee2e2;      /* red-100 */

/* Info - Cyan (Active, Information) */
--color-info: #0891b2;           /* cyan-600 */
--color-info-bg: #cffafe;        /* cyan-100 */

/* Neutral - Gray (Text, Borders) */
--color-neutral-50: #f9fafb;     /* gray-50 - Subtle BG */
--color-neutral-100: #f3f4f6;    /* gray-100 - Card BG */
--color-neutral-200: #e5e7eb;    /* gray-200 - Borders */
--color-neutral-300: #d1d5db;    /* gray-300 - Disabled BG */
--color-neutral-600: #4b5563;    /* gray-600 - Secondary text */
--color-neutral-900: #111827;    /* gray-900 - Primary text */
```

### Usage Guide

| Token | Use For | Example |
|-------|---------|---------|
| `primary` | Main actions, links, current state | Connect, Upload, Start buttons |
| `secondary` | Less important actions | Mask Trace, secondary buttons |
| `success` | Completed states, positive feedback | Sewing complete, upload success |
| `warning` | Waiting states, cautions | Color change wait, pause |
| `danger` | Errors, destructive actions | Delete, disconnect, errors |
| `info` | Active states, information | Sewing in progress, informational messages |
| `neutral-900` | Primary text | Headings, body text |
| `neutral-600` | Secondary text | Labels, helper text |
| `neutral-300` | Borders, disabled states | Card borders, disabled buttons |
| `neutral-100` | Backgrounds | Card backgrounds |
| `neutral-50` | Subtle backgrounds | Component backgrounds |

---

## Typography

### Text Sizes

```tsx
// Headings
h1: "text-2xl font-bold text-neutral-900"        // 24px - Main title
h2: "text-xl font-semibold text-neutral-900"     // 20px - Section titles
h3: "text-base font-semibold text-neutral-900"   // 16px - Subsections
h4: "text-sm font-semibold text-neutral-700"     // 14px - Small headings

// Body Text
text-base: 16px    // Large body text, important info
text-sm: 14px      // Standard body text (MINIMUM)
text-xs: 12px      // Small text, captions
text-[11px]: 11px  // Very small (use sparingly)

// Line Heights
leading-tight: 1.25    // Headings
leading-normal: 1.5    // Body text
leading-relaxed: 1.625 // Comfortable reading
```

### Font Weights

```tsx
font-normal: 400    // Regular text
font-medium: 500    // Emphasis
font-semibold: 600  // Headings, labels
font-bold: 700      // Main headings, important
```

### Usage Examples

```tsx
// Page title
<h1 className="text-2xl font-bold text-neutral-900">SKiTCH Controller</h1>

// Section header
<h2 className="text-xl font-semibold text-neutral-900">Pattern Preview</h2>

// Subsection
<h3 className="text-base font-semibold text-neutral-900">Pattern Information</h3>

// Small heading
<h4 className="text-sm font-semibold text-neutral-700">Color Blocks</h4>

// Body text
<p className="text-sm text-neutral-700 leading-normal">Description text...</p>

// Label
<span className="text-xs font-medium text-neutral-600 uppercase tracking-wide">File Name</span>

// Value
<span className="text-sm font-semibold text-neutral-900">pattern.pes</span>
```

---

## Spacing

### Padding Scale

```tsx
p-2: 0.5rem (8px)   // Tight
p-3: 0.75rem (12px) // Compact
p-4: 1rem (16px)    // Standard
p-5: 1.25rem (20px) // Comfortable
p-6: 1.5rem (24px)  // Spacious
p-8: 2rem (32px)    // Very spacious
```

### Gap Scale

```tsx
gap-1: 0.25rem (4px)  // Very tight
gap-2: 0.5rem (8px)   // Tight grouping
gap-3: 0.75rem (12px) // Related items
gap-4: 1rem (16px)    // Section spacing
gap-6: 1.5rem (24px)  // Major sections
gap-8: 2rem (32px)    // Large gaps
```

### Margin Scale

```tsx
mb-2: 0.5rem (8px)   // Tight
mb-3: 0.75rem (12px) // Compact
mb-4: 1rem (16px)    // Standard
mb-5: 1.25rem (20px) // Comfortable
mb-6: 1.5rem (24px)  // Spacious
mb-8: 2rem (32px)    // Large gap
```

### Standard Component Spacing

```tsx
// Card padding
"p-6"           // Standard card (24px)
"p-5"           // Compact card (20px)
"p-4"           // Small card (16px)

// Content stacking
"space-y-2"     // Tight grouping (8px)
"space-y-3"     // Related items (12px)
"space-y-4"     // Section spacing (16px)
"space-y-6"     // Major sections (24px)

// Grid gaps
"gap-3"         // Tight grid (12px)
"gap-4"         // Standard grid (16px)
"gap-6"         // Spacious grid (24px)
```

---

## Buttons

### Primary Button (Main Actions)

```tsx
className="
  px-6 py-3
  bg-primary text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-primary-light hover:shadow-md hover:scale-[1.02]
  active:bg-primary-dark active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none
  transition-all duration-150 ease-in-out
  cursor-pointer
"
```

**Use for:** Connect, Upload, Start Sewing, Resume

---

### Secondary Button (Less Important Actions)

```tsx
className="
  px-6 py-3
  bg-white text-neutral-700 border border-neutral-300
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-neutral-50 hover:border-neutral-400
  active:bg-neutral-100 active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2
  disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
  transition-all duration-150
  cursor-pointer
"
```

**Use for:** Mask Trace, Refresh, Cancel

---

### Danger Button (Destructive Actions)

```tsx
className="
  px-6 py-3
  bg-danger text-white
  rounded-lg font-semibold text-sm
  shadow-sm
  hover:bg-red-700 hover:shadow-md
  active:bg-red-800 active:scale-[0.98]
  focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2
  disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:shadow-none
  transition-all duration-150
  cursor-pointer
"
```

**Use for:** Delete, Disconnect

---

### Icon Button (Zoom, Controls)

```tsx
className="
  w-10 h-10
  flex items-center justify-center
  bg-white border border-neutral-300
  rounded-lg
  text-neutral-700
  hover:bg-primary hover:text-white hover:border-primary
  active:bg-primary-dark active:scale-95
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-all duration-150
  cursor-pointer
"
aria-label="Descriptive label"
```

**Use for:** Zoom in/out/reset, small controls

---

## Cards & Containers

### Standard Card

```tsx
<div className="bg-white p-6 rounded-lg shadow-md border border-neutral-100">
  <div className="mb-5 pb-3 border-b border-neutral-200">
    <h2 className="text-xl font-bold text-neutral-900">Title</h2>
  </div>
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>
```

---

### Compact Card

```tsx
<div className="bg-white p-5 rounded-lg shadow-md border border-neutral-100">
  {/* Content */}
</div>
```

---

### Info Card (Small)

```tsx
<div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
  <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
    Label
  </div>
  <div className="font-semibold text-sm text-neutral-900">
    Value
  </div>
</div>
```

---

## Alert Boxes

### Info Alert

```tsx
<div className="bg-info-bg border-l-4 border-info p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <InformationCircleIcon className="w-6 h-6 text-info flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-cyan-900 mb-1">Title</h4>
      <p className="text-sm text-cyan-800">Message</p>
    </div>
  </div>
</div>
```

---

### Success Alert

```tsx
<div className="bg-success-bg border-l-4 border-success p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <CheckCircleIcon className="w-6 h-6 text-success flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-green-900 mb-1">Title</h4>
      <p className="text-sm text-green-800">Message</p>
    </div>
  </div>
</div>
```

---

### Warning Alert

```tsx
<div className="bg-warning-bg border-l-4 border-warning p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <ExclamationTriangleIcon className="w-6 h-6 text-warning flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-amber-900 mb-1">Title</h4>
      <p className="text-sm text-amber-800">Message</p>
    </div>
  </div>
</div>
```

---

### Error Alert

```tsx
<div className="bg-danger-bg border-l-4 border-danger p-4 rounded-lg">
  <div className="flex items-start gap-3">
    <XCircleIcon className="w-6 h-6 text-danger flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-red-900 mb-1">Title</h4>
      <p className="text-sm text-red-800">Message</p>
    </div>
  </div>
</div>
```

---

## Progress Bars

### Standard Progress Bar

```tsx
<div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
  <div
    className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 ease-out relative overflow-hidden"
    style={{ width: `${progress}%` }}
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Progress description"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
  </div>
</div>
```

---

### Block Progress Bar (Smaller)

```tsx
<div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-primary transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>
```

---

## Status Badges

### Status Badge Template

```tsx
<span className={`
  inline-flex items-center gap-2
  px-3.5 py-2
  rounded-lg
  font-semibold text-sm
  border border-current/20
  ${statusColor}
`}>
  <span className="text-base leading-none">{icon}</span>
  <span>{text}</span>
</span>
```

### Status Color Classes

```tsx
const statusColors = {
  idle: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  active: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  complete: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};
```

---

## Overlays (Canvas)

### Standard Overlay

```tsx
<div className="absolute top-3 left-3 bg-white/98 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-neutral-200 z-10">
  {/* Content */}
</div>
```

---

## Data Grids

### Info Grid (2×2)

```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
    <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
      Label
    </div>
    <div className="font-semibold text-sm text-neutral-900">
      Value
    </div>
  </div>
  {/* Repeat for other cells */}
</div>
```

---

### Key-Value Rows

```tsx
<div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-neutral-600">Label:</span>
    <span className="text-base font-bold text-neutral-900">Value</span>
  </div>
  {/* Repeat for other rows */}
</div>
```

---

## Icons

### Size Scale

```tsx
w-4 h-4: 16px   // Small icons (in buttons)
w-5 h-5: 20px   // Standard icons
w-6 h-6: 24px   // Medium icons (alerts)
w-8 h-8: 32px   // Large icons (status)
w-10 h-10: 40px // Very large (main features)
```

### Usage

```tsx
// In buttons
<PlayIcon className="w-4 h-4" />

// In alerts
<InformationCircleIcon className="w-6 h-6 text-info" />

// In headers
<CheckCircleIcon className="w-8 h-8 text-success" />
```

---

## Border Radius

```tsx
rounded: 4px      // Subtle (rarely used)
rounded-md: 6px   // Small elements
rounded-lg: 8px   // Standard (buttons, cards)
rounded-xl: 12px  // Large elements (overlays)
rounded-full: 9999px // Pills, circles
```

---

## Shadows

```tsx
shadow-sm: Small shadow        // Buttons, cards
shadow-md: Medium shadow       // Hover states
shadow-lg: Large shadow        // Overlays, modals
shadow-inner: Inset shadow     // Progress bar tracks

// With color
shadow-primary/10: Colored shadow (10% opacity)
shadow-primary/20: Stronger colored shadow
shadow-primary/30: Prominent colored shadow
```

---

## Transitions

```tsx
// Standard transition
transition-all duration-150 ease-in-out

// Specific properties
transition-colors duration-150
transition-transform duration-150
transition-opacity duration-300

// Easing
ease-in-out  // Standard
ease-out     // Decelerate
ease-in      // Accelerate
```

---

## Accessibility Attributes

### Buttons

```tsx
aria-label="Descriptive action"    // For icon buttons
title="Tooltip text"                // For hover tooltips
disabled={condition}                // Properly disabled
```

### Progress Bars

```tsx
role="progressbar"
aria-valuenow={currentValue}
aria-valuemin={0}
aria-valuemax={100}
aria-label="What's progressing"
```

### Interactive Elements

```tsx
focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
tabIndex={0}                        // If not naturally focusable
```

---

## Touch Targets

### Minimum Sizes

```tsx
// Buttons: 44×44px minimum
min-w-[44px] min-h-[44px]

// Icon buttons: Use w-10 h-10 (40px) as minimum
w-10 h-10  // Close to 44px with padding
```

---

## Responsive Breakpoints

```tsx
sm: 640px   // Small devices
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large screens
```

### Usage

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Show/hide by breakpoint
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

---

## Copy-Paste Snippets

### Section Header
```tsx
<div className="mb-5 pb-3 border-b border-neutral-200">
  <h2 className="text-xl font-bold text-neutral-900">Section Title</h2>
</div>
```

### Stat Card
```tsx
<div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
  <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
    Label
  </div>
  <div className="font-semibold text-sm text-neutral-900">
    Value
  </div>
</div>
```

### Loading Spinner
```tsx
<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
```

---

## Quick Reference Table

| Element | Padding | Radius | Shadow | Border |
|---------|---------|--------|--------|--------|
| **Button** | px-6 py-3 | rounded-lg | shadow-sm | - |
| **Card** | p-6 | rounded-lg | shadow-md | border-neutral-100 |
| **Overlay** | p-4 | rounded-xl | shadow-lg | border-neutral-200 |
| **Alert** | p-4 | rounded-lg | - | border-l-4 |
| **Badge** | px-3.5 py-2 | rounded-lg | - | border-current/20 |
| **Stat Card** | p-3 | rounded-lg | shadow-sm | border-neutral-200 |

---

**Quick reference for SKiTCH Controller design system**
**Use with:** All component files
**Created:** 2025-12-06
