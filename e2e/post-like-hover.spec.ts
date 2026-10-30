import {test,expect} from '@playwright/test';
// Liking a post must not leave a pink box behind the heart (touch keeps :hover after a tap).
test('like has no tinted background after tapping',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('/preview/feed');
 
 const target=page.getByRole('button',{name:/좋아요/}).first();await target.click();await target.hover();
 const bg=await page.locator('[class*=postActions] button[class*=liked]').first().evaluate(el=>getComputedStyle(el).backgroundColor);expect(bg).toBe('rgba(0, 0, 0, 0)');});
