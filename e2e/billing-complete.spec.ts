import {test,expect,type Page} from '@playwright/test';
const orderId='12345678-1234-1234-1234-123456789012';
const checkoutPath=`/service/checkout/${orderId}`;
async function mockBilling(page:Page,returnPath:string){
 let calls=0,release:(success:boolean)=>void=()=>{};const result=new Promise<boolean>(resolve=>{release=resolve;});
 const bootstrap={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.addInitScript(({returnPath})=>sessionStorage.setItem('crefans-billing-registration',JSON.stringify({registrationId:'test-registration',state:'test-state',customerKey:'test-customer',returnPath})),{returnPath});
 await page.route('**/api/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let data:any=null;
  if(path.endsWith('/bootstrap'))data=bootstrap;
  else if(path.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test'},paymentMethods:[{id:'test-card',label:'등록한 카드',isDefault:true}],paymentGuidance:''};
  else if(path.endsWith('/billing/methods')&&req.method()==='POST'){
   calls++;expect(req.postDataJSON()).toMatchObject({registrationId:'test-registration',state:'test-state',customerKey:'test-customer',returnPath});
   if(!await result){await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false,data:null,errorCode:'PAYMENT_UNCERTAIN',errorMessage:'카드 등록 결과를 확인하지 못했습니다. 다시 확인해주세요.'})});return;}
   data={message:'결제수단을 등록했습니다.',returnPath};
  }else if(path===`/api/v1/checkout/${orderId}`)data={id:orderId,amount:10000,status:'pending',snapshot:{creatorId:'test-creator',name:'맛집 탐험',benefits:[],refundWindowDays:7}};
  else if(req.method()!=='GET')throw Error('Unexpected mutation '+path);
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorCode:null,errorMessage:null})});
 });
 return {release,calls:()=>calls};
}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}

test('preview shares success design and a visible return link',async({page},info)=>{
 await page.goto('/preview/billing/success');await expect(page.getByRole('heading',{name:'카드 등록이 완료됐어요',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'카드 등록이 완료됐어요',exact:true})).toHaveCSS('margin-top','28px');
 const link=page.getByRole('link',{name:'이전 화면으로 돌아가기',exact:true});await expect(link).toHaveAttribute('href','/preview/checkout');
 await expect(page.getByRole('link',{name:'결제수단 관리',exact:true})).toHaveAttribute('href','/preview/payment-methods');
 await noOverflow(page);await page.screenshot({path:info.outputPath('preview.png'),fullPage:true,animations:'disabled'});
 await link.click();await expect(page).toHaveURL(/\/preview\/checkout$/);await expect(page.getByRole('heading',{name:'멤버십 결제',exact:true})).toBeVisible();
});
for(const destination of ['checkout','management'])test(`confirmed registration returns to ${destination} without payment`,async({page},info)=>{
 const returnPath=destination==='checkout'?checkoutPath:'/service/payment-methods',api=await mockBilling(page,returnPath);
 await page.goto('/service/billing/success?registrationId=test-registration&state=test-state&customerKey=test-customer&authKey=test-auth');
 await expect(page.getByText('카드 등록을 확인하고 있습니다.',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'카드 등록이 완료됐어요',exact:true})).toHaveCount(0);
 api.release(true);await expect(page.getByRole('heading',{name:'카드 등록이 완료됐어요',exact:true})).toBeVisible();
 await expect(page).toHaveURL(/\/service\/billing\/success$/);expect(api.calls()).toBe(1);
 const link=page.getByRole('link',{name:'이전 화면으로 돌아가기',exact:true});await expect(link).toHaveAttribute('href',returnPath);
 if(destination==='checkout')await expect(page.getByText('이전 화면에서 결제를 이어가세요.',{exact:false})).toBeVisible();
 else await expect(page.getByText('결제수단 관리에서 등록한 카드를 확인하세요.',{exact:false})).toBeVisible();
 await noOverflow(page);await page.screenshot({path:info.outputPath(destination+'.png'),fullPage:true,animations:'disabled'});
 await link.click();await expect(page).toHaveURL(new RegExp(returnPath+'$'));
 await expect(page.getByRole('heading',{name:destination==='checkout'?'맛집 탐험':'결제수단 관리',exact:true})).toBeVisible();expect(api.calls()).toBe(1);
});
test('unconfirmed registration never shows completion and retains retry',async({page})=>{
 const api=await mockBilling(page,checkoutPath);api.release(false);
 await page.goto('/service/billing/success?registrationId=test-registration&state=test-state&customerKey=test-customer&authKey=test-auth');
 await expect(page.getByRole('alert').filter({hasText:'카드 등록 결과를 확인하지 못했습니다.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'카드 등록이 완료됐어요',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'다시 확인하기',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'멤버십 결제로 돌아가기',exact:true})).toHaveAttribute('href',checkoutPath);expect(api.calls()).toBe(1);
});
