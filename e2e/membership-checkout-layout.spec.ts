import {test,expect,type Page} from '@playwright/test';

async function mockCheckout(page:Page,{card=true,invalid=false,long=false,processing=false}={}){
 let calls=0,terms='';
 const order={id:'layout-order',planId:'plan-one',amount:long?10000000:10000,status:processing?'processing':'pending',snapshot:{creatorId:'creator-one',name:long?'사진과 영상을 함께 즐기는 크리에이터의 아주 긴 이름의 월간 멤버십 상품':'맛집 탐험',benefits:['멤버십 전용 게시물 이용'],refundWindowDays:7,paymentEnvironment:'test'}};
 const bootstrap={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:card?[{id:'card-one',label:'기본 카드',isDefault:true,requiresUpdate:invalid}]:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  let data:any=null;
  if(path.endsWith('/bootstrap'))data=bootstrap;
  else if(path.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test',guidance:''},paymentMethods:bootstrap.account.paymentMethods,paymentGuidance:''};
  else if(path.endsWith('/pay')){calls++;terms=route.request().postDataJSON()?.paymentTerms;order.status='paid';data={order};}
  else if(path.endsWith('/checkout/layout-order'))data=order;
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 return{calls:()=>calls,terms:()=>terms};
}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
async function captureScreen(page:Page,path:string){
 await page.evaluate(()=>{window.scrollTo(0,0);document.querySelectorAll<HTMLElement>('*').forEach(element=>{if(element.scrollTop)element.scrollTop=0;});});
 await page.screenshot({path,fullPage:true,animations:'disabled'});
}

test('preview shares the checkout, with keyboard-accessible full terms and separated mobile buttons',async({page},info)=>{
 await page.goto('/preview/checkout');
 await expect(page.getByRole('heading',{name:'멤버십 결제',exact:true})).toBeVisible();
 const terms=page.getByRole('region',{name:'결제 전 확인'});
 await expect(terms.locator('details')).toHaveCount(3);
 const first=terms.locator('summary').first();await first.focus();await first.press('Enter');
 await expect(terms.getByText('등록 카드 결제는 오늘 결제한 뒤',{exact:false})).toBeVisible();await first.press('Enter');
 await expect(terms.getByText('등록 카드 결제는 오늘 결제한 뒤',{exact:false})).toBeHidden();
 for(const detail of await terms.locator('details').all()){await detail.locator('summary').click();await expect(detail.locator('div')).toBeVisible();await detail.locator('summary').click();}
 const primary=page.getByRole('button',{name:'결제하고 가입',exact:true}),secondary=page.getByRole('button',{name:'한 달만 결제하기',exact:true});
 await expect(primary).toBeDisabled();await expect(secondary).toBeDisabled();
 const a=await primary.boundingBox(),b=await secondary.boundingBox();
 if(page.viewportSize()!.width<768)expect(b!.y-a!.y-a!.height).toBeGreaterThanOrEqual(11);
 await page.getByRole('checkbox').check();await expect(primary).toBeEnabled();await expect(secondary).toBeEnabled();
 await noOverflow(page);await captureScreen(page,info.outputPath('preview.png'));
 if(page.viewportSize()!.width<768){await page.setViewportSize({...page.viewportSize()!,height:1200});await captureScreen(page,info.outputPath('preview-overview.png'));}
});

test('service checkout keeps agreement gating and versioned payment, with original policy text',async({page},info)=>{
 const api=await mockCheckout(page);await page.goto('/service/checkout/layout-order');
 await expect(page.getByRole('heading',{name:'맛집 탐험'})).toBeVisible();
 await expect(page.getByRole('link',{name:'멤버십으로 돌아가기'})).toHaveAttribute('href','/service/membership/creator-one?plan=plan-one');
 await expect(page.getByRole('link',{name:'결제수단 관리',exact:true})).toHaveAttribute('href','/service/payment-methods');
 await page.locator('summary').filter({hasText:'환불'}).click();
 await expect(page.getByText('결제 후 7일 이내이고 멤버십 게시물을 열람하지 않았다면',{exact:false})).toBeVisible();
 await page.locator('summary').filter({hasText:'환불'}).click();
 const button=page.getByRole('button',{name:'결제하고 가입',exact:true});await expect(button).toBeDisabled();
 await page.getByRole('checkbox').check();await expect(button).toBeEnabled();
 await noOverflow(page);await captureScreen(page,info.outputPath('service.png'));
 await button.click();await expect(page.getByRole('heading',{name:'멤버십 가입 완료'})).toBeVisible();expect(api.calls()).toBe(1);expect(api.terms()).toBe('2026-11-02.1');
});

test('missing or unusable cards never enable recurring payment; one-time remains available after consent',async({page},info)=>{
 for(const invalid of [false,true]){
  await page.unrouteAll();await mockCheckout(page,{card:invalid,invalid});await page.goto('/service/checkout/layout-order');
  await expect(page.getByRole('heading',{name:'맛집 탐험'})).toBeVisible();await page.getByRole('checkbox').check();
  await expect(page.getByRole('button',{name:'결제하고 가입',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'한 달만 결제하기',exact:true})).toBeEnabled();
  if(invalid)await expect(page.getByRole('alert').filter({hasText:'기본 카드를 사용할 수 없습니다'})).toBeVisible();
  else await expect(page.getByText('등록된 결제수단 없음',{exact:true})).toBeVisible();
  await noOverflow(page);await captureScreen(page,info.outputPath(invalid?'invalid-card.png':'no-card.png'));
 }
});

test('long product and maximum price fit; in-progress payment checks result without new consent',async({page},info)=>{
 await mockCheckout(page,{long:true,processing:true});await page.goto('/service/checkout/layout-order');
 await expect(page.getByRole('button',{name:'결제 결과 확인',exact:true})).toBeEnabled();
 await expect(page.getByRole('region',{name:'결제 전 확인'})).toHaveCount(0);
 await noOverflow(page);await captureScreen(page,info.outputPath('long-processing.png'));
});
