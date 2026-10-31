import {test,expect,type Page} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
// Assert each visible UI and action below; offscreen lazy images must not gate document readiness in WebKit.
const nickname='모카의 분홍빛 코스프레와 일상이야기',handle='@moka_cosplay_story_daily';
const plan='모카와 함께 보는 특별한 코스프레 화보 컬렉션 멤버십';
const label=(page:Page,text=nickname)=>page.locator('[data-marquee]:visible').filter({has:page.locator('span',{hasText:text})});
async function fits(page:Page){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  expect(await page.locator('main:visible').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1))).toBeTruthy();
}
async function inspect(page:Page){
 await expect(label(page).first()).toBeVisible();await page.evaluate(()=>document.fonts.ready);await expect.poll(()=>page.locator('[data-marquee]:visible').evaluateAll(es=>es.every(el=>el.firstElementChild!.scrollWidth<=el.clientWidth+1||el.getAttribute('data-overflow')==='true'))).toBeTruthy();await fits(page);
 const rows=await page.locator('[data-marquee]:visible').evaluateAll(es=>es.map(el=>{const line=el.firstElementChild!;return {text:el.textContent,width:el.clientWidth,track:line.scrollWidth,overflow:el.getAttribute('data-overflow'),animation:getComputedStyle(line).animationName};}));
 for(const row of rows){expect(row.width, row.text||'empty').toBeGreaterThan(0);if(row.track>row.width+1){expect(row.overflow,row.text||'').toBe('true');expect(row.animation).not.toBe('none');}}
 await test.info().attach('measured-labels',{body:JSON.stringify(rows,null,2),contentType:'application/json'});
}
for(const path of ['explore','creator/moka','membership/moka','post/moka-first-shoot','subscriptions','messages','notifications','landing']){
 test(`long labels stay inside ${path}`,async({page})=>{await page.goto(`/preview/${path}`,{waitUntil:'domcontentloaded'});await inspect(page);await page.screenshot({path:test.info().outputPath('screen.png')});});
}
test('price, badge and controls stay still as the entire name travels to its end',async({page})=>{
 await page.goto('/preview/creator/moka',{waitUntil:'domcontentloaded'});const heading=page.locator('h1');const name=heading.locator('[data-marquee]');await expect(name).toHaveAttribute('data-overflow','true');
 const badge=heading.getByAltText('인증 크리에이터');const before=await badge.boundingBox();
 const result=await name.evaluate(el=>{const line=el.firstElementChild! as HTMLElement;const animation=line.getAnimations()[0];animation.pause();animation.currentTime=Number(animation.effect!.getTiming().duration)*.95;const box=el.getBoundingClientRect(),text=line.getBoundingClientRect();return {end:text.right-box.right,copies:el.childElementCount,text:el.textContent};});
 expect(Math.abs(result.end)).toBeLessThanOrEqual(1);expect(result.text).toBe(nickname);expect(result.copies).toBe(1);expect(await badge.boundingBox()).toEqual(before);
 await expect(page.getByRole('button',{name:'가입하기',exact:true}).first()).toBeVisible();await fits(page);
});
test('membership selection and locked-post layer show full names, with prices separate',async({page})=>{
 await page.goto('/preview/membership/moka',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'선택하고 계속',exact:true}).last().click();const dialog=page.getByRole('dialog',{name:'멤버십 선택 확인'});await expect(dialog.locator('[data-marquee]',{hasText:plan})).toBeVisible();await expect(dialog.getByText('₩19,900',{exact:true})).toBeVisible();await expect(dialog.getByRole('button',{name:'확인하고 계속'})).toBeDisabled();
 await page.goto('/preview/post/moka-pink-portrait',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'멤버십 안내',exact:true}).click();const offer=page.getByRole('dialog');await expect(offer).toBeVisible();await expect(offer.locator('h3 [data-marquee]',{hasText:plan})).toBeVisible();await expect(offer.getByText('₩19,900',{exact:true})).toBeVisible();await fits(page);
});
test('receipt, following and conversation keep their actions usable with a long identity',async({page})=>{
 await page.goto('/preview/subscriptions?tab=payments',{waitUntil:'domcontentloaded'});await page.getByRole('button').filter({hasText:nickname}).click();await expect(page.getByRole('dialog').locator('[data-marquee]',{hasText:plan})).toBeVisible();await fits(page);
 await page.goto('/preview/explore',{waitUntil:'domcontentloaded'});const card=page.locator('article').filter({hasText:nickname});await card.getByRole('button',{name:'팔로우',exact:true}).click();await page.locator('a[href="/preview/creator/moka"]').first().click();await expect(page).toHaveURL(/\/creator\/moka$/);await page.getByRole('button',{name:'팔로우 하는중',exact:true}).click();await expect(page.getByRole('dialog').locator('[data-marquee]',{hasText:nickname})).toBeVisible();await page.getByRole('button',{name:'취소',exact:true}).click();await page.locator('a[href="/preview/me"]:visible').last().click();await page.locator('a[href="/preview/settings"]').click();await page.getByRole('link',{name:'팔로잉 목록'}).click();await expect(page).toHaveURL(/\/following$/);await expect(label(page,handle)).toBeVisible();await fits(page);
 // Client navigation retains preview follow state.
 
 await page.goto('/preview/messages',{waitUntil:'domcontentloaded'});await page.getByRole('button').filter({hasText:nickname}).first().click();await expect(page.getByRole('region',{name:`${nickname}님과의 대화`})).toBeVisible();await fits(page);
});
test('global pause persists through navigation and reload; reduced motion reveals wrapped text',async({page})=>{
 await page.goto('/preview/settings',{waitUntil:'domcontentloaded'});const toggle=page.locator('main').getByRole('switch',{name:'텍스트 움직임',exact:true});await expect(toggle).toBeChecked();
 const position=await toggle.evaluate(el=>{const row=el.closest('label')!,label=row.querySelector('strong')!.getBoundingClientRect(),input=el.getBoundingClientRect(),bounds=row.getBoundingClientRect();return {gap:input.left-label.right,rightInset:bounds.right-input.right};});
 expect(position.gap).toBeGreaterThan(0);expect(position.rightInset).toBeLessThanOrEqual(5);await fits(page);await toggle.scrollIntoViewIfNeeded();await page.screenshot({path:test.info().outputPath('settings-switch.png')});
 await toggle.uncheck();expect(await page.evaluate(()=>localStorage.getItem('crefans:text-motion'))).toBe('off');
 await page.goto('/preview/explore',{waitUntil:'domcontentloaded'});await expect(label(page).first()).toHaveAttribute('data-paused','true');
 expect(await label(page).first().evaluate(el=>{const line=el.firstElementChild!;return getComputedStyle(line).animationName==='none'&&line.scrollWidth<=el.clientWidth+1&&getComputedStyle(line).whiteSpace==='normal';})).toBeTruthy();await fits(page);
 await page.reload({waitUntil:'domcontentloaded'});await expect(label(page).first()).toHaveAttribute('data-paused','true');
 await page.goto('/preview/settings',{waitUntil:'domcontentloaded'});await expect(toggle).not.toBeChecked();await toggle.focus();await page.keyboard.press('Space');await expect(toggle).toBeChecked();
 expect(await page.evaluate(()=>localStorage.getItem('crefans:text-motion'))).toBe('on');await page.reload({waitUntil:'domcontentloaded'});await expect(toggle).toBeChecked();
 await page.goto('/preview/explore',{waitUntil:'domcontentloaded'});await expect(label(page).first()).toHaveAttribute('data-paused','false');
 await page.evaluate(()=>{localStorage.removeItem('crefans:text-motion');});await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'domcontentloaded'});
 expect(await label(page).first().evaluate(el=>getComputedStyle(el.firstElementChild!).animationName)).toBe('none');await fits(page);
});
test('every motion switch shares the same preference in the catalog',async({page})=>{
 await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:false}).first().click();const sample=page.locator('#marquee-text'),switches=sample.getByRole('switch',{name:'텍스트 움직임',exact:true}),toggle=switches.first(),other=switches.nth(1);
 await expect(toggle).toBeChecked();await toggle.uncheck();await expect(sample.locator('[data-marquee]').first()).toHaveAttribute('data-paused','true');
 await expect(other).not.toBeChecked();await other.check();await expect(toggle).toBeChecked();await expect(sample.locator('[data-marquee]').first()).toHaveAttribute('data-paused','false');
 await expect(sample.getByRole('button',{name:/텍스트 움직임 (켜기|끄기)/})).toHaveCount(0);
});
test('short and empty labels are still; width changes remeasure overflow',async({page})=>{
 await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:false}).first().click();const sample=page.locator('#marquee-text');await expect(sample).toBeVisible();const long=sample.locator('[data-marquee]',{hasText:plan});await expect(long).toHaveAttribute('data-overflow','true');
 await expect(sample.locator('[data-marquee]',{hasText:'짧은 이름'})).toHaveAttribute('data-overflow','false');
 expect(await sample.locator('[data-marquee]').evaluateAll(es=>es.some(e=>e.textContent===''&&e.getAttribute('data-overflow')==='false'))).toBeTruthy();
 await sample.locator('div[style]').first().evaluate(el=>{(el as HTMLElement).style.width='900px';(el as HTMLElement).style.maxWidth='none';});await expect(long).toHaveAttribute('data-overflow','false');
 await sample.locator('div[style]').first().evaluate(el=>{(el as HTMLElement).style.width='120px';});await expect(long).toHaveAttribute('data-overflow','true');
});
test('gallery overlay keeps a readable identity in the mobile panel and desktop detail pane',async({page})=>{
 await page.goto('/preview/feed',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/분홍빛 첫 인사 1 크게 보기/}).first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog).toHaveCSS('opacity','1');const name=dialog.locator('[data-marquee]',{hasText:nickname}).first();await expect(name).toBeVisible();
 await expect.poll(()=>name.evaluate(el=>el.firstElementChild!.scrollWidth<=el.clientWidth+1||el.getAttribute('data-overflow')==='true')).toBeTruthy();
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();await page.screenshot({path:test.info().outputPath('gallery.png')});
});
test('the API-bound service uses the same overflowing profile and membership labels',async({page})=>{
 const creator={id:'qa-artist',name:nickname,handle:handle.slice(1),image:'',cover:'',bio:'긴 이름 표시 검수',tags:[],followers:'0',followingCount:0,isVerified:true,isCreator:true,plans:[{id:'qa-plan',name:plan,rank:1,price:9900,benefits:['테스트 혜택']}]};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:any={};
  if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'',handle:'',image:'',bio:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
  else if(path==='/api/v1/profiles/qa-artist')data=creator;
  else if(path==='/api/v1/posts')data={creators:[creator],posts:[],nextCursor:null};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 await page.goto('/service/creator/qa-artist',{waitUntil:'domcontentloaded'});await inspect(page);await expect(label(page,handle)).toBeVisible();await expect(label(page,plan)).toBeVisible();
});
test('profile media tile reveals all membership lines with either persistent pause or reduced motion',async({page})=>{
 for(const preference of ['pause','reduce']){
  await page.emulateMedia({reducedMotion:preference==='reduce'?'reduce':'no-preference'});
  await page.goto('/preview/settings',{waitUntil:'domcontentloaded'});if(preference==='pause')await page.locator('main').getByRole('switch',{name:'텍스트 움직임',exact:true}).uncheck();else await page.evaluate(()=>localStorage.removeItem('crefans:text-motion'));
  await page.goto('/preview/creator/moka',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/^미디어/}).click();const labels=page.locator('a[class*=postTile] [data-marquee]');await expect(labels).toHaveCount(2);
  expect(await labels.evaluateAll(es=>es.every(el=>{const box=el.closest('a')!.getBoundingClientRect(),text=el.getBoundingClientRect();return text.bottom<=box.bottom+1&&text.top>=box.top-1&&getComputedStyle(el.firstElementChild!).animationName==='none';}))).toBeTruthy();await fits(page);
 }
});
