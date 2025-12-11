# Video Functionality Removal Plan

This plan outlines the steps to remove video functionality from the system, including the deletion of components, APIs, and third-party integrations, with a focus on a single-release deployment strategy.

## Implementation Plan

# Executive Summary

## Video Functionality Removal

Remove DraggableVideoWidget component from codebase via hard deletion in a single release. No backward compatibility. Third-party integrations (YouTube embed) deprovisioned immediately.

**Scope:**
- DraggableVideoWidget.tsx component and YouTube URL parsing
- localStorage positioning system
- Video widget reference in /app/page.tsx
- No database records affected; no external CDN dependencies

**Deployment:**
Big-bang release to all users simultaneously. Zero incremental rollout.

# Problem Statement & Objectives

## Current State
DraggableVideoWidget.tsx contains YouTube iframe embedding with drag functionality and localStorage position persistence. The component is imported and rendered in page.tsx. External video services include AWS S3, Google Cloud Storage, Cloudinary, Mux.

## Problems to Solve
Video functionality adds maintenance overhead and code complexity without core business value. Removing it eliminates unused dependencies, simplifies component architecture, and removes iframe handling logic.

## Implementation Objectives
- Hard delete all video data, files, and database records
- Remove DraggableVideoWidget component and all video-related imports/localStorage keys from codebase
- Deprovision third-party video services (AWS S3, Google Cloud Storage, Cloudinary, Mux)
- Deploy in single release to all users simultaneously

# Scope & Constraints

## Included

**Component deletion:** Remove `DraggableVideoWidget` from `/app/components/` and its import from `app/page.tsx`. Delete YouTube iframe embedding functionality, localStorage position persistence, and related CSS z-index declarations.

**Third-party service deprovisioning:** End YouTube embedded iframe delivery. No other video services (AWS S3, Google Cloud Storage, Cloudinary, Mux, CDN) are integrated per package.json analysis.

**Single release deployment:** All users simultaneously. No phased rollout, feature flags, or deprecation period.

## Excluded

**Database operations:** No video tables exist. Hard deletion does not apply.

**API endpoints:** No `/api/videos/*` endpoints exist to remove.

**Dependencies:** No video-related npm packages in package.json.

**Configuration:** No environment variables for video services detected.

## Constraints

**Resource:** Single file deletion with one import removal. No database migration tooling needed.

**Technical:** Browser localStorage cleanup handled client-side. Component is self-contained with no downstream dependencies.

**Temporal:** Single release deployment. No monitoring period required.

# System Architecture & Components

## Current Video Architecture

The system contains a single video component: `DraggableVideoWidget` at `/app/components/DraggableVideoWidget.tsx` embedded in `/app/page.tsx`. The component renders YouTube videos via iframe (src: `https://www.youtube.com/embed/{videoId}`), extracting IDs via regex from URLs. Position state persists in browser localStorage (`videoWidgetPosition` key). The component uses fixed positioning (zIndex: 9999) with drag handlers (mouseDown, mouseMove, mouseUp) to enable repositioning.

## Removal Scope

Delete `DraggableVideoWidget.tsx`, remove its import from `/app/page.tsx`, and eliminate the localStorage key `videoWidgetPosition`. No external video services are integrated—YouTube embed is the only video infrastructure.

# Technical Design & Implementation Plan

## Frontend & Component Removal

Delete `DraggableVideoWidget.tsx` from `/app/components/`. Remove import from `app/page.tsx` (line 11). Clear `videoWidgetPosition` from localStorage. No video-specific npm packages exist in dependencies.

## Database & Third-Party Cleanup

Hard delete all video records. Deprovision third-party services: AWS S3, Google Cloud Storage, Cloudinary, and Mux buckets. Revoke API credentials. Remove service configuration from environment files.

## Deployment

Big-bang release: Remove all video functionality simultaneously across all users.

# Data Structures & API Changes

**Component Removal:** Delete `DraggableVideoWidget.tsx` and its import from `app/page.tsx` (line 11, instantiation line 184). Remove YouTube iframe embedding (video ID: `Yy6fByUmPuE`) and URL parsing logic.

**Client Storage:** Clear `videoWidgetPosition` localStorage key. No server-side migration required. Post-deployment, the key becomes orphaned on next page load.

**External Services:** No AWS S3, Google Cloud Storage, Cloudinary, or Mux integrations exist for this feature. No API keys or CDN configurations to deprovision.

**Deployment:** Hard delete all video references in single release; no backward compatibility layer.

# Testing & Validation Strategy

**Component and import removal.** Delete `/app/components/DraggableVideoWidget.tsx` and remove import from `/app/page.tsx` (line 11). Run Jest to verify no broken dependencies.

**API and storage cleanup.** Verify counter, gamification, trees, and visitor-counter endpoints return unchanged responses. Remove `videoWidgetPosition` key from localStorage. Confirm theme preferences and color palette data persist independently.

**Regression testing.** Build application and verify homepage loads without errors. Confirm SnowflakeContainer, Counter, VisitorCounter, ThemeToggle, ColorPaletteSwitcher, and ChatWoot render correctly. Validate Supabase schemas contain no orphaned video references and game profiles, visitor counts, and palette data remain intact.

# Deployment & Risk Mitigation

Single release removes all video functionality for all users simultaneously. Delete DraggableVideoWidget component from `/app/components/`, remove YouTube iframe and embed URL parsing, clear videoWidgetPosition from localStorage on load, and deprecate video-related API endpoints. Disable third-party credentials (AWS S3, Google Cloud Storage, Cloudinary, Mux) before deployment.

Codebase scan for "video", "youtube", "embed", "mux", "cloudinary" to catch legacy code patterns. Deploy localStorage cleanup to remove videoWidgetPosition keys with error handling for undefined references. Disable third-party API keys and remove configuration variables.

Monitor for 404 errors on removed endpoints, client-side console errors referencing DraggableVideoWidget, and confirm localStorage cleanup completes without errors across browsers. Validate no user sessions reference deprecated video props.