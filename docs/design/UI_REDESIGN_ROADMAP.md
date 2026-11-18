# Progressive web redesign roadmap

Statuses: NOT_STARTED, IN_PROGRESS, IMPLEMENTED_NOT_VERIFIED, TESTED, COMPLETE, BLOCKED.

| Order | Area | Status | Exit evidence |
| --- | --- | --- | --- |
| 1 | Audit, six references, design tokens, shell | TESTED | Browser screenshots and keyboard/responsive checks (`discovery.spec.ts`) |
| 2 | Discovery and profiles | TESTED | Instagram + LinkedIn 2-column hybrid layout, real contract fixtures, loading/empty/error interactions (`discovery.spec.ts`, `collaboration.spec.ts`) |
| 3 | Messaging and collaboration | TESTED | Discord 3-column chat & Linear 2-pane collaboration workspace (`messaging.spec.ts`, `collaboration.spec.ts`) |
| 4 | Feed and challenges | IN_PROGRESS | Dashboard Command Center (`/dashboard`), Trending, Recommendations & Activity Feed redesigned and verified (`dashboard-marketplace.spec.ts`); standalone social posts/challenges domain pending |
| 5 | Startup & Talent Hub | TESTED | Linear + LinkedIn deal-flow workspace, founder/talent parity, private pitches, counterproposals and offer revision (`hub.spec.ts`) |
| 6 | Marketplace | IN_PROGRESS | Airbnb + Linear service catalog (`/marketplace`) and bookings pipeline (`/marketplace/bookings`) redesigned and verified (`dashboard-marketplace.spec.ts`); physical shipping/eligibility pending |
| 7 | Live and podcast studios | NOT_STARTED | Actual media and consent tests |
| 8 | Sponsors, analytics, billing, settings, admin | NOT_STARTED | Provider and permission validation |
| 9 | Browser polish and release readiness | IN_PROGRESS | 11 Playwright browser tests verified at 1440/768/390 across Discovery, Profile, Hub, Messaging, Collaboration, Dashboard & Marketplace |

Native mobile applications are excluded. Reuse the Next.js App Router. Preserve pricing, Rizz history/formulas, existing routes and logo. No public release until approved feature verification gates pass.
