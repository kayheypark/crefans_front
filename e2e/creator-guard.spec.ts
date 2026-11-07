import {test,expect,type Page} from '@playwright/test';
import path from 'node:path';
// 2026-11-07 user request: members who have not switched to creator see a guard page (same tone as signup complete) on studio
// screens instead of the start form. Service runs against an API stand-in; no real account or server is involved.
const shots=path.resolve('.local/creator-guard-20261107');
const mobile=(page:Page)=>(page.viewportSize()?.width||0)<768;
async function shot(page:Page,name:string){await page.screenshot({path:path.join(shots,`${mobile(page)?'mobile':'pc'}-${name}.png`),fullPage:true,animations:'disabled'});}
async function service(page:Page,started:boolean){
 const boot={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.route('**/api/v1/**',async route=>{const p=new URL(route.request().url()).pathname;
  const data=p.endsWith('/bootstrap')?boot:p.endsWith('/studio/overview')?{started,categories:['일상'],profile:{name:'검증',handle:'qa',avatar:'',bio:'',category:''},management:{contents:[],memberships:[],subscribers:[],now:'2026-11-07T00:00:00Z'},metrics:[],activities:[],series:[],contentPerformance:[]}:p.endsWith('/studio/community')?{posts:[],comments:[],contacts:[],messagesByCreator:{}}:{};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});});
}
async function checkGuard(page:Page){
 const heading=page.getByRole('heading',{name:'크리에이터 전환이 필요해요',exact:true});
 await expect(heading).toBeVisible();await expect(heading).toBeFocused();
 await expect(page.getByText('스튜디오는 크리에이터만 이용할 수 있어요.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'크리에이터 시작하기',exact:true})).toHaveCount(0);
 const check=page.locator('section span').filter({has:page.locator('svg')}).first();
 await expect(check).toHaveCSS('width','88px');await expect(check).toHaveCSS('height','88px');
 const primary=page.getByRole('link',{name:'크리에이터 시작하기',exact:true}),secondary=page.getByRole('link',{name:'팬 화면으로',exact:true});
 await expect(primary).toHaveCSS('background-color','rgb(37, 99, 235)');
 for(const link of [primary,secondary])expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 return {primary,secondary};
}
test('미전환 회원: 스튜디오 진입 시 가드 페이지, 주 버튼은 크리에이터 시작하기 (API 대역)',async({page})=>{
 await service(page,false);
 for(const url of ['/service/studio/content','/service/studio']){await page.goto(url);await expect(page).toHaveURL(new RegExp(`${url}$`));await checkGuard(page);}
 await shot(page,'guard');
 const {primary}=await checkGuard(page);await primary.click();
 await expect(page).toHaveURL(/\/service\/studio\/start$/);await expect(page.getByRole('heading',{name:'크리에이터 시작하기',exact:true})).toBeVisible();await shot(page,'start');
});
test('미전환 회원: 보조 버튼은 팬 화면으로 (API 대역)',async({page})=>{
 await service(page,false);await page.goto('/service/studio');const {secondary}=await checkGuard(page);
 await secondary.click();await expect(page).toHaveURL(/\/service$/);
});
test('크리에이터는 기존대로 스튜디오 화면 (API 대역)',async({page})=>{
 await service(page,true);await page.goto('/service/studio/content');
 await expect(page.getByRole('heading',{name:'게시물'}).first()).toBeVisible();
 await expect(page.getByRole('heading',{name:'크리에이터 전환이 필요해요'})).toHaveCount(0);
});
test('목업 /preview/studio/guard 와 디자인 시스템 버튼',async({page,context})=>{
 await page.goto('/preview/studio/guard');const {primary}=await checkGuard(page);await shot(page,'preview-guard');
 await expect(primary).toHaveAttribute('href','/preview/studio/start');await expect(page.getByRole('link',{name:'팬 화면으로'})).toHaveAttribute('href','/preview');
 await page.setViewportSize({width:320,height:640});await page.goto('/preview/studio/guard');await checkGuard(page);await shot(page,'preview-guard-320');
 await page.setViewportSize({width:1280,height:800});await page.goto('/design-system');await page.getByRole('button',{name:'상태·피드백',exact:false}).click();
 const [opened]=await Promise.all([context.waitForEvent('page'),page.getByRole('button',{name:'크리에이터 전환 안내 보기'}).click()]);
 await opened.waitForLoadState();await checkGuard(opened);
});
