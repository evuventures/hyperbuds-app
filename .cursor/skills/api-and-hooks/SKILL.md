---
name: api-and-hooks
description: Given an endpoint spec, creates a typed API module in src/lib/api, types in src/types, and React Query hooks in src/hooks/features with query keys and invalidation. Includes error normalization and react-hot-toast usage. Use when adding a new API integration, endpoint, or when the user provides an endpoint specification.
---

# Create API Module + React Query Hooks

## When to Use

Use when given an endpoint spec (path, method, request/response shape) to add a new API integration. Produces API module, types, and hooks in one pass.

## Deliverables

1. **Typed API function** in `src/lib/api/<feature>.api.ts` using `apiClient` from `src/lib/api/client.ts`.
2. **Types** in `src/types/<feature>.types.ts` (request/response DTOs).
3. **React Query hooks** in `src/hooks/features/<feature>/use<Feature>.ts` with stable query keys and invalidation.

Include error normalization and react-hot-toast patterns used in the repo.

## API Module Pattern

- Import: `import { apiClient } from './client';`
- Optional: add path constant to `src/lib/api/endpoints.ts` (e.g. `API_ENDPOINTS.<feature>`).
- Export typed functions that return `response.data`; use `apiClient.get<T>()`, `apiClient.post<T>()`, etc. with explicit generic where helpful.
- Do not use `fetch()`; use `apiClient` only.

## Types

- Put request/response interfaces in `src/types/<feature>.types.ts`.
- Import and use in the api module and in hooks.
- Name clearly: e.g. `GetXResponse`, `CreateXRequest`, `UpdateXResponse`.

## React Query Hooks

- **Query keys**: Define a stable key factory, e.g. `const FEATURE_KEYS = { all: ['feature'] as const, list: () => [...FEATURE_KEYS.all, 'list'] as const };`
- **Queries**: `useQuery({ queryKey: FEATURE_KEYS.list(), queryFn: () => featureApi.getList(), ... })`
- **Mutations**: `useMutation({ mutationFn: featureApi.create, onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURE_KEYS.all }), ... })`
- **Error handling**: In mutation `onError`, show user-facing message (from `error instanceof Error ? error.message : 'An error occurred'` or API error shape).
- **Toasts**: Use react-hot-toast only (e.g. `toast.success(...)`, `toast.error(...)`). Do not introduce sonner or other toast libs.

## Error Normalization

- API errors are often Axios errors; extract message from `error.response?.data?.message` or `error.message`.
- In hooks, normalize before passing to toast or UI. Reuse any existing `api.types.ts` or error type from the codebase if present.

## Repo Conventions

- Hooks may use `useToast` from `@/hooks/ui/useToast` in some places; the project rule is react-hot-toast only—prefer `import toast from 'react-hot-toast'` for new code unless the file already uses `useToast` consistently.
- Invalidation: invalidate the minimal set (e.g. `['profile']`, `FEATURE_KEYS.list()`) to avoid over-fetching.
