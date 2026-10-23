import {test,expect,login,api} from './fixtures';
test('분실 카드 갱신 실패 안내·권한 회수·새 기본 카드로 한 번만 복구',async({page,scenario,control})=>{
 await login(page,scenario);expect((await api(page.request,'/checkout/'+scenario.orderId+'/pay',{})).success).toBe(true);
 await page.goto('/service/post/'+scenario.postId);await expect(page.getByText(scenario.privateBody,{exact:true})).toBeVisible();
 await control('lost-card-renewal');await control('retry-renewal');expect(await control('stats')).toMatchObject({orders:1,subscriptions:1});
 await page.goto('/service/subscriptions');await expect(page.getByRole('heading',{name:'갱신 결제 대기',exact:true})).toBeVisible();await expect(page.getByText(/결제수단 변경이 필요합니다/)).toBeVisible();
 await page.screenshot({path:'test-results/billing-recovery-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('link',{name:'결제수단 변경',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await page.screenshot({path:'test-results/billing-recovery-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'결제수단 변경',exact:true}).click();await expect(page.getByText('사용할 수 없는 카드입니다. 다른 카드를 등록해주세요.',{exact:true})).toBeVisible();
 await page.goto('/service/post/'+scenario.postId);await expect(page.getByText(scenario.privateBody,{exact:true})).toHaveCount(0);
 await control('replacement-card');await page.goto('/service/payment-methods');await page.getByRole('button',{name:'기본으로 설정',exact:true}).click();await expect(page.getByRole('button',{name:'기본으로 설정',exact:true})).toBeDisabled();await expect.poll(async()=>(await api(page.request,'/common')).data.paymentMethods.find((m:any)=>m.isDefault)?.requiresUpdate).toBe(false);
 await control('retry-renewal');await control('retry-renewal');expect(await control('stats')).toMatchObject({orders:2,subscriptions:1});
 await page.goto('/service/subscriptions');await expect(page.getByRole('heading',{name:'갱신 결제 대기',exact:true})).toHaveCount(0);
 await page.goto('/service/post/'+scenario.postId);await expect(page.getByText(scenario.privateBody,{exact:true})).toBeVisible();
});
test('갱신 실패 후 해지하면 카드 변경을 해도 재청구하지 않음',async({page,scenario,control})=>{
 await login(page,scenario);await api(page.request,'/checkout/'+scenario.orderId+'/pay',{});await control('lost-card-renewal');await page.goto('/service/subscriptions');await page.getByRole('button',{name:'갱신 해지',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'갱신 해지하기',exact:true}).click();
 await control('replacement-card');await page.goto('/service/payment-methods');await page.getByRole('button',{name:'기본으로 설정',exact:true}).click();await expect.poll(async()=>(await api(page.request,'/common')).data.paymentMethods.find((m:any)=>m.isDefault)?.requiresUpdate).toBe(false);await control('retry-renewal');expect(await control('stats')).toMatchObject({orders:1,subscriptions:1});
});
