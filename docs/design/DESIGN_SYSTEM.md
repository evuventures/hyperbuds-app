# HyperBuds design system — incremental specification

Status: IN_PROGRESS. Existing palette and logo retained.

| Role | Value / treatment |
| --- | --- |
| Primary identity | `#a855f7` |
| Secondary identity | `#6366f1` |
| Accent | `#3b82f6` |
| Primary action | `#7e22ce` (existing purple family, darker for white-label contrast) |
| Primary hover | `#6b21a8` |
| Primary subtle | `#faf5ff` |
| Light canvas / surface | `#f9fafb` / `#ffffff` |
| Dark canvas / surface | `#111827` / `#1f2937` |
| Text light / muted | `#171717` / `#4b5563` |
| Text dark / muted | `#f9fafb` / `#d1d5db` |
| Border light / dark | `#e5e7eb` / `#374151` |
| Success / warning / error | existing `#10b981` / `#f59e0b` / `#ef4444`; use darker text variants on light surfaces |

Retain system sans fallback with Inter preferred when installed. Use 14px navigation/body controls, 16px reading text, 24–32px page titles. Spacing: 4/8/12/16/24/32/48px. Controls 40–44px, touch targets at least 44px where practical. Radius: 8px controls, 12px surfaces, circular identity photos. Prefer borders to stacked shadows. Reserve gradients for established identity accents, never every card.

Register semantic tokens in Tailwind 4 `@theme inline` so existing Button/Input/Card classes work. Distinguish brand identity color from accessible action/text shades. Keep one focus ring and visible keyboard state, skip navigation, explicit active-page semantics, reduced-motion CSS and Framer Motion policy. Do not encode status through color alone.

Reuse existing primitives; do not create a second library. Scope shell refinements; inspect each experience before migrating its styles. Discovery retains real creator photos/data and existing hook behavior. Messaging retains thread hierarchy; workspace panels favor concise task metadata. Commerce emphasizes imagery and price/trust clarity. Studio controls must reflect actual media capabilities.
