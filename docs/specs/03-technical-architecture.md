# Technical Architecture Decisions (High-Level)

## Purpose

Capture only top-level stack decisions for MVP-B.

## Decisions and rationale

1. `Expo + React Native + TypeScript` for frontend.
Reason: fastest path to a phone-first app with one codebase and strong AI-assisted dev support.

2. `Expo Router` for navigation.
Reason: file-based routing keeps app structure simple and easy to scaffold with AI.

3. `SQLite (on-device) + Drizzle ORM` for local data.
Reason: reliable offline-first tracking with typed schema and migrations.

4. `Supabase (Postgres + Auth + RLS)` for backend.
Reason: strong free tier and quick setup for auth + cloud storage without custom backend overhead.

5. `Offline-first sync via client outbox pattern`.
Reason: guarantees logging works without internet while still supporting cloud sync later.

6. `Architecture prepared for groups later`.
Reason: MVP-B ships tracker first, but schema/contracts should avoid rework for social features.
