import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
test.beforeEach(async({page})=>{await page.addInitScript(()=>sessionStorage.setItem('crefans-preview-signed-in','false'));});
// Use the shared prompt with the signed-out preview model; no account or API mutations are needed.
for(const width of [320,390,767])test(`sign-in footer keeps 16px mobile gutters at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:844});
 for(const path of ['/preview/me','/preview/beans','/preview/beans/charges']){
  await page.goto(path);await page.getByText('로그인이 필요해요',{exact:true}).waitFor();
  const footer=page.locator('main footer'),nav=footer.getByRole('navigation',{name:'서비스 안내'});
  await expect(nav).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  const layout=await nav.evaluate(el=>{const r=el.getBoundingClientRect();return {edges:[Math.round(r.left),Math.round(innerWidth-r.right)],columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth};});
  expect(layout).toEqual({edges:[16,16],columns:2,overflow:false});
  await expect(nav.getByRole('link')).toHaveCount(9);
  const icon=page.locator('main img[src*="signin-lock-3d-transparent-v1"]');
  await expect(icon).toBeVisible();await expect(icon).toHaveCSS('width','88px');
  await expect.poll(()=>icon.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.getByRole('heading',{name:'로그인이 필요해요',exact:true})).toBeVisible();
  await expect(footer.locator('address')).toBeVisible();
  await expect(page.getByRole('link',{name:'로그인',exact:true})).toHaveAttribute('href',`/preview/login?next=${encodeURIComponent(path)}`);
  await expect(page.getByRole('link',{name:'회원가입',exact:true})).toHaveAttribute('href','/preview/signup');
 }
});
test('desktop sign-in layout keeps service links in the sidebar',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/preview/me');
 await page.getByText('로그인이 필요해요',{exact:true}).waitFor();
 await expect(page.locator('main footer')).toBeHidden();
 await expect(page.getByRole('link',{name:'공지사항',exact:true})).toBeVisible();
 await expect(page.locator('main').getByRole('link',{name:'로그인',exact:true})).toBeVisible();
 await expect(page.locator('main img[src*="signin-lock-3d-transparent-v1"]')).toBeVisible();
});

test('service protected pages share the signed-out prompt',async({page},info)=>{
 const bootstrap={data:{creators:[],plans:[],creatorPlans:{},posts:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'',handle:'',bio:'',image:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{}}};
 await page.route('**/api/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:new URL(route.request().url()).pathname.endsWith('/bootstrap')?bootstrap:null,errorMessage:null,errorCode:null})}));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 for(const path of ['/service/me','/service/beans','/service/settings','/service/messages','/service/notifications']){
  await page.goto(path);const main=page.locator('main');
  await expect(main.getByRole('heading',{name:'로그인이 필요해요',exact:true})).toBeVisible();
  const icon=main.locator('img[src*="signin-lock-3d-transparent-v1"]');await expect(icon).toBeVisible();
  await expect.poll(()=>icon.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(main.getByRole('link',{name:'로그인',exact:true})).toHaveAttribute('href',`/service/login?next=${encodeURIComponent(path)}`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.screenshot({path:info.outputPath('service-signin.png'),fullPage:true});expect(errors).toEqual([]);
});
