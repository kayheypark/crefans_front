import {test,expect} from '@playwright/test';
import path from 'node:path';

const photo=path.resolve(__dirname,'../public/illustrations/creators/jiwoo/avatar-trail-v2.png');
test.beforeEach(async({page})=>{
 await page.route('**/api/**',route=>route.abort());
});

test('create and edit use the compact single-image picker and preserve save/remove behavior',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/preview/studio/memberships');await page.getByRole('button',{name:'멤버십 만들기',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'멤버십 만들기',exact:true}),group=dialog.getByRole('group',{name:'멤버십 이미지 · 선택',exact:true});
 await expect(group.getByRole('button',{name:'사진 추가',exact:true})).toBeVisible();
 await expect(group).toContainText('0/1');await expect(group).toContainText('JPG·PNG·WebP 5MB 이하');
 await expect(group).not.toContainText('이미지를 끌어다 놓거나');
 const input=group.locator('input[type=file]');await expect(input).not.toHaveAttribute('multiple');await expect(input).toHaveAttribute('accept','image/jpeg,image/png,image/webp');
 const height=await group.getByRole('button',{name:'사진 추가',exact:true}).evaluate(el=>el.getBoundingClientRect().height);expect(height).toBeLessThanOrEqual(60);
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await dialog.screenshot({path:info.outputPath('create-empty.png')});
 await input.setInputFiles(photo);await expect(group.getByRole('img',{name:'이미지 1',exact:true})).toBeVisible();await expect(group).toContainText('1/1');await expect(input).toBeDisabled();
 await dialog.screenshot({path:info.outputPath('create-selected.png')});
 await dialog.getByLabel('멤버십 이름',{exact:true}).fill('업로드 UI 검증');await dialog.getByLabel('월 구독료 (원)',{exact:true}).fill('9900');await dialog.getByLabel('혜택 1',{exact:true}).fill('사진 콘텐츠');
 await dialog.getByRole('button',{name:'저장하기',exact:true}).click();await expect(dialog).toBeHidden();
 const card=page.locator('article').filter({has:page.getByRole('heading',{name:'업로드 UI 검증',exact:true})});await expect(card.getByRole('img')).toBeVisible();
 await card.getByRole('button',{name:'수정',exact:true}).click();const edit=page.getByRole('dialog',{name:'멤버십 수정',exact:true});await expect(edit.getByRole('img',{name:'이미지 1',exact:true})).toBeVisible();
 await edit.getByRole('button',{name:'1번째 이미지 삭제',exact:true}).click();await expect(edit.getByRole('button',{name:'사진 추가',exact:true})).toBeEnabled();
 await edit.getByRole('button',{name:'저장하기',exact:true}).click();await expect(edit).toBeHidden();await expect(card.getByRole('img')).toHaveCount(0);expect(errors).toEqual([]);
});

test('membership rejects video and oversize files, recovers and resets cancelled drafts',async({page},info)=>{
 await page.goto('/preview/studio/memberships');await page.getByRole('button',{name:'멤버십 만들기',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'멤버십 만들기',exact:true}),input=dialog.locator('input[type=file]');
 await input.setInputFiles({name:'invalid.mp4',mimeType:'video/mp4',buffer:Buffer.from('test')});await expect(dialog.getByRole('alert')).toHaveText('JPG, PNG, WebP 이미지를 선택해주세요.');
 await input.setInputFiles({name:'large.png',mimeType:'image/png',buffer:Buffer.alloc(5*1024*1024+1)});await expect(dialog.getByRole('alert')).toHaveText('5MB 이하의 이미지 파일을 선택해주세요.');
 await dialog.screenshot({path:info.outputPath('invalid-size.png')});
 await input.setInputFiles(photo);await expect(dialog.getByRole('alert')).toHaveCount(0);await expect(dialog.getByRole('img',{name:'이미지 1',exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();await page.getByRole('button',{name:'멤버십 만들기',exact:true}).click();
 await expect(dialog.getByRole('img',{name:'이미지 1',exact:true})).toHaveCount(0);await expect(dialog.getByRole('group',{name:'멤버십 이미지 · 선택',exact:true})).toContainText('0/1');
});

test('the post editor retains multiple media selection and its existing add label',async({page})=>{
 await page.goto('/preview/studio/content/new');const group=page.getByRole('group',{name:'파일 업로드',exact:true});
 await expect(group.getByRole('button',{name:'사진·동영상 추가',exact:true})).toBeVisible();await expect(group).toContainText('0/10');
 await expect(group.locator('input[type=file]')).toHaveAttribute('multiple','');await expect(group.locator('input[type=file]')).toHaveAttribute('accept',/video\/mp4/);
});
