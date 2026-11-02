import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/**',route=>route.abort());});
test('membership pricing and exact-name deletion reset on cancel and keep the image picker',async({page},info)=>{
 await page.goto('/preview/studio/memberships');await page.getByRole('button',{name:'멤버십 만들기',exact:true}).click();
 const create=page.getByRole('dialog',{name:'멤버십 만들기',exact:true}),name='직접 입력 확인 멤버십';
 await expect(create).toContainText('나의 공제율: 20%');await expect(create).not.toContainText('원천징수');
 await create.getByLabel('멤버십 이름',{exact:true}).fill(name);await create.getByLabel('월 구독료 (원)',{exact:true}).fill('10000');
 await expect(create).toContainText('예상 수익: 8,000원 / 결제 1건');await create.getByLabel('월 구독료 (원)',{exact:true}).fill('20000');await expect(create).toContainText('예상 수익: 16,000원 / 결제 1건');
 await expect(create.getByRole('button',{name:'사진 추가',exact:true})).toBeVisible();await create.getByLabel('혜택 1',{exact:true}).fill('공개 콘텐츠');
 await create.screenshot({path:info.outputPath('membership-revenue.png')});await create.getByRole('button',{name:'저장하기',exact:true}).click();await expect(create).toBeHidden();
 const card=page.locator('article').filter({has:page.getByRole('heading',{name,exact:true})});await card.getByRole('button',{name:'삭제',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'멤버십을 삭제할까요?',exact:true}),input=dialog.getByLabel('확인 문구',{exact:true}),remove=dialog.getByRole('button',{name:'삭제하기',exact:true});
 await expect(remove).toBeDisabled();await input.fill(name+' ');await expect(remove).toBeDisabled();await input.fill(name);await expect(remove).toBeEnabled();
 await input.press('Enter');await expect(dialog).toBeVisible();await expect(card).toBeVisible();
 await dialog.getByRole('button',{name:'취소',exact:true}).click();await expect(dialog).toBeHidden();await card.getByRole('button',{name:'삭제',exact:true}).click();await expect(input).toHaveValue('');await expect(remove).toBeDisabled();
 await input.fill(name);expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await dialog.screenshot({path:info.outputPath('membership-delete-confirm.png')});
 await remove.click();await expect(dialog).toBeHidden();await expect(card).toHaveCount(0);
});
