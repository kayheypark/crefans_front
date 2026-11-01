import {test,expect,type Page} from '@playwright/test';

async function gesture(page:Page,{dx=0,dy=125,cancel=false,multi=false,target='#page-content',startOnly=false}:{dx?:number;dy?:number;cancel?:boolean;multi?:boolean;target?:string;startOnly?:boolean}={}){
  await page.locator(target).first().evaluate((node,args)=>{
    const send=(type:string,touches:object[])=>{
      const event=new Event(type,{bubbles:true,cancelable:true});
      Object.defineProperty(event,'touches',{value:touches});node.dispatchEvent(event);
    };
    const start={identifier:1,clientX:180,clientY:180};
    send('touchstart',[start]);
    send('touchmove',[{...start,clientX:180+args.dx,clientY:180+args.dy},...(args.multi?[{identifier:2,clientX:220,clientY:200}]:[])]);
    if(!args.startOnly)send(args.cancel?'touchcancel':'touchend',[]);
  },{dx,dy,cancel,multi,startOnly});
}

test('홈·탐색·내 프로필·크리에이터는 맨 위에서 당기고 놓으면 현재 페이지를 다시 요청한다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile pull gesture');
  for(const route of ['feed','explore','me','creator/haneul']){
    await page.goto('/preview/'+route);await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
    await gesture(page,{startOnly:true});
    await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
    const loaded=page.waitForEvent('domcontentloaded');
    await page.locator('#page-content').evaluate(node=>{const event=new Event('touchend',{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:[]});node.dispatchEvent(event);});
    await loaded;
    await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
    expect(await page.evaluate(()=>(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');
    expect(new URL(page.url()).pathname).toBe('/preview/'+route);
    await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
    const bottom=await page.getByRole('navigation',{name:'하단 메뉴'}).boundingBox();
    expect(Math.abs(bottom!.y+bottom!.height-(await page.evaluate(()=>innerHeight)))).toBeLessThan(1);
  }
});

test('짧은 당김·취소·가로·위쪽·다중 터치·스크롤 중·입력·모달에서는 새로고침하지 않는다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile gesture exclusions');
  await page.goto('/preview/feed');await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
  const navigations:string[]=[];page.on('request',request=>{if(request.isNavigationRequest())navigations.push(request.url());});
  for(const args of [{dy:45},{cancel:true},{dx:150,dy:40},{dy:-100},{multi:true}])await gesture(page,args);
  await page.locator('[data-service-scroll]').evaluate(node=>node.scrollTo(0,200));await gesture(page);
  await page.locator('[data-service-scroll]').evaluate(node=>node.scrollTo(0,0));
  await page.locator('#page-content').evaluate(node=>{const input=document.createElement('input');input.id='refresh-input';node.prepend(input);input.focus();});
  await gesture(page,{target:'#refresh-input'});await page.locator('#refresh-input').evaluate(node=>node.remove());
  await page.locator('#page-content').evaluate(node=>{const dialog=document.createElement('dialog');dialog.id='refresh-dialog';node.append(dialog);dialog.showModal();});
  await gesture(page);await page.locator('#refresh-dialog').evaluate(node=>node.remove());
  await page.locator('#page-content').evaluate(node=>{const div=document.createElement('div');div.id='refresh-carousel';div.style.cssText='width:100px;overflow-x:auto';div.innerHTML='<div style="width:500px;height:40px">carousel</div>';node.prepend(div);});
  await gesture(page,{target:'#refresh-carousel'});
  await page.waitForTimeout(250);expect(navigations).toEqual([]);await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
});

test('PC와 결제·출금 화면은 기존 동작을 유지한다',async({page,isMobile})=>{
  for(const route of isMobile?['beans/charge','beans/withdraw']:['feed','explore','me']){
    await page.goto('/preview/'+route);await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
    await page.evaluate(()=>{(window as any).__refreshGuard=true;});await gesture(page);
    await page.waitForTimeout(100);expect(await page.evaluate(()=>(window as any).__refreshGuard)).toBe(true);
    await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
  }
});

test('입력 포커스를 해제한 댓글 초안도 당김으로 사라지지 않는다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile comment draft');
  await page.goto('/preview/feed');
  await page.getByRole('article').filter({has:page.locator('a[href="/preview/post/moka-first-shoot"]')}).getByRole('button',{name:/댓글 .*펼치기/}).click();
  const input=page.getByRole('textbox',{name:'댓글 남기기',exact:true});
  await input.fill('보존할 댓글 초안');await input.blur();
  await page.locator('[data-service-scroll]').evaluate(node=>node.scrollTo(0,0));
  await gesture(page);await page.waitForTimeout(150);
  await expect(input).toHaveValue('보존할 댓글 초안');
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toHaveCount(0);
});

test('Chromium 실제 터치 입력으로 피드 스크롤·상단 당겨서 새로고침',async({page,isMobile,browserName})=>{
  test.skip(!isMobile||browserName!=='chromium','CDP touch available in Chromium only');
  await page.goto('/preview/feed');await expect(page.locator('#page-content')).not.toHaveAttribute('inert');
  const session=await page.context().newCDPSession(page);
  const touch=async(type:'touchStart'|'touchMove'|'touchEnd',x:number,y:number)=>session.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await touch('touchStart',15,430);
  for(let y=410;y>=210;y-=20)await touch('touchMove',15,y);
  await touch('touchEnd',15,210);
  await expect.poll(()=>page.locator('[data-service-scroll]').evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  // End compositor momentum before starting a separate gesture at the boundary.
  await page.waitForTimeout(400);
  await page.locator('[data-service-scroll]').evaluate(node=>node.scrollTo(0,0));
  await expect.poll(()=>page.locator('[data-service-scroll]').evaluate(node=>node.scrollTop)).toBe(0);
  await touch('touchStart',15,180);
  for(let y=190;y<=310;y+=10)await touch('touchMove',15,y);
  await expect(page.getByText('놓으면 새로고침',{exact:true})).toBeVisible();
  const loaded=page.waitForEvent('domcontentloaded');await touch('touchEnd',15,310);await loaded;
  expect(await page.evaluate(()=>(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).type)).toBe('reload');
});
