import {test,expect} from '@playwright/test';

test('messaging preserves failed drafts, supports keyboard retry and isolates conversations',async({page,context})=>{
 const userId='111111111111111111111111',peerId='222222222222222222222222';
 const user={id:userId,_id:userId,email:'self@example.invalid',role:'talent',profile:{username:'self_fixture',displayName:'Messaging fixture',bio:'Synthetic test account',niche:['Design']}};
 const peer={id:peerId,_id:peerId,email:'peer@example.invalid',username:'Fixture peer',role:'talent'};
 const conversations=['333333333333333333333333','444444444444444444444444'].map((_id,i)=>({_id,type:'group',title:i?'Second fixture room':'First fixture room',participants:[peer],unreadCounts:[],isArchived:false,createdAt:'2024-01-01T12:00:00Z',updatedAt:'2024-01-01T12:00:00Z'}));
 let failSend=true;const writes:unknown[]=[];const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await context.addInitScript(()=>{localStorage.setItem('accessToken','isolated-messaging-fixture');localStorage.setItem('hyperbuds-theme','light');sessionStorage.setItem('skipped_profile_completion','true');});
 await context.routeWebSocket('**/*',socket=>{if(new URL(socket.url()).origin==='ws://127.0.0.1:3100')socket.connectToServer();else socket.close();});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.pathname.includes('/api/v1/')){
   let status=200,data:unknown={};
   if(/\/(auth|users)\/me$/.test(url.pathname))data={user,profile:user.profile};
   else if(/messaging\/conversations\/[^/]+\/messages$/.test(url.pathname)){
    const conversationId=url.pathname.split('/').at(-2)!;
    if(route.request().method()==='POST'){
     if(failSend){status=503;data={message:'Synthetic send unavailable; your draft is safe.'};}
     else{const body=route.request().postDataJSON();writes.push({conversationId,...body});data={message:{_id:'555555555555555555555555',conversationId,sender:{_id:userId,email:user.email},content:body.content,type:'text',attachments:[],isRead:false,createdAt:'2024-01-01T12:01:00Z',updatedAt:'2024-01-01T12:01:00Z'}};}
    }else data={messages:[{_id:conversationId+'-message',conversationId,sender:peer,content:'Synthetic planning message for this room.',type:'text',attachments:[],isRead:true,createdAt:'2024-01-01T12:00:00Z',updatedAt:'2024-01-01T12:00:00Z'}],pagination:{page:1,total:1,pages:1}};
   }else if(/messaging\/conversations/.test(url.pathname))data={conversations,conversation:conversations.find(c=>url.pathname.endsWith(c._id)),pagination:{page:1,total:2,pages:1}};
   else if(/notifications/.test(url.pathname))data={notifications:[],unreadCount:0};
   return route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  }if(url.origin==='http://127.0.0.1:3100')return route.continue();return route.abort();
 });
 await page.goto(`/messages/${conversations[0]._id}`);const composer=page.getByRole('textbox',{name:'Message',exact:true});await expect(composer).toBeVisible();await expect(page.getByText('Synthetic planning message for this room.',{exact:true})).toBeVisible();
 await composer.fill('Keep this draft');await composer.press('Enter');await expect(page.getByRole('alert').filter({hasText:'Synthetic send unavailable'})).toBeVisible();await expect(composer).toHaveValue('Keep this draft');expect(writes).toHaveLength(0);
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});await expect(page.getByRole('button',{name:'Send message',exact:true})).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({animations:'disabled',timeout:60000,path:`docs/design/screenshots/messaging-retry-${width}.png`});}
 failSend=false;await composer.press('Enter');await expect(composer).toHaveValue('');await expect(page.getByRole('region',{name:'Message history'}).getByText('Keep this draft',{exact:true})).toBeVisible();expect(writes).toEqual([{conversationId:conversations[0]._id,content:'Keep this draft',type:'text'}]);
 await composer.fill('Private unsent draft');await page.setViewportSize({width:1440,height:1000});await page.getByRole('link',{name:/Second fixture room/}).click();await expect(composer).toHaveValue('');await expect(page.getByRole('region',{name:'Message history'}).getByText('Keep this draft',{exact:true})).toHaveCount(0);expect(errors).toEqual([]);
});
