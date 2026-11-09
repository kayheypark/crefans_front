// Messages now use the shared Toast (2026-10-30): an always-present status region holding an open toast with a close button.
import {settledShot} from './qa-settled';
import {test,expect,type Page} from '@playwright/test';
test.afterEach(settledShot);
// Assert each visible UI and action below; offscreen lazy images must not gate document readiness in WebKit.
const title='분홍빛 첫 인사';
const shareLayer=(page:Page)=>page.getByRole('dialog',{name:'게시물 공유',exact:true});
async function browserAPIs(page:Page,{native='success',clipboard='success'}={}){
 await page.addInitScript(({native,clipboard})=>{
  const state={copies:[] as string[],shares:[] as {data:ShareData;active:boolean}[],native,clipboard};(window as any).__shareQA=state;
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(url:string)=>{state.copies.push(url);if(state.clipboard==='failure')throw new DOMException('test denied','NotAllowedError');}}});
  Object.defineProperty(navigator,'share',{configurable:true,value:native==='unsupported'?undefined:async(data:ShareData)=>{state.shares.push({data,active:navigator.userActivation.isActive});if(state.native==='cancel')throw new DOMException('test cancel','AbortError');if(state.native==='failure')throw new DOMException('test denied','NotAllowedError');}});
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>native!=='unsupported'});
 },{native,clipboard});
}
async function openShare(page:Page,postTitle=title,scope:ReturnType<Page['locator']>|Page=page){
 await scope.getByRole('button',{name:`${postTitle} 더보기`,exact:true}).click();await scope.getByRole('menuitem',{name:'공유',exact:true}).click();await expect(shareLayer(page)).toBeVisible();
}
async function assertLayout(page:Page){
 const dialog=shareLayer(page),box=await dialog.boundingBox();expect(box).not.toBeNull();expect(box!.x).toBeGreaterThanOrEqual(-1);expect(box!.x+box!.width).toBeLessThanOrEqual(page.viewportSize()!.width+1);
 for(const name of ['복사','카카오톡','더보기']){const r=await dialog.getByRole('button',{name,exact:true}).boundingBox();expect(r!.width).toBeGreaterThanOrEqual(44);expect(r!.height).toBeGreaterThanOrEqual(44);}
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
}
test('share opens three choices; copy and native sharing only run on their own clicks',async({page})=>{
 await browserAPIs(page);await page.goto('/preview/feed?unrelated=do-not-share#context',{waitUntil:'domcontentloaded'});await openShare(page);
 const layer=shareLayer(page);await expect(layer.getByRole('button',{name:'카카오톡',exact:true})).toBeDisabled();await expect(layer.getByText('카카오톡 공유는 준비 중이에요.')).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__shareQA.copies)).toEqual([]);expect(await page.evaluate(()=>(window as any).__shareQA.shares)).toEqual([]);await expect(layer.getByText('링크를 복사했어요.')).toHaveCount(0);await assertLayout(page);
 await layer.getByRole('button',{name:'복사',exact:true}).click();await expect(layer.locator('[role="status"] > [data-state="open"]')).toContainText('링크를 복사했어요.');
 await layer.getByRole('button',{name:'더보기',exact:true}).click();const state=await page.evaluate(()=>(window as any).__shareQA);
 // 99440da: shared links carry the share source (?share=copy|native) for the post's inflow metrics.
 expect(state.copies).toEqual([`${new URL(page.url()).origin}/preview/post/moka-first-shoot?share=copy`]);expect(state.shares).toEqual([{active:true,data:{title:`${title} | 크레팬스`,url:`${new URL(page.url()).origin}/preview/post/moka-first-shoot?share=native`}}]);
 await page.screenshot({path:test.info().outputPath('share.png')});
});
test('failed copy reveals selectable URL; cancelling native share leaves the layer usable',async({page})=>{
 await browserAPIs(page,{native:'cancel',clipboard:'failure'});await page.goto('/preview/post/moka-first-shoot',{waitUntil:'domcontentloaded'});await openShare(page);const layer=shareLayer(page);
 await layer.getByRole('button',{name:'복사',exact:true}).click();await expect(layer.getByRole('alert')).toContainText('직접 복사');const field=layer.getByRole('textbox',{name:'공유 링크'});await expect(field).toHaveValue(`${new URL(page.url()).origin}/preview/post/moka-first-shoot?share=copy`);expect(await field.evaluate((el:HTMLInputElement)=>el.selectionEnd!-el.selectionStart!)).toBeGreaterThan(0);
 await layer.getByRole('button',{name:'더보기',exact:true}).click();await expect(layer.getByRole('alert')).toHaveCount(0);await expect(layer).toBeVisible();await expect(layer.getByRole('button',{name:'복사',exact:true})).toBeEnabled();
});
test('native permission failure reports failure; unsupported browsers keep more visible but disabled',async({page})=>{
 await browserAPIs(page,{native:'failure'});await page.goto('/preview/post/moka-first-shoot',{waitUntil:'domcontentloaded'});await openShare(page);let layer=shareLayer(page);await layer.getByRole('button',{name:'더보기',exact:true}).click();await expect(layer.getByRole('alert')).toContainText('기기 공유창을 열지 못했어요');
 await page.waitForLoadState('networkidle');await browserAPIs(page,{native:'unsupported'});await page.reload({waitUntil:'domcontentloaded'});await openShare(page);layer=shareLayer(page);await expect(layer.getByRole('button',{name:'더보기',exact:true})).toBeDisabled();await expect(layer.getByText(/이 브라우저는 기기 공유를 지원하지/)).toBeVisible();await expect(layer.getByRole('button',{name:'복사',exact:true})).toBeEnabled();
});
test('a gallery share closes independently and returns focus to the post menu button',async({page})=>{
 await browserAPIs(page);await page.goto('/preview/feed',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:/분홍빛 첫 인사 1 크게 보기/}).first().click();const gallery=page.getByRole('dialog',{name:title,exact:true});await expect(gallery).toHaveCSS('opacity','1');await openShare(page,title,gallery);await assertLayout(page);
 await page.keyboard.press('Escape');await expect(shareLayer(page)).not.toBeVisible();await expect(gallery).toBeVisible();await expect(gallery.getByRole('button',{name:`${title} 더보기`,exact:true})).toBeFocused();
 await openShare(page,title,gallery);await shareLayer(page).getByRole('button',{name:'닫기',exact:true}).click();await expect(shareLayer(page)).not.toBeVisible();await expect(gallery).toBeVisible();
});
test('service shares only its permalink and public title even for a locked post',async({page})=>{
 await browserAPIs(page);const creator={id:'qa-owner',name:'작가',handle:'owner',image:'',tags:[],bio:'',followers:'0'};
 const post={id:'qa-paid',creatorId:creator.id,title:'공개 제목',body:'PAID_BODY_DO_NOT_SHARE',image:'/api/v1/media/private/file',media:[{type:'image',url:'/api/v1/media/private/file'}],position:'center',likes:0,comments:0,requiredRank:2,time:'방금',canAccess:false};
 await page.route('**/api/v1/**',async route=>{const path=new URL(route.request().url()).pathname;let data:any={};if(path.endsWith('/bootstrap'))data={data:{creators:[creator],posts:[post],plans:[],creatorPlans:{},notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'',handle:'',image:'',bio:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};else if(path.endsWith('/posts/qa-paid'))data={post,creator};await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});});
 await page.goto('/service/post/qa-paid?token=not-shared',{waitUntil:'domcontentloaded'});await openShare(page,'공개 제목');await shareLayer(page).getByRole('button',{name:'더보기',exact:true}).click();const payload=await page.evaluate(()=>(window as any).__shareQA.shares[0].data);expect(payload).toEqual({title:'공개 제목 | 크레팬스',url:`${new URL(page.url()).origin}/service/post/qa-paid?share=native`});expect(JSON.stringify(payload)).not.toMatch(/private|PAID_BODY|token/);
});
test('catalog uses the shared layer with ready, pending, unavailable and loading states',async({page})=>{
 await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:false}).first().click();const example=page.locator('#post-share');await example.getByRole('button',{name:'공유 레이어 열기',exact:true}).click();await shareLayer(page).getByRole('button',{name:'카카오톡',exact:true}).click();await expect(shareLayer(page).locator('[role="status"] > [data-state="open"]')).toContainText('카카오톡 동작 예시입니다.');await shareLayer(page).getByRole('button',{name:'닫기',exact:true}).click();
 await expect(shareLayer(page)).not.toBeVisible();
 for(const [option,state]of [['처리 중','pending'],['미연결·미지원','unavailable'],['카카오 로딩','loading'],['실패·직접 복사','error']]){
  await example.getByRole('combobox',{name:'공유 상태',exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click();await example.getByRole('button',{name:'공유 레이어 열기',exact:true}).click();const layer=shareLayer(page);
  if(state==='pending')for(const name of ['복사','카카오톡','더보기'])await expect(layer.getByRole('button',{name,exact:true})).toBeDisabled();
  if(state==='unavailable'){await expect(layer.getByRole('button',{name:'카카오톡',exact:true})).toBeDisabled();await expect(layer.getByRole('button',{name:'더보기',exact:true})).toBeDisabled();}
  if(state==='loading'){await expect(layer.getByRole('button',{name:'카카오톡',exact:true})).toBeDisabled();await expect(layer.locator('p[role="status"]')).toHaveText('카카오톡 공유를 준비하고 있어요.');/* inline hint, not a toast */}
  if(state==='error')await expect(layer.getByRole('textbox',{name:'공유 링크'})).toBeVisible();
  await layer.getByRole('button',{name:'닫기',exact:true}).click();await expect(layer).not.toBeVisible();
 }
 await page.screenshot({path:test.info().outputPath('catalog.png')});
});


test('Chromium writes and reads the real clipboard API after the explicit copy click',async({page,context,browserName})=>{
 test.skip(browserName!=='chromium','Clipboard permission automation is Chromium-specific.');
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/preview/post/moka-first-shoot',{waitUntil:'domcontentloaded'});await openShare(page);await shareLayer(page).getByRole('button',{name:'복사',exact:true}).click();await expect(shareLayer(page).locator('[role="status"] > [data-state="open"]')).toContainText('링크를 복사했어요.');expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(`${new URL(page.url()).origin}/preview/post/moka-first-shoot?share=copy`);
});
