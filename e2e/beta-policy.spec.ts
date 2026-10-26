import {test,expect,login,api} from './fixtures';

for(const width of [390,1280])test(`베타 이용안내·FAQ 목업/서비스 공용 화면 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 for(const base of ['/preview','/service']){
  await page.goto(`${base}/support`);
  await page.getByRole('link',{name:'팬 이용안내',exact:true}).click();
  await expect(page.getByRole('heading',{name:'팬 이용안내',exact:true})).toBeVisible();
  await expect(page.getByText(/베타 테스트 결제는 실제 청구되지 않습니다/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('link',{name:'고객센터로 돌아가기',exact:true}).click();
  await page.getByRole('link',{name:'크리에이터 이용안내',exact:true}).click();
  await expect(page.getByRole('heading',{name:'크리에이터 이용안내',exact:true})).toBeVisible();
  await expect(page.getByText(/총 공제율 20%/)).toBeVisible();
  await page.screenshot({path:`test-results/beta-guide-${base.slice(1)}-${width}.png`,fullPage:true});
  await page.goto(`${base}/support`);
  await page.getByRole('button',{name:'베타에서도 실제로 결제되나요?',exact:true}).click();
  await expect(page.getByText(/실제 청구와 출금은 하지 않습니다/)).toBeVisible();
 }
});

test('광고 이메일은 선택 동의와 저장 후 적용되고 철회된다',async({page,scenario})=>{
 await login(page,scenario);
 await page.goto('/service/settings?section=notifications');
 const toggle=page.getByRole('switch',{name:/^마케팅 알림/});
 await expect(toggle).not.toBeChecked();await toggle.check();
 await page.getByRole('dialog').getByRole('button',{name:'저장하기',exact:true}).click();
 await page.reload();await expect(toggle).toBeChecked();
 await toggle.uncheck();await page.getByRole('dialog').getByRole('button',{name:'저장하기',exact:true}).click();
 await page.reload();await expect(toggle).not.toBeChecked();
});

test('메일 수신거부 링크는 로그인 없이 확인 후 처리하며 프록시에서도 HTML로 표시된다',async({page,scenario,control})=>{
 await login(page,scenario);await page.goto('/service/settings?section=notifications');
 await page.getByRole('switch',{name:/^마케팅 알림/}).check();
 await page.getByRole('dialog').getByRole('button',{name:'저장하기',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(0);
 const link=await control('marketing-link');await api(page.request,'/auth/logout',{});
 const response=await page.goto(link.path);expect(response?.headers()['content-security-policy']).toContain("form-action 'self'");
 await expect(page.getByRole('heading',{name:'광고 메일 수신 설정',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'수신거부',exact:true}).click();
 await expect(page.getByText(/광고 메일 수신거부를 처리했습니다/)).toBeVisible();
 await expect(page.getByRole('heading',{name:'광고 메일 수신 설정',exact:true})).toBeVisible();
 await login(page,scenario);await page.goto('/service/settings?section=notifications');
 await expect(page.getByRole('switch',{name:/^마케팅 알림/})).not.toBeChecked();
});
