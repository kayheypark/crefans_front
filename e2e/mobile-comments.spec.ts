import {test,expect,type Page} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
// Assert each visible UI and action below; offscreen lazy images must not gate document readiness in WebKit.

const input=(page:Page)=>page.getByRole('textbox',{name:'댓글 남기기',exact:true});
async function aboveNavigation(page:Page){
  const dock=page.locator('[data-comment-dock]').filter({has:page.locator('form')});
  const nav=page.getByRole('navigation',{name:'하단 메뉴',exact:true});
  await expect.poll(async()=>Math.abs((await dock.boundingBox())!.y+(await dock.boundingBox())!.height-(await nav.boundingBox())!.y)).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}

test('댓글 입력은 모바일 하단 한 줄·PC 본문 textarea이며 초안과 등록 동작을 공유한다',async({page,isMobile},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/preview/post/moka-first-shoot',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'댓글 쓰기',exact:true})).toBeHidden();
  const field=input(page),submit=page.getByRole('button',{name:isMobile?'댓글 등록':'등록',exact:true});
  await expect(field).toBeVisible();await expect(submit).toBeDisabled();
  expect(await field.evaluate(node=>node.tagName)).toBe(isMobile?'INPUT':'TEXTAREA');
  if(isMobile){await aboveNavigation(page);expect((await submit.boundingBox())!.width).toBeGreaterThanOrEqual(44);}
  await field.fill('  한 줄 댓글 테스트  ');
  // Enter while an IME syllable is being composed must not submit.
  if(isMobile){
    await field.dispatchEvent('compositionstart');await field.press('Enter');await expect(field).toHaveValue('  한 줄 댓글 테스트  ');
    await field.dispatchEvent('compositionend');
  }
  await submit.click();await expect(field).toHaveValue('');
  await expect(page.getByText('한 줄 댓글 테스트',{exact:true})).toBeVisible();
  await page.goto('/preview/post/morning',{waitUntil:'domcontentloaded'});await expect(field).toBeVisible();
  await field.fill('화면 크기가 바뀌어도 유지할 초안');
  if(isMobile){
    const before=await field.boundingBox();
    await page.locator('[data-service-scroll]').evaluate(node=>node.scrollTo(0,node.scrollHeight));
    expect((await field.boundingBox())!.y).toBe(before!.y);await aboveNavigation(page);
    await page.setViewportSize({width:320,height:570});await aboveNavigation(page);
    await page.setViewportSize({width:767,height:844});await aboveNavigation(page);
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:info.outputPath('mobile-comments.png')});
  }else{await expect(page.locator('[data-comment-dock]')).toBeHidden();}
  await page.setViewportSize({width:1280,height:900});await expect(field).toHaveValue('화면 크기가 바뀌어도 유지할 초안');
  expect(await field.evaluate(node=>node.tagName)).toBe('TEXTAREA');
  expect(errors).toEqual([]);
});

test('여러 피드 댓글의 입력바는 하나만 표시하고 게시물별 초안을 보존한다',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile dock arbitration');
  await page.goto('/preview/feed',{waitUntil:'domcontentloaded'});
  const first=page.getByRole('article').filter({has:page.locator('a[href="/preview/post/moka-first-shoot"]')}),second=page.getByRole('article').filter({has:page.locator('a[href="/preview/post/sion-first-shoot"]')});
  await first.getByRole('button',{name:/댓글 .*펼치기/}).click();await input(page).fill('모카 초안');
  await second.getByRole('button',{name:/댓글 .*펼치기/}).click();await expect(input(page)).toHaveCount(1);await expect(input(page)).toHaveValue('');await input(page).fill('시온 초안');
  await first.getByRole('button',{name:'댓글 쓰기',exact:true}).click();await expect(input(page)).toHaveValue('모카 초안');
  await page.getByRole('button',{name:'댓글 닫기',exact:true}).click();await expect(first.getByRole('button',{name:/댓글 .*펼치기/})).toHaveAttribute('aria-expanded','false');await expect(input(page)).toHaveValue('시온 초안');
  await page.getByRole('button',{name:'댓글 닫기',exact:true}).click();await expect(input(page)).toHaveCount(0);
  await expect(page.locator('[data-comment-dock]')).toBeHidden();
});

