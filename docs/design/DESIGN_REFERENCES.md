# Design references — observed evidence and intended application

Status: IN_PROGRESS. Public pages accessed 2026-10-17/18 using web retrieval and headless Chrome. No authenticated reference accounts were accessed. Browser capture attempts for Linear, Instagram, Discord and Riverside timed out; do not treat their visual details as inspected. Saved third-party screenshots are internal research evidence, never application assets.

## Source notes

- [Linear](https://linear.app/): public page text exposes workspace/favorites navigation, issues with activity and properties, board status groups and planning timelines. Apply compact contextual navigation and metadata hierarchy. Exact spacing, color, hover and motion were not verified visually.
- [Instagram](https://www.instagram.com/): public text returned no usable content and screenshot timed out. Creator imagery, identity headers and media grids are user-requested design directions, not observations from this session. Authenticated feed/reels study remains pending.
- [Discord](https://discord.com/): public page exposes discovery, server directory, safety and login hierarchy. Apply clear separation of communication context and safety actions. Authenticated conversation layout, unread behavior and voice controls were not inspected.
- [Riverside](https://riverside.com/): public material separates recording and tracks, participant readiness and video/audio formats. Apply visible participant readiness and permission-aware recording controls when media exists. No studio interaction, reconnection or export was tested.
- [Airbnb](https://www.airbnb.com/): text separates destination/date/guest search; saved screenshot shows a wide segmented rounded search surface, thin divider, restrained shadow and loading skeletons. Listing cards did not render in the captured state. Apply structured filters and explicit loading treatment; do not infer loaded marketplace behavior from this capture.
- [LinkedIn](https://www.linkedin.com/): saved public screenshot shows a wide two-column hero, clear professional headline, single email action, outlined topic chips and restrained blue action hierarchy. Use clear professional identity and role context in the Hub; no authenticated profiles, recruiter actions or offers were inspected.

## Sixteen-dimension study register

“Pending” means unavailable or not yet exercised, not presumed behavior. Applications below are HyperBuds decisions.

| Dimension | Evidence / limitation | HyperBuds application |
| --- | --- | --- |
| Layout/composition | LinkedIn two-column landing; Airbnb wide search; Linear text hierarchy | Stable shell, constrained page widths and context-specific content |
| Navigation | Linear workspace grouping; Discord discovery/safety; LinkedIn people/jobs | Preserve existing routes and group labels |
| Typography | LinkedIn large sans headline and compact nav visually observed; exact font unverified | Retain existing system/Inter stack; controlled scale |
| Color | LinkedIn blue action hierarchy; Airbnb pink search accent observed | Existing HyperBuds purple/indigo, neutral surfaces |
| Spacing/alignment | LinkedIn generous aligned columns; Airbnb centered search | 4px-derived spacing scale; aligned controls |
| Card proportions | Loaded product cards not captured | Inspect real creator cards before refining; avoid placeholder grid claims |
| Radius/shadows | LinkedIn pill actions; Airbnb pill search with subtle shadow | Small control radii, restrained surface shadows |
| Icons | Airbnb outlined account/menu/search observed | Reuse Lucide with consistent stroke and labels |
| Images | LinkedIn editorial illustration observed; Riverside participant image descriptions | Real creator media, meaningful fallback initials |
| Interactions | Reference controls enumerated, not exercised | Preserve actual handlers, test navigation and refresh |
| Hover/active | Reference hover not observed | Visible focus/current-page state; no copied claims |
| Loading/empty | Airbnb skeleton captured; others pending | Distinct loading, empty and error states |
| Responsive | Reference mobile captures pending | Verify HyperBuds at 1440/768/390 independently |
| Density | Linear issue metadata from text; LinkedIn sparse landing observed | Dense workspace metadata, spacious discovery |
| Animation | Reference motion unverified | Subtle motion, honor reduced-motion preference |
| Personality | LinkedIn professional landing; Airbnb search-first shell observed | One HyperBuds identity across creator and professional contexts |

The six-platform study is not complete: authenticated product screens, mobile references, hover/loading transitions and full studio/commerce flows remain pending. Do not claim visual equivalence to references. Current local screenshots validate only HyperBuds discovery with isolated empty-state fixtures.
