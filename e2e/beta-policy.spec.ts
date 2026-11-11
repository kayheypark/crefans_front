import {test,expect,login,api} from './fixtures';

for(const width of [390,1280])test(`고객센터 FAQ 목업/서비스 공용 화면 ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 for(const base of ['/preview','/service']){
  // 2026-11-07: 팬/크리에이터 이용안내 페이지와 고객센터의 이용안내 버튼 줄·운영시간 문구를 지웠다.
  await page.goto(`${base}/support`);
  await expect(page.getByRole('heading',{name:'고객센터',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:/이용안내/})).toHaveCount(0);await expect(page.getByText('2영업일 내 첫 답변을 목표로 합니다')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'지금 결제하면 실제로 청구되나요?',exact:true}).click();
  await expect(page.getByText(/아직 실제 청구를 하지 않습니다/)).toBeVisible();
  for(const [id,name] of [['fan','팬 이용안내'],['creator','크리에이터 이용안내']]){await page.goto(`${base}/guide/${id}`);await expect(page.getByRole('heading',{name,exact:true})).toHaveCount(0);}
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
