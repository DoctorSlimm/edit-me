# Real-time Collaboration Tool

A platform enabling simultaneous document editing and live commenting for small-scale teams, integrating PostgreSQL for data persistence and OAuth 2.0 for authentication.

## Implementation Plan

# Executive Summary

Real-time collaboration tool enabling simultaneous document editing and live commenting. Stack: Next.js 16, React 19, Tailwind CSS frontend with PostgreSQL backend via Supabase. OAuth 2.0 authentication via Auth0/Okta. Target: 100-1,000 active users initially.

PostgreSQL ensures transactional integrity across concurrent edits. OAuth integration removes authentication overhead.

# Problem Statement and Requirements

## Problem
Real-time document editing requires instant synchronization across concurrent users without context switching between edits and feedback.

## Requirements
**Functional**: Multi-user document editing (sub-second sync), live commenting tied to document sections, OAuth 2.0 authentication, session recovery, conflict resolution for simultaneous edits.

**Non-Functional**: PostgreSQL persistence, support for 100-1,000 active users, 200ms max round-trip latency, ACID compliance, token validation, row-level access control.

**Success Criteria**: Two users see edits within 500ms. Comments persist after 10,000+ operations. Failed authentication on token expiry. Document recovery after 5-minute disconnection. Zero data loss during concurrent edits.

# System Architecture and Design

## Core Architecture

Frontend: Next.js with React, TypeScript, Tailwind CSS. Real-time updates via Supabase WebSocket subscriptions. Backend: PostgreSQL database, server-side API endpoints on Next.js. Authentication: OAuth 2.0 (Auth0/Okta) with token validation on protected routes. Deployment: Vercel serverless infrastructure auto-scales for 100-1,000 concurrent users.

## Data Flow

Mutations trigger API endpoints that execute PostgreSQL transactions. Supabase subscriptions stream changes to connected clients. WebSocket connections persist during active sessions and close on inactivity.

# Data Structures, Interfaces, and APIs

## Database Schema (PostgreSQL)

**Users**: id (UUID), email, oauth_id, created_at.
**Documents**: id (UUID), title, content, version (int), owner_id, created_at.
**Edits**: id (UUID), document_id, user_id, type (insert|delete|replace), position, content, timestamp, sequence.
**Comments**: id (UUID), document_id, user_id, text, position, thread_id, created_at.
**Permissions**: user_id, document_id, role (viewer|editor|owner).

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/documents | POST | OAuth | Create document. Body: `{title, content}`. Returns document object. |
| /api/documents/:id | GET | OAuth | Fetch document. Returns current content, version, owner, active editors. |
| /api/documents/:id | PATCH | OAuth | Update content. Body: `{content, version}`. Version must match server for conflict detection. |
| /api/documents/:id/comments | POST | OAuth | Add comment. Body: `{text, position, userId}`. |
| /api/documents/:id/comments | GET | OAuth | List comments. Returns array grouped by position. |
| /api/documents/:id/edits | GET | OAuth | Fetch edit history. Query: `?limit=100&offset=0`. |
| /api/documents/:id | DELETE | OAuth | Remove document (owner only). Cascade deletes comments and edits. |
| /api/documents/:id/share | POST | OAuth | Grant access. Body: `{userId, role}`. |

## WebSocket Messages

Connect: `ws://[domain]/socket` after OAuth auth.
Subscribe: `{type: "subscribe", documentId, userId}`
Edit broadcast: `{type: "edit", userId, content, position, version, timestamp}`
Presence: `{type: "presence", userId, action: "join"|"leave", role}`
Conflict: `{type: "conflict", version, clientVersion, operation}`
Ack: `{type: "ack", messageId}`

## Authentication & Database

OAuth 2.0 redirect flow via Auth0/Okta. Bearer token in `Authorization` header. Supabase PostgreSQL via connection string. Row-level security policies enforce permissions.

# Component Interactions and Workflows

## Authentication & Real-Time Sync

OAuth 2.0 validates user identity via Auth0/Okta. Client WebSocket connects after authentication, receives current document state from PostgreSQL, and subscribes to updates. Changes from any client broadcast to all connected clients via WebSocket.

## Change Persistence

Client modifications update local state immediately (optimistic). Server validates against PostgreSQL on receipt. Valid changes persist to database; invalid changes trigger conflict resolution using timestamp-based last-write-wins. Acknowledgment sent to originating client.

## Offline & Reconnection

Disconnected clients queue changes locally. On reconnection, queued changes sync to server and merged with any concurrent edits from other clients. Server returns final merged state.

# Constraints, Dependencies, and Integration Points

**Stack:** Next.js 16.0.8, React 19.2.1, TypeScript 5, Tailwind CSS 4. Supabase (@supabase/supabase-js@2.87.0) for real-time subscriptions; PostgreSQL for data persistence. OAuth 2.0 (Auth0/Okta) required for authentication—no custom auth. NEXT_PUBLIC_API_URL environment variable routes API calls (localhost:3000 dev, https://sourcewizard.ai prod).

**Operational:** Node.js runtime (Vercel, self-hosted). Target: 100–1,000 concurrent users with modest linear growth. Real-time updates must propagate <500ms. Supabase rate limiting applies. OAuth token refresh happens transparently.

**No compliance requirements (HIPAA, GDPR, PCI-DSS) identified.**

# Edge Cases, Failure Modes, and Risk Mitigation

## Real-Time Synchronization & Network Failures

Concurrent edits create race conditions when network latency separates updates. WebSocket disconnections leave clients with stale data. PostgreSQL transaction conflicts occur when users submit conflicting changes simultaneously. Mitigation: implement operational transformation (OT) or CRDT for conflict resolution with sequence numbers. Use PostgreSQL advisory locks for critical sections. Establish 30-second reconnection timeouts with automatic state reconciliation on reconnect.

## Authentication & Token Management

OAuth token expiration breaks active sessions during editing. Token refresh windows create brief periods where stale tokens serve requests. If Auth0/Okta becomes unreachable, database-level permission checks fail silently. Mitigation: synchronize token refresh using 5-minute buffer windows before expiry. Implement local permission caching with 15-minute TTL and database row-level security policies. Add circuit breaker for identity provider calls with cached permission fallback.

## Data Persistence & Recovery

PostgreSQL commits fail mid-transaction during rapid consecutive saves, causing data loss. Server crashes between receiving edits and persistence result in unrecoverable changes. Mitigation: enable write-ahead logging (WAL) with synchronous replication. Batch edits into 5-second windows before commit to reduce transaction volume. Store in-flight edits in Redis with 24-hour expiration as backup.

# Testing, Validation, and Measurement

## Test Coverage and Performance

Unit tests cover document editing, cursor tracking, OAuth integration, and PostgreSQL transactions with 80% minimum code coverage. Integration tests verify real-time synchronization, conflict resolution, and <100ms latency. End-to-end tests validate 2-5 concurrent users editing without data loss. Performance benchmarks: <100ms P95 sync latency, <50MB memory per user, 50 simultaneous edits/second.

## Validation Metrics and Launch Criteria

Functional validation: document edits persist to PostgreSQL, presence updates <500ms, transparent token refresh. Track daily active users, edit operations per session, sync failure rates, and authentication errors. Launch requires all tests passing, OAuth tested with real credentials, 5-user concurrent editing for 30+ minutes without errors, and 100-user stress test for 2 hours.