---
name: add-feature-hyperbuds
description: Implements a new feature in HyperBuds following repo conventions: API in src/lib/api, types in src/types, React Query hooks in src/hooks/features, UI from src/components/ui and src/constants/colors.ts, loading/empty/error from common components. Use when adding a new feature or when the user asks to implement a feature the HyperBuds way.
---

# Add Feature (HyperBuds Pattern)

## When to Use

Use when implementing a new feature in the HyperBuds app. Ensures API layer, types, hooks, and UI follow existing conventions.

## Implementation Checklist

1. **API** — Add typed function(s) in `src/lib/api/<feature>.api.ts` using `apiClient` from `src/lib/api/client.ts`. Add new base paths to `src/lib/api/endpoints.ts` if needed. Never use `fetch()` directly.
2. **Types** — Add or extend types in `src/types/<feature>.types.ts`. Reuse in API and hooks.
3. **Hooks** — Add React Query hooks in `src/hooks/features/<feature>/` (or a single `use<Feature>.ts`). Use stable query key objects and `queryClient.invalidateQueries` for mutations.
4. **State** — Use Zustand only for truly global UI state; prefer React Query for server state.
5. **UI** — Use primitives from `src/components/ui` and color tokens from `src/constants/colors.ts`. Provide loading, empty, and error UI using `src/components/common/*` (LoadingStates, EmptyStates, ErrorStates) where possible.
6. **Output** — Return a file list, code changes, and how to test.

## File Layout

```
src/lib/api/<feature>.api.ts    # apiClient-based API
src/types/<feature>.types.ts    # request/response types
src/hooks/features/use<Feature>.ts  # query keys + useQuery/useMutation + invalidation
src/components/<feature>/       # feature UI (optional)
```

## Conventions (from .cursor/rules)

- All HTTP via `apiClient` and feature api modules only.
- TanStack React Query v5 for server state; hooks in `src/hooks/features/*`.
- Toasts: react-hot-toast only.
- Tailwind only; prefer `src/constants/colors.ts` tokens.
- Add `"use client"` only where needed (hooks, Zustand, React Query, browser APIs).

## Output Format

1. **Files to change** — List every file to add or modify.
2. **Data flow** — Short description: API → types → hooks → components.
3. **Code changes** — Minimal, strongly typed patches or full files.
4. **How to test** — Exact steps or commands (e.g. run app, hit route, trigger mutation).
