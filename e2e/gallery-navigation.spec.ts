import {test,expect} from '@playwright/test';
for(const width of [390,320,1440])test(`gallery post navigation and text close ${width}`,async({page},info)=>{
 await page.setViewportSize({width,height:900});
 await page.goto('/preview/creator/haneul');
 await page.getByRole('article').getByRole('button',{name:/크게 보기/}).first().click();
 const dialog=page.getByRole('dialog'),prev=dialog.getByRole('button',{name:'이전 게시물',exact:true}),next=dialog.getByRole('button',{name:'다음 게시물',exact:true}),close=dialog.getByRole('button',{name:'갤러리 닫기',exact:true});
 await expect(prev).toBeDisabled();await expect(prev.locator('span')).toHaveText('‹');await expect(next.locator('span')).toHaveText('›');
 await next.click();await expect(prev).toBeEnabled();await prev.click();await expect(prev).toBeDisabled();
 if(width<768){
  await close.scrollIntoViewIfNeeded();await expect(close).toBeVisible();await expect(close).toHaveText('닫기');
  const a=(await next.boundingBox())!,b=(await close.boundingBox())!;expect(b.x).toBeGreaterThanOrEqual(a.x+a.width);expect(Math.abs(a.y-b.y)).toBeLessThan(2);expect(b.x+b.width).toBeLessThanOrEqual(width);
  await page.screenshot({path:info.outputPath(`navigation-${width}.png`)});await close.click();
 }else{await expect(close).toBeHidden();await dialog.getByRole('button',{name:'닫기',exact:true}).click();}
 await expect(dialog).toHaveCount(0);
});
