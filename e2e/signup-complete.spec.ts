import {test,expect,type Page} from '@playwright/test';

// 2026-10-31 user request: 전체 동의, a dedicated completion page instead of a dialog, and login returning to the screen it came from.
async function checkCompletion(page:Page){
 await expect(page).toHaveURL(/\/preview\/signup\/complete$/);
 await expect(page.getByRole('dialog')).toHaveCount(0);
 const heading=page.getByRole('heading',{name:'회원가입이 완료됐어요',exact:true});
 await expect(heading).toBeVisible();
 await expect(page.getByText('크레팬스에 오신 것을 환영해요.')).toBeVisible();
 const check=page.locator('section span').filter({has:page.locator('svg')}).first();
 await expect(check).toHaveCSS('width','88px');await expect(check).toHaveCSS('height','88px');
 const button=page.getByRole('link',{name:'로그인하러 가기'});
 await expect(button).toHaveCSS('background-color','rgb(37, 99, 235)');
 expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}

test('전체 동의는 보이는 항목을 함께 켜고 끄며, 하나를 풀면 전체 동의도 풀린다',async({page})=>{
 await page.goto('/preview/signup');
 const all=page.getByRole('checkbox',{name:/^전체 동의/});
 const items=['만 19세 이상입니다 (필수)','이용약관 동의 (필수)','개인정보 처리방침 확인 (필수)','마케팅 정보 수신 동의 (선택)'].map(name=>page.getByRole('checkbox',{name,exact:true}));
 await all.check();for(const item of items)await expect(item).toBeChecked();
 await items[3].uncheck();await expect(all).not.toBeChecked();for(const item of items.slice(0,3))await expect(item).toBeChecked();
 await items[3].check();await expect(all).toBeChecked();
 await all.uncheck();for(const item of items)await expect(item).not.toBeChecked();
});

test('목업 가입은 완료 페이지로 이동하고, 로그인 화면에 가입한 이메일을 채운다',async({page},info)=>{
 const email='signup-design@example.invalid';
 await page.goto('/preview/signup');
 await page.getByLabel('이메일',{exact:true}).fill(email);
 await page.getByRole('button',{name:'인증 코드 받기',exact:true}).click();
 await page.getByLabel('인증 코드',{exact:true}).fill('000000');
 await page.getByRole('button',{name:'확인',exact:true}).click();
 await expect(page.getByRole('alert').filter({hasText:'인증 코드가 올바르지 않습니다.'})).toContainText('인증 코드가 올바르지 않습니다.');
 await page.getByLabel('인증 코드',{exact:true}).fill('123456');
 await page.getByRole('button',{name:'확인',exact:true}).click();
 await page.getByLabel('비밀번호',{exact:true}).fill('SyntheticTestOnly2026!');
 await page.getByLabel('비밀번호 확인',{exact:true}).fill('SyntheticTestOnly2026!');
 await page.getByLabel('닉네임',{exact:true}).fill('가입 화면 검수');
 await page.getByRole('checkbox',{name:/^전체 동의/}).check();
 await page.getByRole('button',{name:'동의하고 가입하기',exact:true}).click();
 await checkCompletion(page);
 await expect(page.getByRole('heading',{name:'회원가입이 완료됐어요'})).toBeFocused();
 await page.screenshot({path:info.outputPath('signup-complete-page.png'),fullPage:true});
 await page.getByRole('link',{name:'로그인하러 가기'}).click();
 await expect(page).toHaveURL(/\/preview\/login$/);
 await expect(page.getByLabel('이메일',{exact:true})).toHaveValue(email);
});

test('완료 페이지는 좁은 화면에서도 넘치지 않고, 카탈로그 버튼으로 열 수 있다',async({page,context})=>{
 await page.setViewportSize({width:320,height:640});
 await page.goto('/preview/signup/complete');await checkCompletion(page);
 await page.setViewportSize({width:1280,height:800});
 await page.goto('/design-system');await page.getByRole('button',{name:'상태·피드백',exact:false}).click();
 const [opened]=await Promise.all([context.waitForEvent('page'),page.getByRole('button',{name:'회원가입 완료 화면 보기'}).click()]);
 await opened.waitForLoadState();await checkCompletion(opened);
});

test('로그인이 필요한 화면에서 로그인하면 그 화면으로 돌아간다',async({page})=>{
 await page.goto('/preview/feed');await page.evaluate(()=>sessionStorage.setItem('crefans-preview-signed-in','false'));
 await page.goto('/preview/me');
 const login=page.getByRole('main').getByRole('link',{name:'로그인',exact:true});
 await expect(login).toHaveAttribute('href','/preview/login?next=%2Fpreview%2Fme');
 await login.click();await expect(page).toHaveURL(/\/preview\/login\?next=/);
 await page.getByLabel('이메일',{exact:true}).fill('moka@crefans.example');
 await page.getByLabel('비밀번호',{exact:true}).fill('preview-password');
 await page.getByRole('button',{name:'로그인',exact:true}).click();
 await expect(page).toHaveURL(/\/preview\/me$/);
});
