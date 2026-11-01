import {test,expect} from './fixtures';
import type {Browser,BrowserContext} from '@playwright/test';
// QA cohort (2026-10-31): role matrix against the real local API (isolated e2e DB, payment provider stand-in).
// Every principal has its own BrowserContext (separate cookie jar); cross checks keep several contexts open at once.
const BASE='http://127.0.0.1:3011',ORIGIN={Origin:BASE};
type Cohort={ids:Record<string,string>;creators:Record<string,{id:string;plans:Record<string,string>;posts:Record<string,{id:string;media:string;body:string}>}>;orders:Record<string,{id:string;creator:string;level:number;amount:number}>;password:string;users:{id:string;email:string;role:string}[]};
const POSTS=['public','L1','L2','L3','exactL2'] as const;
// Expected access to C10 content; exact-L2 is a product-only post (accessPlanId), so a higher level does not open it.
const EXPECTED:Record<string,Record<(typeof POSTS)[number],boolean>>={
 C10:{public:true,L1:true,L2:true,L3:true,exactL2:true},
 S03:{public:true,L1:true,L2:false,L3:false,exactL2:false},
 S07:{public:true,L1:true,L2:true,L3:false,exactL2:true},
 S11:{public:true,L1:true,L2:true,L3:true,exactL2:false},
 S01:{public:true,L1:false,L2:false,L3:false,exactL2:false},
 C2:{public:true,L1:false,L2:false,L3:false,exactL2:false},
 N0:{public:true,L1:false,L2:false,L3:false,exactL2:false},
 G0:{public:true,L1:false,L2:false,L3:false,exactL2:false},
};
async function principal(browser:Browser,cohort:Cohort|null,role:string):Promise<BrowserContext>{
 const ctx=await browser.newContext({baseURL:BASE});
 if(role==='G0'||!cohort)return ctx;
 const user=cohort.users.find(u=>u.role===role)!;
 const r=await ctx.request.post('/api/v1/auth/login',{data:{email:user.email,password:cohort.password},headers:ORIGIN});expect(r.ok(),`login ${role}`).toBeTruthy();
 return ctx;
}
async function whoami(ctx:BrowserContext){const r=await ctx.request.get('/api/v1/bootstrap');const b=await r.json();return b.data?.signedIn?b.data.viewer?.handle:null;}
const handleOf=(c:Cohort,role:string)=>`qa-${role.toLowerCase()}-${c.ids[role].slice(0,8)}`;

