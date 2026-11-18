import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function setupMilestoneMocks(context: BrowserContext, role: 'founder' | 'admin' = 'admin') {
  const user = {
    _id: userId,
    id: userId,
    email: 'creator@example.invalid',
    fullName: 'Casey Creator',
    username: 'casey_creator',
    role,
    profile: {
      username: 'casey_creator',
      displayName: 'Casey Creator',
      niche: ['Tech', 'AI'],
      rizzScore: 76,
      stats: { totalFollowers: 42000, avgEngagement: 5.2 },
    },
  };

  let claimed = false;

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'milestone-p3-p4-token');
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
      } else if (url.pathname.endsWith('/wallet')) {
        data = {
          wallet: {
            id: 'wal-m',
            userId,
            balanceCredits: 875,
            reservedCredits: 0,
            availableCredits: 875,
            buckets: { purchased: 500, subscription: 250, promo: 125 },
            currency: 'credits',
          },
        };
      } else if (url.pathname.endsWith('/wallet/referrals')) {
        data = {
          referralCode: 'HB-CASEY99',
          policy: { referrerPromoCredits: 25, refereePromoCredits: 15, maxMonthlyRewardedReferrals: 10 },
          monthlyRewardedCount: 2,
          monthlyRemainingCount: 8,
          totalEarnedPromoCredits: 50,
          alreadyClaimedAsReferee: false,
          referrals: [],
        };
      } else if (url.pathname.endsWith('/analytics/overview')) {
        data = {
          overview: {
            profileStats: { totalFollowers: 42000, avgEngagement: 5.2, totalViews: 320000, rizzScore: 76 },
            collaborations: 11,
            marketplaceOrders: 3,
            earnings: 950,
          },
        };
      } else if (url.pathname.endsWith('/analytics/reports')) {
        data = { reports: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      } else if (url.pathname.endsWith('/analytics/forecast') && method === 'GET') {
        data = { snapshots: [] };
      } else if (url.pathname.endsWith('/analytics/forecast/generate') && method === 'POST') {
        status = 201;
        data = {
          creditsCharged: 5,
          snapshot: {
            _id: 'snap-1',
            horizonDays: 30,
            method: 'linear-trend-damped-v1',
            confidenceLevel: 0.8,
            predictions: {
              reach: { pointEstimate: 145000, lowerBound: 118000, upperBound: 172000, unit: 'impressions' },
              avgViews: { pointEstimate: 18400, lowerBound: 15100, upperBound: 21700, unit: 'views' },
              liveViewers: { pointEstimate: 620, lowerBound: 490, upperBound: 750, unit: 'concurrent_viewers' },
            },
          },
        };
      } else if (url.pathname.endsWith('/analytics/plans/generate') && method === 'POST') {
        status = 201;
        data = {
          planType: 'content_plan',
          promptVersion: 'content-trend-plan-v1.0',
          model: 'structured-plan-fallback-v1',
          creditsCharged: 6,
          generatedSuggestions: {
            planTitle: 'AI 14-Day Content & Trend Plan',
            trendAngles: [
              { angle: 'Live Benchmark', hook: '2 creators benchmark studio workflows', format: 'Reel' },
            ],
          },
        };
      } else if (url.pathname.includes('/matching/suggestions') || url.pathname.includes('/matching/history')) {
        data = { matches: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      } else if (url.pathname.endsWith('/matching/external')) {
        data = {
          provenance: 'local_heuristic_fallback',
          creators: [
            {
              _id: 'ext-1',
              platform: 'youtube',
              handle: 'nova_builds',
              displayName: 'Nova Builds',
              niche: ['AI', 'Tech'],
              followersEstimate: 65000,
              compatibilityScore: 91,
              claimStatus: claimed ? 'claimed' : 'unclaimed',
            },
          ],
        };
      } else if (url.pathname.includes('/profiles/claim/') && method === 'POST') {
        claimed = true;
        data = { success: true };
      } else if (url.pathname.endsWith('/update/rizz-score')) {
        data = {
          rizzScore: 76,
          factors: { niches: 80, engagement: 74, location: 72 },
          trend: 'up',
          lastUpdated: '2026-11-17T12:00:00.000Z',
        };
      } else if (url.pathname.endsWith('/matching/rizz-score/appeals')) {
        data = { appeals: [] };
      } else if (url.pathname.includes('/matching/leaderboard')) {
        data = {
          leaderboard: [
            {
              userId,
              currentScore: 92,
              scoreV2: 920,
              tierInfo: { scoreV2: 920, tier: 'HyperLegend' },
              trending: { isViral: true, trendingScore: 14 },
              profile: { username: 'casey_creator', displayName: 'Casey Creator', niche: ['AI'] },
            },
          ],
        };
      } else if (url.pathname.endsWith('/matching/matches-of-month')) {
        data = {
          periodKey: '2026-11',
          matchesOfTheMonth: [
            {
              matchId: 'mm-1',
              compatibilityScore: 95,
              creators: [{ username: 'casey_creator' }, { username: 'nova_builds' }],
            },
          ],
        };
      } else if (url.pathname.endsWith('/streaming/quotas')) {
        data = {
          quota: {
            tier: 'pro',
            tierName: 'Pro',
            maxStreamDurationMinutes: 120,
            maxHosts: 5,
            maxResolution: '1080p',
            storageLimitMb: 20480,
            usedStorageMb: 40,
            remainingStorageMb: 20440,
          },
        };
      } else if (url.pathname.endsWith('/streaming/streams')) {
        data = { streams: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
      } else if (url.pathname.endsWith('/podcasts/episodes') && method === 'GET') {
        data = {
          episodes: [
            {
              _id: 'ep-1',
              title: 'Creator Monetization Deep Dive',
              status: 'ready',
              recordingConsent: true,
              maxDurationMinutes: 120,
              storageMb: 40,
              tracks: [{ label: 'Host 1', codec: 'aac', sizeMb: 40 }],
              transcript: { text: '[00:00] Welcome back to Creator Monetization Deep Dive.' },
              highlights: [{ title: 'Opening Hook', startSeconds: 5, endSeconds: 42 }],
            },
          ],
        };
      } else if (url.pathname.endsWith('/moderation/reports/my')) {
        data = { reports: [] };
      } else if (url.pathname.includes('/moderation/queue')) {
        data = {
          reports: [
            {
              _id: 'rep-dmca-1',
              targetType: 'post',
              targetId: '65f000000000000000000301',
              reason: 'copyright',
              status: 'open',
              resolutionAction: 'none',
              copyrightClaim: {
                workTitle: 'Original Beat Track #4',
                rightsHolder: 'Indie Label Co.',
              },
            },
          ],
        };
      } else if (url.pathname.includes('/resolve') && method === 'POST') {
        data = { report: { _id: 'rep-dmca-1', status: 'actioned', resolutionAction: 'copyright_takedown' } };
      } else if (url.pathname.includes('/payments/')) {
        data = { subscription: null, paymentMethods: [], payments: [] };
      }

      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
      return;
    }

    if (url.origin !== 'http://127.0.0.1:3100' && url.origin !== 'http://localhost:3100') {
      await route.abort();
      return;
    }
    await route.continue();
  });
}

