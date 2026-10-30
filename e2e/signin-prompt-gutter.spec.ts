import {test,expect} from '@playwright/test';
// The signed-out prompt uses the feed's 16px side gutter on phones (it used to add its own 16px on top).
test('sign-in prompt side gutter matches the feed on phones',async({page})=>{await page.setViewportSize({width:390,height:844});
 await page.goto('/service/notifications');await page.getByText('로그인이 필요해요').waitFor();
 const edges=await page.getByRole('navigation').filter({hasText:'이용약관'}).first().evaluate(el=>{const r=el.getBoundingClientRect();return [Math.round(r.left),Math.round(innerWidth-r.right)];});
 expect(edges).toEqual([16,16]);});
