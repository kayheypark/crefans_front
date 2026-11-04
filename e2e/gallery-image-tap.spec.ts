import {test,expect,type Page,type Locator} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);

const activeImage=(dialog:Locator)=>dialog.locator('[class*="stageSlide"]:not([aria-hidden]) > img');
async function tapImage(page:Page,dialog:Locator){const image=activeImage(dialog);await image.evaluate((i:HTMLImageElement)=>i.decode());if((page.viewportSize()?.width??1280)<=767)await image.tap();else await image.click();}
async function openPost(page:Page,url:string){await page.goto(url);await page.locator('article').getByRole('button',{name:/크게 보기/}).first().click();const dialog=page.getByRole('dialog');await expect(dialog).toHaveAttribute('data-state','open');return dialog;}

// Run on a touch-capable mobile project and a desktop project. No payment or comment is submitted.
test('이미지 탭 전체 보기·패널 복원, 스와이프와 동영상·PC 예외',async({page,browserName},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const dialog=await openPost(page,'/preview/post/morning'),mobile=(page.viewportSize()?.width??1280)<=767;
 const track=dialog.locator('[class*="stageTrack"]'),panel=dialog.locator('aside');
 if(!mobile){await tapImage(page,dialog);await expect(dialog).not.toHaveAttribute('data-media-expanded','true');await expect(panel).toBeVisible();}
 else{
  const handle=dialog.getByRole('button',{name:/상세 패널 크기:/});await expect(dialog).toHaveAttribute('data-panel-snap','0');await handle.press('Home');await handle.click();await expect(dialog).toHaveAttribute('data-panel-snap','1');
  await tapImage(page,dialog);await expect(dialog).toHaveAttribute('data-media-expanded','true');await expect(panel).toBeHidden();
  await expect.poll(async()=>Math.round((await track.boundingBox())!.height)).toBe(Math.round((await dialog.boundingBox())!.height));
  await page.screenshot({path:info.outputPath('expanded.png')});
  await tapImage(page,dialog);await expect(dialog).not.toHaveAttribute('data-media-expanded','true');await expect(panel).toBeVisible();await expect(dialog).toHaveAttribute('data-panel-snap','1');
  await handle.press('Home');await expect(dialog).toHaveAttribute('data-panel-snap','0');
 }
 const box=(await track.boundingBox())!,from={x:box.x+box.width*.8,y:box.y+box.height*.4},to={x:box.x+box.width*.2,y:from.y};
 if(mobile&&browserName==='chromium'){
  const client=await page.context().newCDPSession(page);await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
  for(let i=1;i<=8;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/8,y:from.y}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await client.detach();
 }else{await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();}
 await expect(track).toHaveAttribute('data-index','1');await expect(dialog).not.toHaveAttribute('data-media-expanded','true');
 const video=dialog.locator('video[controls]');await video.evaluate(v=>v.setAttribute('data-identity-check','same'));await video.click();await expect(dialog).not.toHaveAttribute('data-media-expanded','true');await expect(video).toHaveAttribute('data-identity-check','same');
 await dialog.getByRole('button',{name:'이전 미디어',exact:true}).click();await expect(track).toHaveAttribute('data-index','0');await expect(dialog).not.toHaveAttribute('data-media-expanded','true');
 if(mobile){await tapImage(page,dialog);await expect(panel).toBeHidden();await dialog.getByRole('button',{name:'미디어 축소',exact:true}).click();await expect(panel).toBeVisible();}
 await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toHaveCount(0);expect(errors).toEqual([]);
});

test('사진 한 장도 탭으로 확대하고 프로필 사진 뷰어에는 영향을 주지 않는다',async({page},info)=>{
 const dialog=await openPost(page,'/preview/post/cat-day'),mobile=(page.viewportSize()?.width??1280)<=767;
 await tapImage(page,dialog);
 if(mobile){await expect(dialog).toHaveAttribute('data-media-expanded','true');await tapImage(page,dialog);}
 await expect(dialog).not.toHaveAttribute('data-media-expanded','true');await expect(dialog.locator('aside')).toBeVisible();
 await page.screenshot({path:info.outputPath('restored.png')});await dialog.getByRole('button',{name:'닫기',exact:true}).click();
 await page.goto('/preview/creator/jiwoo');await page.getByRole('button',{name:'지우 프로필 사진 크게 보기',exact:true}).click();const profile=page.getByRole('dialog');await expect(profile).toHaveAttribute('data-media-only','true');await tapImage(page,profile);await expect(profile).toHaveAttribute('data-state','open');await expect(profile).not.toHaveAttribute('data-media-expanded','true');await expect(profile.locator('aside')).toHaveCount(0);await profile.getByRole('button',{name:'닫기',exact:true}).click();
});

test('실서비스 공용 갤러리도 같은 이미지 탭을 적용한다 (API 응답 대역)',async({page})=>{
 const creator={id:'tap-artist',name:'테스트 작가',handle:'artist',image:'',position:'center',tags:[],bio:'',followers:'0'};
 const post={id:'open',creatorId:creator.id,title:'이미지 탭 검증',body:'본문',image:'/illustrations/redesign/daily-cat.png',position:'center',likes:0,comments:0,requiredRank:0,time:'오늘',canAccess:true};
 await page.context().route('**/api/v1/**',async route=>{const path=new URL(route.request().url()).pathname;let data:unknown={};if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'팬',handle:'fan',image:'',bio:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};else if(path.endsWith('/comments-page'))data={comments:[],nextOffset:null};else if(path.startsWith('/api/v1/posts/'))data={creator,post};await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});});
 const dialog=await openPost(page,'/service/post/open');await tapImage(page,dialog);if((page.viewportSize()?.width??1280)<=767){await expect(dialog).toHaveAttribute('data-media-expanded','true');await expect(dialog.locator('aside')).toBeHidden();}else{await expect(dialog).not.toHaveAttribute('data-media-expanded','true');await expect(dialog.locator('aside')).toBeVisible();}
});
