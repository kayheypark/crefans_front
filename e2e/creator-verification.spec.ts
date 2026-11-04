import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);

test('verified creator names share the badge across profile, feed, membership and explore',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['creator/moka','creator/jiwoo','creator/sion','creator/haneul','post/morning','membership/haneul','explore','following','landing']){
  await page.goto('about:blank');
  await page.goto('/preview/'+route);
  const badge=page.getByRole('img',{name:'인증 크리에이터',exact:true}).first();await expect(badge).toBeVisible();
  await expect.poll(()=>badge.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  const box=await badge.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(16);expect(box!.width).toBeLessThanOrEqual(24);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(route==='creator/haneul'){await expect(page.getByRole('heading',{level:1}).getByRole('img',{name:'인증 크리에이터'})).toHaveCount(1);await page.screenshot({path:info.outputPath('verified-profile.png')});}
  // Finish Next route prefetch before replacing the document on the next iteration.
  await page.waitForLoadState('networkidle');
 }
 await page.goto('/preview/creator/seoyeon');await expect(page.getByRole('heading',{level:1}).getByRole('img',{name:'인증 크리에이터'})).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('service pages render current API verification and remove the badge when revoked',async({page},info)=>{
 let verified=true;
 const creator={id:'qa-artist',name:'인증 상태를 확인하는 크리에이터',handle:'qa',tags:[],image:'',position:'center',bio:'',followers:'0',plans:[],isCreator:true};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:unknown={};
  if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'',handle:'',image:'',bio:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
  else if(path==='/api/v1/profiles/qa-artist')data={...creator,isVerified:verified};
  else if(path==='/api/v1/posts')data={creators:[{...creator,isVerified:verified}],posts:[],nextCursor:null};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 await page.goto('/service/creator/qa-artist');const heading=page.getByRole('heading',{level:1});await expect(heading.getByRole('img',{name:'인증 크리에이터'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('service-verified-long-name.png')});
 verified=false;await page.reload();await expect(heading).toContainText(creator.name);await expect(heading.getByRole('img',{name:'인증 크리에이터'})).toHaveCount(0);
});

test('verification badge loads without the image optimizer in profile, feed and gallery',async({page},info)=>{
 await page.route('**/_next/image?**',route=>new URL(route.request().url()).searchParams.get('url')?.includes('verified-creator')?route.abort():route.continue());
 const loaded=async(badge:ReturnType<typeof page.getByRole>)=>{await expect(badge).toBeVisible();await expect.poll(()=>badge.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);};
 await page.goto('/preview/creator/haneul');await loaded(page.getByRole('heading',{level:1}).getByRole('img',{name:'인증 크리에이터'}));
 await page.goto('/preview/post/morning');await loaded(page.locator('article').getByRole('img',{name:'인증 크리에이터'}).first());
 await page.locator('article').getByRole('button',{name:/크게 보기/}).first().click();await loaded(page.getByRole('dialog').getByRole('img',{name:'인증 크리에이터'}).first());
 await page.screenshot({path:info.outputPath('verified-gallery.png')});
});
