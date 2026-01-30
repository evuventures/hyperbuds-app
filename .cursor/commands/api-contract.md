# api-contract

Given an endpoint (method + path + body + response), generate:

- endpoints.ts entry
- typed api function in correct src/lib/api module
- types in src/types
- React Query hooks with correct query keys and invalidation
  This command will be available in chat with /api-contract
