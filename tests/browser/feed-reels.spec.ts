import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function isolateFeedAndReels(context: BrowserContext) {
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
    },
  };

  const posts: Array<Record<string, unknown>> = [
    {
      _id: 'post-101',
      author: { _id: '222222222222222222222222', fullName: 'Maya Chen', username: 'maya_studio' },
      kind: 'post',
      body: 'Shipping the new creator lighting rig checklist today.',
      media: [],
      tags: ['lighting', 'studio'],
      visibility: 'public',
      likes: [],
      bookmarks: [],
      comments: [],
      createdAt: '2026-11-15T10:00:00.000Z',
    },
    {
      _id: 'reel-101',
      author: { _id: '222222222222222222222222', fullName: 'Maya Chen', username: 'maya_studio' },
      kind: 'reel',
      body: '60s overhead desk rig tour',
      media: [{ type: 'video', url: 'https://example.invalid/reel-101.mp4', aspectRatio: '9:16' }],
      tags: ['rig', 'bts'],
      visibility: 'public',
      likes: [],
      bookmarks: [],
      comments: [],
      createdAt: '2026-11-15T11:00:00.000Z',
    },
    ...Array.from({ length: 12 }, (_, idx) => ({
      _id: `feed-page-${idx + 2}`,
      author: { _id: '222222222222222222222222', fullName: 'Maya Chen', username: 'maya_studio' },
      kind: idx % 3 === 0 ? 'reel' : 'post',
      body: `Endless stream fixture item #${idx + 2}`,
      media:
        idx % 3 === 0
          ? [{ type: 'video', url: 'https://example.invalid/reel-stream.mp4', aspectRatio: '9:16' }]
          : [],
      tags: ['endless', 'collab'],
      visibility: 'public',
      likes: [],
      bookmarks: [],
      comments: [],
      createdAt: `2026-11-14T${String(20 - idx).padStart(2, '0')}:00:00.000Z`,
    })),
  ];

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-m8-fixture');
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
      let status = 200;

      if (/\/(users|auth)\/me$/.test(url.pathname) || url.pathname.endsWith('/profiles/me')) {
        data = { user, profile: user.profile };
      } else if (url.pathname.endsWith('/feed/upload-media') && method === 'POST') {
        const rawBody = route.request().postDataBuffer()?.toString('utf8') || '';
        const isReel =
          rawBody.includes('video/') ||
          rawBody.includes('.mp4') ||
          rawBody.includes('name="kind"\r\n\r\nreel');
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            media: isReel
              ? {
                  type: 'video',
                  url: 'https://res.cloudinary.com/hyperbuds-test/video/upload/v1/reel-clip.mp4',
                  publicId: 'hyperbuds/reels/alex/reel-clip',
                  aspectRatio: '9:16',
                  durationSeconds: 15,
                }
              : {
                  type: 'image',
                  url: 'https://res.cloudinary.com/hyperbuds-test/image/upload/v1/post-clip.png',
                  publicId: 'hyperbuds/posts/alex/post-clip',
                  aspectRatio: '4:3',
                },
          }),
        });
      } else if (url.pathname.endsWith('/feed/posts') && method === 'GET') {
        const kind = url.searchParams.get('kind');
        const filtered = kind ? posts.filter((p) => p.kind === kind) : posts;
        const pageNum = Math.max(1, Number(url.searchParams.get('page')) || 1);
        const limitNum = Math.max(1, Number(url.searchParams.get('limit')) || 10);
        const start = (pageNum - 1) * limitNum;
        const sliced = filtered.slice(start, start + limitNum);
        const pages = Math.max(1, Math.ceil(filtered.length / limitNum));
        data = { posts: sliced, pagination: { page: pageNum, limit: limitNum, total: filtered.length, pages } };
      } else if (url.pathname.endsWith('/feed/posts') && method === 'POST') {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        const created = {
          _id: `item-${posts.length + 1}`,
          author: { _id: userId, fullName: 'Alex Fixture', username: 'alex_fixture' },
          kind: body.kind || 'post',
          body: String(body.body ?? ''),
          media: Array.isArray(body.media) ? body.media : [],
          tags: Array.isArray(body.tags) ? body.tags : [],
          visibility: body.visibility || 'public',
          likes: [],
          bookmarks: [],
          comments: [],
          createdAt: new Date().toISOString(),
        };
        posts.unshift(created);
        status = 201;
        data = { post: created };
      } else if (/\/feed\/posts\/[^/]+\/like$/.test(url.pathname) && method === 'POST') {
        data = { liked: true, likesCount: 1 };
      } else if (/\/feed\/posts\/[^/]+\/bookmark$/.test(url.pathname) && method === 'POST') {
        data = { bookmarked: true, bookmarksCount: 1 };
      } else if (/\/feed\/posts\/[^/]+\/comments$/.test(url.pathname) && method === 'POST') {
        const body = route.request().postDataJSON() as { text: string };
        data = {
          comment: {
            _id: `c-${Date.now()}`,
            author: { _id: userId, fullName: 'Alex Fixture', username: 'alex_fixture' },
            text: body.text,
            createdAt: new Date().toISOString(),
          },
        };
      }

      return route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }

    if (url.hostname === 'res.cloudinary.com') {
      if (url.pathname.endsWith('.png')) {
        return route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64',
          ),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: Buffer.from('ftypmp42', 'utf8'),
      });
    }

    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort('blockedbyclient');
  });
}

