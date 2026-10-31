import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
// D9: "@" opens the people who can be tagged, tags read as blue profile links, and someone else's comment can be reported.

test('"@"을 치면 태그할 사람이 뜨고, 고르면 본문에 파란 링크로 남는다',async({page,isMobile},info)=>{
  test.skip(isMobile,'PC 본문 댓글 입력창 전제. 휴대폰은 하단 한 줄 입력이며 "모바일 하단 입력창에서는 태그 목록이 입력창 위로 열린다"에서 확인');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/post/morning');
  const section=page.locator('[data-post-detail] #comments-morning');
  await expect(section.locator('a[class*=mentionLink]').first()).toBeVisible();
  const field=section.locator('textarea[id^="post-comment-"]');
  await field.click();await field.pressSequentially('고마워요 @하');
  const list=page.getByRole('listbox',{name:'태그할 사람'});await expect(list).toBeVisible();
  await expect(list.getByRole('option').first()).toHaveAttribute('aria-selected','true');
  await page.screenshot({path:info.outputPath('mention-list.png')});
  await field.press('Escape');await expect(list).toHaveCount(0);
  await field.pressSequentially('늘');await expect(list.getByRole('option',{name:/하늘/})).toBeVisible();
  await field.press('Enter');await expect(list).toHaveCount(0);await expect(field).toHaveValue('고마워요 @하늘 ');
  await field.pressSequentially('다음 편도 기대할게요');
  await field.locator('xpath=ancestor::form[1]').getByRole('button',{name:'등록',exact:true}).click();
  await expect(field).toHaveValue('');
  // A new comment goes to the end of the list, behind "더 보기".
  const posted=section.locator('p',{hasText:'다음 편도 기대할게요'});
  for(let i=0;i<6&&!await posted.count();i++)await section.getByRole('button',{name:/개 더 보기/}).click();
  await expect(posted).toBeVisible();
  const link=posted.getByRole('link',{name:'@하늘'});await expect(link).toHaveAttribute('href',/\/creator\//);
  await expect(link).toHaveCSS('color',await page.locator('a[class*=mentionLink]').first().evaluate(el=>getComputedStyle(el).color));
  await posted.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('mention-posted.png')});
  expect(errors).toEqual([]);
});

test('답글 목록에서도 "@" 태그를 마우스로 고를 수 있다',async({page})=>{
  await page.goto('/preview/post/morning');
  const section=page.locator('[data-post-detail] #comments-morning');
  await section.getByRole('button',{name:/님 댓글에 답글 달기$/}).first().click();
  const field=section.getByRole('textbox',{name:'답글 쓰기'});await field.pressSequentially('@하');
  await page.getByRole('listbox',{name:'태그할 사람'}).getByRole('option',{name:/하늘/}).click();
  await expect(field).toHaveValue('@하늘 ');await expect(field).toBeFocused();
});

test('남의 댓글은 사유를 골라 신고할 수 있고, 내 댓글에는 신고가 없다',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/post/morning');
  const section=page.locator('[data-post-detail] #comments-morning');
  const own=section.getByRole('button',{name:'수정',exact:true}).locator('xpath=ancestor::div[contains(@class,"comment")][1]');
  await expect(own.getByRole('button',{name:/댓글 신고$/})).toHaveCount(0);
  await section.getByRole('button',{name:/님 댓글 신고$/}).first().click();
  const dialog=page.getByRole('dialog',{name:'댓글을 신고할까요?'});await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button',{name:'신고하기'})).toBeDisabled();
  await dialog.getByText('스팸·광고').click();await page.screenshot({path:info.outputPath('comment-report.png')});
  await dialog.getByRole('button',{name:'신고하기'}).click();
  await expect(dialog).toHaveCount(0);await expect(page.getByText('신고를 접수했어요. 검토 후 안내드릴게요.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('모바일 하단 입력창에서는 태그 목록이 입력창 위로 열린다',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/preview/post/morning');
  // The detail page shows the docked input right away.
  const input=page.locator('[data-comment-dock] input[aria-label="댓글 남기기"]');await input.click();
  await input.pressSequentially('@하');
  const list=page.getByRole('listbox',{name:'태그할 사람'});await expect(list).toBeVisible();
  const [box,field]=[await list.boundingBox(),await input.boundingBox()];expect(box!.y+box!.height).toBeLessThanOrEqual(field!.y+1);
  await page.screenshot({path:info.outputPath('mention-mobile.png')});
  await input.press('Enter');await expect(input).toHaveValue('@하늘 ');await expect(list).toHaveCount(0);
});

