import {test,expect} from '@playwright/test';
const bootstrap={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'',handle:'',image:'',bio:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1280,height:900}]){
 test(`체험 동의 버튼 고정 및 동의·실패 상태 ${viewport.width}`,async({page})=>{
  await page.setViewportSize(viewport);let starts=0;let release:(()=>void)|undefined;
  await page.route('**/api/v1/**',async route=>{
   const path=new URL(route.request().url()).pathname;
   if(path.endsWith('/guest/session')&&route.request().method()==='POST'){
    starts++;expect(route.request().postDataJSON()).toEqual({consent:true,version:'2026-11-16.guest.5'});
    await new Promise<void>(resolve=>{release=resolve;});
    return route.fulfill({json:{success:false,data:null,errorMessage:'테스트: 다시 시도해 주세요.',errorCode:'TEST'}});
   }
   const data=path.endsWith('/bootstrap')?bootstrap:path.endsWith('/guest/session')?{active:false,limit:10,remaining:10,postHours:24}:{};
   await route.fulfill({json:{success:true,data,errorMessage:null,errorCode:null}});
  });
  await page.goto('/service/try');
  const root=page.locator('[data-guest-consent]'),button=root.getByRole('button',{name:'동의하고 0원체험'}),checkbox=root.getByRole('checkbox');
  if(viewport.width<768)await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeHidden();
  else await expect(page.getByRole('navigation',{name:'사이드 메뉴',exact:true})).toBeVisible();
  await expect(button).toBeDisabled();await expect(checkbox).not.toBeChecked();expect(starts).toBe(0);
  await expect(root.getByRole('img',{name:'내 사진 예시, 가상 인물',exact:true})).toHaveJSProperty('naturalWidth',720);
  await expect(root.getByRole('img',{name:'선택한 모더니아 코스튬',exact:true})).toHaveJSProperty('naturalWidth',512);
  await expect(root.getByRole('img',{name:'모더니아 코스어가 된 내 모습 예시, 가상 인물',exact:true})).toHaveJSProperty('naturalWidth',720);
  await expect(root.locator('figcaption')).toHaveText(['내 사진 + 코스튬','코스어가 된 내 모습!']);
  const before=await button.boundingBox();expect(before!.y).toBeGreaterThan(0);expect(before!.y+before!.height).toBeLessThanOrEqual(viewport.height);
  await root.locator('details').evaluate(e=>(e as HTMLDetailsElement).open=true);
  await root.locator('[aria-label="체험 안내"]').evaluate(e=>e.scrollTop=e.scrollHeight);
  expect((await button.boundingBox())!.y).toBeCloseTo(before!.y,0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await checkbox.check();await expect(button).toBeEnabled();
  expect(await button.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(190, 24, 93)');
  await root.locator('details').evaluate(e=>(e as HTMLDetailsElement).open=false);
  await root.locator('[aria-label="체험 안내"]').evaluate(e=>e.scrollTop=0);
  await expect.poll(()=>checkbox.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(190, 24, 93)');
  await page.screenshot({path:`.local/consent-pink/no-mobile-nav-${viewport.width}.png`});
  await button.click();await expect(root.getByRole('button',{name:'준비 중…'})).toBeDisabled();await expect(checkbox).toBeDisabled();
  await expect.poll(()=>starts).toBe(1);release!();
  await expect(root.getByRole('alert')).toContainText('다시 시도');await expect(checkbox).toBeChecked();await expect(button).toBeEnabled();
  if(viewport.width<768){await root.evaluate(e=>e.removeAttribute('data-guest-consent'));await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeVisible();}
 });
}

test('모바일 동의 본문 최상단 당김은 공통 새로고침을 실행하고 스크롤 중·짧은 당김은 유지한다',async({browser})=>{
 const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:390,height:844},hasTouch:true});const page=await context.newPage();
 await page.route('**/api/v1/**',route=>route.fulfill({json:{success:true,data:new URL(route.request().url()).pathname.endsWith('/bootstrap')?bootstrap:new URL(route.request().url()).pathname.endsWith('/guest/session')?{active:false,limit:10,remaining:10,postHours:24}:{}}}));
 await page.goto('/service/try');const root=page.locator('[data-guest-consent]'),body=root.locator('[aria-label="체험 안내"]');await expect(root).toBeVisible();await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
 const gesture=async(dy:number,release=true)=>body.evaluate((node,args)=>{const send=(type:string,touches:object[])=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:touches});node.dispatchEvent(e);};send('touchstart',[{identifier:1,clientX:150,clientY:200}]);send('touchmove',[{identifier:1,clientX:150,clientY:200+args.dy}]);if(args.release)send('touchend',[]);},{dy,release});
 await page.evaluate(()=>{(window as any).__consentPreserved=true;});await gesture(40);await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
 await root.locator('details').evaluate(e=>(e as HTMLDetailsElement).open=true);await body.evaluate(e=>e.scrollTop=100);expect(await body.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);await gesture(130);expect(await page.evaluate(()=>(window as any).__consentPreserved)).toBe(true);await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
 await body.evaluate(e=>e.scrollTop=0);await gesture(130,false);await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
 const loaded=page.waitForEvent('domcontentloaded');await body.evaluate(node=>{const e=new Event('touchend',{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:[]});node.dispatchEvent(e);});await loaded;
 expect(await page.evaluate(()=>(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');await expect(root).toBeVisible();await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeHidden();await context.close();
});
