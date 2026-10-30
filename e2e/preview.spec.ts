import {test,expect} from '@playwright/test';
for(const route of['landing','feed','explore','creator/haneul','membership/haneul','post/morning','following','subscriptions','me?tab=saved','me?tab=liked','notifications','login','signup','reset-password','support']){
 test(`목업 /preview/${route} 렌더링`,async({page})=>{const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const r=await page.goto('/preview/'+route);expect(r?.status()).toBe(200);await expect(page.getByText('목업 페이지입니다',{exact:true})).toBeVisible();await expect(page.locator('body')).not.toContainText('Application error');expect(errors).toEqual([]);});
}
test('회원가입 필수 입력 전 제출 차단·비밀번호 눈 토글',async({page})=>{await page.goto('/preview/signup');await expect(page.getByRole('button',{name:'동의하고 가입하기'})).toBeDisabled();await page.getByLabel('비밀번호',{exact:true}).fill('Example-123!');await page.getByRole('button',{name:'비밀번호 보기',exact:true}).first().click();await expect(page.getByLabel('비밀번호',{exact:true})).toHaveAttribute('type','text');});
test('모바일·PC 모두 스튜디오 표시, 모바일은 메뉴 버튼으로 이동',async({page,isMobile})=>{await page.goto('/preview/studio');await expect(page.getByRole('heading',{name:'하늘님, 반가워요',exact:true})).toBeVisible();if(isMobile){const menu=page.getByRole('button',{name:'스튜디오 메뉴 열기',exact:true});await expect(menu).toBeVisible();await menu.click();await page.getByRole('button',{name:'수익,정산,출금 관리',exact:true}).click();await page.getByRole('link',{name:'수익 현황',exact:true}).click();await expect(page).toHaveURL(/\/preview\/studio\/earnings$/);await expect(page.getByRole('heading',{name:'수익 현황',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'스튜디오 메뉴 열기',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}else await expect(page.getByRole('button',{name:/스튜디오 메뉴/})).toHaveCount(0);});
test('크리에이터 팔로우 해제는 확인 모달을 거친다',async({page})=>{await page.goto('/preview/creator/haneul');const following=page.getByRole('button',{name:'팔로우 하는중',exact:true});if(await following.count()===0)await page.getByRole('button',{name:'팔로우',exact:true}).click();await following.click();const dialog=page.getByRole('dialog');await expect(dialog.getByRole('heading',{name:'팔로우를 해제할까요?',exact:true})).toBeVisible();await dialog.getByRole('button',{name:'취소',exact:true}).click();await expect(dialog).toBeHidden();await expect(following).toBeVisible();await following.click();await dialog.getByRole('button',{name:'팔로우 해제',exact:true}).click();await expect(page.getByRole('button',{name:'팔로우',exact:true})).toBeVisible();});

test('갤러리 상세 패널 세 단계와 미디어 넘김·댓글 스크롤',async({page,isMobile,browserName})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/preview/creator/haneul');
  const opener=page.getByRole('article').getByRole('button',{name:/크게 보기/}).first();await opener.click();
  const dialog=page.getByRole('dialog'),handle=dialog.getByRole('button',{name:/상세 패널 크기:/});
  const stage=dialog.locator('[class*="stageTrack"]'),panel=dialog.locator('[class*="panelContent"]');
  if(!isMobile){
    await expect(handle).toBeHidden();
    await expect(dialog.getByRole('button',{name:'미디어 확대',exact:true})).toBeHidden();
    const mediaBox=await stage.boundingBox(),panelBox=await panel.boundingBox();
    expect(mediaBox!.x+mediaBox!.width).toBeLessThanOrEqual(panelBox!.x);
    await dialog.getByRole('button',{name:'다음 미디어',exact:true}).click();await expect(stage).toHaveAttribute('data-index','1');
    await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();expect(errors).toEqual([]);return;
  }
  const client=browserName==='chromium'?await page.context().newCDPSession(page):null;
  async function drag(from:{x:number;y:number},to:{x:number;y:number}){
    if(client){
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
      for(let i=1;i<=10;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/10,y:from.y+(to.y-from.y)*i/10}]});
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:10});await page.mouse.up();}
  }
  async function resizeTo(snap:number){
    const box=(await handle.boundingBox())!,viewport=(await dialog.boundingBox())!;
    await drag({x:box.x+box.width/2,y:box.y+box.height/2},{x:box.x+box.width/2,y:viewport.height*[.56,.22,0][snap]+box.height/2});
    await expect(dialog).toHaveAttribute('data-panel-snap',String(snap));
    await expect.poll(async()=>Math.round((await stage.boundingBox())!.height)).toBe(Math.round(viewport.height*[.56,.22,0][snap]));
  }
  async function expandMedia(){
    await expectGalleryCorner('미디어 확대');
    await dialog.getByRole('button',{name:'미디어 확대',exact:true}).click();
    await expect(panel).toBeHidden();await expect(handle).toBeHidden();await expect(stage).toBeVisible();
    const viewport=(await dialog.boundingBox())!;
    await expect.poll(async()=>Math.round((await stage.boundingBox())!.height)).toBe(Math.round(viewport.height));
    await expect(dialog.getByRole('button',{name:'미디어 축소',exact:true})).toBeVisible();
    await expect(dialog.getByRole('button',{name:'닫기',exact:true})).toBeVisible();
    await expectGalleryCorner('미디어 축소');
  }
  async function expectGalleryCorner(name:string){
    const toggle=dialog.getByRole('button',{name,exact:true});
    await expect.poll(()=>toggle.evaluate(node=>{
      const button=node.getBoundingClientRect(),gallery=node.parentElement!.getBoundingClientRect();
      return Math.max(Math.abs(gallery.right-button.right-10),Math.abs(gallery.bottom-button.bottom-10));
    })).toBeLessThan(1);
  }
  async function restorePanel(snap:number){
    await dialog.getByRole('button',{name:'미디어 축소',exact:true}).click();
    await expect(panel).toBeVisible();await expect(dialog).toHaveAttribute('data-panel-snap',String(snap));
    const viewport=(await dialog.boundingBox())!;
    await expect.poll(async()=>Math.round((await stage.boundingBox())!.height)).toBe(Math.round(viewport.height*[.56,.22,0][snap]));
  }
  await expect(dialog).toHaveAttribute('data-panel-snap','0');
  await expandMedia();await restorePanel(0);
  await resizeTo(1);
  await expandMedia();
  const mediaBox=(await stage.boundingBox())!;
  await drag({x:mediaBox.x+mediaBox.width*.8,y:mediaBox.y+mediaBox.height/2},{x:mediaBox.x+mediaBox.width*.2,y:mediaBox.y+mediaBox.height/2});
  await expect(stage).toHaveAttribute('data-index','1');await expect(dialog).toHaveAttribute('data-panel-snap','1');
  await restorePanel(1);await expect(stage).toHaveAttribute('data-index','1');
  await resizeTo(2);await expect(dialog.getByRole('button',{name:'닫기',exact:true})).toBeVisible();
  await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();
  await expect(dialog.getByRole('heading',{name:/^댓글 \d/})).toBeVisible();
  const panelBox=(await panel.boundingBox())!;
  if(client)await drag({x:panelBox.x+panelBox.width/2,y:panelBox.y+panelBox.height*.8},{x:panelBox.x+panelBox.width/2,y:panelBox.y+panelBox.height*.2});
  else await panel.evaluate(node=>node.scrollTo(0,node.scrollHeight));
  await expect.poll(()=>panel.evaluate(node=>node.scrollTop)).toBeGreaterThan(0);
  await expect(dialog).toHaveAttribute('data-panel-snap','2');
  const draft=dialog.getByRole('textbox',{name:'댓글 남기기',exact:true});await draft.fill('확대 후에도 작성 중인 댓글 유지');
  await expect(dialog.getByRole('button',{name:'미디어 확대',exact:true})).toBeHidden();
  await resizeTo(1);await expandMedia();await restorePanel(1);await expect(draft).toHaveValue('확대 후에도 작성 중인 댓글 유지');
  await resizeTo(0);
  await handle.press('End');await expect(dialog).toHaveAttribute('data-panel-snap','2');
  await handle.press('Home');await expect(dialog).toHaveAttribute('data-panel-snap','0');
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();
  await opener.click();await expect(dialog).toHaveAttribute('data-panel-snap','0');
  await expandMedia();
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();
  await opener.click();await expect(dialog.getByRole('button',{name:'미디어 확대',exact:true})).toBeVisible();await expect(panel).toBeVisible();
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();expect(errors).toEqual([]);
});

