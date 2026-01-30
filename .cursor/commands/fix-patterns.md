# fix-patterns

Audit the touched code for HyperBuds conventions:

- no direct fetch in components (unless documented)
- React Query hooks exist for server state
- Zustand only for global state
- types in src/types
- react-hot-toast only
- tokens from src/constants/colors.ts
  Then propose a small refactor plan and apply minimal safe fixes.
  This command will be available in chat with /fix-patterns
