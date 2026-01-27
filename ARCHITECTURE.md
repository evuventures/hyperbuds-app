# HyperBuds App Architecture & Rules

## Purpose
This document defines the app flow, scope, and engineering rules to prevent duplicate components and inconsistent patterns.

## App Flow & Scope
Primary routes live under `src/app`.

- Public entry: `src/app/page.tsx` and `src/app/(public)`
- Auth: `src/app/auth/*`
- Onboarding: `src/app/onboarding`
- Dashboard: `src/app/dashboard`
- Marketplace: `src/app/marketplace/*`
- Collaborations: `src/app/collaborations/*`
- Notifications: `src/app/notifications`
- Messages: `src/app/messages/*`
- Payments: `src/app/payments/*`
- Profile & Settings: `src/app/profile/*`, `src/app/settings/*`
- Streaming & Analytics: `src/app/streaming`, `src/app/analytics`

## State Management
- Global client state: **Redux Toolkit** (single store).
- Server state: **@tanstack/react-query** (queries/mutations, caching, invalidation).
- Local UI state: React `useState` / `useReducer` inside components.
- Disallowed: parallel state stores (e.g., Zustand, Recoil, MobX) for global state.

## Notifications (Toasts)
- Use **react-hot-toast** only.
- Centralize toast helpers in `src/lib/toast` (single wrapper) and import from there.
- Do not mix toast systems (no `sonner` in new code).

## UI Component Policy
- No external UI frameworks: **no MUI, Chakra, AntD, Mantine**.
- Use Tailwind + local components in `src/components`.
- Use Radix primitives only through our own wrappers in `src/components/ui`.
- Before creating a new component, search for an existing one:
  - `rg -n "ComponentName" src/components`

## API Access
- All HTTP calls go through `src/lib/api/*` using the shared `apiClient`.
- No direct `fetch` in components (except Next.js route handlers).
- Keep API request/response typing in `src/types/*`.

## File/Folder Conventions
- Pages: `src/app/**/page.tsx` only.
- Shared UI: `src/components/ui/*`.
- Feature components: `src/components/<feature>/*`.
- Feature hooks: `src/hooks/features/*`.
- API hooks: `src/hooks/features/*` should call `src/lib/api/*` only.
- State: `src/store/*` (Redux Toolkit slices).

## Duplication Rules
- Do not create a new file if a similar component exists.
- Reach out to the administrator if there is need to create a file/folder or use a library for a particular feature
- Prefer extending existing components over creating variants.
- All new shared patterns must be documented here.

## Required Libraries
- Global state: Redux Toolkit.
- Toasts: react-hot-toast.
- Data fetching: @tanstack/react-query.

## Deviation Process
- If you must deviate, open a short PR comment or add a note here explaining the reason.

