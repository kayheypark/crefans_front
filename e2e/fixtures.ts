import {test as base,expect,APIRequestContext,Page} from '@playwright/test';
import {PAYMENT_TERMS} from '../lib/crefans/payment-terms';
type Scenario={id:string;creator:string;planId:string;postId:string;privateBody:string;orderId:string;signupEmail:string;password:string;users:{id:string;email:string;role:string}[]};
export const test=base.extend<{scenario:Scenario;control:(action:string,body?:object)=>Promise<any>}>({
 page:async({page},use,info)=>{const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));await use(page);
  // QA runs (QA_SETTLED_SHOT=1): after the test body, wait for running animations and keep a settled end-of-test screen.
  if(process.env.QA_SETTLED_SHOT&&!page.isClosed()&&page.url()!=='about:blank'){try{await page.evaluate(()=>Promise.race([Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>null))),new Promise(r=>setTimeout(r,2000))]));await page.waitForTimeout(150);const file=info.outputPath('settled-final.png');await page.screenshot({path:file});await info.attach('settled-final',{path:file,contentType:'image/png'});}catch{}}
  expect(errors,'browser runtime errors').toEqual([]);},
 scenario:async({request},use)=>{const r=await request.post('http://127.0.0.1:3012/__test/seed',{headers:{'x-e2e-token':process.env.CREFANS_E2E_TOKEN!}});expect(r.ok()).toBeTruthy();const f=await r.json();try{await use(f);}finally{const cleanup=await request.post('http://127.0.0.1:3012/__test/dispose',{headers:{'x-e2e-token':process.env.CREFANS_E2E_TOKEN!},data:{fixtureId:f.id}});expect(cleanup.ok(),'test fixture cleanup').toBeTruthy();}},
 control:async({request,scenario},use)=>{await use(async(action,body={})=>{const r=await request.post(`http://127.0.0.1:3012/__test/${action}`,{headers:{'x-e2e-token':process.env.CREFANS_E2E_TOKEN!},data:{fixtureId:scenario.id,...body}});expect(r.ok(),action).toBeTruthy();return r.json();});},
});
export {expect};
// A signed-in visitor is sent away from /service/login (components/crefans/AccountPages.tsx:122), so switching accounts starts signed out.
export async function login(page:Page,f:Scenario,role='fan'){await page.context().clearCookies();await page.goto('/service/login');await page.getByLabel('이메일',{exact:true}).fill(f.users.find(u=>u.role===role)!.email);await page.getByLabel('비밀번호',{exact:true}).fill(f.password);const response=page.waitForResponse(r=>r.url().endsWith('/api/v1/auth/login')&&r.request().method()==='POST');await page.getByRole('button',{name:'로그인',exact:true}).click();expect((await response).ok()).toBeTruthy();await expectSignedIn(page,`E2E ${role} 내 프로필`);}
// Since 4d1d3e8 (2026-11-02) the PC header shows a "계정 메뉴" button; the "<닉네임> 내 프로필" avatar link is displayed only under 768px
// (components/crefans/header-account-menu.module.css). That link stays in the header at every width, so it still identifies the signed-in member.
export async function expectSignedIn(page:Page,profileLink:string|RegExp){const header=page.getByRole('banner');
 await expect(header.getByRole('button',{name:'계정 메뉴',exact:true}).or(header.getByRole('link',{name:profileLink,exact:true}))).toBeVisible();
 await expect(header.getByRole('link',{name:profileLink,exact:true,includeHidden:true})).toHaveCount(1);}
// Server src/platform/finance.service.ts rejects an HTTP payment without the current payment terms version (400 PAYMENT_TERMS_REQUIRED, 6eed61a/2e2ef73).
export const PAY={paymentTerms:PAYMENT_TERMS.version};
export async function api(request:APIRequestContext,path:string,body?:object){const r=body?await request.post('/api/v1'+path,{data:body,headers:{Origin:'http://127.0.0.1:3011'}}):await request.get('/api/v1'+path);return{status:r.status(),...(await r.json())};}
