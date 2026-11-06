import {test,expect,type Page} from '@playwright/test';
// 2026-11-06 user decision: hosting provider and intermediary notice in the business info (initial screen), and the
// intermediary notice next to the seller, in the same type size, in the membership payment confirmation.
const NOTICE='크레팬스는 크리에이터 멤버십 거래의 통신판매중개자로 거래 당사자가 아니며, 멤버십의 판매자는 각 크리에이터입니다. 콩은 크레팬스가 직접 판매합니다.';
const order={id:'notice-order',planId:'plan-one',amount:10000,status:'pending',snapshot:{creatorId:'creator-one',name:'맛집 탐험',benefits:['멤버십 전용 게시물 이용'],refundWindowDays:7,paymentEnvironment:'test'}};
const bootstrap=(signedIn:boolean)=>({data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[{id:'card-one',label:'기본 카드',isDefault:true,requiresUpdate:false}],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}});
async function mock(page:Page,signedIn:boolean){
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:any=null;
  if(path.endsWith('/bootstrap'))data=bootstrap(signedIn);
  else if(path.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test',guidance:''},paymentMethods:bootstrap(signedIn).account.paymentMethods,paymentGuidance:''};
  else if(path.endsWith('/checkout/notice-order'))data=order;
  else if(path.endsWith('/profiles/creator-one'))data={id:'creator-one',name:'맛집 크리에이터',handle:'food'};
  else if(path.endsWith('/posts'))data={posts:[],creators:[],nextCursor:null};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
test('business info on the first screen names the hosting provider and the intermediary notice',async({page},info)=>{
 await mock(page,false);await page.goto('/service/feed');
 const business=page.getByRole('group',{name:'사업자 정보'}).or(page.locator('address[aria-label="사업자 정보"]')).filter({visible:true}).first();
 await expect(business).toContainText('호스팅서비스 제공자 Amazon Web Services Korea LLC');await expect(business).toContainText(NOTICE);await expect(business).toContainText('통신판매업 신고번호');
 await business.scrollIntoViewIfNeeded();await noOverflow(page);
 await business.screenshot({path:info.outputPath('business-info.png')});
});
test('mobile landing footer carries the same notices without horizontal overflow',async({page,isMobile},info)=>{
 test.skip(!isMobile,'the landing footer is hidden at PC width; PC shows the sidebar business info instead');
 await mock(page,false);await page.goto('/service/landing');
 const business=page.locator('address[aria-label="사업자 정보"]').filter({visible:true}).first();
 await expect(business).toContainText('Amazon Web Services Korea LLC');await expect(business).toContainText(NOTICE);
 await business.scrollIntoViewIfNeeded();await noOverflow(page);await business.screenshot({path:info.outputPath('landing-footer.png')});
});
test('membership checkout shows the seller and the intermediary notice in the same size before the pay button',async({page},info)=>{
 await mock(page,true);await page.goto('/service/checkout/notice-order');
 const terms=page.getByRole('region',{name:'결제 전 확인'}),seller=terms.getByLabel('판매자 안내');
 await expect(seller).toContainText('판매자: 맛집 크리에이터');await expect(seller).toContainText(NOTICE);
 const sizes=await seller.locator('p').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).fontSize));
 expect(sizes.length).toBe(2);expect(sizes[0]).toBe(sizes[1]);
 const sellerBox=await seller.boundingBox(),pay=await page.getByRole('button',{name:'결제하고 가입'}).boundingBox();expect(sellerBox!.y).toBeLessThan(pay!.y);
 await noOverflow(page);await seller.scrollIntoViewIfNeeded();await terms.screenshot({path:info.outputPath('checkout-terms.png')});
});
