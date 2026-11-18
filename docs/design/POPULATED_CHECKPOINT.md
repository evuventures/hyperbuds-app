# Milestone 2 — populated frontend checkpoint

Status: TESTED for the bounded cases below. Milestone 2 remains IN_PROGRESS.

## Changes

- `src/components/profile/ProfileCard.jsx`: optional callback typing fixes TypeScript compilation; missing/broken avatars fall back to initials; absent/invalid join dates are omitted; account activity no longer implies live presence; unsupported growth/connection claims removed. Missing metrics display a dash. Existing score calculations remain unchanged.
- `src/app/profile/[username]/page.tsx` and `src/lib/api/profile.api.ts`: accept Express `userId`/`rizzScore` while retaining legacy `id`/`profileRizzScore` compatibility. Message links use the account ID rather than the username. Preserve source stats/dates instead of inventing zero statistics.
- `src/components/matching/MatchCard.tsx`: remove unsupported ranking badges, show actual niches, retain API scores, provide disabled states when actions are unavailable and improve narrow-screen wrapping.
- `src/app/messages/components/ConversationItem.tsx`: group titles, active-link/read/unread accessibility, keyboard focus and invalid-date protection.
- `tests/browser/discovery.spec.ts`: isolated populated discovery → profile → messaging link, plus conversation-list fixtures; no external API/provider access. Explicitly test the actual Express profile field names, unavailable avatar and missing date. Existing empty-state/navigation regression retained.
- `playwright.config.ts`: allow slow development-server startup. Screenshot capture disables animations and has a separate 60-second timeout; click assertions remain unchanged.

## Verification

- `npx tsc --noEmit`: PASS.
- Isolated Playwright suite: **2 tests passed**. Command: `HYPERBUDS_CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' PW_TEST_SCREENSHOT_NO_FONTS_READY=1 npm run test:browser`.
- Captured and visually inspected all nine populated screenshots below. Automated checks also enforce no document-level horizontal overflow at each width.
- Existing regression checks mobile focus wrapping, Escape/return focus, navigation dismissal, desktop collapse, dark mode and no page exceptions.
- Production build: PASS (`npm run build`, isolated loopback API configuration); TypeScript completed and all 56 static pages generated.

| Screen | 1440px | 768px | 390px |
|---|---|---|---|
| Discovery | [Screenshot](screenshots/populated-discovery-1440.png) | [Screenshot](screenshots/populated-discovery-768.png) | [Screenshot](screenshots/populated-discovery-390.png) |
| Public profile | [Screenshot](screenshots/populated-profile-1440.png) | [Screenshot](screenshots/populated-profile-768.png) | [Screenshot](screenshots/populated-profile-390.png) |
| Conversation list | [Screenshot](screenshots/populated-messaging-1440.png) | [Screenshot](screenshots/populated-messaging-768.png) | [Screenshot](screenshots/populated-messaging-390.png) |

The fixtures are explicitly synthetic and exist only in browser tests. The deliberately unavailable avatar tests the fallback. Socket connections are deliberately blocked: expected connection-error console messages and the Next development issue indicator are visible in messaging captures. No uncaught page exception occurred. These screenshots do not demonstrate live delivery, chat history, provider metrics or production data.

## Remaining work

Dedicated Startup & Talent Hub frontend, full conversation/send/reconnect flows, broader keyboard/screen-reader and contrast audit, all route success/resource-authorization contracts, full six-platform reference study and Marketplace reference implementation remain outstanding. Existing founder/talent backend, logo/navigation, brand colors, prices and historical scores remain preserved.
