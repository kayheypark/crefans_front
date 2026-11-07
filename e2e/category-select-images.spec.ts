import {test,expect,type Page} from '@playwright/test';
import path from 'node:path';
const icon='/api/v1/categories/new-category/icon/upload-v2';
const labels=['운영 등록 분야','여행','아트','없는 이미지','아주 긴 이름을 가진 활동 분야도 선택할 수 있습니다'];
async function setup(page:Page,started=false){
 const profile={name:'테스트 크리에이터',handle:'test_creator',bio:'',about:'',links:{},avatar:'',cover:'',category:started?labels[0]:'',active:true,commentsEnabled:true};
 const state={beanSupport:false,data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:labels,categoryIcons:{[labels[0]]:icon,'여행':null,'아트':'/brand/categories/art-round-flat-v1.png','없는 이미지':'/select-broken.png'},followers:[]},viewer:{...profile,image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{}}};
 await page.route('**/select-broken.png',r=>r.fulfill({status:404,body:''}));
 await page.route('**/api/v1/**',async r=>{
  const p=new URL(r.request().url()).pathname;
  if(p===icon)return r.fulfill({contentType:'image/png',path:path.resolve('public/brand/categories/travel-round-flat-v1.png')});
  let data:any={};
  if(p.endsWith('/bootstrap'))data=state;
  if(p.endsWith('/common'))data=null;
  if(p.endsWith('/studio/overview'))data={profile,started,categories:labels,period:'',metrics:[],activities:[],tasks:[],series:[],contentPerformance:[],management:{contents:[],memberships:[],subscribers:[],now:'2026-11-07T00:00:00Z'}};
  if(p.endsWith('/studio/community'))data={posts:[],comments:[],contacts:[],messagesByCreator:{},blockedCreatorIds:[]};
  if(p.endsWith('/creators'))data={creators:[],newCreators:[],nextCursor:null};
  if(p.endsWith('/posts'))data={posts:[],creators:[],nextCursor:null};
  await r.fulfill({json:{success:true,data,errorMessage:null,errorCode:null}});
 });
}
for(const started of [false,true])test(`${started?'settings':'onboarding'} uses explore artwork and order; missing/failed images retain labels`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await setup(page,started);
 await page.goto('/service/explore');
 const source=page.getByRole('button',{name:labels[0],exact:true}).locator('img');
 await expect(source).toHaveAttribute('src',icon);
 await page.goto(started?'/service/studio/settings':'/service/studio/start');
 const select=page.getByRole('combobox',{name:'주요 활동 분야'});
 await select.scrollIntoViewIfNeeded();
 await select.click();
 await expect(page.getByRole('option')).toHaveText(labels);
 const option=page.getByRole('option',{name:labels[0],exact:true});
 await expect(option.locator('img')).toHaveAttribute('src',icon);
 await expect(option.locator('img')).toHaveCSS('width','20px');
 await expect.poll(()=>option.locator('img').evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
 await expect(page.getByRole('option',{name:'여행',exact:true}).locator('img')).toHaveCount(0);
 await expect(page.getByRole('option',{name:'없는 이미지',exact:true}).locator('img')).toHaveCount(0);
 const popup=page.locator('[data-select="popup"]');
 const box=(await popup.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
 await page.screenshot({path:info.outputPath('options.png'),animations:'disabled'});
 await option.click();
 await expect(select).toContainText(labels[0]);await expect(select.locator('img')).toHaveAttribute('src',icon);await expect(select.locator('img')).toHaveCSS('height','20px');
 if(!started){await expect(page.getByRole('button',{name:'다음 단계'})).toBeEnabled();await page.getByRole('button',{name:'다음 단계'}).click();await expect(page.getByRole('button',{name:'설정 완료하기'})).toBeVisible();await page.getByRole('button',{name:'이전',exact:true}).click();await expect(select.locator('img')).toHaveAttribute('src',icon);}
 await select.click();await page.getByRole('option',{name:'여행',exact:true}).click();await expect(select.locator('img')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
});
test('preview shares icons and selected state',async({page},info)=>{
 await page.route('**/api/v1/common',r=>r.fulfill({json:{success:true,data:null,errorCode:null,errorMessage:null}}));
 await page.goto('/preview/studio/start');
 const select=page.getByRole('combobox',{name:'주요 활동 분야'});await select.click();
 const art=page.getByRole('option',{name:'아트',exact:true});await expect(art.locator('img')).toHaveAttribute('src','/brand/categories/art-round-flat-v1.png');await page.screenshot({path:info.outputPath('preview-options.png'),animations:'disabled'});await art.click();await expect(select.locator('img')).toHaveAttribute('src','/brand/categories/art-round-flat-v1.png');
});
test('catalog image select supports search, missing artwork, disabled and read-only',async({page},info)=>{
 await page.route('**/select-example-missing.png',r=>r.fulfill({status:404,body:''}));
 await page.goto('/design-system');await page.getByRole('button',{name:'입력·선택',exact:false}).first().click();
 const select=page.getByRole('combobox',{name:'이미지가 있는 선택',exact:true});
 await expect(select.locator('img')).toHaveCSS('width','20px');await select.scrollIntoViewIfNeeded();await select.click();
 await page.getByRole('searchbox',{name:'이미지가 있는 선택 검색',exact:true}).fill('일상');await page.getByRole('option',{name:'일상',exact:true}).click();
 await expect(select.locator('img')).toHaveAttribute('src','/brand/categories/daily-round-flat-v1.png');
 await select.click();await page.getByRole('searchbox',{name:'이미지가 있는 선택 검색',exact:true}).fill('이미지 로드 실패');await page.getByRole('option',{name:'이미지 로드 실패',exact:true}).click();await expect(select.locator('img')).toHaveCount(0);
 const readOnly=page.getByRole('combobox',{name:'이미지가 있는 읽기 전용',exact:true});await readOnly.click();await expect(readOnly).toHaveAttribute('aria-expanded','false');
 const controls=page.locator('section').filter({has:page.getByRole('heading',{name:'입력란의 모든 상태',exact:true})});
 await controls.getByRole('checkbox',{name:'비활성 상태',exact:true}).check();await expect(select).toBeDisabled();
 await select.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('catalog.png'),animations:'disabled'});
});
