import { test, expect, type BrowserContext } from '@playwright/test';

const userId = '111111111111111111111111';

async function isolateGearMarketplace(context: BrowserContext) {
  const user = {
    _id: userId,
    id: userId,
    email: 'fixture@example.invalid',
    role: 'creator',
    profile: {
      username: 'alex_fixture',
      displayName: 'Alex Fixture',
    },
  };

  const products = [
    {
      _id: 'gear-101',
      sku: 'MIC-DYN-01',
      title: 'HyperBuds Studio Dynamic Mic',
      description: 'Broadcast XLR/USB-C dynamic vocal microphone for co-streams.',
      brand: 'HyperAudio',
      category: 'microphones',
      priceCents: 14900,
      currency: 'USD',
      stock: 8,
      shippingCountries: ['US', 'CA'],
      specs: [
        { label: 'Polar Pattern', value: 'Cardioid' },
        { label: 'Connection', value: 'XLR + USB-C' },
      ],
    },
  ];

  const orders: Array<Record<string, unknown>> = [];

  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-m7-fixture');
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
      } else if (url.pathname.endsWith('/marketplace/gear/products') && method === 'GET') {
        data = { products, pagination: { page: 1, limit: 20, total: products.length, pages: 1 } };
      } else if (url.pathname.endsWith('/marketplace/gear/orders') && method === 'GET') {
        data = { orders, pagination: { page: 1, limit: 20, total: orders.length, pages: 1 } };
      } else if (url.pathname.endsWith('/marketplace/gear/orders') && method === 'POST') {
        const body = route.request().postDataJSON() as {
          quantity: number;
          shippingAddress: { line1: string; city: string; postalCode: string; country: string };
        };
        if (body.shippingAddress.country !== 'US' && body.shippingAddress.country !== 'CA') {
          status = 400;
          data = { message: `Shipping not supported to ${body.shippingAddress.country}` };
        } else {
          const created = {
            _id: `order-${orders.length + 1}`,
            productId: { _id: 'gear-101', title: 'HyperBuds Studio Dynamic Mic' },
            quantity: body.quantity,
            totalCents: 14900 * body.quantity,
            currency: 'USD',
            shippingAddress: body.shippingAddress,
            fulfillmentStatus: 'pending_payment',
          };
          orders.unshift(created);
          status = 201;
          data = { order: created };
        }
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

test('gear marketplace renders catalog, enforces shipping country, and records provisional order without overflow', async ({
  context,
  page,
}) => {
  await isolateGearMarketplace(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/marketplace/gear', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Creator Gear & Gadgets' })).toBeVisible();
  await expect(page.getByText('HyperBuds Studio Dynamic Mic').first()).toBeVisible();

  await page.getByLabel('Country (ISO)').fill('GB');
  await page.getByLabel('Street Address').fill('10 Downing St');
  await page.getByLabel('City').fill('London');
  await page.getByLabel('Postal Code').fill('SW1A 2AA');
  await page.getByRole('button', { name: 'Place provisional order' }).click();
  await expect(page.getByText('Shipping not supported to GB')).toBeVisible();

  await page.getByLabel('Country (ISO)').fill('US');
  await page.getByLabel('Street Address').fill('742 Evergreen Terrace');
  await page.getByLabel('City').fill('Austin');
  await page.getByLabel('Postal Code').fill('78701');
  await page.getByRole('button', { name: 'Place provisional order' }).click();
  await expect(page.getByText(/Provisional gear order recorded/i)).toBeVisible();

  await page.getByRole('button', { name: /Orders & Returns/i }).click();
  await expect(page.getByText(/Ship to Austin, US/i)).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});
