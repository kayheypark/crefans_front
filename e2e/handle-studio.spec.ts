import {test,expect,login} from './fixtures';
// 2026-10-31 user requests: one user name (member handle = creator profile address) edited in 설정 > 프로필 수정,
// no login prompt flash while the studio loads, and no subtitle under the dashboard greeting.

test('the studio never flashes the login prompt while a signed-in creator loads it, and the greeting has no subtitle',async({page,scenario})=>{
 await login(page,scenario,'creator');
 await page.addInitScript(()=>{(window as any).__promptSeen=false;new MutationObserver(()=>{if(document.body?.innerText.includes('로그인이 필요해요'))(window as any).__promptSeen=true;}).observe(document,{subtree:true,childList:true,characterData:true});});
 await page.goto('/service/studio');
 await expect(page.getByText(/님, 반가워요/).first()).toBeVisible();
 expect(await page.evaluate(()=>(window as any).__promptSeen)).toBe(false);
 await expect(page.getByText('좋아하는 일을 이어가는 공간',{exact:false})).toHaveCount(0);
});

test('changing the user name in profile settings also changes the creator profile address',async({page,scenario})=>{
 await login(page,scenario,'creator');
 const next='e2e_'+Date.now().toString(36);
 await page.goto('/service/settings');
 await page.getByRole('button',{name:'프로필 수정'}).click();
 const field=page.getByLabel('사용자 이름');
 await field.fill('Bad-Name');await page.getByRole('button',{name:'저장하기'}).click();
 await expect(page.getByText('사용자 이름은 영문 소문자, 숫자, 밑줄 3~24자입니다.')).toBeVisible();
 await field.fill(next);await page.getByRole('button',{name:'저장하기'}).click();
 await expect(page.getByText('프로필을 저장했습니다.').first()).toBeVisible();
 const profile=await (await page.request.get('/api/v1/profiles/'+next)).json();
 expect(profile.success).toBe(true);expect(profile.data.handle).toBe(next);expect(profile.data.isCreator).toBe(true);
 await page.goto('/service/studio/settings');
 await expect(page.getByLabel('프로필 주소')).toHaveValue('@'+next);
});
