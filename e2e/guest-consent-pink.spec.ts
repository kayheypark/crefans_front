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
  const root=page.locator('[data-guest-consent]'),button=root.getByRole('button',{name:'동의하고 체험 시작'}),checkbox=root.getByRole('checkbox');
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
  await page.screenshot({path:`.local/consent-pink/title-restored-${viewport.width}.png`});
  await button.click();await expect(root.getByRole('button',{name:'준비 중…'})).toBeDisabled();await expect(checkbox).toBeDisabled();
  await expect.poll(()=>starts).toBe(1);release!();
  await expect(root.getByRole('alert')).toContainText('다시 시도');await expect(checkbox).toBeChecked();await expect(button).toBeEnabled();
 });
}
