import { test, expect, type BrowserContext } from "@playwright/test";

const userId = "111111111111111111111111";

const sampleServices = [
  {
    _id: "srv-101",
    seller: { _id: "888888888888888888888888", email: "maya@example.invalid" },
    title: "Design System & Creator Studio UI Kit",
    description:
      "Modular Figma + Next.js component architecture for creator products.",
    price: 450,
    currency: "USD",
    category: "Design",
    deliveryTime: "5 days",
    location: "Remote",
    isAvailable: true,
    featured: true,
    rating: { average: 4.9, count: 14 },
    stats: { views: 340, orders: 19 },
    images: [],
  },
  {
    _id: "srv-102",
    seller: { _id: "555555555555555555555555", email: "liam@example.invalid" },
    title: "Podcast & Co-Stream Audio Mastering",
    description: "Broadcast-grade dialogue cleanup and stem mixing.",
    price: 180,
    currency: "USD",
    category: "Audio",
    deliveryTime: "3 days",
    location: "London",
    isAvailable: true,
    featured: false,
    rating: { average: 0, count: 0 },
    stats: { views: 80, orders: 2 },
    images: [],
  },
];

async function isolateDashboardAndMarketplace(context: BrowserContext) {
  const user = {
    _id: userId,
    id: userId,
    email: "fixture@example.invalid",
    role: "creator",
    profile: {
      username: "alex_fixture",
      displayName: "Alex Fixture",
      bio: "Synthetic profile for Milestone 4 verification",
      niche: ["Design", "Tech"],
      rizzScore: 88,
    },
  };

  let bookingStatus = "in_progress";
  const statusUpdates: Array<{ id: string; status: string }> = [];
  const uploadedMediaRequests: Array<{ contentType: string; url: string }> = [];
  const createdStreams: Array<Record<string, unknown>> = [];
  const feedPosts: Array<Record<string, unknown>> = [
    {
      _id: "dash-post-1",
      author: {
        _id: "888888888888888888888888",
        fullName: "Maya Chen",
        username: "maya_chen",
      },
      kind: "post",
      body: "Shipping the updated creator lighting kit checklist on HyperBuds today.",
      media: [],
      tags: ["lighting", "studio"],
      visibility: "public",
      likes: [],
      bookmarks: [],
      comments: [],
      createdAt: "2026-11-15T12:00:00.000Z",
    },
  ];

  await context.addInitScript(() => {
    localStorage.setItem("accessToken", "isolated-m4-fixture");
    localStorage.setItem("hyperbuds-theme", "light");
    sessionStorage.setItem("skipped_profile_completion", "true");
  });

  await context.routeWebSocket("**/*", (socket) => {
    if (new URL(socket.url()).origin === "ws://127.0.0.1:3100")
      socket.connectToServer();
    else socket.close();
  });

  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/api/v1/")) {
      let data: unknown = {};
      const status = 200;

      if (
        /\/(users|auth)\/me$/.test(url.pathname) ||
        url.pathname.endsWith("/profiles/me")
      ) {
        data = { user, profile: user.profile };
      } else if (url.pathname.endsWith("/dashboard/trending-collaborations")) {
        data = {
          trending: [
            {
              _id: "777777777777777777777777",
              title: "HyperStudio AI · Core Team",
              type: "Creator SaaS",
              collaboratorCount: 3,
              analytics: { totalViews: 14200 },
              growthRate: 24,
            },
          ],
          count: 1,
        };
      } else if (url.pathname.endsWith("/dashboard/ai-recommendations")) {
        data = {
          recommendations: [
            {
              user: {
                id: "888888888888888888888888",
                username: "maya_chen",
                displayName: "Maya Chen",
                niche: ["Design", "Tech"],
                rizzScore: 91,
              },
              compatibilityScore: 94,
              matchingRizzScore: 91,
              commonNiches: ["Design", "Tech"],
              keyFeatures: ["Shared focus on Design & Tech"],
            },
          ],
          count: 1,
        };
      } else if (url.pathname.endsWith("/dashboard/activity-feed")) {
        data = {
          activities: [
            {
              _id: "act-1",
              type: "collab",
              actor: { name: "Maya Chen" },
              message: "submitted deliverable update on HyperStudio AI",
              createdAt: "2026-11-14T20:00:00.000Z",
            },
          ],
          count: 1,
        };
      } else if (url.pathname.endsWith("/marketplace/services")) {
        const q = (url.searchParams.get("q") || "").toLowerCase();
        const cat = url.searchParams.get("category") || "";
        let list = [...sampleServices];
        if (q) list = list.filter((s) => s.title.toLowerCase().includes(q));
        if (cat) list = list.filter((s) => s.category === cat);
        data = {
          services: list,
          pagination: { page: 1, limit: 12, total: list.length, pages: 1 },
        };
      } else if (url.pathname.endsWith("/marketplace/bookings")) {
        data = {
          bookings: [
            {
              _id: "book-1001",
              serviceId: sampleServices[0],
              buyerId: userId,
              sellerId: "888888888888888888888888",
              status: bookingStatus,
              amount: 450,
              currency: "USD",
              requirements: "Include dark-mode Slate tokens.",
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        };
      } else if (
        /\/marketplace\/bookings\/[^/]+\/status$/.test(url.pathname) &&
        route.request().method() === "PUT"
      ) {
        const body = route.request().postDataJSON() as { status: string };
        bookingStatus = body.status;
        statusUpdates.push({
          id: url.pathname.split("/").at(-2) || "",
          status: body.status,
        });
        data = {
          booking: {
            _id: "book-1001",
            serviceId: sampleServices[0],
            status: bookingStatus,
            amount: 450,
            currency: "USD",
          },
        };
      } else if (
        url.pathname.endsWith("/feed/upload-media") &&
        route.request().method() === "POST"
      ) {
        const contentType = route.request().headers()["content-type"] || "";
        uploadedMediaRequests.push({ contentType, url: url.pathname });
        const rawBody = route.request().postDataBuffer()?.toString("utf8") || "";
        const isReel =
          rawBody.includes("video/") ||
          rawBody.includes("reel-sample") ||
          rawBody.includes('name="kind"\r\n\r\nreel');
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            media: isReel
              ? {
                  type: "video",
                  url: "https://res.cloudinary.com/hyperbuds-test/video/upload/v1/reel-sample.mp4",
                  publicId: "hyperbuds/reels/alex/reel-sample",
                  aspectRatio: "9:16",
                  durationSeconds: 18,
                }
              : {
                  type: "image",
                  url: "https://res.cloudinary.com/hyperbuds-test/image/upload/v1/post-sample.png",
                  publicId: "hyperbuds/posts/alex/post-sample",
                  width: 1200,
                  height: 900,
                  aspectRatio: "4:3",
                },
          }),
        });
      } else if (
        url.pathname.endsWith("/feed/upload-media") &&
        route.request().method() === "POST"
      ) {
        const contentType = route.request().headers()["content-type"] || "";
        uploadedMediaRequests.push({ contentType, url: url.pathname });
        const rawBody = route.request().postDataBuffer()?.toString("utf8") || "";
        const isReel =
          rawBody.includes("video/") ||
          rawBody.includes("reel-sample") ||
          rawBody.includes('name="kind"\r\n\r\nreel');
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            media: isReel
              ? {
                  type: "video",
                  url: "https://res.cloudinary.com/hyperbuds-test/video/upload/v1/reel-sample.mp4",
                  publicId: "hyperbuds/reels/alex/reel-sample",
                  aspectRatio: "9:16",
                  durationSeconds: 18,
                }
              : {
                  type: "image",
                  url: "https://res.cloudinary.com/hyperbuds-test/image/upload/v1/post-sample.png",
                  publicId: "hyperbuds/posts/alex/post-sample",
                  width: 1200,
                  height: 900,
                  aspectRatio: "4:3",
                },
          }),
        });
      } else if (
        url.pathname.endsWith("/feed/posts") &&
        route.request().method() === "GET"
      ) {
        data = {
          posts: feedPosts,
          pagination: { page: 1, limit: 25, total: feedPosts.length, pages: 1 },
        };
      } else if (
        url.pathname.endsWith("/feed/posts") &&
        route.request().method() === "POST"
      ) {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        const created = {
          _id: `dash-post-${feedPosts.length + 1}`,
          author: {
            _id: userId,
            fullName: "Alex Fixture",
            username: "alex_fixture",
          },
          kind: body.kind || "post",
          body: String(body.body ?? ""),
          media: Array.isArray(body.media) ? body.media : [],
          tags: Array.isArray(body.tags) ? body.tags : [],
          visibility: body.visibility || "public",
          likes: [],
          bookmarks: [],
          comments: [],
          createdAt: new Date().toISOString(),
        };
        feedPosts.unshift(created);
        data = { post: created };
      } else if (url.pathname.endsWith("/messages/conversations")) {
        data = {
          conversations: [
            {
              _id: "conv-1",
              participants: [
                { _id: userId, displayName: "Alex Fixture" },
                {
                  _id: "888888888888888888888888",
                  displayName: "Roger Korsgaard",
                },
              ],
              lastMessage: { content: "Ready for our co-stream tonight?" },
              category: "primary",
            },
          ],
        };
      } else if (
        url.pathname.endsWith("/streaming/streams") &&
        route.request().method() === "GET"
      ) {
        data = {
          streams: [
            {
              _id: "stream-1",
              title: "Design System Collaboration",
              status: "scheduled",
            },
            ...createdStreams,
          ],
        };
      } else if (
        url.pathname.endsWith("/streaming/streams") &&
        route.request().method() === "POST"
      ) {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        const created = {
          _id: `stream-${createdStreams.length + 2}`,
          title: String(body.title || "Untitled Live Stream"),
          description: body.description ? String(body.description) : "",
          status: "scheduled",
          scheduledAt: body.scheduledAt,
          tags: Array.isArray(body.tags) ? body.tags : [],
          chatEnabled: body.chatEnabled ?? true,
          recordingEnabled: Boolean(body.recordingEnabled),
          recordingConsent: Boolean(body.recordingConsent),
          ingestUrl: "rtmp://live.hyperbuds.local/app",
          streamKey: "hb_live_mock_key_12345",
        };
        createdStreams.push(created);
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ stream: created }),
        });
      } else if (
        /\/streaming\/streams\/[^/]+\/start$/.test(url.pathname) &&
        route.request().method() === "PUT"
      ) {
        const streamId = url.pathname.split("/").at(-2) || "stream-2";
        const target =
          createdStreams.find((s) => s._id === streamId) ?? createdStreams[0];
        if (target) {
          target.status = "live";
        }
        data = {
          stream: target ?? {
            _id: streamId,
            title: "Live Stream",
            status: "live",
            ingestUrl: "rtmp://live.hyperbuds.local/app",
            streamKey: "hb_live_mock_key_12345",
          },
        };
      } else if (/notifications/.test(url.pathname)) {
        data = { notifications: [], unreadCount: 0 };
      }

      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    }
    if (url.hostname === "res.cloudinary.com") {
      if (url.pathname.endsWith(".png")) {
        return route.fulfill({
          status: 200,
          contentType: "image/png",
          body: Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "base64",
          ),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: "video/mp4",
        body: Buffer.from("ftypmp42", "utf8"),
      });
    }
    if (url.origin === "http://127.0.0.1:3100") return route.continue();
    return route.abort();
  });

  return { statusUpdates, uploadedMediaRequests, createdStreams };
}

