# 90s-Inspired UI Redesign

A comprehensive plan to transform the entire application with a 90s aesthetic, featuring fully blocking modal popups, retro typography, and period-accurate styling across all UI components.

## Implementation Plan

# Executive Summary

Redesign the Next.js application UI to 1990s aesthetic across all pages. Implement beveled buttons, limited color palettes, retro typography, and fully blocking modal popups using an existing modal library with custom CSS styling. All existing features (counter, gamification, forestry, authentication) remain functional.

The redesign covers visual styling (fonts, colors, beveled effects), component structure (buttons, dialogs), and popup system (modal management with force-dismiss timeouts). The current technology stack (Next.js, React, Tailwind CSS, Zustand) is maintained.

# Problem Statement & Requirements

**Business Goal:** Redesign the entire application with 90s aesthetic across all UI components using period-accurate styling: beveled buttons, limited color palettes, MS Sans Serif fonts, and animated elements.

**Technical Scope:** Replace Tailwind CSS with 90s-style visual framework. Implement fully-blocking modal popups using an existing library (React Modal, Material-UI, or Radix UI) with custom 90s CSS styling applied on top. Add timeout auto-dismiss mechanism to popups matching authentic 90s UX patterns. Maintain all existing application functionality during presentation layer update.

**Key Requirements:** Complete 90s design treatment (no modern patterns), beveled UI elements, dithered backgrounds, limited 8-bit color palettes, z-index management for fully-blocking modals, auto-dismiss timeout logic for all popups.

# Design & Architecture

Next.js with React and Tailwind CSS. Period-accurate 90s styling: beveled borders, red/green/blue color palettes, chunky shadows. ThemeProvider (React Context) manages theme state via data-theme attribute on :root, persisted to localStorage. Snowflake animations use GPU-accelerated CSS with custom properties (--wind-drift, --rotation). Respects prefers-reduced-motion.

Fully blocking modals with force-dismiss timeout. Custom 90s CSS applied to existing modal library. Fixed z-index stacking at root level. 90s styling applied consistently across entire UI.

# Visual Components & Styling

Colors: Red (#EF4444), lime green (#22C55E), yellow (#F59E0B), dark backgrounds. MS Sans Serif or system monospace typography. Buttons: 2-4px beveled borders (light top/left, dark bottom/right), sharp corners, solid backgrounds from palette, darkened hover states. Modals: fully blocking with opaque dark overlay (50%+ opacity), 4-6px beveled borders, force-dismiss timeout (5-8 seconds) or corner close button. Max 3 simultaneous popups with fixed z-index hierarchy (overlay 100+, modals 101+).

Marquee text horizontal scroll. "Under Construction" banners with animated emoji. Pulsing status indicators. ASCII art and emoji visual separators. Animated GIFs in footer badges. All components use Tailwind CSS with custom CSS variables for theming.

Animations: fade-in/fade-out (200-300ms), no easing. Respects `prefers-reduced-motion` (animations disabled, opacity 0.3). Mobile optimization: reduced font sizes below 768px. GPU acceleration via `transform: translateZ(0)` and `will-change` properties.

# Popup System & Modal Dialogs

## Implementation

Use a mature modal library (React Modal, Material-UI, or Radix UI) with custom 90s CSS styling applied on top. Render modals to a portal outside the main DOM tree to prevent CSS containment issues.

## Blocking Behavior

Popups are fully blocking modals with limited close options. Semi-transparent dark overlay (rgba(0,0,0,0.7)) covers the viewport. Auto-dismiss timeout forces closure after 15 seconds maximum. No click-outside-to-dismiss. No escape key by default. Backdrop click interception prevents background interaction without explicit close functionality.

## Stacking & Z-Index

Base modal z-index: 1000. Each subsequent modal increments by 100 (`baseZ + stackIndex * 100`). Multiple concurrent modals stack vertically with 10px offset (right and down). Active modal receives focus; background modals remain visible but inert. Focus trap prevents tabbing outside active modal.

## Styling

Beveled borders using inset box-shadow (light edge top-left, dark edge bottom-right). MS Sans Serif typography with limited color palette (grays, teals, magentas). Modal border: 3px outer bevel, 1px inner border. Buttons styled with beveled 3D effect and inset shadows.

## Animation

Fade-in (200ms) plus 90% to 100% scale on entry. Fade-out on dismiss. Ease-in-out timing function. Stacked popups animate independently with 100ms stagger delay.

# Data Structures & APIs

**PopupConfig Schema:**
```
{
  id: string (uuid)
  title: string
  content: ReactNode
  isOpen: boolean
  dismissTimeout: number (ms, default 5000)
  isBlocking: boolean (true for full 90s modals)
  zIndex: number (auto-calculated)
  animation: 'bounce' | 'slide' | 'fade'
  closeButton: 'none' | 'force-dismiss'
}
```

Popup queue stores ordered array with UUID keys. Auto-dismiss timer fires on mount. Z-index calculated as base 1000 + position * 100. CSS applies MS Sans Serif equivalent fonts, beveled box-shadow effects, and limited retro color palette.

**RetroModalProps Interface:**
```
{
  isOpen: boolean
  onClose: () => void
  title: string
  content: string | JSX.Element
  isDismissing: boolean
  cssClass: string ('retro-modal-90s')
  autoCloseMs?: number
  isBlockingInteraction: boolean
}
```

Wrap existing modal library with custom 90s CSS theming via BEM naming. Populate via Zustand store for queue management across components.

# Implementation & Rollout

## Phase 1: Modal Library + 90s Styling

Select a mature modal library (React Modal, Radix UI, or Material-UI). Create custom 90s CSS stylesheet with beveled buttons, limited color palettes (reds, greens, yellows), and MS Sans Serif fonts. Implement forced-dismiss timeout behavior with limited close options.

## Phase 2: Component Refactoring

Apply 90s styling to existing components: Counter.tsx, ThemeToggle.tsx, ColorPaletteSwitcher.tsx, VisitorCounter.tsx, LoginForm.tsx, RegisterForm.tsx, TreeIntakeForm.tsx, TreeInventoryTable.tsx, GamificationBadges.tsx, GamificationLeaderboard.tsx. Update page.tsx and layout.tsx. Integrate popups into form submissions and validation errors.

## Phase 3: Modal Stacking & Testing

Implement modal queue system using Zustand. Configure auto-dismiss timeouts for blocking modals. Run visual regression tests across all pages. Validate modal blocking behavior and responsive design on mobile and desktop.

# Testing, Validation & Success Metrics

## Component & Visual Testing

Jest and Testing Library validate component rendering. Tests verify snowflake properties (posX, delay, duration, opacity, scale, rotation, windStrength) match specifications. CSS animations use transform and opacity for GPU acceleration. Tests confirm beveled buttons, color palettes (#22c55e), and retro typography render consistently.

## Modal & Performance Validation

Fully blocking modals (no forced close options) render with correct z-index stacking. Tests verify 300+ snowflakes render without jank on mobile devices. Frame rate targets: 60 FPS desktop, 55+ FPS mobile. Memory usage stays below 50MB per session.

## Browser & Accessibility Standards

Chrome, Firefox, and Safari render consistently. Mobile breakpoint at 768px reduces snowflake count and font size. Prefers-reduced-motion respected. Keyboard navigation unaffected (pointer-events: none). No TypeScript errors. All tests pass before deployment.