test('social feed publishes normal posts, toggles comments, and avoids overflow', async ({
  context,
  page,
}) => {
  await isolateFeedAndReels(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/feed', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Creator Feed' })).toBeVisible();
  await expect(page.getByText('Shipping the new creator lighting rig checklist today.')).toBeVisible();

  await page.getByTestId('composer-mind-trigger').click();
  const dialog = page.getByTestId('creator-studio-modal');
  await expect(dialog.getByRole('heading', { name: 'Create Post' })).toBeVisible();
  await dialog
    .getByPlaceholder("What's on your mind, Alex?")
    .fill('Recording our first co-stream episode tonight.');
  await dialog.getByTestId('creator-media-input').setInputFiles({
    name: 'post-clip.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await expect(dialog.getByText('Uploaded to Cloudinary')).toBeVisible();
  await dialog.getByTestId('creator-step-next').click();
  await dialog.getByTestId('creator-step-next').click();
  await dialog.getByTestId('creator-submit-btn').click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Recording our first co-stream episode tonight.')).toBeVisible();

  // Verify endless scrolling loads page 2 automatically when scrolling to sentinel
  await expect(page.getByText('Endless stream fixture item #13')).toHaveCount(0);
  await page.getByTestId('feed-scroll-sentinel').scrollIntoViewIfNeeded();
  await expect(page.getByText('Endless stream fixture item #13')).toBeVisible();

  // Verify desktop sidebar appearance switcher (Purple | Normal | Glass)
  const sidebarPanel = page.locator('[data-sidebar-appearance]:visible').first();
  await expect(sidebarPanel).toHaveAttribute('data-sidebar-appearance', 'brand');
  await sidebarPanel.getByRole('radio', { name: 'Glass' }).click();
  await expect(sidebarPanel).toHaveAttribute('data-sidebar-appearance', 'glass');
  await sidebarPanel.getByRole('radio', { name: 'Normal' }).click();
  await expect(sidebarPanel).toHaveAttribute('data-sidebar-appearance', 'classic');
  await sidebarPanel.getByRole('radio', { name: 'Purple' }).click();
  await expect(sidebarPanel).toHaveAttribute('data-sidebar-appearance', 'brand');

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }

  // Verify 390px mobile top floating pill nav + 3-bar dropdown sidebar
  await expect(page.getByRole('navigation', { name: 'Mobile quick navigation' })).toBeVisible();
  await expect(page.getByTestId('mobile-sidebar-trigger')).toBeVisible();
  await page.getByTestId('mobile-sidebar-trigger').click();
  const mobileSidebar = page.locator('[data-sidebar-appearance]:visible').first();
  await expect(mobileSidebar.getByText('More Content')).toBeVisible();
  await mobileSidebar.getByRole('radio', { name: 'Glass' }).click();
  await expect(mobileSidebar).toHaveAttribute('data-sidebar-appearance', 'glass');
});

test('reels view renders vertical 9:16 player, publishes a reel, and avoids overflow', async ({
  context,
  page,
}) => {
  await isolateFeedAndReels(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/reels', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Reels' })).toBeVisible();
  await expect(page.getByText('60s overhead desk rig tour')).toBeVisible();

  await page.getByRole('button', { name: /New Reel/i }).click();
  const reelDialog = page.getByTestId('creator-studio-modal');
  await expect(reelDialog.getByRole('heading', { name: 'Create Reel' })).toBeVisible();
  await reelDialog.getByTestId('creator-media-input').setInputFiles({
    name: 'reel-clip.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('ftypmp42', 'utf8'),
  });
  await expect(reelDialog.getByText('Uploaded to Cloudinary')).toBeVisible();
  await reelDialog.getByTestId('creator-step-next').click();
  await reelDialog.getByLabel('Reel Caption').fill('Quick mic check before going live');
  await reelDialog.getByTestId('creator-step-next').click();
  await reelDialog.getByTestId('creator-submit-btn').click();
  await expect(reelDialog).toHaveCount(0);
  await expect(page.getByText('Quick mic check before going live')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});
