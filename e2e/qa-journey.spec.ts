import {test,expect} from './fixtures';
import type {Browser,BrowserContext,Page,TestInfo} from '@playwright/test';
// QA journey (2026-10-31): post-signup member journey on the local isolated stack (e2e DB, payment/bank stand-ins).
// Every role signs in through the login screen in its own BrowserContext. Each case saves numbered screenshots
// (before / action / result) as attachments so the PC and Mobile projects each keep their own evidence.
const ORIGIN={Origin:'http://127.0.0.1:3011'};
type Cohort={ids:Record<string,string>;creators:Record<string,{id:string;plans:Record<string,string>;posts:Record<string,{id:string;media:string;body:string}>}>;orders:Record<string,{id:string}>;password:string;users:{id:string;email:string;role:string}[]};
async function snap(page:Page,info:TestInfo,step:string){
 // wait for running CSS/Web animations (overlay fades, sheet slides) so the screenshot shows the settled state
 await page.evaluate(()=>Promise.race([Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>null))),new Promise(r=>setTimeout(r,2000))]));const n=String(info.attachments.filter(a=>a.name.startsWith('step-')).length+1).padStart(2,'0');
 const file=info.outputPath(`step-${n}.png`);await page.screenshot({path:file,fullPage:false});await info.attach(`step-${n} ${step}`,{path:file,contentType:'image/png'});}
async function contextFor(browser:Browser,info:TestInfo):Promise<BrowserContext>{
 const u:any=info.project.use;return browser.newContext({baseURL:u.baseURL,viewport:u.viewport,userAgent:u.userAgent,deviceScaleFactor:u.deviceScaleFactor,isMobile:u.isMobile,hasTouch:u.hasTouch,locale:'ko-KR'});}
async function signIn(browser:Browser,info:TestInfo,c:Cohort,role:string,shots=false){
 const ctx=await contextFor(browser,info),page=await ctx.newPage(),user=c.users.find(u=>u.role===role)!;
 await page.goto('/service/login');await page.getByLabel('이메일',{exact:true}).fill(user.email);await page.getByLabel('비밀번호',{exact:true}).fill(c.password);
 if(shots)await snap(page,info,`${role} 로그인 입력(비밀번호 가림 필드)`);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/auth/login')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'로그인',exact:true}).click();expect((await response).ok(),`login ${role}`).toBeTruthy();
 await expect(page.getByRole('link',{name:new RegExp(`^QA ${role} .*내 프로필$`)}).first()).toBeVisible();return {ctx,page};
}
const nick=(role:string)=>`QA ${role} 긴 닉네임 검수용 합성 계정`;

