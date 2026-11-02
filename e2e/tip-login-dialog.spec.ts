import {test,expect} from '@playwright/test';
const profile='/preview/creator/moka';
test.beforeEach(async({page})=>{await page.addInitScript(()=>sessionStorage.setItem('crefans-preview-signed-in','false'));});
for(const viewport of [{width:1440,height:900},{width:1280,height:720},{width:390,height:844}])test(`signed-out tip dialog fits its content at ${viewport.width}x${viewport.height}`,async({page},info)=>{
 await page.setViewportSize(viewport);await page.goto(profile,{waitUntil:'networkidle'});
 for(const kind of ['post','profile']){
  const trigger=kind==='post'?page.getByRole('button',{name:/^게시물 후원 ·/}).first():page.getByRole('button',{name:'후원하기',exact:true}).first();
  // Test keyboard focus restoration with a keyboard activation; Safari mouse clicks do not focus buttons.
  await trigger.focus();await trigger.press('Enter');const dialog=page.getByRole('dialog',{name:kind==='post'?'이 게시물 후원하기':'콩 후원',exact:true});
  await expect(dialog.getByRole('heading',{name:'로그인이 필요해요',exact:true})).toBeVisible();
  const icon=dialog.locator('img[src*="signin-lock-3d-transparent-v1"]');await expect(icon).toBeVisible();await expect.poll(()=>icon.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(dialog.locator('footer')).toHaveCount(0);
  await expect(dialog.getByRole('link',{name:'로그인',exact:true})).toHaveAttribute('href',`/preview/login?next=${encodeURIComponent(profile)}`);
  await expect(dialog.getByRole('link',{name:'회원가입',exact:true})).toHaveAttribute('href','/preview/signup');
  await expect.poll(()=>dialog.evaluate(el=>el.scrollHeight-el.clientHeight)).toBeLessThanOrEqual(1);
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.screenshot({path:info.outputPath(`${kind}.png`),animations:'disabled'});
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
 }
});
test('short viewport retains scrolling and reachable actions',async({page})=>{
 await page.setViewportSize({width:844,height:320});await page.goto(profile,{waitUntil:'networkidle'});await page.getByRole('button',{name:/^게시물 후원 ·/}).first().click();
 const dialog=page.getByRole('dialog',{name:'이 게시물 후원하기',exact:true});
 await expect(dialog.getByRole('heading',{name:'로그인이 필요해요',exact:true})).toBeVisible();
 expect(await dialog.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
 await dialog.getByRole('link',{name:'로그인',exact:true}).scrollIntoViewIfNeeded();
 expect(await dialog.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 await dialog.getByRole('link',{name:'로그인',exact:true}).click();await expect(page).toHaveURL(/\/preview\/login\?next=/);
});
