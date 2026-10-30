import {test,expect,type Locator,type Page} from '@playwright/test';
// Mock comments carry every state: the viewer's own (수정·삭제), edited (수정됨) and a deleted parent kept for its replies (italic).
async function expectStates(scope:Locator){
  const section=scope.locator('#comments-morning');
  await expect(section.getByText('삭제된 댓글입니다.',{exact:true})).toHaveCSS('font-style','italic');
  await expect(section.getByText('· 수정됨').first()).toBeVisible();
  await expect(section.getByRole('button',{name:'수정',exact:true})).toHaveCount(1);
  await expect(section.getByRole('button',{name:'삭제',exact:true})).toHaveCount(1);
  return section;
}
const card=(page:Page)=>page.locator('article').filter({hasText:'오늘도 좋은 하루였어요'}).first();

test('상세에서 내 댓글을 수정·삭제하고 수정됨·삭제된 댓글 표시를 본다',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/post/morning');
  const section=await expectStates(page.locator('[data-post-detail]'));
  const heading=section.getByRole('heading',{level:2}),before=Number(await heading.locator('span').textContent());
  await section.getByText('삭제된 댓글입니다.').scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('comment-states.png')});
  const own=section.getByRole('button',{name:'수정',exact:true}).locator('xpath=ancestor::div[contains(@class,"comment")][1]');
  await section.getByRole('button',{name:'수정',exact:true}).click();
  const field=section.getByRole('textbox',{name:'댓글 수정'});await field.fill('');await expect(section.getByRole('button',{name:'저장',exact:true})).toBeDisabled();
  await field.fill('고친 내 댓글');await page.screenshot({path:info.outputPath('comment-editing.png')});
  await section.getByRole('button',{name:'저장',exact:true}).click();
  await expect(field).toHaveCount(0);
  const edited=section.locator('p',{hasText:'고친 내 댓글'});await expect(edited).toBeVisible();
  await expect(own.getByText('· 수정됨')).toBeVisible();
  await section.getByRole('button',{name:'삭제',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'댓글을 삭제할까요?'});await expect(dialog).toBeVisible();await page.screenshot({path:info.outputPath('comment-delete-confirm.png')});
  await dialog.getByRole('button',{name:'삭제',exact:true}).click();
  await expect(edited).toHaveCount(0);await expect(heading.locator('span')).toHaveText(String(before-1));
  await expect(section.getByRole('button',{name:'수정',exact:true})).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('피드 카드·갤러리 오버레이·프로필의 댓글에도 같은 표시와 수정·삭제가 있다',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/feed');
  await card(page).locator('[aria-controls="comments-morning"]').click();
  await expectStates(card(page));
  await card(page).getByRole('button',{name:/크게 보기/}).first().click();
  const overlay=page.getByRole('dialog');await overlay.locator('[aria-controls="comments-morning"]').click();
  await expectStates(overlay);await page.screenshot({path:info.outputPath('overlay-comments.png')});
  await page.keyboard.press('Escape');await expect(overlay).toHaveCount(0);
  await page.goto('/preview/creator/haneul');
  await card(page).locator('[aria-controls="comments-morning"]').click();
  await expectStates(card(page));
  expect(errors).toEqual([]);
});

test('댓글 아래에서 바로 답글을 달면 그 댓글의 답글 목록에 보인다 (상세·피드)',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  for(const [url,scope] of [['/preview/post/morning',(p:Page)=>p.locator('[data-post-detail]')],['/preview/feed',(p:Page)=>card(p)]] as const){
    await page.goto(url);
    if(url.endsWith('feed'))await card(page).locator('[aria-controls="comments-morning"]').click();
    const section=scope(page).locator('#comments-morning'),thread=section.locator('[class*=thread]').first();
    await expect(section.getByText('삭제된 댓글입니다.')).toBeVisible();
    await thread.getByRole('button',{name:/답글 달기/}).click();
    const field=thread.getByRole('textbox',{name:'답글 쓰기'});await expect(field).toBeFocused();
    await expect(thread.getByRole('button',{name:'등록',exact:true})).toBeDisabled();
    await field.fill('바로 단 답글이에요');if(url.endsWith('morning'))await page.screenshot({path:info.outputPath('reply-input.png')});
    await thread.getByRole('button',{name:'등록',exact:true}).click();
    await expect(field).toHaveCount(0);
    const replies=thread.locator('[class*=replies]');await expect(replies.getByText('바로 단 답글이에요',{exact:true})).toBeVisible();
    await expect(replies.getByRole('button',{name:'수정',exact:true})).toBeVisible();
    if(url.endsWith('morning'))await page.screenshot({path:info.outputPath('reply-posted.png')});
  }
  expect(errors).toEqual([]);
});

test('답글에 답글을 달면 같은 스레드에 "@이름"으로 붙는다',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/post/morning');
  const section=page.locator('[data-post-detail] #comments-morning');
  // Open the first comment's replies; every live reply now offers 답글 달기.
  await section.getByRole('button',{name:/답글 \d+개 보기/}).first().click();
  const button=section.getByRole('button',{name:/님 답글에 답글 달기$/}).first();
  const name=(await button.getAttribute('aria-label'))!.replace(/님 답글에 답글 달기$/,'');
  await button.click();
  const field=section.getByRole('textbox',{name:'답글 쓰기'});await expect(field).toBeFocused();await expect(field).toHaveValue(`@${name} `);
  expect(await field.evaluate((el:HTMLTextAreaElement)=>el.selectionStart)).toBe(name.length+2);
  await page.keyboard.type('저도 그렇게 생각해요');await page.screenshot({path:info.outputPath('nested-reply-input.png')});
  await field.locator('xpath=ancestor::form[1]').getByRole('button',{name:'등록',exact:true}).click();
  await expect(field).toHaveCount(0);
  await expect(section.getByText(`@${name} 저도 그렇게 생각해요`,{exact:true})).toBeVisible();
  await page.screenshot({path:info.outputPath('nested-reply-posted.png')});
  expect(errors).toEqual([]);
});
