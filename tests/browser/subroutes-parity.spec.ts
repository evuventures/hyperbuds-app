import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function isolateSubroutes(context: BrowserContext) {
  const user = {
    _id: userId,
    id: userId,
    email: 'fixture@example.invalid',
    fullName: 'Alex Fixture',
    username: 'alex_fixture',
    role: 'creator',
    profile: {
      username: 'alex_fixture',
      displayName: 'Alex Fixture',
      bio: 'Synthetic profile for Milestone 6 verification',
      isPublic: true,
      allowDirectInvites: true,
    },
  };

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-m6-fixture');
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
      if (/\/(users|auth)\/me$/.test(url.pathname) && method === 'GET') {
        data = { user, profile: user.profile };
      } else if (url.pathname.endsWith('/users/me') && method === 'PUT') {
        data = { user, message: 'Updated' };
      } else if (url.pathname.endsWith('/profiles/me')) {
        data = { profile: user.profile };
      } else if (url.pathname.endsWith('/matching/suggestions')) {
        data = {
          suggestions: [
            {
              _id: 'cand-1',
              userId: '222222222222222222222222',
              username: 'maya_studio',
              displayName: 'Maya Chen',
              bio: 'Design systems & creator tooling',
              niche: ['Design', 'Tech'],
              stats: { totalFollowers: 32000, avgEngagement: 5.8, rizzScore: 88 },
            },
          ],
        };
      } else if (url.pathname.endsWith('/matching/preferences') && method === 'POST') {
        data = { success: true };
      } else if (url.pathname.endsWith('/streaming/streams/stream-101')) {
        data = {
          stream: {
            _id: 'stream-101',
            title: 'Weekly Product Teardown',
            description: 'Live UI and architecture review',
            status: 'scheduled',
            playbackUrl: 'https://localhost/streams/fixture.m3u8',
            viewersCurrent: 0,
            viewersPeak: 0,
          },
        };
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }

    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort('blockedbyclient');
  });
}

test('settings account and privacy sub-routes render and save cleanly', async ({
  context,
  page,
}) => {
  await isolateSubroutes(context);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/settings/account', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Account & Identity' })).toBeVisible();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Account details updated.')).toBeVisible();

  await page.goto('/settings/privacy', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Privacy & Safety' })).toBeVisible();
  await page.getByRole('button', { name: 'Save privacy settings' }).click();
  await expect(page.getByText('Privacy preferences saved.')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});

test('matching discover, preferences, and streaming room sub-routes work cleanly', async ({
  context,
  page,
}) => {
  await isolateSubroutes(context);
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('/matching/discover', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Discover Collaborators' })).toBeVisible();
  await expect(page.getByText('Maya Chen')).toBeVisible();

  await page.goto('/matching/preferences', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Matching Preferences' })).toBeVisible();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByText('Matching preferences updated.')).toBeVisible();

  await page.goto('/streaming/room/stream-101', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Weekly Product Teardown' })).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});
