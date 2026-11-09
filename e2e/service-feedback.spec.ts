import {test,expect,login} from './fixtures';

test('self-follow uses the common dialog without shifting the page, normal follow/unfollow still works',async({page,scenario},info)=>{
 await login(page,scenario,'creator');await page.waitForURL('**/service/feed');
 await page.goto('/service/creator/'+scenario.creator);
 const follow=page.getByRole('button',{name:'팔로우',exact:true});await expect(follow).toBeVisible();
 const before=await follow.boundingBox(),response=page.waitForResponse(r=>r.url().endsWith('/follow')&&r.request().method()==='PUT');
 await follow.click();expect((await response).status()).toBe(400);
 const dialog=page.getByRole('dialog',{name:'알림',exact:true});await expect(dialog).toBeVisible();await expect(dialog).toContainText('자신을 팔로우할 수 없습니다.');await expect(dialog.getByRole('button',{name:'다시 불러오기'})).toHaveCount(0);
 await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>null))));
 expect(Math.abs((await follow.boundingBox())!.y-before!.y)).toBeLessThan(1);
 expect(await dialog.evaluate(el=>el.matches(':modal'))).toBe(true);expect(await page.evaluate(()=>document.activeElement?.tagName)).toBe('H2');
 await page.screenshot({path:info.outputPath('self-follow-dialog.png')});await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
 await follow.click();await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'확인',exact:true}).click();await expect(dialog).not.toBeVisible();await expect(follow).toHaveAttribute('aria-pressed','false');
 await page.request.post('/api/v1/auth/logout',{data:{},headers:{Origin:'http://127.0.0.1:3011'}});await login(page,scenario,'fan');await page.waitForURL('**/service/feed');await page.goto('/service/creator/'+scenario.creator);await follow.click();const following=page.getByRole('button',{name:'팔로우 하는중',exact:true});await expect(following).toBeVisible();await following.click();const confirm=page.getByRole('dialog',{name:'팔로우를 해제할까요?'});await expect(confirm).toBeVisible();await confirm.getByRole('button',{name:'팔로우 해제',exact:true}).click();await expect(follow).toBeVisible();
});

test('guest follow, like and save show a login dialog; login returns to the requested screen',async({page,scenario},info)=>{
 const writes:string[]=[];page.on('request',r=>{if(r.method()==='PUT'&&/\/(follow|like|save)$/.test(r.url()))writes.push(r.url());});
 const creator='/service/creator/'+scenario.creator,post='/service/post/'+scenario.postId;
 await page.goto(creator);await page.getByRole('button',{name:'팔로우',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'로그인이 필요해요'});await expect(dialog).toBeVisible();await expect(dialog.getByRole('link',{name:'로그인',exact:true})).toHaveAttribute('href','/service/login?next='+encodeURIComponent(creator));await expect(dialog.getByRole('link',{name:'회원가입',exact:true})).toHaveAttribute('href','/service/signup');
 await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>null))));await page.screenshot({path:info.outputPath('login-required-dialog.png')});await dialog.getByRole('button',{name:'닫기',exact:true}).click();/* efcb810: SignInPrompt actions are 로그인·회원가입; the dialog closes with its 닫기 button */await expect(dialog).not.toBeVisible();
 await page.goto(post);
 for(const label of ['좋아요','게시물 저장']){await page.getByRole('button',{name:label,exact:true}).click();await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).not.toBeVisible();}
 expect(writes).toEqual([]);
 await page.getByRole('button',{name:'게시물 저장',exact:true}).click();await dialog.getByRole('link',{name:'로그인',exact:true}).click();await expect(page).toHaveURL(/\/service\/login\?next=/);
 // Wait until the native dialog's exit animation releases the login form from inertness.
 await expect(page.locator('dialog[open]')).toHaveCount(0);
 await page.getByLabel('이메일',{exact:true}).fill(scenario.users.find(u=>u.role==='fan')!.email);await page.getByLabel('비밀번호',{exact:true}).fill(scenario.password);await page.getByRole('button',{name:'로그인',exact:true}).click();await page.waitForURL('**'+post);await expect(dialog).not.toBeVisible();
});

test('an expired real session shows login guidance instead of a bare page error',async({page,scenario,control},info)=>{
 await login(page,scenario);await page.waitForURL('**/service/feed');await page.goto('/service/creator/'+scenario.creator);await expect(page.getByRole('button',{name:'팔로우',exact:true})).toBeVisible();
 await control('expire-session',{refresh:true});await page.getByRole('button',{name:'팔로우',exact:true}).click();const dialog=page.getByRole('dialog',{name:'로그인이 필요해요'});await expect(dialog).toBeVisible();await expect(page.getByRole('button',{name:'다시 불러오기'})).toHaveCount(0);await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>null))));await page.screenshot({path:info.outputPath('expired-session-dialog.png')});
 await dialog.getByRole('link',{name:'로그인',exact:true}).click();await expect(page).toHaveURL(/\/service\/login\?next=/);
});
