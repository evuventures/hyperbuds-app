import { test, expect } from '@playwright/test';

const userId = '111111111111111111111111';
const founderId = '999999999999999999999999';

test('creator/talent profile and collaboration workspace at three widths', async ({ page, context }) => {
  const profile = {
    _id: '222222222222222222222222',
    userId,
    username: 'alex_builder',
    displayName: 'Alex Builder',
    bio: 'Creator and product engineer building tools for creative studios.',
    niche: ['Design', 'Tech'],
    rizzScore: 84,
    primaryRole: 'Lead Product Engineer',
    availability: 'immediately',
    offerPreference: 'hybrid',
    skills: ['TypeScript', 'Next.js', 'Design Systems'],
    experience: [
      { title: 'Senior Frontend Engineer', company: 'Studio Labs', duration: '2024–Present' },
    ],
    portfolioLinks: {
      github: 'https://github.com/alexbuilder',
      portfolio: 'https://alexbuilder.example.com',
    },
    location: { city: 'London', country: 'GB' },
    stats: { totalFollowers: 18400, avgEngagement: 4.2, platformBreakdown: {} },
    socialLinks: { youtube: 'https://youtube.com/@alexbuilder' },
    isPublic: true,
    isActive: true,
    createdAt: '2025-02-15T10:00:00.000Z',
  };

  const user = {
    _id: userId,
    id: userId,
    email: 'alex@example.invalid',
    role: 'talent',
    profile,
  };

  let collabStatus: 'pending' | 'accepted' = 'pending';
  let myCollabStatus: 'invited' | 'accepted' = 'invited';
  const deliverables = [
    {
      _id: 'deliv-1',
      title: 'Initial architecture RFC',
      description: 'Draft component hierarchy and state flow',
      status: 'in_progress',
      assignedTo: userId,
      files: [],
    },
  ];

  const getCollaborationPayload = () => ({
    _id: '777777777777777777777777',
    id: '777777777777777777777777',
    title: 'Fixture Studio · Core Team',
    description: 'Collaboration workspace for Lead Product Engineer on Fixture Studio',
    type: 'startup_collaboration',
    status: collabStatus,
    creator: { _id: founderId, username: 'founder_maya', displayName: 'Maya Founder' },
    collaborators: [
      {
        user: { _id: userId, username: 'alex_builder', displayName: 'Alex Builder' },
        role: 'co-creator',
        status: myCollabStatus,
      },
    ],
    pinnedAgreement: {
      role: 'Lead Product Engineer',
      compensationType: 'hybrid',
      salary: 130000,
      equity: 1.5,
      vesting: '4yr cliff 1yr',
      status: 'active',
    },
    details: {
      scheduledDate: '2026-12-01T00:00:00.000Z',
      location: 'Remote',
      platform: ['youtube'],
    },
    deliverables,
  });

  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-collab-fixture');
    localStorage.setItem('hyperbuds-theme', 'light');
    sessionStorage.setItem('skipped_profile_completion', 'true');
  });

  await context.routeWebSocket('**/*', (socket) => {
    if (new URL(socket.url()).origin === 'ws://127.0.0.1:3100') socket.connectToServer();
    else socket.close();
  });

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/api/v1/')) {
      let data: unknown = {};
      if (/\/(auth|users)\/me$/.test(url.pathname)) {
        data = { user, profile };
      } else if (url.pathname.endsWith('/profiles/me')) {
        data = { profile };
      } else if (/suggestions|matching/.test(url.pathname)) {
        data = { matches: [], pagination: { page: 1, limit: 10, total: 0 } };
      } else if (url.pathname.endsWith('/collaborations/777777777777777777777777/respond')) {
        myCollabStatus = 'accepted';
        collabStatus = 'accepted';
        data = getCollaborationPayload();
      } else if (url.pathname.endsWith('/collaborations/777777777777777777777777/deliverables')) {
        const body = route.request().postDataJSON();
        deliverables.push({
          _id: `deliv-${deliverables.length + 1}`,
          title: body.title,
          description: body.description || '',
          status: 'pending',
          assignedTo: userId,
          files: [],
        });
        data = getCollaborationPayload();
      } else if (url.pathname.endsWith('/collaborations/777777777777777777777777')) {
        data = getCollaborationPayload();
      } else if (/notifications/.test(url.pathname)) {
        data = { notifications: [], unreadCount: 0 };
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }
    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort();
  });

  // 1. Verify own Creator + Talent Profile (/profile)
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Alex Builder', exact: true })).toBeVisible();
  await expect(page.getByText('Professional & Startup Hub Profile')).toBeVisible();
  await expect(page.getByText('Lead Product Engineer').first()).toBeVisible();
  await expect(page.getByText('Available immediately')).toBeVisible();
  await expect(page.getByText('Hybrid (Salary + Equity)')).toBeVisible();
  await expect(page.getByText('Senior Frontend Engineer')).toBeVisible();
  await expect(page.getByText('Studio Labs')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({
      animations: 'disabled',
      timeout: 60000,
      path: `docs/design/screenshots/profile-workspace-${width}.png`,
    });
  }

  // 2. Verify Collaboration Workspace (/collaborations/[id])
  await page.goto('/collaborations/777777777777777777777777', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Fixture Studio · Core Team' })).toBeVisible();
  await expect(page.getByText('Pinned Startup Proposal Terms')).toBeVisible();
  await expect(page.getByText('$130,000/yr')).toBeVisible();
  await expect(page.getByText('1.5%')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Respond to Invite' })).toBeVisible();

  // Accept invite as invited collaborator -> unlocks deliverable form
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.getByPlaceholder('Deliverable title')).toBeVisible();
  await page.getByPlaceholder('Deliverable title').fill('Ship design system tokens');
  await page.getByRole('button', { name: 'Add Deliverable', exact: true }).click();
  await expect(page.getByText('Ship design system tokens')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({
      animations: 'disabled',
      timeout: 60000,
      path: `docs/design/screenshots/collaboration-workspace-${width}.png`,
    });
  }

  expect(errors).toEqual([]);
});