test('피드 카드·사진 크게 보기·프로필 댓글에도 신고·태그 링크·"@" 목록이 있다',async({page,isMobile},info)=>{
  test.skip(isMobile,'PC 본문 댓글 입력창 전제. 휴대폰 댓글 입력은 mobile-comments.spec.ts에서 확인');
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const card=page.locator('article').filter({hasText:'오늘도 좋은 하루였어요'}).first();
  const check=async(scope:import('@playwright/test').Locator,label:string)=>{
    const section=scope.locator('#comments-morning');
    await expect(section.getByRole('button',{name:/님 댓글 신고$/}).first(),label).toBeVisible();
    await expect(section.locator('a[class*=mentionLink]').first(),label).toHaveAttribute('href',/\/creator\//);
  };
  await page.goto('/preview/feed');await card.locator('[aria-controls="comments-morning"]').click();await check(card,'피드 카드');
  const field=card.locator('textarea[id^="post-comment-"]');await field.click();await field.pressSequentially('@하');
  await expect(page.getByRole('listbox',{name:'태그할 사람'}).getByRole('option',{name:/하늘/})).toBeVisible();await page.screenshot({path:info.outputPath('feed-mention.png')});
  await field.press('Escape');
  await card.locator('#comments-morning').getByRole('button',{name:/님 댓글 신고$/}).first().click();
  await expect(page.getByRole('dialog',{name:'댓글을 신고할까요?'})).toBeVisible();await page.getByRole('dialog',{name:'댓글을 신고할까요?'}).getByRole('button',{name:'취소'}).click();
  await card.getByRole('button',{name:/크게 보기/}).first().click();
  const overlay=page.getByRole('dialog');await overlay.locator('[aria-controls="comments-morning"]').click();await check(overlay,'사진 크게 보기');
  await page.keyboard.press('Escape');
  await page.goto('/preview/creator/haneul');await card.locator('[aria-controls="comments-morning"]').click();await check(card,'프로필');
  expect(errors).toEqual([]);
});

test.describe('휴대폰 터치',()=>{
  test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test('답글 달기·수정·삭제·신고 버튼은 높이·너비 44px 이상이다',async({page},info)=>{
    await page.goto('/preview/post/morning');
    const section=page.locator('[data-post-detail] #comments-morning');
    const buttons=[section.getByRole('button',{name:/답글 달기$/}).first(),section.getByRole('button',{name:'수정',exact:true}),section.getByRole('button',{name:'삭제',exact:true}),section.getByRole('button',{name:/님 댓글 신고$/}).first()];
    for(const button of buttons){await button.scrollIntoViewIfNeeded();const box=(await button.boundingBox())!;expect(box.height,await button.innerText()).toBeGreaterThanOrEqual(44);expect(box.width,await button.innerText()).toBeGreaterThanOrEqual(44);}
    await buttons[1].scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('touch-targets.png')});
  });
});

test('알림 분류에는 멤버십·댓글·메시지·새 게시물이 늘 있다',async({page})=>{
  await page.goto('/preview/notifications');
  const chips=page.getByRole('group',{name:'알림 분류'}).or(page.locator('[aria-label="알림 분류"]')).first();
  for(const label of ['전체','멤버십','댓글','메시지','새 게시물'])await expect(chips.getByRole('button',{name:label,exact:true})).toBeVisible();
});