test('프로필 사진·배경사진은 공용 미디어 오버레이에서 확대하고 닫으면 포커스를 복원한다',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/preview/creator/moka');
  for(const label of ['모카 프로필 사진','모카 배경사진']){
    const trigger=page.getByRole('button',{name:`${label} 크게 보기`,exact:true});
    const src=await trigger.locator('img').getAttribute('src');
    await trigger.click();
    const viewer=page.getByRole('dialog',{name:label,exact:true});
    await expect(viewer).toBeVisible();await expect(viewer).toHaveAttribute('data-media-only','true');
    await expect(viewer.getByRole('img',{name:label,exact:true})).toHaveAttribute('src',src!);
    await expect(viewer.locator('aside')).toHaveCount(0);
    const close=viewer.getByRole('button',{name:'닫기',exact:true});
    await expect(close).toBeFocused();await close.press('Tab');await expect(close).toBeFocused();
    expect((await close.boundingBox())!.width).toBeGreaterThanOrEqual(44);
    expect((await close.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.locator('body').evaluate(node=>node.style.overflow)).toBe('hidden');
    await close.press('Escape');await expect(viewer).toBeHidden();await expect(trigger).toBeFocused();
    expect(await page.locator('body').evaluate(node=>node.style.overflow)).not.toBe('hidden');
  }
  await page.goto('/preview/me');
  await page.getByRole('button',{name:/프로필 사진 크게 보기/}).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('data-media-only','true');
  await page.getByRole('dialog').getByRole('button',{name:'닫기',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeHidden();expect(errors).toEqual([]);
});


test('좋아요·저장은 다른 게시물 액션과 후원 모달 이후에도 선택 색상을 유지한다',async({page})=>{
  await page.goto('/preview/post/sion-first-shoot');
  for(const gallery of [false,true]){
    if(gallery)await page.getByRole('button',{name:'시온의 북부에서 온 첫 인사 1 크게 보기',exact:true}).click();
    const scope=gallery?page.getByRole('dialog',{name:'북부에서 온 첫 인사',exact:true}):page.getByRole('main');
    const like=scope.getByRole('button',{name:/^좋아요( 취소)?$/});
    const save=scope.getByRole('button',{name:/^(게시물 저장|저장 취소)$/});
    if(await like.getAttribute('aria-pressed')!=='true')await like.click();
    await save.click();
    await expect(like).toHaveAttribute('aria-pressed','true');
    await expect(like).toHaveCSS('color','rgb(220, 38, 38)');
    await expect(like.locator('svg')).toHaveCSS('fill','rgb(220, 38, 38)');
    if(await save.getAttribute('aria-pressed')!=='true')await save.click();
    await scope.getByRole('button',{name:/^게시물 후원/}).click();
    const tip=page.getByRole('dialog',{name:'이 게시물 후원하기',exact:true});
    await expect(tip).toBeVisible();await tip.getByRole('button',{name:'닫기',exact:true}).click();await expect(tip).toBeHidden();
    await expect(like).toHaveCSS('color','rgb(220, 38, 38)');
    await expect(like.locator('svg')).toHaveCSS('fill','rgb(220, 38, 38)');
    await expect(save).toHaveCSS('color','rgb(37, 99, 235)');
    await like.click();await save.click();
    await expect(like).toHaveAttribute('aria-pressed','false');
    await expect(like.locator('svg')).toHaveCSS('fill','none');
    if(gallery)await scope.getByRole('button',{name:'닫기',exact:true}).click();
  }
});
