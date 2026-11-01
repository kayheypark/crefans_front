import {test,expect,login,api} from './fixtures';
for(const width of [390,1280])test(`프로모션 후원 잔액과 이벤트 보조 문구 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/preview/beans');
 await expect(page.locator('dd').filter({hasText:'3,050콩'})).toBeVisible();
 await expect(page.getByText('프로모션 후원콩',{exact:true})).toBeVisible();
 await expect(page.getByText('출금 제외 후원콩',{exact:true}).locator('..')).toContainText('0콩');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/promotion-wallet-${width}.png`,fullPage:true});
 await page.goto('/preview/events/promotion-beans');const note=page.getByText('프로모션 콩은 후원받은 사람이 출금할 수 있습니다.',{exact:false});await expect(note).toBeVisible();await expect(note).toHaveCSS('text-align','right');
 await page.screenshot({path:`test-results/promotion-event-${width}.png`,fullPage:true});
});
test('프로모션 후원: 실제 API 출금 잔액·PIN·1000콩 예약·은행 대역 지급·중복 방지',async({page,scenario,control})=>{
 await control('bean-promotion-funds');await login(page,scenario);let wallet=await api(page.request,'/beans/wallet');expect(wallet.data.withdrawableBeans).toBe(0);expect(wallet.data.spendableBreakdown.promotion).toBe(500);
 await page.context().clearCookies();await login(page,scenario,'creator');await page.goto('/service/studio/beans');await expect(page.locator('dd').filter({hasText:/^1,500콩$/})).toBeVisible();await expect(page.getByText('프로모션 후원콩',{exact:true})).toBeVisible();
 await page.getByLabel('출금할 콩',{exact:true}).fill('1000');await page.getByRole('button',{name:'출금 내용 확인',exact:true}).click();await expect(page.getByText('80,000원',{exact:true})).toBeVisible();
 await page.getByLabel('콩 출금 PIN',{exact:true}).fill('123456');await page.getByRole('button',{name:'출금 신청하기',exact:true}).click();await expect(page.getByText(/후원콩 출금이 접수되었습니다/)).toBeVisible();
 await expect(page.getByText('콩 종류: 일반 0콩 · 프로모션 1,000콩',{exact:true})).toBeVisible();wallet=await api(page.request,'/beans/wallet');expect(wallet.data.withdrawableBreakdown).toEqual({paid:0,promotion:500});
 await control('bean-pay');await page.reload();await expect(page.getByText(/1,000콩 · 완료/)).toBeVisible();
 await page.screenshot({path:'test-results/promotion-service-payout.png',fullPage:true});
 const after=await api(page.request,'/beans/wallet');expect(after.data.accounts.find((a:any)=>a.bucket==='reserved-paid').balance).toBe('0');await page.reload();expect((await api(page.request,'/beans/wallet')).data.withdrawableBeans).toBe(500);
});
