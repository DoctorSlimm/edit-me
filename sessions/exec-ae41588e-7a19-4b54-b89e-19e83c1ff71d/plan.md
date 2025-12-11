# Draggable Video Widget Implementation

This plan outlines the implementation of a draggable video widget that allows users to watch a YouTube video as a floating overlay across an application, with the position saved in localStorage for persistence across page navigation.

## Implementation Plan

# Draggable Video Widget Implementation

## Executive Summary

A draggable video widget displays a YouTube video (https://www.youtube.com/watch?v=Yy6fByUmPuE) as a floating overlay across the app. Users drag the widget anywhere on screen without constraints. The widget persists across page navigation with position stored in localStorage.

The widget uses YouTube's native embed with standard controls only and fixed size. Designed for single-user or demo environments.

## Problem Statement and Requirements

Build a draggable video widget that plays https://www.youtube.com/watch?v=Yy6fByUmPuE. The widget floats on the screen, stores its position in localStorage, and restores that position on page load or browser refresh.

### Core Requirements

- YouTube iframe embed with native player controls only.
- Widget draggable anywhere on screen without boundaries.
- Position persisted to localStorage and restored on load.
- Fixed widget dimensions, no resizing.
- Single-user session scope—position stored locally only.

## Component Architecture and Design

DraggableVideoWidget is a React component rendering a fixed-position overlay with YouTube iframe embed. Position state (x, y coordinates) persists to localStorage on drag completion. The component mounts at app root and renders above all content via z-index layering.

Drag handling attaches mousedown, mousemove, and mouseup listeners to the container. Position updates calculate offset between initial click and cursor movement. No external library required. Widget dragging is unconstrained—moves freely within viewport. localStorage saves position immediately after drag.

Stack: React (useState, useEffect, useRef), YouTube iframe, localStorage, CSS (position: fixed), vanilla JavaScript event handlers.

## Data Structures and APIs

### Component Props

```typescript
interface DraggableVideoWidgetProps {
  videoUrl: string;  // "https://www.youtube.com/watch?v=Yy6fByUmPuE"
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}
```

### State & Persistence

Position stored in localStorage under `videoWidgetPosition` as `{x: number; y: number}`. State persists across page navigation and browser sessions.

### YouTube Embed

Fixed 560×315px iframe embedding YouTube video via `https://www.youtube.com/embed/{VIDEO_ID}` with native controls only. Fullscreen attribute enabled.

### Drag Interactions

Position calculated using absolute screen coordinates without viewport constraints. Drag end persists position to localStorage and triggers `onPositionChange` callback.

## Interaction Flow and Behavior

The widget mounts as a floating overlay with `position: fixed` and `z-index: 9999`. On load, it retrieves saved position from localStorage. If no position exists, it defaults to bottom-right. The YouTube embed at `https://www.youtube.com/embed/Yy6fByUmPuE` loads with native YouTube controls only.

Users drag the widget anywhere on the screen without boundary constraints using react-grab. On drag completion, coordinates save to localStorage. Subsequent page navigation restores the widget to the saved position automatically.

The widget has fixed size and no resize capability. Standard YouTube controls (play, pause, volume, fullscreen) are the only interactive elements.

## External System Integrations

Embeds YouTube video `Yy6fByUmPuE` via `<iframe src="https://www.youtube.com/embed/Yy6fByUmPuE" />`. Uses native YouTube controls (play, pause, volume, fullscreen). Fixed size, draggable anywhere on screen via react-grab. Position stored in localStorage. No API keys required. CORS not applicable to iframe embeds. Video availability depends on YouTube servers.

## Edge Cases, Constraints, and Risk Management

**Positioning Constraints:** Widget can be dragged anywhere on screen without boundaries. Resizing viewport or multi-monitor setups may position widget off-screen since only localStorage saves coordinates—no recovery mechanism exists. localStorage is cleared by cache wipes or private browsing, and fails silently if quota is exceeded.

**YouTube Embed Limitations:** Embedded video (https://www.youtube.com/watch?v=Yy6fByUmPuE) uses fixed size with native controls only. Video unavailability (deletion, private status, regional restriction, copyright claims) breaks playback. Controls may be cut off on mobile due to fixed iframe dimensions.

**Session Scope:** Position syncs only within current browser session via localStorage. No cross-tab, cross-device, or user sync.

## Testing, Validation, and Success Metrics

Verify YouTube embed (https://www.youtube.com/watch?v=Yy6fByUmPuE) loads with native controls functional. Test localStorage persistence: close browser, reopen, confirm widget position loads at saved coordinates. Validate drag operations work unconstrained across entire viewport without overflow.

Unit tests verify drag events update position state and trigger localStorage writes. Integration tests confirm YouTube IFrame API initializes and play/pause controls work. Widget loads on page navigation with position restored from localStorage. Drag operations update position immediately. No console errors during drag or localStorage operations.