import {test,expect,type Page} from '@playwright/test';

export const refreshPages=[
  'beans','beans/charges','beans/history','beans/tips','beans/referral','beans/referral-history',
  'feed','explore','me','me?tab=saved','me?tab=liked','creator/haneul','post/moka-first-shoot',
  'messages','notifications','subscriptions','subscriptions?tab=payments','settings','support',
  'following','followers','following?profile=haneul','followers?profile=haneul','payment-methods',
  'notices','notices/welcome','events','events/feedback','events/creator-advertising',
  'events/promotion-beans','events/founding-badge','legal/terms','legal/privacy','legal/policy',
  'screens',
];

async function pull(page:Page,target='#page-content',release=true){
  await page.locator(target).first().evaluate((node,release)=>{
    const send=(type:string,touches:object[])=>{const event=new Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:touches});node.dispatchEvent(event);};
    send('touchstart',[{identifier:1,clientX:180,clientY:180}]);
    send('touchmove',[{identifier:1,clientX:180,clientY:310}]);
    if(release)send('touchend',[]);
  },release);
}
async function release(page:Page,target='#page-content'){
  const load=page.waitForEvent('domcontentloaded');
  await page.locator(target).first().evaluate(node=>{const event=new Event('touchend',{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:[]});node.dispatchEvent(event);});
  await load;
  expect(await page.evaluate(()=>(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');
}
async function noReload(page:Page,target='#page-content'){
  await page.evaluate(()=>{(window as any).__pullGuard=true;});await pull(page,target);
  await page.waitForTimeout(150);
  expect(await page.evaluate(()=>(window as any).__pullGuard)).toBe(true);
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
}

for(const route of refreshPages)test(`조회 화면 새로고침: ${route}`,async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile gesture');
  await page.goto('/preview/'+route);await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
  await pull(page,'#page-content',false);
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
  await page.screenshot({path:test.info().outputPath('pull.png')});
  const before=page.url();await release(page);expect(page.url()).toBe(before);
  await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
  const nav=await page.getByRole('navigation',{name:'하단 메뉴'}).boundingBox();
  expect(Math.abs(nav!.y+nav!.height-(await page.evaluate(()=>innerHeight)))).toBeLessThan(1);
});

test('충전·출금·구매·인증·문의 작성 흐름은 새로고침을 유발하지 않는다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile exclusions');
  for(const route of ['beans/charge','beans/withdraw','beans/success','beans/fail','membership/haneul','login','signup','reset-password','support?tab=qna']){
    await page.goto('/preview/'+route);await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
    await noReload(page);
  }
  await page.getByRole('textbox',{name:'제목',exact:true}).fill('유지할 문의 제목');
  await page.getByRole('textbox',{name:'문의 내용',exact:true}).fill('작성 중인 문의');
  await page.getByRole('textbox',{name:'문의 내용',exact:true}).blur();await noReload(page);
  await expect(page.getByRole('textbox',{name:'제목',exact:true})).toHaveValue('유지할 문의 제목');
});

test('메시지 목록의 내부 스크롤은 최상단에서만 새로고침한다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile inbox');
  await page.goto('/preview/messages');const list=page.locator('[data-pull-refresh-scroll]');
  await expect(list).toBeVisible();
  await list.evaluate(node=>{(node as HTMLElement).style.height='150px';node.scrollTop=90;});
  expect(await list.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);await noReload(page,'[data-pull-refresh-scroll]');
  await list.evaluate(node=>node.scrollTop=0);await pull(page,'[data-pull-refresh-scroll] button',false);
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
  await release(page,'[data-pull-refresh-scroll] button');
  await expect(page.locator('[data-room-open]')).toHaveAttribute('data-room-open','false');
});

test('대화방과 목록으로 돌아온 메시지 초안·열린 모달·처리 중 상태를 보호한다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile draft protection');
  await page.goto('/preview/messages');await page.locator('[data-pull-refresh-scroll] button').first().click();
  await noReload(page);
  const input=page.getByRole('textbox',{name:'메시지 입력',exact:true});await input.fill('보존할 메시지');await input.blur();
  await page.getByRole('button',{name:'대화 목록으로',exact:true}).click();await noReload(page);
  await page.locator('[data-pull-refresh-scroll] button').nth(1).click();
  await page.getByRole('button',{name:'대화 목록으로',exact:true}).click();await noReload(page);
  await page.locator('[data-pull-refresh-scroll] button').first().click();await expect(input).toHaveValue('보존할 메시지');
  await page.goto('/preview/settings');await page.getByRole('button',{name:'프로필 수정',exact:true}).click();await noReload(page);
  await page.goto('/preview/beans/charges');
  await page.locator('#page-content').evaluate(node=>node.setAttribute('data-pull-refresh-block','true'));
  // The flag is on a page descendant in production, not on the shell's scroll element.
  await noReload(page);
});

test('PC 조회 페이지와 스튜디오 문서 스크롤은 기존 구조를 유지한다',async({page,isMobile})=>{
  if(!isMobile){for(const route of ['beans','notifications','messages','settings']){await page.goto('/preview/'+route);await expect(page.locator('#page-content')).not.toHaveAttribute('inert');await noReload(page);}}
  for(const route of ['studio','studio/content','studio/subscribers','studio/analytics','studio/beans/tips','studio/beans/payouts','studio/advertising','landing']){
    await page.goto('/preview/'+route);await expect(page.locator('[data-service-scroll]')).toHaveCount(0);
    const styles=await page.evaluate(()=>[document.documentElement,document.body].map(node=>({overflow:getComputedStyle(node).overflowY,overscroll:getComputedStyle(node).overscrollBehaviorY})));
    for(const style of styles){expect(style.overflow).not.toBe('hidden');expect(style.overscroll).toBe('auto');}
  }
});

test('Chromium 실제 터치로 지갑 새로고침',async({page,isMobile,browserName})=>{
  test.skip(!isMobile||browserName!=='chromium','CDP touch only');
  await page.goto('/preview/beans');await expect(page.getByRole('heading',{name:'지갑',exact:true})).toBeVisible();
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:15,y:180}]});
  for(let y=190;y<=310;y+=10)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:15,y}]});
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
  const load=page.waitForEvent('domcontentloaded');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await load;
  expect(await page.evaluate(()=>(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');
});
