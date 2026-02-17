# MVP Deliverables (High-Level)

## Scope and intent

This plan defines the order of MVP delivery at a high level.  
Detailed implementation specs will be written per phase.

## Agreed delivery sequence

1. FE scaffolding and session tracking
2. Backend foundation and basic auth
3. FE auth integrated with backend
4. Session sync between offline-first FE and backend
5. First groups prototype

## Deliverable definitions

## 1) FE scaffolding and session tracking

- Set up mobile-first app foundation.
- Implement core flow: `Session -> Exercise -> Set`.
- Include `Gym -> Machine` context in tracking.
- Work fully offline for local tracking.

Exit check:
- A user can log a complete workout offline with gym and machine context.

## 2) Backend foundation and basic auth

- Stand up backend project and environments.
- Add user model and basic authentication primitives.
- Confirm free-tier-safe baseline architecture.

Exit check:
- Backend can create/authenticate users and store app-owned records.


## 3) FE auth integrated with backend

- Add sign-up/sign-in/sign-out flows in app.
- Persist auth session appropriately on device.
- Gate user-specific backend operations by auth.

Exit check:
- User can authenticate from the app and access only own data.

## 4) Session sync between FE and backend

- Implement offline-first sync contract.
- Push local tracked data when online.
- Handle retries and conflict-safe behavior for MVP.

Exit check:
- Offline sessions reliably sync to backend after reconnect.

## 5) First groups prototype

- Create groups (brotherhood/sisterhood/fellowship concept).
- Add minimal group membership.
- Add first leaderboard slice for shared progress visibility.

Exit check:
- Authenticated users can join/create a group and appear in a basic leaderboard.

## Explicitly deferred after MVP

- Advanced analytics and rich dashboards.
- Complex social mechanics (badges/certifications/advanced notifications).
- Full notification strategy and growth loops.
