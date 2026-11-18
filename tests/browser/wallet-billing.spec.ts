import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function isolateWalletAndChallenges(context: BrowserContext) {
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

  let wallet = {
    id: 'wal-1',
    userId,
    balanceCredits: 600,
    reservedCredits: 10,
    availableCredits: 590,
    currency: 'credits',
    updatedAt: '2026-11-15T12:00:00.000Z',
  };

  const entries = [
    {
      _id: 'led-101',
      type: 'subscription_grant',
      amountMinor: 500,
      currency: 'credits',
      status: 'posted',
      refType: 'subscription',
      refId: 'sub_1',
      createdAt: '2026-11-14T10:00:00.000Z',
    },
    {
      _id: 'led-102',
      type: 'ai_settle',
      amountMinor: -10,
      currency: 'credits',
      status: 'posted',
      refType: 'ai_usage',
      refId: 'ai_1',
      createdAt: '2026-11-15T10:30:00.000Z',
    },
  ];

  const aiUsage = [
    {
      _id: 'ai-1',
      feature: 'content_analysis',
      promptVersion: 'content-analysis-v1.0',
      model: 'gpt-4o-mini',
      creditCost: 10,
      inputTokens: 120,
      outputTokens: 60,
      status: 'settled',
      createdAt: '2026-11-15T10:30:00.000Z',
    },
    {
      _id: 'ai-2',
      feature: 'pitch_analysis',
      promptVersion: 'pitch-roles-v1.0',
      model: 'gpt-4o-mini',
      creditCost: 15,
      inputTokens: 0,
      outputTokens: 0,
      status: 'refunded',
      errorMessage: 'Provider timeout',
      createdAt: '2026-11-15T11:00:00.000Z',
    },
  ];

  let challengeClaimed = false;

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-p3-fixture');
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
          wallet: { ...wallet, buckets: { purchased: 100, subscription: 500, promo: 0 } },
          creditPacks: { 100: 200, 250: 450, 500: 800, 1000: 1500, 2500: 3500 },
        };
      } else if (url.pathname.endsWith('/wallet/referrals')) {
        data = {
          referralCode: 'HB-TEST1234',
          policy: { referrerPromoCredits: 25, refereePromoCredits: 15, maxMonthlyRewardedReferrals: 10 },
          monthlyRewardedCount: 1,
          monthlyRemainingCount: 9,
          totalEarnedPromoCredits: 25,
          alreadyClaimedAsReferee: false,
          referrals: [],
        };
      } else if (url.pathname.endsWith('/wallet/ledger')) {
        data = { entries, pagination: { page: 1, limit: 20, total: entries.length, pages: 1 } };
      } else if (url.pathname.endsWith('/wallet/reconcile')) {
        data = {
          wallet,
          ledgerPostedBalance: wallet.balanceCredits,
          ledgerReservedCredits: wallet.reservedCredits,
          balanceMatches: true,
          reservedMatches: true,
          entryCount: entries.length,
        };
      } else if (url.pathname.endsWith('/wallet/ai-usage')) {
        data = { records: aiUsage };
      } else if (url.pathname.endsWith('/wallet/topup-intent') && method === 'POST') {
        const body = route.request().postDataJSON() as { credits: number };
        status = 201;
        data = {
          paymentIntentId: 'pi_test_pack_500',
          amountCents: body.credits === 500 ? 2900 : 900,
          currency: 'usd',
          creditGrant: body.credits,
        };
      } else if (url.pathname.endsWith('/challenges') && method === 'GET') {
        data = {
          challenges: [
            {
              _id: 'chal-101',
              title: 'Launch Co-Stream Pitch',
              description: 'Publish one verified pitch brief to earn credits.',
              category: 'pitch',
              rewardCredits: 75,
              currency: 'credits',
              status: 'active',
              claimsCount: challengeClaimed ? 1 : 0,
              mySubmission: challengeClaimed
                ? { _id: 'sub-1', status: 'rewarded', rewardCreditsAwarded: 75 }
                : null,
            },
          ],
        };
      } else if (url.pathname.endsWith('/challenges/chal-101/claim') && method === 'POST') {
        challengeClaimed = true;
        wallet = {
          ...wallet,
          balanceCredits: wallet.balanceCredits + 75,
          availableCredits: wallet.availableCredits + 75,
        };
        const createdEntry = {
          _id: 'led-103',
          type: 'challenge_reward',
          amountMinor: 75,
          currency: 'credits',
          status: 'posted',
          refType: 'challenge',
          refId: 'chal-101',
          createdAt: '2026-11-15T12:30:00.000Z',
        };
        entries.unshift(createdEntry);
        status = 201;
        data = { wallet, ledgerEntry: createdEntry };
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

test('wallet & credits dashboard renders ledger, AI refund records, claims challenge reward, and adapts cleanly across viewports', async ({
  page,
}) => {
  await isolateWalletAndChallenges(page.context());

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(vp);
    await page.goto('/payments/wallet', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Wallet, AI Metering/i })).toBeVisible();
    await expect(page.getByText('Launch Co-Stream Pitch')).toBeVisible();
    await expect(page.getByText('content-analysis-v1.0')).toBeVisible();
    await expect(page.getByText('refunded', { exact: true })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(overflow).toBe(false);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/payments/wallet', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('available-credits')).toHaveText('590');

  await page.getByRole('button', { name: 'Claim Reward' }).click();
  await expect(page.getByText('Rewarded')).toBeVisible();
  await expect(page.getByTestId('available-credits')).toHaveText('665');

  await page.screenshot({
    path: '/Users/macbookpro/.gemini/antigravity/brain/4d82d28e-d99a-46a0-af9d-0bc64367157f/scratch/wallet-billing-preview.png',
    fullPage: true,
  });
});
