import {test,expect,type BrowserContext} from '@playwright/test';
const userId='111111111111111111111111';
const pitch={_id:'222222222222222222222222',startupName:'Fixture Studio',tagline:'A synthetic startup for accessible creator tools.',fullDescription:'This isolated fixture explores tools that help small creative teams work together.',category:'Creator tools',fundingStage:'mvp_built',status:'published',recommendedRoles:[{_id:'333333333333333333333333',title:'Product designer',skills:['Design'],isSelected:true}]};
const offer={id:'444444444444444444444444',roleTitle:'Product designer',status:'negotiating',startup:{id:pitch._id,name:pitch.startupName},talent:{name:'Fixture Talent'},offerTerms:{compensationType:'hybrid',salary:125000,currency:'USD',equity:1.25,vesting:'4 years, 1 year cliff'},negotiations:[{senderRole:'talent',note:'Synthetic discussion about the proposed scope.',counterTerms:{salary:130000,equity:1.5}}]};
async function isolate(context:BrowserContext,role:'founder'|'talent'){
 const user={_id:userId,id:userId,email:'fixture@example.invalid',role,profile:{username:'hub_fixture',displayName:'Hub fixture account',bio:'Synthetic browser fixture',niche:['Design']}};
 const drafts:Record<string,unknown>[]=[];const writes:unknown[]=[];let unavailable=false;let currentOffer=structuredClone(offer);
 await context.addInitScript(()=>{localStorage.setItem('accessToken','isolated-hub-fixture');localStorage.setItem('hyperbuds-theme','light');sessionStorage.setItem('skipped_profile_completion','true');});
 await context.routeWebSocket('**/*',socket=>{if(new URL(socket.url()).origin==='ws://127.0.0.1:3100')socket.connectToServer();else socket.close();});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.includes('/api/v1/')){
   let data:unknown={};let status=200;
   if(/\/(users|auth)\/me$/.test(url.pathname))data={user,profile:user.profile};
   else if(url.pathname.endsWith('/matched-talents'))data={status:'success',data:[{id:'888888888888888888888888',name:'Fixture Editor',bio:'Synthetic candidate with editing experience.',skills:['Editing','Design']}]};
   else if(url.pathname.endsWith('/invites')&&route.request().method()==='POST'){const body=route.request().postDataJSON();writes.push({action:'invite',body});data={status:'success',data:{id:'new-fixture-invite'}};status=201;}
   else if(/\/idea-pitches\/[^/]+(?:\/roles)?$/.test(url.pathname)&&route.request().method()==='PUT'){
    const body=route.request().postDataJSON();const id=url.pathname.endsWith('/roles')?url.pathname.split('/').at(-2):url.pathname.split('/').at(-1);const draft=drafts.find(d=>d._id===id);if(draft)Object.assign(draft,url.pathname.endsWith('/roles')?{recommendedRoles:body.roles}:body);writes.push({action:url.pathname.endsWith('/roles')?'roles':'edit',body});data={status:'success',data:draft};
   }else if(/\/idea-pitches\/[^/]+\/(publish|unpublish)$/.test(url.pathname)){
    const draft=drafts.find(d=>d._id===url.pathname.split('/').at(-2));if(draft)draft.status=url.pathname.endsWith('/publish')?'published':'draft';data={status:'success',data:draft};writes.push({action:url.pathname.split('/').at(-1)});
   }else if(/\/invites\/[^/]+\/(accept|negotiate|decline)$/.test(url.pathname)){
    if(unavailable){status=503;data={message:'Fixture transaction temporarily unavailable'};}else{const action=url.pathname.split('/').at(-1);const body=route.request().postDataJSON();writes.push({action,body});currentOffer={...currentOffer,status:action==='accept'?'accepted':action==='decline'?'declined':'negotiating',negotiations:action==='negotiate'?[...currentOffer.negotiations,{senderRole:'talent',note:body.note,counterTerms:body.counterTerms||{salary:130000,equity:1.5}}]:currentOffer.negotiations};data={status:'success',data:{collaborationId:'777777777777777777777777'}};}
   }else if(url.pathname.endsWith('/idea-pitches/my'))data={status:'success',data:drafts,total:drafts.length};
   else if(url.pathname.endsWith('/idea-pitches')){
    if(route.request().method()==='POST'){
     const body=route.request().postDataJSON();writes.push(body);const draft={_id:'555555555555555555555555',...body};drafts.push(draft);data={status:'success',data:draft};status=201;
    }else if(unavailable){status=503;data={message:'Fixture service temporarily unavailable'};}
    else data={status:'success',data:url.searchParams.get('search')?[]:[pitch,{...pitch,_id:'666666666666666666666666',startupName:'Fixture Collective',tagline:'A second synthetic team looking for a collaborator.',fundingStage:'pre_seed',recommendedRoles:[{title:'Engineer',isSelected:true}]}],total:url.searchParams.get('search')?0:2};
   }else if(url.pathname.endsWith('/invites/pipeline'))data={status:'success',data:{invites:[currentOffer],stats:{totalSent:1,negotiating:1}}};
   else if(url.pathname.endsWith('/invites/inbound'))data={status:'success',data:[currentOffer],count:1};
   else if(/notifications/.test(url.pathname))data={notifications:[],unreadCount:0};
   return route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  }
  if(url.origin==='http://127.0.0.1:3100')return route.continue();
  return route.abort();
 });
 return {writes,fail:(value:boolean)=>{unavailable=value;}};
}
test('founder Hub discovery, keyboard details, private drafts and failure recovery',async({page,context})=>{
 const fixtures=await isolate(context,'founder');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/startup-talent');
 await expect(page.getByRole('heading',{name:'Fixture Studio',exact:true})).toBeVisible();
 const details=page.getByText('View pitch details',{exact:false}).first();await details.focus();await page.keyboard.press('Enter');
 await expect(page.getByText(pitch.fullDescription,{exact:true}).first()).toBeVisible();
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#main-content').evaluate(el=>{el.scrollTop=0;});await page.screenshot({animations:'disabled',timeout:60000,fullPage:false,path:`docs/design/screenshots/hub-founder-${width}.png`});}
 await page.getByRole('heading',{name:'Fixture Collective',exact:true}).scrollIntoViewIfNeeded();await expect(page.getByRole('heading',{name:'Fixture Collective',exact:true})).toBeInViewport();
 await page.getByRole('button',{name:'New pitch',exact:true}).click();
 await page.getByLabel('Startup name',{exact:true}).fill('Private fixture draft');await page.getByLabel('One-line pitch').fill('A draft written only to the browser fixture.');await page.getByLabel('Category',{exact:true}).fill('Design');await page.getByLabel('Description',{exact:true}).fill('Synthetic draft description.');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Private fixture draft',exact:true})).toBeVisible();
 expect(fixtures.writes).toEqual([{startupName:'Private fixture draft',tagline:'A draft written only to the browser fixture.',fullDescription:'Synthetic draft description.',category:'Design',fundingStage:'just_an_idea',status:'draft'}]);
 await page.getByRole('button',{name:'Team pipeline',exact:true}).click();await expect(page.getByRole('heading',{name:'Product designer',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Discover pitches',exact:true}).click();await page.getByLabel('Search pitches').fill('no-match');await page.getByRole('button',{name:'Search',exact:true}).click();await expect(page.getByRole('heading',{name:'No pitches match your search'})).toBeVisible();
 fixtures.fail(true);await page.getByLabel('Search pitches').fill('failure');await page.getByRole('button',{name:'Search',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Fixture service temporarily unavailable'})).toBeVisible();
 fixtures.fail(false);await page.getByRole('button',{name:'Try again'}).click();await expect(page.getByRole('heading',{name:'No pitches match your search'})).toBeVisible();
 expect(errors).toEqual([]);
});
test('talent Hub displays actual offer terms and negotiation history',async({page,context})=>{
 const fixtures=await isolate(context,'talent');const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/startup-talent');await expect(page.getByRole('heading',{name:'Fixture Studio',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'New pitch',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'My pitches',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'My opportunities',exact:true}).click();await expect(page.getByText('USD 125,000',{exact:true})).toBeVisible();await expect(page.getByText('1.25%',{exact:true})).toBeVisible();
 await page.getByText('Negotiation history',{exact:true}).click();await expect(page.getByText(/Synthetic discussion about the proposed scope/)).toBeVisible();
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#main-content').evaluate(el=>{el.scrollTop=0;});await page.screenshot({animations:'disabled',timeout:60000,fullPage:false,path:`docs/design/screenshots/hub-talent-${width}.png`});}
 expect(fixtures.writes).toEqual([]);expect(errors).toEqual([]);
});

test('founder publishes a private pitch only after confirmation',async({page,context})=>{
 const fixtures=await isolate(context,'founder');await page.goto('/startup-talent');await page.getByRole('button',{name:'New pitch',exact:true}).click();
 await page.getByLabel('Startup name',{exact:true}).fill('Publish fixture');await page.getByLabel('One-line pitch').fill('Synthetic publication');await page.getByLabel('Category',{exact:true}).fill('Design');await page.getByLabel('Description',{exact:true}).fill('Synthetic description');await page.getByRole('button',{name:'Save draft',exact:true}).click();
 const publish=page.getByRole('button',{name:'Publish pitch',exact:true});await publish.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(publish).toBeFocused();expect(fixtures.writes).toHaveLength(1);
 await publish.click();await page.getByRole('button',{name:'Confirm publish',exact:true}).click();await expect(page.getByRole('button',{name:'Return to draft',exact:true})).toBeVisible();expect(fixtures.writes.at(-1)).toEqual({action:'publish'});
});
test('talent proposes terms, retains history and declines with confirmation',async({page,context})=>{
 const fixtures=await isolate(context,'talent');await page.goto('/startup-talent');await page.getByRole('button',{name:'My opportunities',exact:true}).click();await page.getByRole('button',{name:'Negotiate',exact:true}).click();
 await page.getByLabel('Proposal note').fill('Please review the revised scope.');await page.getByLabel('Proposed salary (optional)').fill('130000');await page.getByLabel('Proposed equity % (optional)').fill('1.5');
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await expect(page.getByRole('dialog')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/hub-proposal-${width}.png`});}
 await page.getByRole('button',{name:'Send proposal',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);expect(fixtures.writes.at(-1)).toEqual({action:'negotiate',body:{note:'Please review the revised scope.',counterTerms:{salary:130000,equity:1.5}}});
 await expect(page.getByText('USD 125,000',{exact:true})).toBeVisible();await page.getByText('Negotiation history',{exact:true}).click();await expect(page.getByText(/Please review the revised scope/)).toBeVisible();
 await page.getByRole('button',{name:'Decline',exact:true}).click();await page.getByRole('button',{name:'Confirm decline',exact:true}).click();await expect(page.getByRole('button',{name:'Accept offer',exact:true})).toHaveCount(0);expect(fixtures.writes.at(-1)).toEqual({action:'decline',body:{}});
});
test('acceptance failure retains confirmation and retries without duplicate successful writes',async({page,context})=>{
 const fixtures=await isolate(context,'talent');await page.goto('/startup-talent');await page.getByRole('button',{name:'My opportunities',exact:true}).click();await page.getByRole('button',{name:'Accept offer',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Counterproposals do not replace the original terms');
 fixtures.fail(true);await page.getByRole('button',{name:'Confirm acceptance',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Fixture transaction temporarily unavailable');expect(fixtures.writes).toHaveLength(0);
 fixtures.fail(false);await page.getByRole('button',{name:'Confirm acceptance',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.getByRole('button',{name:'Accept offer',exact:true})).toHaveCount(0);expect(fixtures.writes).toEqual([{action:'accept',body:{}}]);
});

test('founder manages pitch details and roles then sends explicit invitation terms',async({page,context})=>{
 const fixtures=await isolate(context,'founder');await page.goto('/startup-talent');await page.getByRole('button',{name:'New pitch',exact:true}).click();
 await page.getByLabel('Startup name',{exact:true}).fill('Team fixture');await page.getByLabel('One-line pitch').fill('Synthetic team');await page.getByLabel('Category',{exact:true}).fill('Design');await page.getByLabel('Description',{exact:true}).fill('Synthetic team description');await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await page.getByRole('button',{name:'Manage pitch & team',exact:true}).click();const dialog=page.getByRole('dialog');await dialog.getByLabel('Startup name',{exact:true}).fill('Edited team fixture');await dialog.getByRole('button',{name:'Save pitch details',exact:true}).click();await expect(page.getByRole('heading',{name:'Edited team fixture',exact:true})).toBeVisible();expect(fixtures.writes.at(-1)).toMatchObject({action:'edit',body:{startupName:'Edited team fixture',title:'Edited team fixture'}});
 await page.getByRole('button',{name:'Manage pitch & team',exact:true}).click();await dialog.getByRole('button',{name:'Open roles',exact:true}).click();await dialog.getByLabel('New role title').fill('Editor');await dialog.getByLabel('Skills, separated by commas').fill('Editing, Design');await dialog.getByRole('button',{name:'Add role',exact:true}).click();await dialog.getByRole('button',{name:'Save roles',exact:true}).click();await expect(dialog).toHaveCount(0);expect(fixtures.writes.at(-1)).toEqual({action:'roles',body:{roles:[{title:'Editor',skills:['Editing','Design'],isSelected:true}]}});
 await page.getByRole('button',{name:'Manage pitch & team',exact:true}).click();await dialog.getByRole('button',{name:'Find talent',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Fixture Editor',exact:true})).toBeVisible();await dialog.getByRole('button',{name:'Prepare invitation',exact:true}).click();await dialog.getByLabel('Currency code').fill('GBP');await dialog.getByLabel('Proposed salary amount').fill('125000');await dialog.getByLabel('Vesting / compensation notes').fill('Scope and schedule to be agreed.');
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/hub-invitation-${width}.png`});}
 await dialog.getByRole('button',{name:'Send invitation',exact:true}).click();await expect(dialog.getByRole('button',{name:'Invitation sent',exact:true})).toBeDisabled();expect(fixtures.writes.at(-1)).toEqual({action:'invite',body:{pitchId:'555555555555555555555555',talentId:'888888888888888888888888',roleTitle:'Editor',offerTerms:{compensationType:'salary',salary:125000,equity:0,currency:'GBP',vesting:'Scope and schedule to be agreed.'}}});
});