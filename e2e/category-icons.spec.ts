import {test,expect} from '@playwright/test';
import path from 'node:path';
import {creators} from '../components/preview/service/fixtures';
test('live category order and uploaded artwork reach feed, explore and profile; preview retains default artwork',async({page},info)=>{
 const state:any={beanSupport:false,data:{creators:[],plans:[],creatorPlans:{},posts:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'',handle:'',bio:'',image:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},commentsByPost:{},account:{email:'',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{}}};
 const creator={...creators.find(c=>c.id==='jiwoo')!,tags:['새 분야'],plans:[]},icon='/api/v1/categories/qa/icon/qa-version';
 state.data={...state.data,categories:['새 분야','여행'],categoryIcons:{'새 분야':icon},creators:[creator]};
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url()),p=url.pathname;
  if(p===icon)return route.fulfill({contentType:'image/png',path:path.resolve('public/brand/categories/travel-round-flat-v1.png')});
  const data=p.endsWith('/bootstrap')?state:p.endsWith('/common')?null:p.includes('/profiles/')?creator:p.endsWith('/creators')?{creators:[creator],nextCursor:null}:p.endsWith('/posts')?{posts:[],creators:[creator],nextCursor:null}:{};
  return route.fulfill({json:{success:true,data,errorMessage:null,errorCode:null}});
 });
 for(const screen of ['feed','explore']){
  await page.goto('/service/'+screen);const chips=page.getByRole('group',{name:screen==='feed'?'관심 카테고리':'크리에이터 카테고리'});
  await expect(chips.getByRole('button')).toHaveText(['전체','새 분야','여행']);
  const img=chips.getByRole('button',{name:'새 분야',exact:true}).locator('img');await expect(img).toHaveAttribute('src',icon);await expect.poll(()=>img.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({path:info.outputPath(screen+'.png')});
 }
 await page.goto('/service/creator/'+creator.id);await expect(page.locator('[aria-label="크리에이터 카테고리"] img')).toHaveAttribute('src',icon);await page.screenshot({path:info.outputPath('profile.png')});
 await page.goto('/preview/explore');const defaultIcon=page.getByRole('button',{name:'여행',exact:true}).locator('img');await expect(defaultIcon).toHaveAttribute('src',/travel-round-flat-v1/);expect(errors).toEqual([]);
});
