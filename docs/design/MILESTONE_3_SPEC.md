# Milestone 3 design specification

Status: TESTED. Extend working pages, retain HyperBuds tokens and navigation. Reuse existing Button/Input/Textarea and Radix Dialog for consistent focus, Escape and modal behavior.

Hub: professional identity and real role/offer information precede actions. Keep published discovery separate from private founder drafts. Publication is explicit and explains visibility. Talent responses show original salary/currency/equity/vesting before confirmation; counterproposals remain visibly separate. Founders can respond with discussion notes or revise proposal figures (`POST /api/v1/invites/:id/revise`), which resets invitation status to `pending` so talent must explicitly confirm before locking terms. Decline and acceptance have clear consequences and error recovery. No generated credibility, trust, ratings or legal execution claims.

Profile & Collaborations:
- Creator & Talent Profiles (`/profile`, `/profile/[username]`, `/profile/edit`): 1px Slate borders (`border-slate-200 dark:border-slate-800`), no decorative blurred background blobs, truthful measured metrics (`—` when absent), and a structured Professional & Startup Hub section displaying `primaryRole`, `availability`, `offerPreference`, `skills`, `experience` timeline, and `portfolioLinks`.
- Collaboration Workspace (`/collaborations/[id]`): Linear-inspired project overview with Pinned Startup Proposal Terms (`pinnedAgreement`) displaying role, compensation type, salary, equity, vesting, and an explicit non-execution notice; Collaborator Roster with status badges; invite response card for invited collaborators; and deliverable creation/status controls for both owners and accepted collaborators.

Reference evidence: LinkedIn's official introduction-section documentation describes identity/context/actions, and Linear's project documentation separates overview/resources from work. These guide hierarchy, not copied branding or a claim to have exercised authenticated interfaces:
- https://www.linkedin.com/help/linkedin/answer/a563106/information-displayed-on-the-introduction-card-on-your-profile-overview
- https://linear.app/docs/projects
- https://support.discord.com/hc/en-us/articles/7924992471191-Message-Requests

Validation target (VERIFIED): desktop 1440 / tablet 768 / mobile 390 (`10/10` Playwright tests passing across `discovery.spec.ts`, `hub.spec.ts`, `messaging.spec.ts`, and `collaboration.spec.ts`), keyboard opening/Escape/focus return, form validation, pending and failed submissions, exact legacy API request bodies, terminal-state action removal and real-data-only runtime rendering. Browser fixtures remain isolated from providers and live APIs.
