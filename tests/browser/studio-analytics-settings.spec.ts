import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function isolateStudioAnalyticsSettings(context: BrowserContext) {
  const user = {
    _id: userId,
    id: userId,
    email: 'fixture@example.invalid',
    role: 'creator',
    profile: {
      username: 'alex_fixture',
      displayName: 'Alex Fixture',
      bio: 'Synthetic profile for Milestone 5 verification',
      niche: ['Design', 'Tech'],
      rizzScore: 86,
    },
  };

  const streams = [
    {
      _id: 'stream-101',
      userId,
      title: 'Weekly Product Teardown',
      description: 'Live UI and architecture review',
      status: 'scheduled',
      scheduledAt: '2026-11-20T18:00:00.000Z',
      streamKey: 'fixture_stream_key_101',
      ingestUrl: 'rtmp://localhost/live/fixture_stream_key_101',
      playbackUrl: 'https://localhost/streams/fixture_stream_key_101.m3u8',
      recordingEnabled: true,
      recordingConsent: true,
      chatEnabled: true,
      viewersCurrent: 0,
      viewersPeak: 0,
      category: 'Design',
      likesCount: 12,
      subscribersCount: 8,
      sharesCount: 4,
      viewsCount: 95,
      isLiked: false,
      isSubscribed: false,
    },
  ];

  const episodes = [
    {
      _id: 'ep-101',
      userId,
      title: 'Creator Economy Deep Dive',
      status: 'ready',
      recordingConsent: true,
      maxDurationMinutes: 30,
      storageMb: 18,
      category: 'Creator Talk',
      durationSeconds: 200,
      playsCount: 42,
      likesCount: 5,
      isLiked: false,
      author: {
        _id: userId,
        id: userId,
        displayName: 'Alex Fixture',
        username: 'alex_fixture',
        followersCount: 14,
      },
    },
  ];

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-m5-fixture');
    localStorage.setItem('hyperbuds-theme', 'light');
    sessionStorage.setItem('skipped_profile_completion', 'true');
  });

  await context.routeWebSocket('**/*', (socket) => {
    if (new URL(socket.url()).origin === 'ws://127.0.0.1:3100') socket.connectToServer();
    else socket.close();
  });

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname.includes('/api/v1/')) {
      let data: unknown = {};
      const status = 200;

      if (/\/(users|auth)\/me$/.test(url.pathname) || url.pathname.endsWith('/profiles/me')) {
        data = { user, profile: user.profile };
      } else if ((url.pathname.endsWith('/streaming/streams') || url.pathname.endsWith('/streaming/discover')) && method === 'GET') {
        data = { streams, total: streams.length, pagination: { page: 1, limit: 20, total: streams.length, pages: 1 } };
      } else if (url.pathname.endsWith('/streaming/streams') && method === 'POST') {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        const created = {
          _id: `stream-${streams.length + 101}`,
          userId,
          title: String(body.title ?? 'Untitled'),
          description: String(body.description ?? ''),
          status: 'scheduled',
          scheduledAt: String(body.scheduledAt || '2026-11-22T18:00:00.000Z'),
          streamKey: 'fixture_stream_key_new',
          ingestUrl: 'rtmp://localhost/live/fixture_stream_key_new',
          playbackUrl: 'https://localhost/streams/fixture_stream_key_new.m3u8',
          recordingEnabled: Boolean(body.recordingEnabled),
          recordingConsent: Boolean(body.recordingConsent),
          chatEnabled: Boolean(body.chatEnabled ?? true),
          viewersCurrent: 0,
          viewersPeak: 0,
          category: String(body.category || 'Live'),
          thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : null,
          likesCount: 0,
          subscribersCount: 0,
          sharesCount: 0,
          viewsCount: 0,
          isLiked: false,
          isSubscribed: false,
        };
        streams.unshift(created);
        data = { stream: created };
      } else if (/\/streaming\/streams\/[^/]+\/start$/.test(url.pathname) && method === 'PUT') {
        const id = url.pathname.split('/').slice(-2, -1)[0];
        const target = streams.find((s) => s._id === id);
        if (target) target.status = 'live';
        data = { stream: target };
      } else if (/\/streaming\/streams\/[^/]+\/subscribe$/.test(url.pathname) && method === 'POST') {
        const id = url.pathname.split('/').slice(-2, -1)[0];
        const target = streams.find((s) => s._id === id);
        if (target) {
          target.isSubscribed = !target.isSubscribed;
          target.subscribersCount = (target.subscribersCount || 0) + (target.isSubscribed ? 1 : -1);
        }
        data = {
          streamId: id,
          subscribed: target?.isSubscribed ?? true,
          subscribersCount: target?.subscribersCount ?? 1,
        };
      } else if (url.pathname.endsWith('/podcasts/episodes') && method === 'GET') {
        data = { episodes };
      } else if (/\/podcasts\/episodes\/[^/]+\/like$/.test(url.pathname) && method === 'POST') {
        const id = url.pathname.split('/').slice(-2, -1)[0];
        const ep = episodes.find((e) => e._id === id);
        if (ep) {
          ep.isLiked = !ep.isLiked;
          ep.likesCount = (ep.likesCount || 0) + (ep.isLiked ? 1 : -1);
        }
        data = {
          episodeId: id,
          liked: ep?.isLiked ?? true,
          likesCount: ep?.likesCount ?? 1,
        };
      } else if (url.pathname.endsWith('/analytics/overview')) {
        data = {
          overview: {
            profileStats: {
              totalFollowers: 24500,
              avgEngagement: 6.4,
              totalViews: 580000,
              rizzScore: 86,
            },
            collaborations: 9,
            marketplaceOrders: 4,
            earnings: 1240,
          },
        };
      } else if (url.pathname.endsWith('/analytics/reports')) {
        data = {
          reports: [
            {
              _id: 'rep-1',
              period: {
                start: '2026-10-01T00:00:00.000Z',
                end: '2026-10-31T23:59:59.000Z',
                granularity: 'monthly',
              },
              metrics: {
                totalFollowers: 24500,
                avgEngagement: 6.4,
                totalViews: 192000,
                earnings: 840,
              },
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        };
      } else if (url.pathname.includes('/rizzScore/')) {
        data = {
          rizzScore: {
            currentScore: 86,
            factors: {
              engagement: { engagementRate: 88 },
              growth: { followerGrowth: 82 },
              collaboration: { completionRate: 92 },
              content: { nicheRelevance: 84 },
            },
          },
        };
      } else if (url.pathname.includes('/payments/')) {
        data = {
          subscription: null,
          paymentMethods: [],
          payments: [],
        };
      }

      return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }

    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort('blockedbyclient');
  });
}

