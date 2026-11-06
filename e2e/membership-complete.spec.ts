import {test,expect,type Page} from '@playwright/test';

const id='12345678-1234-1234-1234-123456789012',path=`/service/checkout/${id}`,title='멤버십 가입이 완료됐어요';
async function mockOrder(page:Page,status:string,{single=false,long=false,hold=false}={}){
 let release:()=>void=()=>{};const ready=hold?new Promise<void>(resolve=>{release=resolve;}):Promise.resolve();
 const mutations:string[]=[];
 const order={id,planId:'plan-one',amount:long?10000000:10000,status,snapshot:{creatorId:'creator-one',name:long?'사진과 영상을 함께 즐기는 크리에이터의 아주 긴 이름의 월간 멤버십 상품':'맛집 탐험',benefits:['멤버십 전용 게시물 이용'],refundWindowDays:7,paymentMode:single?'one-time':undefined}};
 const bootstrap={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[{id:'card-one',label:'기본 카드',isDefault:true}],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.route('**/api/v1/**',async route=>{
  const req=route.request(),url=new URL(req.url()).pathname;let data:any=null;
  if(req.method()!=='GET')mutations.push(url);
  if(url.endsWith('/bootstrap'))data=bootstrap;
  else if(url.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test',guidance:''},paymentMethods:bootstrap.account.paymentMethods,paymentGuidance:''};
  else if(url===`/api/v1/checkout/${id}`){await ready;data=order;}
  else if(url===`/api/v1/checkout/${id}/pay`){order.status='paid';data={order};}
  else if(req.method()!=='GET')throw Error('Unexpected mutation '+url);
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorCode:null,errorMessage:null})});
 });
 return{release,mutations};
}
async function completion(page:Page){
 const heading=page.getByRole('heading',{name:title,exact:true});await expect(heading).toBeVisible();
 await expect(heading).toHaveCSS('margin-top','28px');
 const check=heading.locator('..').locator('..').locator('>span[aria-hidden="true"]');
 await expect(check).toHaveCSS('width','88px');await expect(check.locator('svg')).toHaveAttribute('width','50');
 const link=page.getByRole('link',{name:'내 구독 확인',exact:true});await expect(link).toBeVisible();
 await expect(link).toHaveAttribute('href','/service/subscriptions');await expect(link).toHaveCSS('min-height','52px');
 await expect(page.getByRole('button',{name:/결제하고 가입|한 달만 결제하기|다시 결제하기/})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
}
async function capture(page:Page,path:string){
 await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);document.querySelectorAll<HTMLElement>('*').forEach(element=>{if(element.scrollTop)element.scrollTop=0;});});
 await page.screenshot({path,fullPage:true,animations:'disabled'});
}
test('paid checkout shows the shared success design, product and subscription link without another charge',async({page},info)=>{
 const api=await mockOrder(page,'paid',{hold:true});await page.goto(path);
 await expect(page.getByRole('heading',{name:'멤버십 결제',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(0);api.release();
 await completion(page);const summary=page.getByRole('region',{name:'가입한 멤버십'});
 await expect(summary).toContainText('맛집 탐험');await expect(summary).toContainText('10,000원');await expect(summary).toContainText('월 · VAT 포함');
 await capture(page,info.outputPath('membership-complete.png'));
 await page.getByRole('link',{name:'내 구독 확인',exact:true}).click();await expect(page).toHaveURL(/\/service\/subscriptions$/);expect(api.mutations).toEqual([]);
});
test('payment confirmation switches checkout to completion once',async({page})=>{
 const api=await mockOrder(page,'pending');await page.goto(path);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'결제하고 가입',exact:true}).click();
 await completion(page);expect(api.mutations).toEqual([`/api/v1/checkout/${id}/pay`]);
});
test('one-month product and long content fit without recurring-payment wording',async({page},info)=>{
 const api=await mockOrder(page,'paid',{single:true,long:true});await page.goto(path);await completion(page);
 const summary=page.getByRole('region',{name:'가입한 멤버십'});await expect(summary).toContainText('10,000,000원');await expect(summary).toContainText('한 달 이용 · VAT 포함');await expect(summary.getByText('월간 멤버십',{exact:true})).toHaveCount(0);
 await capture(page,info.outputPath('one-month-long.png'));expect(api.mutations).toEqual([]);
});
test('one-time callback refresh uses the same success design only for a stored paid order',async({page},info)=>{
 const api=await mockOrder(page,'paid',{single:true});await page.goto(`/service/payment/success?id=${id}`);await completion(page);
 await capture(page,info.outputPath('one-time-complete.png'));expect(api.mutations).toEqual([]);
});
test('pending, processing and failed orders never show completion, including callback refresh',async({page})=>{
 for(const status of ['pending','processing','failed']){
  await page.unrouteAll();const api=await mockOrder(page,status);await page.goto(path);
  await expect(page.getByRole('heading',{name:'맛집 탐험',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(0);
  await page.goto(`/service/payment/success?id=${id}`);
  await expect(page.getByRole('button',{name:status==='processing'?'다시 확인하기':'다시 결제하기',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:title,exact:true})).toHaveCount(0);expect(api.mutations).toEqual([]);
 }
});