test('피드를 스크롤한 뒤 플로팅 X로 댓글을 닫고 키보드 영역을 복원한다',async({page,isMobile},info)=>{
  await page.goto('/preview/feed',{waitUntil:'domcontentloaded'});
  const first=page.getByRole('article').filter({has:page.locator('a[href="/preview/post/moka-first-shoot"]')});
  await first.getByRole('button',{name:/댓글 .*펼치기/}).click();
  const close=page.getByRole('button',{name:'댓글 닫기',exact:true});
  if(!isMobile){await expect(close).toHaveCount(0);await expect(input(page)).toBeVisible();return;}
  await expect(close).toBeVisible();
  for(const width of [320,390,767]){
    await page.setViewportSize({width,height:844});await aboveNavigation(page);
    expect((await input(page).boundingBox())!.width).toBeGreaterThan(160);
    expect((await close.boundingBox())!.width).toBeGreaterThanOrEqual(44);
  }
  await page.setViewportSize({width:390,height:844});
  const box=(await close.boundingBox())!,fieldBox=(await input(page).boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);expect(box.x+box.width).toBeLessThan(fieldBox.x);
  const scroll=page.locator('[data-service-scroll]');
  await scroll.evaluate(node=>node.scrollTo(0,node.scrollHeight));
  expect(await first.getByRole('button',{name:/댓글 .*접기/}).evaluate(node=>node.getBoundingClientRect().bottom)).toBeLessThan(0);
  await expect(close).toBeInViewport();await aboveNavigation(page);
  await page.screenshot({path:info.outputPath('scrolled-close.png')});
  await input(page).fill('닫기 동작 확인');
  await page.evaluate(()=>{Object.defineProperty(visualViewport!,'height',{configurable:true,get:()=>450});visualViewport!.dispatchEvent(new Event('resize'));});
  await expect(page.locator('[data-mobile-shell]')).toHaveAttribute('data-comment-keyboard','true');
  await close.click();
  await expect(input(page)).toHaveCount(0);await expect(close).toHaveCount(0);
  await expect(first.getByRole('button',{name:/댓글 .*펼치기/})).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('[data-comment-dock]')).toBeHidden();
  await expect(page.locator('[data-mobile-shell]')).not.toHaveAttribute('data-comment-keyboard','true');
  await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeVisible();
  expect(await scroll.evaluate(node=>node.scrollTop)).toBeGreaterThan(100);
  await page.evaluate(()=>{delete (visualViewport as unknown as {height?:number}).height;visualViewport!.dispatchEvent(new Event('resize'));});
  await first.getByRole('button',{name:/댓글 .*펼치기/}).click();await expect(input(page)).toBeVisible();await expect(close).toBeVisible();
});