test('streaming workspace schedules and starts a stream without overflow', async ({
  context,
  page,
}) => {
  await isolateStudioAnalyticsSettings(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/streaming', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Live & Upcoming' })).toBeVisible();
  await expect(page.getByText('Weekly Product Teardown').first()).toBeVisible();
  await expect(page.getByText('Subscribers').first()).toBeVisible();

  await page.getByRole('button', { name: 'New Stream' }).click();
  await page.getByPlaceholder('Spider-Verse Live Breakdown').fill('Design Critique Live');
  await page.getByRole('button', { name: 'Create Stream Card' }).click();
  await expect(page.getByText('Design Critique Live').first()).toBeVisible();

  await page.getByRole('button', { name: 'Go Live Again' }).first().click();
  await expect(
    page.getByText('Stream is LIVE! All stream subscribers have been notified.'),
  ).toBeVisible();

  // Switch to Podcasts hub and verify real counts + per-user like toggle
  await page.getByRole('button', { name: 'Podcasts' }).click();
  await expect(
    page.getByRole('heading', { name: 'Listen to trending podcasts all the time' }),
  ).toBeVisible();
  await expect(page.getByText('Creator Economy Deep Dive').first()).toBeVisible();
  await expect(page.getByText('14 Followers')).toBeVisible();
  await expect(page.getByText('42 Plays')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});

test('analytics workspace renders KPIs, reports, and validates date range', async ({
  context,
  page,
}) => {
  await isolateStudioAnalyticsSettings(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/analytics', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Analytics & Rizz Score' })).toBeVisible();
  await expect(page.getByText('24,500')).toBeVisible();
  await expect(page.getByText('$1,240.00')).toBeVisible();

  await page.getByLabel('From', { exact: true }).fill('2026-11-15');
  await page.getByLabel('To', { exact: true }).fill('2026-11-01');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('Start date must be on or before end date.')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});

test('settings hub and billing pages render cleanly without overflow', async ({
  context,
  page,
}) => {
  await isolateStudioAnalyticsSettings(context);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Account & Identity/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Plan & Billing/i })).toBeVisible();

  await page.goto('/payments/subscription', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Subscription Management' })).toBeVisible();
  await expect(page.getByText('$9.99')).toBeVisible();

  await page.goto('/payments/history', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Payment History', exact: true })).toBeVisible();
  await expect(page.getByText(/underwriting/i)).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});