test.describe('QA 회원 여정',()=>{
 test.describe.configure({timeout:180000});

 test('J01 로그인·본인 식별·로그아웃 후 다른 계정 세션 유지',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');
  const a=await signIn(browser,info,c,'S03',true),b=await signIn(browser,info,c,'S07');
  await a.page.goto('/service/me');await expect(a.page.getByText(nick('S03')).first()).toBeVisible();await snap(a.page,info,'S03 내 프로필: 본인 닉네임 표시');
  await b.page.goto('/service/me');await expect(b.page.getByText(nick('S07')).first()).toBeVisible();await snap(b.page,info,'S07 독립 컨텍스트: 본인 닉네임 표시');
  expect((await a.ctx.request.post('/api/v1/auth/logout',{headers:ORIGIN})).ok()).toBeTruthy();
  await a.page.goto('/service/subscriptions');await expect(a.page.getByText('로그인이 필요해요',{exact:true})).toBeVisible();await expect(a.page.getByRole('link',{name:/^QA S03 .*내 프로필$/})).toHaveCount(0);await snap(a.page,info,'S03 로그아웃 후 구독 화면: 로그인 요구');
  await b.page.reload();await expect(b.page.getByText(nick('S07')).first()).toBeVisible();await snap(b.page,info,'S07은 로그인 유지');
  await a.ctx.close();await b.ctx.close();
 });

 test('J02 비로그인 방문자는 보호 화면에서 로그인 안내를 받고 보호 API는 401',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const ctx=await contextFor(browser,info),page=await ctx.newPage();
  await page.goto('/service/feed');await snap(page,info,'비로그인 피드(공개 범위)');
  for(const path of['/service/subscriptions','/service/beans','/service/messages']){await page.goto(path);await expect(page.getByText('로그인이 필요해요',{exact:true})).toBeVisible();await snap(page,info,`비로그인 ${path}: 로그인 안내`);}
  for(const path of['/api/v1/studio/overview','/api/v1/beans/wallet','/api/v1/studio/finance'])expect((await ctx.request.get(path)).status(),path).toBe(401);
  await page.goto('/service/post/'+c.creators.C10.posts.L1.id);await expect(page.getByText(c.creators.C10.posts.L1.body)).toHaveCount(0);await snap(page,info,'비로그인 유료 게시물: 본문 숨김');
  await ctx.close();
 });

 test('J03 활동 분야가 없으면 크리에이터 등록을 진행할 수 없고, 분야를 추가하면 등록이 완료된다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const {ctx,page}=await signIn(browser,info,c,'N0');
  await page.goto('/service/studio');await expect(page.getByRole('heading',{name:'크리에이터 시작하기'})).toBeVisible();
  await page.getByLabel('주요 활동 분야').click().catch(()=>{});await snap(page,info,'분야 0건: 선택지 없음');
  await page.keyboard.press('Escape').catch(()=>{});
  const {name}=await control('category');
  try{
   await page.reload();await expect(page.getByRole('heading',{name:'크리에이터 시작하기'})).toBeVisible();
   await page.getByLabel('크리에이터 활동명').fill('QA 신규 크리에이터');await expect(page.getByLabel('핸들',{exact:true})).toHaveValue(/^@/);// the address is the account user name (2026-10-31), read-only here
   await page.getByLabel('주요 활동 분야').click();await page.getByRole('option',{name}).click();await snap(page,info,'분야 추가 후 기본 정보 입력');
   await page.getByRole('button',{name:'다음 단계 →'}).click();
   const agree=page.getByRole('checkbox');await agree.first().check();await snap(page,info,'공개 프로필 확인·동의');
   await page.getByRole('button',{name:/완료|시작/}).last().click();await expect(page.getByRole('heading',{name:/크리에이터 설정 완료|QA 신규 크리에이터님, 반가워요/})).toBeVisible();await snap(page,info,'등록 완료 후 스튜디오');
   const o=await (await ctx.request.get('/api/v1/studio/overview')).json();expect(o.success).toBe(true);
  }finally{await control('category-remove');await ctx.close();}
 });

 test('J04 구독 결제: 카드 등록 회원이 C0 멤버십을 결제하고 C0 구독자가 1명이 된다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const fan=await signIn(browser,info,c,'S03'),creator=await signIn(browser,info,c,'C0');
  const before=await (await creator.ctx.request.get('/api/v1/studio/overview')).json();expect(Number(before.data.metrics.find((m:any)=>m.id==='subscribers').value)).toBe(0);
  const order=await (await fan.ctx.request.post('/api/v1/checkout',{headers:ORIGIN,data:{planId:c.creators.C0.plans['1'],requestId:crypto.randomUUID(),creatorProvision:'2026-10-30.1'}})).json();expect(order.success,order.errorCode).toBe(true);
  await fan.page.goto('/service/checkout/'+order.data.id);await expect(fan.page.getByRole('button',{name:'결제하고 가입',exact:true})).toBeVisible();await snap(fan.page,info,'S03 결제 화면(등록 카드·금액)');
  await fan.page.getByRole('checkbox',{name:/결제에 동의합니다/}).check();await fan.page.getByRole('button',{name:'결제하고 가입',exact:true}).click();await expect(fan.page.getByText('멤버십 가입 완료',{exact:true})).toBeVisible();await snap(fan.page,info,'가입 완료');
  await creator.page.goto('/service/studio');await expect.poll(async()=>Number((await (await creator.ctx.request.get('/api/v1/studio/overview')).json()).data.metrics.find((m:any)=>m.id==='subscribers').value)).toBe(1);
  await creator.page.reload();await snap(creator.page,info,'C0 스튜디오: 구독자 1');
  // paying the same order again is idempotent: no second subscription
  await fan.ctx.request.post(`/api/v1/checkout/${order.data.id}/pay`,{headers:ORIGIN,data:{}});
  expect(Number((await (await creator.ctx.request.get('/api/v1/studio/overview')).json()).data.metrics.find((m:any)=>m.id==='subscribers').value)).toBe(1);
  await fan.ctx.close();await creator.ctx.close();
 });

 test('J05 등급 차등 열람: L1 구독자는 L1 본문을 보고 L2는 잠김, 소유자는 모두 열람',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const p=c.creators.C10.posts;
  const s03=await signIn(browser,info,c,'S03'),owner=await signIn(browser,info,c,'C10'),s01=await signIn(browser,info,c,'S01');
  await s03.page.goto('/service/post/'+p.L1.id);await expect(s03.page.getByText(p.L1.body)).toBeVisible();await expect(s03.page.getByText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)).toHaveCount(0);await snap(s03.page,info,'S03(L1) L1 게시물 본문 표시');
  await s03.page.goto('/service/post/'+p.L2.id);await expect(s03.page.getByText(p.L2.body)).toHaveCount(0);await snap(s03.page,info,'S03(L1) L2 게시물 잠김');
  await s01.page.goto('/service/post/'+p.L1.id);await expect(s01.page.getByText(p.L1.body)).toHaveCount(0);await snap(s01.page,info,'S01(다른 크리에이터 구독) 잠김');
  await owner.page.goto('/service/post/'+p.exactL2.id);await expect(owner.page.getByText(p.exactL2.body)).toBeVisible();await snap(owner.page,info,'C10 소유자 상품 전용 글 열람');
  for(const x of[s03,owner,s01])await x.ctx.close();
 });

 test('J06 유료 미디어 링크를 다른 독립 세션에 전달해도 열리지 않는다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const media=`/api/v1/media/${c.creators.C10.posts.L3.media}/file`;
  const s11=await signIn(browser,info,c,'S11'),n0=await signIn(browser,info,c,'N0'),g0=await contextFor(browser,info);
  const r1=await s11.page.goto(media);expect(r1!.status()).toBe(200);await snap(s11.page,info,'S11(L3) 원본 미디어 200');
  const r2=await n0.page.goto(media);expect(r2!.status()).toBe(403);await snap(n0.page,info,'N0 같은 URL 403');
  const gp=await g0.newPage();const r3=await gp.goto(media);expect(r3!.status()).toBe(403);await snap(gp,info,'비로그인 같은 URL 403');
  for(const x of[s11.ctx,n0.ctx,g0])await x.close();
 });

 test('J07 잠긴 게시물에는 후원 버튼이 없고, 열람 가능한 게시물은 후원이 끝까지 진행된다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const p=c.creators.C10.posts;await control('qa-beans',{memberId:c.ids.S11,quantity:100});
  const s01=await signIn(browser,info,c,'S01'),s11=await signIn(browser,info,c,'S11');
  await s01.page.goto('/service/post/'+p.L3.id);await expect(s01.page.getByRole('button',{name:/후원/})).toHaveCount(0);await snap(s01.page,info,'S01 잠긴 L3 게시물: 후원 버튼 없음');
  const locked=await (await s01.ctx.request.post(`/api/v1/creators/${c.creators.C10.id}/tips`,{headers:ORIGIN,data:{quantity:1,requestId:crypto.randomUUID(),postId:p.L3.id,message:'',creatorProvision:'2026-10-30.1'}})).json();expect(locked.errorCode).toBe('POST_ACCESS_REQUIRED');
  await s11.page.goto('/service/post/'+p.L3.id);await expect(s11.page.getByText(p.L3.body)).toBeVisible();
  await s11.page.getByRole('button',{name:/후원/}).first().click();const dialog=s11.page.getByRole('dialog');await expect(dialog.getByText('사용 가능한 콩')).toBeVisible();await s11.page.waitForTimeout(400);await snap(s11.page,info,'S11 후원 창(잔액 100콩)');
  const balance=async()=>((await (await s11.ctx.request.get('/api/v1/beans/wallet')).json()).data.accounts as any[]).filter(a=>['purchased','promotion'].includes(a.bucket)).reduce((n,a)=>n+Number(a.balance),0);
  const before=await balance();expect(before).toBe(100);
  await dialog.getByRole('button',{name:/^10콩 후원하기$/}).click();
  await dialog.getByRole('checkbox',{name:/크리에이터에게 제공하는 데 동의/}).check();await snap(s11.page,info,'최종 확인: 제공 동의');
  await dialog.getByRole('button',{name:'확인하고 후원하기'}).click();await s11.page.waitForTimeout(500);await snap(s11.page,info,'후원 실행 결과');
  await expect.poll(balance).toBeLessThan(before);
  await s11.page.goto('/service/beans');await snap(s11.page,info,'S11 지갑: 잔액 감소·내역');
  await s01.ctx.close();await s11.ctx.close();
 });

 test('J08 메시지: 구독자가 보낸 메시지를 크리에이터가 받고, 제3자는 대화를 읽을 수 없다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const s03=await signIn(browser,info,c,'S03'),c10=await signIn(browser,info,c,'C10'),n0=await signIn(browser,info,c,'N0');
  const first='QA 첫 메시지 '+c.ids.S03.slice(0,6),text='QA 화면 메시지 '+c.ids.S03.slice(0,6);
  // Conversation start through the API (the messages list shows existing conversations); the reply below uses the screen.
  expect((await (await s03.ctx.request.post(`/api/v1/members/${c.creators.C10.id}/messages`,{headers:ORIGIN,data:{body:first}})).json()).success).toBe(true);
  await s03.page.goto('/service/messages');await s03.page.getByRole('button',{name:/QA C10 크리에이터/}).first().click();
  const box=s03.page.getByRole('textbox').last();await box.fill(text);await snap(s03.page,info,'S03 대화방에서 메시지 작성');
  await s03.page.getByRole('button',{name:/보내기|전송/}).last().click();await expect(s03.page.getByRole('region',{name:/님과의 대화/}).getByText(text)).toBeVisible();await expect(s03.page.getByText(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)).toHaveCount(0);await snap(s03.page,info,'S03 전송 완료');
  await c10.page.goto('/service/studio/messages');await snap(c10.page,info,'C10 스튜디오 메시지 목록');
  await c10.page.getByRole('button',{name:/QA S03/}).first().click();await expect(c10.page.getByRole('region',{name:/님과의 대화/}).getByText(text)).toBeVisible();await snap(c10.page,info,'C10 수신 확인');
  const boot=await (await n0.ctx.request.get('/api/v1/bootstrap')).text();expect(boot).not.toContain(text);expect(boot).not.toContain(first);
  await n0.page.goto('/service/messages');await expect(n0.page.getByText(text)).toHaveCount(0);await snap(n0.page,info,'N0 메시지 화면: 남의 대화 없음');
  for(const x of[s03,c10,n0])await x.ctx.close();
 });

 test('J09 해지 예약 후에도 남은 기간 동안 열람이 유지된다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const s04=await signIn(browser,info,c,'S04');const p=c.creators.C10.posts.L1;
  await s04.page.goto('/service/subscriptions');await snap(s04.page,info,'S04 내 구독(C10 레벨1)');
  await s04.page.getByRole('button',{name:'갱신 해지',exact:true}).first().click();await snap(s04.page,info,'해지 확인 창');
  await s04.page.getByRole('dialog').getByRole('button',{name:/해지/}).click();await expect(s04.page.getByText(/종료일까지 이용/).first()).toBeVisible();await snap(s04.page,info,'해지 예약 완료');
  await s04.page.goto('/service/post/'+p.id);await expect(s04.page.getByText(p.body)).toBeVisible();await snap(s04.page,info,'해지 예약 중 L1 본문 열람 유지');
  await s04.ctx.close();
 });

 test('J10 크리에이터 수익 화면: C10의 구독 매출·수수료·보류가 원장·정책과 같다',async({browser,control},info)=>{
  const c:Cohort=await control('cohort');const policy=await control('qa-policy');const c10=await signIn(browser,info,c,'C10');
  const f=(await (await c10.ctx.request.get('/api/v1/studio/finance')).json()).data;
  // 10 C10 orders: 4×L1(5,000) + 4×L2(10,000) + 2×L3(15,000) = 90,000 KRW; fee = floor(price × policy bps) per order.
  const prices=[5000,5000,5000,5000,10000,10000,10000,10000,15000,15000],fees=prices.reduce((n,p)=>n+Math.floor(p*policy.platformFeeBps/10000),0);
  info.annotations.push({type:'financial-policy',description:`격리 DB 정책 platformFeeBps=${policy.platformFeeBps}, holdDays=${policy.settlementHoldDays}, version=${policy.version}`});
  expect(f.summary.gross).toBe(90000);expect(f.summary.fees).toBe(fees);expect(f.summary.net).toBe(90000-fees);
  await c10.page.goto('/service/studio/earnings');await expect(c10.page.getByText(/90,000/).first()).toBeVisible();await snap(c10.page,info,'C10 수익 화면: 매출 90,000원');
  // Creator agreement 7⑥: each held settlement names its reason (no PG deposit reconciliation recorded in the cohort).
  expect(f.settlements.every((x:any)=>x.status==='pending'&&x.holdReasons.includes('receipt'))).toBe(true);
  await c10.page.goto('/service/studio/settlements');await expect(c10.page.getByText(/대기 사유: .*PG 입금 대사 대기/).first()).toBeVisible();await snap(c10.page,info,'C10 정산 화면: 건별 대기 사유');
  await c10.ctx.close();
 });
});
