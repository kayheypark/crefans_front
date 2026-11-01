import {test,expect,type Page} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
async function fits(page:Page){
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 const rows=await page.locator('[data-post-views]:visible').evaluateAll(elements=>elements.map(el=>{
  const row=el.closest('[class*=postActions]')||el.parentElement!,box=row.getBoundingClientRect();
  // Closed <dialog> elements (tip dialogs render inside the row) are display:none and have no rects; measure only drawn children.
  const children=Array.from(row.children).filter(child=>child.getClientRects().length>0).map(child=>child.getBoundingClientRect());
  return {within:children.every(r=>r.left>=box.left-1&&r.right<=box.right+1),separate:children.every((r,i)=>!i||r.left>=children[i-1].right-1)};
 }));
 expect(rows.every(row=>row.within&&row.separate)).toBeTruthy();
}
test('feed, profile, detail and gallery use the existing eye icon',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const path of ['/preview/feed','/preview/creator/moka','/preview/post/moka-first-shoot']){
  await page.goto(path);await expect(page.getByRole('img',{name:'조회수 1,842회'})).toBeVisible();
  const indicator=page.locator('[data-post-views="1842"]');await expect(indicator.locator('svg circle')).toHaveAttribute('r','3');await expect(indicator.locator('img')).toHaveCount(0);await expect(indicator.locator('svg')).toHaveCSS('width','21px');await expect(indicator.locator('svg')).toHaveCSS('height','21px');await fits(page);
  await page.waitForLoadState('networkidle');
 }
 await page.goto('/preview/feed');await page.getByRole('button',{name:/분홍빛 첫 인사 1 크게 보기/}).first().click();const dialog=page.getByRole('dialog');await expect(dialog).toHaveCSS('opacity','1');await expect(dialog.getByRole('img',{name:'조회수 1,842회'})).toBeVisible();await fits(page);
 await dialog.getByRole('img',{name:'조회수 1,842회'}).scrollIntoViewIfNeeded();
 await page.screenshot({path:test.info().outputPath('gallery.png')});expect(errors).toEqual([]);
});
test('catalog displays zero, normal and compact totals, with no placeholder for unknown',async({page})=>{
 await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:false}).first().click();const section=page.locator('#post-views');await expect(section.locator('[data-post-views]')).toHaveCount(4);
 for(const [count,display]of [[0,'0'],[1842,'1,842'],[24831,'2.5만'],[123456789,'1.2억']]as const){const item=section.locator(`[data-post-views="${count}"]`);await expect(item).toHaveText(display);await expect(item).toHaveAttribute('title',`조회수 ${count.toLocaleString('ko-KR')}회`);}
 await section.scrollIntoViewIfNeeded();await page.screenshot({path:test.info().outputPath('catalog.png')});
});
test('API-bound feed preserves server counts, including zero and absent data',async({page})=>{
 const creator={id:'view-artist',name:'조회수 확인',handle:'views',image:'',tags:[],bio:'',position:'center',followers:'0',plans:[]};
 const posts=[0,24831,undefined].map((views,i)=>({id:`view-${i}`,creatorId:creator.id,title:`서버 게시물 ${i}`,body:'서버 응답 표시',image:'',position:'center',likes:1200,comments:234,requiredRank:0,time:'방금',views}));
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:any={};
  if(path==='/api/v1/bootstrap')data={data:{creators:[creator],posts,plans:[],creatorPlans:{},notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'',handle:'',image:'',bio:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
  else if(path==='/api/v1/posts')data={creators:[creator],posts,nextCursor:null};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 await page.goto('/service/feed');await expect(page.locator('[data-post-views]')).toHaveCount(2);await expect(page.getByRole('img',{name:'조회수 0회'})).toBeVisible();await expect(page.getByRole('img',{name:'조회수 24,831회'})).toHaveText('2.5만');
 await fits(page);await page.screenshot({path:test.info().outputPath('service.png')});
});