test('갤러리 댓글 입력은 패널 하단에 남고 확대·축소 및 키보드 영역 변경에 대응한다',async({page,isMobile},info)=>{
  test.skip(!isMobile,'Mobile gallery dock');
  await page.goto('/preview/creator/haneul',{waitUntil:'domcontentloaded'});
  await page.getByRole('article').getByRole('button',{name:/크게 보기/}).first().click();
  const dialog=page.getByRole('dialog'),field=dialog.getByRole('textbox',{name:'댓글 남기기',exact:true}),dock=dialog.locator('[data-comment-dock]');
  await expect(field).toBeVisible();await expect(field).not.toBeFocused();
  await expect(dialog.getByRole('heading',{name:/^댓글/})).toHaveCount(0);
  for(const width of [320,390,767]){
    await page.setViewportSize({width,height:844});
    await expect.poll(async()=>Math.round((await dock.boundingBox())!.y+(await dock.boundingBox())!.height)).toBe(844);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.setViewportSize({width:390,height:844});
  await field.fill('갤러리 초안');
  await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();
  await expect(dialog.getByRole('button',{name:'댓글 쓰기',exact:true})).toBeHidden();
  await dialog.getByRole('button',{name:/댓글 .*접기/}).click();
  await expect(field).toHaveValue('갤러리 초안');
  await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();
  await dialog.evaluate(async node=>{await Promise.all(node.getAnimations({subtree:true}).map(animation=>animation.finished));});
  const before=await field.boundingBox();await dialog.locator('[class*="panelContent"]').evaluate(node=>node.scrollTo(0,node.scrollHeight));
  expect((await field.boundingBox())!.y).toBe(before!.y);
  await dialog.getByRole('button',{name:/상세 패널 크기:/}).press('End');await expect(field).toBeVisible();
  await dialog.getByRole('button',{name:/상세 패널 크기:/}).press('Home');
  await dialog.getByRole('button',{name:'미디어 확대',exact:true}).click();await expect(field).toBeHidden();
  await dialog.getByRole('button',{name:'미디어 축소',exact:true}).click();await expect(field).toHaveValue('갤러리 초안');
  // Simulate iOS visual-viewport shrink; this does not emulate a physical keyboard.
  await field.focus();await page.evaluate(()=>{Object.defineProperty(visualViewport!,'height',{configurable:true,get:()=>450});visualViewport!.dispatchEvent(new Event('resize'));});
  await expect(dialog).toHaveAttribute('data-comment-keyboard','true');
  await expect.poll(async()=>Math.round((await dock.boundingBox())!.y+(await dock.boundingBox())!.height)).toBe(450);
  await expect(field).toBeFocused();await field.press('Tab');await expect(dialog.getByRole('button',{name:'댓글 등록',exact:true})).toBeFocused();
  await field.evaluate(node=>{(node as HTMLInputElement).blur();});
  await page.evaluate(()=>{delete (visualViewport as unknown as {height?:number}).height;visualViewport!.dispatchEvent(new Event('resize'));});
  await expect(dialog).not.toHaveAttribute('data-comment-keyboard','true');
  await page.screenshot({path:info.outputPath('gallery-comments.png')});
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();await expect(input(page)).toHaveCount(0);
  await page.goto('/preview/post/morning',{waitUntil:'domcontentloaded'});
  // the phone dock input mounts after hydration; until then only the hidden desktop textarea carries this name
  await expect(page.locator('[data-comment-dock] input')).toBeVisible();await input(page).fill('키보드 복귀 확인');
  await page.evaluate(()=>{Object.defineProperty(visualViewport!,'height',{configurable:true,get:()=>450});visualViewport!.dispatchEvent(new Event('resize'));});
  await expect(page.locator('[data-mobile-shell]')).toHaveAttribute('data-comment-keyboard','true');
  await expect(page.getByRole('navigation',{name:'하단 메뉴',exact:true})).toBeHidden();
  await expect.poll(async()=>Math.round((await page.locator('[data-comment-dock]').boundingBox())!.y+(await page.locator('[data-comment-dock]').boundingBox())!.height)).toBe(450);
  await input(page).evaluate(node=>(node as HTMLInputElement).blur());await page.evaluate(()=>{delete (visualViewport as unknown as {height?:number}).height;visualViewport!.dispatchEvent(new Event('resize'));});
  await aboveNavigation(page);
});

test('실서비스 모델도 갤러리 댓글을 바로 작성하고 목록·PC·게시물별 제한을 유지한다',async({page,isMobile})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  const creator={id:'qa-artist',name:'QA 작가',handle:'qa',tags:[],image:'',position:'center',bio:'',followers:'0',plans:[]};
  const viewer={name:'QA 팬',handle:'qa-fan',image:'',bio:''};
  const posts=['one','two','closed','locked'].map(id=>({id,creatorId:creator.id,title:`QA ${id}`,body:'갤러리 댓글 검증',image:'/brand/verified-creator-v1.png',position:'center',likes:0,comments:0,requiredRank:id==='locked'?2:0,time:'오늘',canAccess:id!=='locked',commentsEnabled:id!=='closed'}));
  const reads:string[]=[],sent:{id:string;body:string}[]=[];
  let release=()=>{},success=false;
  await page.route('**/api/v1/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname;let data:unknown={};
    if(path==='/api/v1/bootstrap')data={data:{creators:[creator],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer,signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
    else if(path==='/api/v1/posts')data={posts,creators:[creator],nextCursor:null};
    else if(path.endsWith('/comments-page')){const id=path.split('/')[4];reads.push(id);data={comments:success&&id==='one'?[{id:'qa-comment',author:viewer,body:'갤러리 API 초안',time:'방금'}]:[],nextOffset:null};}
    else if(path.endsWith('/comments')&&request.method()==='POST'){
      sent.push({id:path.split('/')[4],...request.postDataJSON()});
      if(sent.length===1){await new Promise<void>(resolve=>{release=resolve;});await route.fulfill({contentType:'application/json',body:JSON.stringify({success:false,data:null,errorMessage:'갤러리 등록 실패',errorCode:'TEST_ERROR'})});return;}
      success=true;data={message:'등록 완료'};
    }
    await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
  });
  await page.goto('/service/feed',{waitUntil:'domcontentloaded'});
  const article=(id:string)=>page.getByRole('article').filter({has:page.locator(`a[href="/service/post/${id}"]`)});
  await expect(article('locked').getByRole('button',{name:/크게 보기/})).toHaveCount(0);
  await article('one').getByRole('button',{name:/크게 보기/}).click();
  const dialog=page.getByRole('dialog'),field=dialog.getByRole('textbox',{name:'댓글 남기기',exact:true}),dock=dialog.locator('[data-comment-dock]');
  await expect(dialog).toBeVisible();
  if(isMobile){await expect(field).toBeVisible();await expect(field).not.toBeFocused();expect(reads).toEqual([]);}
  else{await expect(field).toHaveCount(0);await expect(dock).toBeHidden();await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();}
  await field.fill('  갤러리 API 초안  ');
  const submit=dialog.getByRole('button',{name:isMobile?'댓글 등록':'등록',exact:true});await submit.click();
  await expect(dialog.getByRole('button',{name:isMobile?'댓글 등록 중':'등록 중...',exact:true})).toBeDisabled();
  if(isMobile)await field.press('Enter');expect(sent).toHaveLength(1);release();
  await expect(dialog.getByRole('alert')).toHaveText('갤러리 등록 실패');await expect(field).toHaveValue('  갤러리 API 초안  ');
  await submit.click();await expect(field).toHaveValue('');
  if(isMobile)await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();
  await expect(dialog.getByRole('button',{name:'댓글 쓰기',exact:true})).toBeHidden();
  await expect(dialog.getByText('갤러리 API 초안',{exact:true})).toBeVisible();
  expect(sent).toEqual([{id:'one',body:'갤러리 API 초안'},{id:'one',body:'갤러리 API 초안'}]);
  await field.fill('이전 글 초안');await dialog.getByRole('button',{name:'다음 게시물',exact:true}).click();
  if(!isMobile){await expect(field).toHaveCount(0);await dialog.getByRole('button',{name:/댓글 .*펼치기/}).click();}
  await expect(field).toHaveValue('');await field.fill('다음 글 초안');
  await dialog.getByRole('button',{name:'다음 게시물',exact:true}).click();
  await expect(dialog.getByRole('heading',{name:'QA closed',exact:true})).toBeVisible();
  await expect(field).toHaveCount(0);await expect(dock).toBeHidden();
  await expect(dialog.getByRole('button',{name:'다음 게시물',exact:true})).toBeDisabled();
  expect(reads).not.toContain('closed');expect(reads).not.toContain('locked');expect(errors).toEqual([]);
});

test('실서비스 모델도 동일한 댓글 입력에서 중복 전송을 막고 실패 초안·권한 제한을 유지한다',async({page,isMobile})=>{
  const creator={id:'qa-artist',name:'QA 작가',handle:'qa',tags:[],image:'',position:'center',bio:'',followers:'0',plans:[]};
  const viewer={name:'QA 팬',handle:'qa-fan',image:'',bio:''};
  const post={id:'qa-post',creatorId:creator.id,title:'댓글 QA 게시물',body:'본문',image:'',media:[],position:'center',likes:0,comments:0,requiredRank:0,time:'오늘',canAccess:true};
  let attempts=0,release=()=>{},success=false;
  const bodies:unknown[]=[];
  await page.route('**/api/v1/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname;let data:unknown={};
    if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer,signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
    else if(path.endsWith('/comments')&&request.method()==='POST'){
      attempts++;bodies.push(request.postDataJSON());
      if(attempts===1){await new Promise<void>(resolve=>{release=resolve;});await route.fulfill({contentType:'application/json',body:JSON.stringify({success:false,data:null,errorMessage:'등록 실패 테스트',errorCode:'TEST_ERROR'})});return;}
      success=true;data={message:'등록 완료'};
    }else if(path.endsWith('/comments-page'))data={comments:success?[{id:'qa-comment',author:viewer,body:'API 초안',time:'방금'}]:[],nextOffset:null};
    else if(path.startsWith('/api/v1/posts/')){const id=path.split('/').at(-1);data={post:{...post,id,canAccess:id!=='locked',requiredRank:id==='locked'?2:0,commentsEnabled:id!=='closed'},creator};}
    await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
  });
  await page.goto('/service/post/qa-post',{waitUntil:'domcontentloaded'});await expect(page.getByRole('button',{name:'댓글 쓰기',exact:true})).toBeHidden();await input(page).fill('  API 초안  ');
  const submit=()=>page.getByRole('button',{name:isMobile?'댓글 등록':'등록',exact:true});await submit().click();
  await expect(page.getByRole('button',{name:isMobile?'댓글 등록 중':'등록 중...',exact:true})).toBeDisabled();
  if(isMobile)await input(page).press('Enter');expect(attempts).toBe(1);release();
  await expect(page.getByRole('alert').filter({hasText:'등록 실패 테스트'})).toHaveText('등록 실패 테스트');await expect(input(page)).toHaveValue('  API 초안  ');
  await submit().click();await expect(input(page)).toHaveValue('');await expect(page.getByText('API 초안',{exact:true})).toBeVisible();
  expect(bodies).toEqual([{body:'API 초안'},{body:'API 초안'}]);
  for(const id of ['locked','closed']){await page.goto('/service/post/'+id,{waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{name:post.title,exact:true})).toBeVisible();await expect(input(page)).toHaveCount(0);await expect(page.locator('[data-comment-dock]')).toBeHidden();}
});
