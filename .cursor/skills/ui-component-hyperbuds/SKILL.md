---
name: ui-component-hyperbuds
description: Builds or modifies UI using src/components/ui primitives (Radix wrappers), Tailwind only with src/constants/colors.ts tokens, and accessibility (keyboard, focus, aria). Avoids new dependencies. Use when creating or updating UI components, forms, or layouts in HyperBuds.
---

# UI Component (Radix + Tailwind Tokens)

## When to Use

Use when building or modifying UI in HyperBuds: new components, forms, modals, or layout changes. Ensures Radix primitives, design tokens, and accessibility are applied without adding dependencies.

## Rules

1. **Primitives** — Use components from `src/components/ui` (Radix-wrapped: Button, Card, Dialog, Input, Label, Select, Tabs, etc.). Do not add MUI, Chakra, AntD, or Mantine.
2. **Styling** — Tailwind only. Prefer tokens from `src/constants/colors.ts` (e.g. `brandColors`, `statusColors`, `neutralColors`) instead of hard-coded hex or arbitrary values.
3. **Accessibility** — Keyboard navigation, visible focus states, and appropriate ARIA (labels, roles, live regions where needed). Use semantic HTML.
4. **Dependencies** — Do not introduce new UI or styling libraries.

## Output

- **Component code** — Full or patch for the component.
- **Where to place it** — Path under `src/components/` (e.g. `src/components/<feature>/ComponentName.tsx` or `src/components/ui/` only if it’s a generic primitive).
- **Example usage** — Short snippet showing props and where it’s used (e.g. in a page or parent component).

## Placement

- Feature-specific UI: `src/components/<feature>/`.
- Generic shared UI that fits existing primitives: extend or compose from `src/components/ui`; only add to `src/components/ui` if it’s a new primitive used in multiple features.
- Loading/empty/error: prefer `src/components/common/LoadingStates`, `EmptyStates`, `ErrorStates` instead of one-off markup.

## Tokens (src/constants/colors.ts)

- Use `brandColors.primary.*`, `brandColors.secondary.*`, `brandColors.gradient.*` for brand.
- Use `statusColors.success`, `statusColors.warning`, `statusColors.error` for feedback.
- Use `neutralColors` for backgrounds and text where applicable.
- Apply as Tailwind classes (e.g. `className={brandColors.primary.bg}`).

## Accessibility Checklist

- Focusable controls are keyboard reachable and have visible focus (e.g. `focus-visible:ring-2`).
- Buttons/links have clear labels; icons have `aria-label` or `title` when standalone.
- Forms: label associated with input (Label + id), inline error messages linked with `aria-describedby` when relevant.
- Modals/dialogs: focus trap and return focus on close; use Radix Dialog which handles this.
