import { test, expect } from '@playwright/test';

// Browser-only fixtures. No real credentials, database or backend traffic.
test('discovery shell, responsive layout and keyboard navigation', async ({ page, context }) => {
  const user = { _id: '000000000000000000000001', id: '000000000000000000000001', email: 'fixture@example.invalid', role: 'talent', profile: {username:'fixture', displayName:'Browser test account', bio:'Isolated fixture', niche:['Design']} };
  const errors: string[] = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Browser exception:', error.message); });
  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-browser-fixture');
    localStorage.setItem('hyperbuds-theme', 'light');
    sessionStorage.setItem('skipped_profile_completion', 'true');
  });
  await context.routeWebSocket('**/*', socket => {
    if (new URL(socket.url()).origin === 'ws://127.0.0.1:3100') socket.connectToServer();
    else socket.close();
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/api/v1/')) {
      let data: unknown = {};
      if (/\/(auth|users)\/me$/.test(url.pathname)) data = { user, profile: user.profile };
      else if (/suggestions|matching/.test(url.pathname)) data = { matches: [], suggestions: [], data: [], pagination: {page:1, limit:10, total:0} };
      else if (/notifications/.test(url.pathname)) data = {notifications:[],unreadCount:0};
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    }
    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort();
  });
  page.on('console', message => { if (message.type() === 'error') console.log('console:', message.text()); });
  page.on('requestfailed', request => console.log('requestfailed:', new URL(request.url()).pathname, request.failure()?.errorText));
  await page.goto('/ai-matches', {waitUntil:'domcontentloaded'});
  await expect(page.getByRole('heading', {name:'Find your next collaborator'})).toBeVisible().catch(async error => {
    console.log('render diagnostics', await page.evaluate(() => ({url:location.href, text:document.body.innerText, hasFixture:localStorage.getItem('accessToken') === 'isolated-browser-fixture'})));
    throw error;
  });
  await expect(page.getByRole('heading', {name:'No Matches Yet'})).toBeVisible();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({width,height:1000});
    if (width === 1440) await expect(page.getByText('Design', {exact:true}).filter({visible:true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/discovery-${width}.png`});
  }
  await page.getByRole('button', {name:'Toggle dark mode',exact:true}).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.screenshot({animations:'disabled',timeout:60000,path:'docs/design/screenshots/discovery-390-dark.png'});
  const open = page.getByRole('button',{name:'Open navigation',exact:true});
  await open.click();
  await expect(page.getByRole('button',{name:'Close navigation',exact:true})).toBeFocused({timeout:3000}).catch(async error => {
    console.log('focus diagnostics', await page.evaluate(() => ({active:document.activeElement?.outerHTML.slice(0,600),width:innerWidth,buttons:Array.from(document.querySelectorAll('button')).map(b=>({label:b.getAttribute('aria-label')||b.textContent,visibility:getComputedStyle(b).visibility,rects:b.getClientRects().length}))})));
    throw error;
  });
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Sign Out',exact:true}).filter({visible:true})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Close navigation',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(open).toBeFocused();
  await expect(open).toHaveAttribute('aria-expanded','false');
  await open.click();
  await page.getByRole('navigation',{name:'Primary'}).filter({visible:true}).getByRole('link',{name:'Matching',exact:true}).click();
  await expect(open).toHaveAttribute('aria-expanded','false');
  await page.setViewportSize({width:1440,height:1000});
  const expand = page.getByRole('button',{name:'Expand navigation',exact:true});
  await expect(expand).toBeVisible();
  await expand.click();
  await page.getByRole('button',{name:'Collapse navigation',exact:true}).click();
  await expect(page.getByRole('button',{name:'Expand navigation',exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('split video signup and onboarding-style multi-step complete profile render across 1440/768/390 without overflow', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await context.addInitScript(() => {
    localStorage.setItem('hyperbuds-theme', 'light');
  });

  await context.routeWebSocket('**/*', (socket) => {
    if (new URL(socket.url()).origin === 'ws://127.0.0.1:3100') socket.connectToServer();
    else socket.close();
  });

  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/api/v1/')) {
      if (url.pathname.endsWith('/auth/register') && route.request().method() === 'POST') {
        const body = route.request().postDataJSON() as Record<string, unknown>;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-user-1',
            email: body.email,
            message: 'User registered successfully. Please verify your email.',
          }),
        });
      }
      if (/username|check-username/.test(url.pathname)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ available: true }),
        });
      }
      if (/niches/.test(url.pathname)) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ niches: ['Design', 'Tech', 'Podcasts'] }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { _id: 'new-user-1', email: 'creator@example.invalid', role: 'talent' },
          profile: {},
        }),
      });
    }
    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort();
  });

  // 1. Signup page (split card + looping video + matchmaking callouts, plus /signup redirect)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/auth\/signup/);
  await page.goto('/auth/signup', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Start your\s+creator match/i })).toBeVisible();
  await expect(
    page.getByLabel('Creator matchmaking and smart collaboration sorting preview video'),
  ).toBeVisible();
  await expect(page.getByText('Creator Matchmaking Hub')).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440) {
      await page.screenshot({
        animations: 'disabled',
        timeout: 60000,
        path: 'docs/design/screenshots/signup-1440.png',
      });
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel('Email').fill('creator@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('StrongPass123!');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByText(/creator@example\.invalid/i)).toBeVisible();

  // 1b. Signin page uses the same split-video layout
  await page.goto('/auth/signin', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Welcome back\s+creator/i })).toBeVisible();
  await expect(page.getByText('Creator Matchmaking Hub')).toBeVisible();
  await page.screenshot({
    animations: 'disabled',
    timeout: 60000,
    path: 'docs/design/screenshots/signin-1440.png',
  });

  // 2. Onboarding-inspired multi-step Complete Profile (including /complete-profile redirect)
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'isolated-complete-profile');
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/complete-profile', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/profile\/complete-profile/);
  await page.waitForLoadState('networkidle');
  await expect(page.getByText('Step 1 of 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add Your Profile Picture' })).toBeVisible();
  await page.screenshot({
    animations: 'disabled',
    timeout: 60000,
    path: 'docs/design/screenshots/complete-profile-1440.png',
  });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Step 2 of 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Set Your Identity' })).toBeVisible();
  await page.getByLabel('Username').fill('modern_creator');
  await page.getByLabel('Display Name').fill('Modern Creator');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Step 3 of 3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Story & Niches' })).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }

  expect(errors).toEqual([]);
});


test('populated discovery, public profile and messaging at three widths', async ({page,context}) => {
 const profile={id:'000000000000000000000002',userId:'000000000000000000000002',username:'studio_fixture',displayName:'Studio Fixture',bio:'Synthetic creator profile for isolated visual testing.',niche:['Design','Podcasts'],avatar:'/images/hero/photo-1494790108377-be9c29b29330.png',rizzScore:72,profileRizzScore:72,location:{city:'Test City',country:'Test Region'},stats:{totalFollowers:12000,avgEngagement:4.2,platformBreakdown:{}},socialLinks:{},isPublic:true,isActive:true};
 const profileTwo={id:'000000000000000000000003',userId:'000000000000000000000003',username:'elena_stream',displayName:'Elena Vance',bio:'Live broadcast producer focused on multi-creator series and spatial studio workflows.',niche:['Live Streaming','Tech'],avatar:'/images/hero/photo-1506794778202-cad84cf45f1d.png',rizzScore:88,profileRizzScore:88,location:{city:'Berlin',country:'DE'},stats:{totalFollowers:42500,avgEngagement:5.6,platformBreakdown:{}},socialLinks:{},isPublic:true,isActive:true};
 const match={_id:'fixture-match',id:'fixture-match',targetUserId:profile.id,targetUser:profile,compatibilityScore:84,matchType:'niche-based',status:'pending',metadata:{algorithm:'synthetic',features:['Shared focus on Design & Podcasts','Weekly collab cadence aligned'],confidence:0.8},scoreBreakdown:{}};
 const matchTwo={_id:'fixture-match-2',id:'fixture-match-2',targetUserId:profileTwo.id,targetUser:profileTwo,compatibilityScore:91,matchType:'ai-suggested',status:'pending',metadata:{algorithm:'synthetic',features:['Co-streaming tech overlap','Strong live chat retention'],confidence:0.9},scoreBreakdown:{}};
 const conversation={_id:'fixture-conversation',type:'group',title:'Fixture studio planning',participants:[{_id:profile.id,username:profile.username}],unreadCounts:[{userId:'000000000000000000000001',count:2}],lastMessage:{content:'Synthetic planning message',createdAt:'invalid-date',sender:{_id:profile.id}},createdAt:'2024-01-02T03:04:05Z',updatedAt:'2024-01-02T03:04:05Z'};
  const user = { _id: '000000000000000000000001', id: '000000000000000000000001', email: 'fixture@example.invalid', role: 'talent', profile: {username:'fixture', displayName:'Browser test account', bio:'Isolated fixture', niche:['Design']} };
  const errors: string[] = [];
  page.on('pageerror', error => { errors.push(error.message); console.error('Browser exception:', error.message); });
  await context.addInitScript(() => {
    localStorage.setItem('accessToken', 'isolated-browser-fixture');
    localStorage.setItem('hyperbuds-theme', 'light');
    sessionStorage.setItem('skipped_profile_completion', 'true');
  });
  await context.routeWebSocket('**/*', socket => {
    if (new URL(socket.url()).origin === 'ws://127.0.0.1:3100') socket.connectToServer();
    else socket.close();
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/api/v1/')) {
      let data: unknown = {};
      if (/\/(auth|users)\/me$/.test(url.pathname)) data = { user, profile: user.profile };
      else if (/suggestions|matching/.test(url.pathname)) data = { matches: [match, matchTwo], pagination: {page:1, limit:10, total:2, pages:1} };
      else if (/(?:profiles|update\/profile)\/(@elena_stream|000000000000000000000003)/.test(url.pathname)) data = {...profileTwo,id:undefined,profileRizzScore:undefined};
      else if (/(?:profiles|update\/profile)\//.test(url.pathname)) data = {...profile,id:undefined,profileRizzScore:undefined};
      else if (/messaging\/conversations\/[^/]+\/messages/.test(url.pathname)) data = {messages:[],pagination:{page:1,total:0,pages:0}};
      else if (/messaging\/conversations/.test(url.pathname)) data = {conversations:[conversation],conversation,pagination:{page:1,total:1,pages:1}};
      else if (/notifications/.test(url.pathname)) data = {notifications:[],unreadCount:0};
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    }
    if (url.origin === 'http://127.0.0.1:3100') return route.continue();
    return route.abort();
  });

 await page.goto('/ai-matches');
 await expect(page.getByRole('heading',{name:'Studio Fixture',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Elena Vance',exact:true})).toBeVisible();
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/populated-discovery-${width}.png`});
 }
 await page.getByRole('button',{name:'View Profile',exact:true}).first().click();
 await expect(page).toHaveURL(/studio_fixture/);
 await expect(page.getByText('Synthetic creator profile for isolated visual testing.',{exact:true}).first()).toBeVisible();
 await expect(page.getByText('Joined Invalid Date',{exact:true})).toHaveCount(0);
 await expect(page.getByText('+8%',{exact:true})).toHaveCount(0);
 await expect(page.getByText('Online',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('img',{name:"Studio Fixture's avatar"})).toBeVisible();
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/populated-profile-${width}.png`});
 }
 await page.getByRole('button',{name:'Message',exact:true}).first().click();
 await expect(page).toHaveURL(new RegExp('userId='+profile.userId));
 await page.goto('/messages');
 await expect(page.getByRole('link',{name:/Fixture studio planning/})).toBeVisible();
 await expect(page.getByLabel('2 unread messages')).toBeVisible();
 for(const width of [1440,768,390]) {
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/populated-messaging-${width}.png`});
 }
 expect(errors).toEqual([]);
});