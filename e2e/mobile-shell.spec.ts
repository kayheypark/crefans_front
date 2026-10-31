import {test,expect,type Page} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);

async function atViewportBottom(page:Page){
  await expect.poll(()=>page.getByRole('navigation',{name:'하단 메뉴',exact:true}).evaluate(node=>Math.abs(node.getBoundingClientRect().bottom-window.innerHeight))).toBeLessThan(1);
  await expect.poll(()=>page.evaluate(()=>Math.max(document.documentElement.scrollHeight,document.body.scrollHeight)-innerHeight)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(()=>window.scrollY)).toBe(0);
}

test('모바일 GNB는 짧은 본문·긴 본문·화면 높이 변경에서 하단을 유지한다',async({page,isMobile,browserName})=>{
  if(!isMobile){
    await page.goto('/preview/notifications');
    await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeHidden();
    await expect(page.getByRole('navigation',{name:'사이드 메뉴',exact:true})).toBeVisible();
    expect(await page.locator('[data-service-scroll]').evaluate(node=>getComputedStyle(node).display)).toBe('grid');
    return;
  }
  for(const route of ['notifications','me','feed']){
    await page.goto('/preview/'+route);await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeVisible();
    await atViewportBottom(page);
    const scroll=page.locator('[data-service-scroll]');
    await scroll.evaluate(node=>node.scrollTo(0,node.scrollHeight));
    if(route==='feed')await expect.poll(()=>scroll.evaluate(node=>node.scrollTop)).toBeGreaterThan(100);
    await atViewportBottom(page);
    // Mobile WebKit does not support Playwright's wheel input; its scroll boundary is checked above.
    if(browserName!=='webkit'){
      await page.mouse.move(180,200);await page.mouse.wheel(0,1200);await atViewportBottom(page);
      await page.mouse.wheel(0,-1200);await atViewportBottom(page);
    }
  }
  for(const viewport of [{width:320,height:570},{width:390,height:650},{width:767,height:844},{width:390,height:844}]){
    await page.setViewportSize(viewport);await atViewportBottom(page);
  }
  await page.getByRole('navigation',{name:'하단 메뉴',exact:true}).getByRole('link',{name:/알림/}).click();
  await expect(page.getByRole('heading',{name:'알림',exact:true})).toBeVisible();
  await expect.poll(()=>page.locator('[data-service-scroll]').evaluate(node=>node.scrollTop)).toBe(0);
  await atViewportBottom(page);
});

test('모바일 메시지 입력·목록 복귀와 모달은 GNB·본문 스크롤을 보존한다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile shell regression');
  await page.goto('/preview/messages');
  await page.getByRole('button',{name:/^하늘 프로필 사진 하늘/}).click();
  const input=page.getByRole('textbox',{name:'메시지 입력',exact:true});
  await input.fill('전송하지 않는 입력 확인');
  await page.setViewportSize({width:390,height:480});await atViewportBottom(page);
  expect((await input.boundingBox())!.y+(await input.boundingBox())!.height).toBeLessThan((await page.getByRole('navigation',{name:'하단 메뉴',exact:true}).boundingBox())!.y);
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'대화 목록으로',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'대화 검색'})).toBeVisible();await atViewportBottom(page);
  await page.goto('/preview/creator/moka');
  const scroll=page.locator('[data-service-scroll]');
  await page.getByRole('button',{name:/^모카.* 프로필 사진 크게 보기$/}).first().click();// the mock creator's display name is long now
  await expect(page.getByRole('dialog',{name:/^모카.* 프로필 사진$/})).toBeVisible();
  expect(await scroll.evaluate(node=>getComputedStyle(node).overflowY)).toBe('hidden');
  await page.getByRole('dialog').getByRole('button',{name:'닫기',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(await scroll.evaluate(node=>getComputedStyle(node).overflowY)).toBe('auto');await atViewportBottom(page);
});
