import {test,expect,login} from './fixtures';

test('studio brand and dashboard avatar match the creator, and handle action is beside the input',async({page,scenario},info)=>{
 await login(page,scenario,'creator');await page.waitForURL('**/service/feed');
 await page.goto('/service/studio');
 const greeting=page.getByRole('heading',{name:/님, 반가워요/});await expect(greeting).toBeVisible();
 await expect(greeting.locator('[data-avatar]')).toHaveCount(1);
 await expect(greeting.getByRole('img')).toHaveAttribute('aria-label',/E2E 크리에이터 프로필 사진/);
 const logo=page.getByRole('link',{name:'크레팬스 스튜디오 홈'});await expect(logo).toHaveAttribute('href','/service/studio');
 await expect(logo.locator('img')).toHaveAttribute('src','/brand/studio-logo-v1.png');
 expect(await logo.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 await page.screenshot({path:info.outputPath('dashboard.png')});
 await page.goto('/service/settings');await page.getByRole('button',{name:'프로필 수정',exact:true}).click();
 const input=page.getByLabel('핸들',{exact:true}),button=page.getByRole('button',{name:'중복 확인',exact:true});
 const field=await input.locator('..').boundingBox(),action=await button.boundingBox();
 expect(action!.x).toBeGreaterThanOrEqual(field!.x+field!.width+6);expect(Math.abs(action!.y-field!.y)).toBeLessThan(2);
 await input.fill('qa_'+Date.now().toString(36));await button.click();await expect(page.getByText('사용할 수 있는 핸들입니다.',{exact:true})).toBeVisible();
 await page.screenshot({path:info.outputPath('handle-action.png')});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('schedule date can be cleared and toggled; saved reservation can be cancelled to a draft',async({page,scenario},info)=>{
 await login(page,scenario,'creator');await page.waitForURL('**/service/feed');await page.goto('/service/studio/content/new');
 await page.getByLabel('제목',{exact:true}).fill('예약 게시 UI 검증');await page.getByLabel('본문',{exact:true}).fill('격리된 테스트 게시물입니다.');
 const toggle=page.getByRole('switch',{name:'예약 사용',exact:true}),input=page.getByLabel('예약 게시 시각',{exact:true}),submit=page.getByRole('button',{name:'예약하기',exact:true}),publishNow=page.getByRole('button',{name:'지금 게시하기',exact:true});
 // 5f95e58: the main button reads 예약하기 only while scheduling is on with a time; otherwise it is 지금 게시하기, disabled while scheduling lacks a time.
 await expect(toggle).not.toBeChecked();await expect(input).toBeDisabled();await expect(submit).toHaveCount(0);await expect(publishNow).toBeEnabled();
 await toggle.check();await expect(input).toBeEnabled();await expect(publishNow).toBeDisabled();
 const future=new Date(Date.now()+86400000*3);future.setMinutes(30,0,0);const local=new Date(future.getTime()-future.getTimezoneOffset()*60000).toISOString().slice(0,16);
 await input.fill(local);await expect(submit).toBeEnabled();
 await page.getByRole('button',{name:'예약 게시 시각 지우기'}).click();await expect(input).toHaveValue('');await expect(submit).toHaveCount(0);await expect(publishNow).toBeDisabled();
 await input.fill(local);await toggle.uncheck();await expect(input).toHaveValue('');await expect(input).toBeDisabled();
 await toggle.check();await expect(input).toHaveValue('');await input.fill(local);
 await input.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('schedule-enabled.png')});
 const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/studio/content')&&r.request().method()==='POST');await submit.click();const saved=await response;expect(saved.ok()).toBe(true);const body=await saved.json();const id=body.data.id;expect(id).toBeTruthy();
 await page.goto('/service/studio/content/'+id+'/edit');await expect(toggle).toBeChecked();await expect(input).toHaveValue(local);
 // The saved reservation is cancelled only by the explicit draft save, whose label says so (ManagementPages.tsx editorActions);
 // the separate notice text this test expected was never in the product (it exists only in f12cea6's test).
 await toggle.uncheck();await expect(page.getByRole('button',{name:'예약 취소 후 임시저장',exact:true})).toBeEnabled();await expect(submit).toHaveCount(0);
 const cancel=page.waitForResponse(r=>r.url().endsWith('/api/v1/studio/content')&&r.request().method()==='POST');await page.getByRole('button',{name:'예약 취소 후 임시저장',exact:true}).click();expect((await cancel).ok()).toBe(true);
 await page.reload();await expect(toggle).not.toBeChecked();await expect(input).toBeDisabled();await expect(input).toHaveValue('');
 await input.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('schedule-cancelled.png')});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