test('PRD commercial, forecasting, external claim, Rizz 2.0, Podcast Studio & moderation flows work cleanly across viewports', async ({
  page,
}) => {
  await setupMilestoneMocks(page.context(), 'admin');

  // 1. Wallet Buckets + Referrals
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/payments/wallet', { waitUntil: 'networkidle' });
  await expect(page.getByText('Promo → Subscription → Purchased')).toBeVisible();
  await expect(page.getByText('HB-CASEY99')).toBeVisible();
  await expect(page.getByText('$8.00 USD')).toBeVisible();

  // 2. Analytics Forecasting & AI Plans
  await page.goto('/analytics', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Run (5 cr)' }).click();
  await expect(page.getByText('145,000')).toBeVisible();
  await page.getByRole('button', { name: 'Generate Metered Plan' }).click();
  await expect(page.getByText('AI 14-Day Content & Trend Plan')).toBeVisible();

  // 3. External Claim Index on AI Matches
  await page.goto('/ai-matches', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'External Claim Index' }).click();
  await expect(page.getByText('Nova Builds')).toBeVisible();
  await page.getByPlaceholder(/bio verification code/i).fill('HB-PROOF-99');
  await page.getByRole('button', { name: 'Verify & Claim' }).click();
  await expect(page.getByText(/Claim verified for @nova_builds/i)).toBeVisible();

  // 4. Rizz 2.0 0-1000 & Leaderboard Matches of the Month
  await page.goto('/profile/rizz-score', { waitUntil: 'networkidle' });
  await expect(page.getByText('Rizz Score 2.0 Progression (0–1000)')).toBeVisible();
  await expect(page.getByText('HyperLegend')).toBeVisible();

  await page.goto('/profile/rizz-score/leaderboard', { waitUntil: 'networkidle' });
  await expect(page.getByText('Matches of the Month (2026-11)')).toBeVisible();

  // 5. Streaming Quotas + Podcast Studio
  await page.goto('/streaming', { waitUntil: 'networkidle' });
  await expect(page.getByText('120m · up to 5 hosts')).toBeVisible();
  await page.getByRole('button', { name: 'Podcast Studio' }).click();
  await expect(page.getByText('Creator Monetization Deep Dive')).toBeVisible();

  // 6. Moderation & Copyright Queue across 1440 / 768 / 390
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(vp);
    await page.goto('/moderation', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Moderation & Copyright Queue' })).toBeVisible();
    await expect(page.getByText(/Original Beat Track #4/)).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);
  }
});