test("dashboard command center renders recommendations, trending and activity across 1440/768/390 without overflow", async ({
  page,
  context,
}) => {
  const fixtures = await isolateDashboardAndMarketplace(context);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Where talent meets the right collab" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Shipping the updated creator lighting kit checklist on HyperBuds today.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
  await expect(page.getByText("Roger Korsgaard")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Maya Chen" })).toBeVisible();
  await expect(page.getByText("94% Match")).toBeVisible();
  await expect(
    page.getByText("HyperStudio AI · Core Team").first(),
  ).toBeVisible();
  await expect(
    page.getByText("submitted deliverable update on HyperStudio AI"),
  ).toBeVisible();

  // Verify hero carousel transitions, cutout images loaded, video slide, & removed tags/progress/pause
  const heroPortrait = page.getByRole('img', { name: 'Featured creator portrait' });
  await expect(heroPortrait).toHaveJSProperty('complete', true);
  expect(await heroPortrait.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

  await expect(page.getByRole('button', { name: 'Pause spotlight' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Product of the Month' })).toHaveCount(0);
  await expect(page.getByText('Verified Profile', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Open to Collabs', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Monthly Pick', { exact: true })).toHaveCount(0);
  await expect(page.locator('.hb-hero-progress')).toHaveCount(0);

  await page.getByRole('button', { name: 'Next spotlight' }).click();
  await expect(page.getByRole('heading', { name: 'Broadcast audio for everyday creators' })).toBeVisible();

  await page.getByRole('button', { name: 'Next spotlight' }).click();
  await expect(
    page.getByRole('heading', { name: 'Co-stream with creators you trust' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Unmute spotlight video' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Previous spotlight' }).click();
  await page.getByRole('button', { name: 'Previous spotlight' }).click();
  await expect(page.getByRole('heading', { name: 'Where talent meets the right collab' })).toBeVisible();

  // Verify compact homepage composer bar + multi-step modals + Cloudinary uploads
  await expect(page.getByTestId("homepage-composer-bar")).toBeVisible();
  await page.getByTestId("composer-mind-trigger").click();
  const postDialog = page.getByTestId("creator-studio-modal");
  await expect(postDialog).toBeVisible();
  await expect(
    postDialog.getByRole("heading", { name: "Create Post" }),
  ).toBeVisible();
  await postDialog
    .getByPlaceholder("What's on your mind, Alex?")
    .fill("Looking for a motion designer for Friday livestream!");
  await postDialog.getByTestId("creator-media-input").setInputFiles({
    name: "studio-banner.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });
  await expect(postDialog.getByText("Uploaded to Cloudinary")).toBeVisible();
  await postDialog.getByTestId("creator-step-next").click();
  await postDialog.getByRole("button", { name: "#CreatorCollab" }).click();
  await postDialog.getByTestId("creator-step-next").click();
  await postDialog.getByTestId("creator-submit-btn").click();
  await expect(postDialog).toHaveCount(0);
  await expect(
    page.getByText("Looking for a motion designer for Friday livestream!"),
  ).toBeVisible();
  expect(fixtures.uploadedMediaRequests.length).toBeGreaterThanOrEqual(1);
  expect(fixtures.uploadedMediaRequests[0].contentType).toContain(
    "multipart/form-data",
  );

  // Verify multi-step Live Stream setup modal from the homepage bar
  await page.getByTestId("composer-livestream-btn").click();
  const liveDialog = page.getByTestId("creator-studio-modal");
  await expect(
    liveDialog.getByRole("heading", { name: "Set Up Live Stream" }),
  ).toBeVisible();
  await liveDialog
    .getByLabel(/Stream Title/i)
    .fill("Friday Creator Collab Q&A");
  await liveDialog.getByTestId("creator-step-next").click();
  await liveDialog.getByText("Save cloud recording for replays").click();
  await expect(liveDialog.getByTestId("creator-step-next")).toBeDisabled();
  await liveDialog
    .getByText(
      "I confirm all co-hosts and participants have granted consent to record this broadcast.",
    )
    .click();
  await expect(liveDialog.getByTestId("creator-step-next")).toBeEnabled();
  await liveDialog.getByTestId("creator-step-next").click();
  await liveDialog.getByTestId("creator-submit-btn").click();
  await expect(
    liveDialog.getByRole("link", { name: "Open Live Studio" }),
  ).toBeVisible();
  await liveDialog.getByRole("button", { name: "Done" }).click();
  await expect(liveDialog).toHaveCount(0);
  expect(fixtures.createdStreams.length).toBe(1);

  // Verify multi-step Create Reel modal with Cloudinary video upload
  await page.getByTestId("composer-reel-btn").click();
  const reelDialog = page.getByTestId("creator-studio-modal");
  await expect(
    reelDialog.getByRole("heading", { name: "Create Reel" }),
  ).toBeVisible();
  await expect(reelDialog.getByTestId("creator-step-next")).toBeDisabled();
  await reelDialog.getByTestId("creator-media-input").setInputFiles({
    name: "reel-sample.mp4",
    mimeType: "video/mp4",
    buffer: Buffer.from("ftypmp42", "utf8"),
  });
  await expect(reelDialog.getByText("Uploaded to Cloudinary")).toBeVisible();
  await reelDialog.getByTestId("creator-step-next").click();
  await reelDialog
    .getByLabel("Reel Caption")
    .fill("Behind the scenes camera rig!");
  await reelDialog.getByTestId("creator-step-next").click();
  await reelDialog.getByTestId("creator-submit-btn").click();
  await expect(reelDialog).toHaveCount(0);
  await expect(
    page.getByText("Reel uploaded to Cloudinary and published."),
  ).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((node) => {
        if (node instanceof HTMLElement && node.scrollTop > 0) {
          node.scrollTop = 0;
        }
      });
      document.documentElement.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      animations: "disabled",
      timeout: 60000,
      fullPage: false,
      path: `docs/design/screenshots/dashboard-${width}.png`,
    });
  }

  expect(errors).toEqual([]);
});

test("marketplace catalog filtering, reset and bookings pipeline render across 1440/768/390 without overflow", async ({
  page,
  context,
}) => {
  const fixtures = await isolateDashboardAndMarketplace(context);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/marketplace");
  await expect(
    page.getByRole("heading", { name: "Creator Marketplace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Design System & Creator Studio UI Kit",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Podcast & Co-Stream Audio Mastering" }),
  ).toBeVisible();

  await page.getByLabel("Filter by category").selectOption("Audio");
  await expect(
    page.getByRole("heading", {
      name: "Design System & Creator Studio UI Kit",
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Podcast & Co-Stream Audio Mastering" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Design System & Creator Studio UI Kit",
    }),
  ).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach((node) => {
        if (node instanceof HTMLElement && node.scrollTop > 0) {
          node.scrollTop = 0;
        }
      });
      document.documentElement.scrollTop = 0;
      window.scrollTo(0, 0);
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      animations: "disabled",
      timeout: 60000,
      fullPage: false,
      path: `docs/design/screenshots/marketplace-${width}.png`,
    });
  }

  expect(errors).toEqual([]);
});

test("marketplace bookings pipeline renders and updates order status", async ({
  page,
  context,
}) => {
  const fixtures = await isolateDashboardAndMarketplace(context);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/marketplace/bookings");
  await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Design System & Creator Studio UI Kit",
    }),
  ).toBeVisible();

  await page
    .getByRole("heading", { name: "Design System & Creator Studio UI Kit" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Order details" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Update Order Status").selectOption("completed");
  await expect(dialog).toHaveCount(0);
  expect(fixtures.statusUpdates).toEqual([
    { id: "book-1001", status: "completed" },
  ]);
  await expect(page.getByText("completed", { exact: true })).toBeVisible();

  expect(errors).toEqual([]);
});