test('QA cohort: identities, 0/2/10 baseline, content and media access matrix, shared URLs, lifecycle, payment race, locked tips',async({browser,control},info)=>{
 test.setTimeout(240000);
 const cohort:Cohort=await control('cohort');const C10=cohort.creators.C10,evidence:any={matrix:[],media:[],shared:[],lifecycle:{},race:{},tips:{},baseline:{}};
 const ctx:Record<string,BrowserContext>={};
 await test.step('each principal is a separate signed-in context (and G0 has no session)',async()=>{
  for(const role of['C0','C2','C10','S01','S03','S07','S11','N0','G0'])ctx[role]=await principal(browser,cohort,role);
  for(const role of Object.keys(ctx))expect(await whoami(ctx[role]),role).toBe(role==='G0'?null:handleOf(cohort,role));
 });
 await test.step('baseline: creators have 0 / 2 / 10 active subscribers in the studio API',async()=>{
  for(const [c,n] of [['C0',0],['C2',2],['C10',10]] as const){const r=await ctx[c].request.get('/api/v1/studio/overview');expect(r.status(),c).toBe(200);const o=await r.json();
   const count=Number(o.data.metrics.find((m:any)=>m.id==='subscribers').value);evidence.baseline[c]=count;expect(count,`${c} subscribers (studio metric)`).toBe(n);}
  expect(Object.keys(cohort.orders).length).toBe(12);expect(new Set(Object.values(cohort.orders).map(o=>o.id)).size).toBe(12);
 });
 await test.step('post body and media file follow the access matrix (GET, HEAD, Range) for 8 principals at once',async()=>{
  for(const [role,expected] of Object.entries(EXPECTED))for(const kind of POSTS){
   const post=C10.posts[kind],detail=await ctx[role].request.get(`/api/v1/posts/${post.id}`),text=await detail.text(),leaked=text.includes(post.body);
   evidence.matrix.push({role,kind,status:detail.status(),bodyVisible:leaked});
   expect(leaked,`${role} body of ${kind}`).toBe(expected[kind]);
   const file=await ctx[role].request.get(`/api/v1/media/${post.media}/file`),head=await ctx[role].request.head(`/api/v1/media/${post.media}/file`),range=await ctx[role].request.get(`/api/v1/media/${post.media}/file`,{headers:{Range:'bytes=0-9'}});
   evidence.media.push({role,kind,get:file.status(),head:head.status(),range:range.status(),cache:file.headers()['cache-control']||null});
   if(expected[kind]){expect(file.status(),`${role} GET ${kind}`).toBe(200);expect(head.status()).toBe(200);expect([200,206]).toContain(range.status());expect(file.headers()['cache-control']).toContain('no-store');}
   else{expect(file.status(),`${role} GET ${kind}`).toBe(403);expect(head.status(),`${role} HEAD ${kind}`).toBe(403);expect(range.status(),`${role} Range ${kind}`).toBe(403);expect((await file.body()).length).toBeLessThan(400);}
  }
 });
 await test.step('a subscriber’s media URL shared after it was loaded stays closed to other contexts',async()=>{
  const url=`/api/v1/media/${C10.posts.L3.media}/file`;const warm=await ctx.S11.request.get(url);expect(warm.status()).toBe(200);
  for(const role of['N0','G0','S01','S03','C2']){const r=await ctx[role].request.get(url);evidence.shared.push({role,status:r.status()});expect(r.status(),role).toBe(403);}
  const again=await ctx.S11.request.get(url);expect(again.status(),'owner of the right still served').toBe(200);
 });
 await test.step('logging one account out does not change another context',async()=>{
  const out=await ctx.S03.request.post('/api/v1/auth/logout',{headers:ORIGIN});expect(out.ok()).toBeTruthy();
  expect(await whoami(ctx.S03)).toBeNull();expect(await whoami(ctx.S07)).toBe(handleOf(cohort,'S07'));
  expect((await ctx.S03.request.get(`/api/v1/media/${C10.posts.L1.media}/file`)).status()).toBe(403);
  expect((await ctx.S07.request.get(`/api/v1/media/${C10.posts.L1.media}/file`)).status()).toBe(200);
 });
 await test.step('cancellation keeps the paid period; expiry and an unused refund remove access; a viewed order is not refunded',async()=>{
  for(const role of['S04','S05','S08','S09'])ctx[role]=await principal(browser,cohort,role);
  const l1=C10.posts.L1,l2=C10.posts.L2;
  const cancel=await ctx.S04.request.post(`/api/v1/subscriptions/${C10.id}/cancel`,{headers:ORIGIN});evidence.lifecycle.cancel=cancel.status();expect(cancel.ok(),'cancel').toBeTruthy();
  expect((await ctx.S04.request.get(`/api/v1/media/${l1.media}/file`)).status(),'cancelled keeps access').toBe(200);
  await control('cohort-expire',{memberId:cohort.ids.S05});
  const expired=await ctx.S05.request.get(`/api/v1/media/${l1.media}/file`);evidence.lifecycle.expired=expired.status();expect(expired.status(),'expired loses access').toBe(403);
  expect(await (await ctx.S05.request.get(`/api/v1/posts/${l1.id}`)).text()).not.toContain(l1.body);
  const refund=await ctx.S08.request.post(`/api/v1/checkout/${cohort.orders.S08.id}/refund`,{headers:ORIGIN});const rb=await refund.json();evidence.lifecycle.unusedRefund={status:refund.status(),code:rb.errorCode};
  expect(refund.ok(),`unused refund ${rb.errorCode}`).toBeTruthy();
  expect((await ctx.S08.request.get(`/api/v1/media/${l2.media}/file`)).status(),'refunded loses access').toBe(403);
  expect((await ctx.S09.request.get(`/api/v1/media/${l2.media}/file`)).status()).toBe(200);
  const used=await ctx.S09.request.post(`/api/v1/checkout/${cohort.orders.S09.id}/refund`,{headers:ORIGIN});const ub=await used.json();evidence.lifecycle.usedRefund={status:used.status(),code:ub.errorCode};
  expect(used.ok(),'viewed order must not be refunded automatically').toBeFalsy();
  expect((await ctx.S09.request.get(`/api/v1/media/${l2.media}/file`)).status(),'viewer keeps access').toBe(200);
 });
 await test.step('other members cannot read someone else’s order and cannot edit another creator’s post',async()=>{
  expect((await ctx.N0.request.get(`/api/v1/checkout/${cohort.orders.S07.id}`)).status()).toBe(404);
  const edit=await ctx.N0.request.post('/api/v1/studio/content',{headers:ORIGIN,data:{id:C10.posts.public.id,title:'변조',body:'변조',media:[],commentsEnabled:true,accessPlanId:null,status:'published',scheduledAt:null}});
  expect(edit.ok(),'N0 edit C10 post').toBeFalsy();
  const del=await ctx.C2.request.post(`/api/v1/studio/content/${C10.posts.public.id}/delete`,{headers:ORIGIN});expect(del.ok(),'C2 delete C10 post').toBeFalsy();
  expect(await (await ctx.G0.request.get(`/api/v1/posts/${C10.posts.public.id}`)).text()).toContain(C10.posts.public.body);
 });
 await test.step('a tip on a post the member cannot see is refused before any balance check; a visible one reaches the balance check',async()=>{
  const locked=await ctx.S01.request.post(`/api/v1/creators/${C10.id}/tips`,{headers:ORIGIN,data:{quantity:1,requestId:crypto.randomUUID(),postId:C10.posts.L3.id,message:'',creatorProvision:'2026-10-30.1'}});
  const lb=await locked.json();evidence.tips.locked={status:locked.status(),code:lb.errorCode};expect(locked.status()).toBe(403);expect(lb.errorCode).toBe('POST_ACCESS_REQUIRED');
  const visible=await ctx.S11.request.post(`/api/v1/creators/${C10.id}/tips`,{headers:ORIGIN,data:{quantity:1,requestId:crypto.randomUUID(),postId:C10.posts.L3.id,message:'',creatorProvision:'2026-10-30.1'}});
  const vb=await visible.json();evidence.tips.visibleNoBeans={status:visible.status(),code:vb.errorCode};expect(vb.errorCode).toBe('INSUFFICIENT_BEANS');
 });
 await test.step('two simultaneous payments of one order produce one subscription',async()=>{
  ctx.S12=await principal(browser,cohort,'S12');// S12 already has a registered test card (cohort fixture); C0 is a different creator
  const order=await ctx.S12.request.post('/api/v1/checkout',{headers:ORIGIN,data:{planId:cohort.creators.C0.plans['1'],requestId:crypto.randomUUID(),creatorProvision:'2026-10-30.1'}});const ob=await order.json();expect(order.ok(),ob.errorCode).toBeTruthy();
  evidence.race.order=ob.data.id;
  const [a,b]=await Promise.all([ctx.S12.request.post(`/api/v1/checkout/${ob.data.id}/pay`,{headers:ORIGIN,data:{}}),ctx.S12.request.post(`/api/v1/checkout/${ob.data.id}/pay`,{headers:ORIGIN,data:{}})]);
  const ab=await a.json(),bb=await b.json();evidence.race.responses=[{status:a.status(),code:ab.errorCode,state:ab.data?.status},{status:b.status(),code:bb.errorCode,state:bb.data?.status}];
  const c0=await (await ctx.C0.request.get('/api/v1/studio/overview')).json();const count=Number(c0.data.metrics.find((m:any)=>m.id==='subscribers').value);evidence.race.c0Subscribers=count;
  expect(count,'exactly one subscription from a double pay').toBe(1);expect([a,b].filter(r=>r.ok()).length,'at least one pay call succeeds').toBeGreaterThanOrEqual(1);
 });
 await test.step('screens: locked vs unlocked post and the public feed (390 / 1280)',async()=>{
  for(const [role,width] of [['S03',390],['S07',390],['G0',1280]] as const){const page=await ctx[role].newPage();await page.setViewportSize({width,height:844});
   await page.goto(`/service/post/${C10.posts.L2.id}`);await page.waitForLoadState('networkidle');await page.screenshot({path:info.outputPath(`post-L2-${role}-${width}.png`)});
   const shown=await page.getByText(C10.posts.L2.body).count();expect(shown>0,`${role} UI body`).toBe(EXPECTED[role].L2);await page.close();}
 });
 await info.attach('qa-cohort-evidence.json',{body:JSON.stringify(evidence,null,1),contentType:'application/json'});
 for(const c of Object.values(ctx))await c.close();
});
