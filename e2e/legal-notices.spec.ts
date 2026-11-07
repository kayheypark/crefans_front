import {test,expect,type Page} from '@playwright/test';
// 2026-11-06 user decision: hosting provider and intermediary notice in the business info (initial screen), and the
// intermediary notice next to the seller, in the same type size, in the membership payment confirmation.
const NOTICE='크레팬스는 크리에이터 멤버십 거래의 통신판매중개자로 거래 당사자가 아니며, 멤버십의 판매자는 각 크리에이터입니다. 콩은 크레팬스가 직접 판매합니다.';
const order={id:'notice-order',planId:'plan-one',amount:10000,status:'pending',snapshot:{creatorId:'creator-one',name:'맛집 탐험',benefits:['멤버십 전용 게시물 이용'],refundWindowDays:7,paymentEnvironment:'test'}};
const bootstrap=(signedIn:boolean)=>({data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[{id:'card-one',label:'기본 카드',isDefault:true,requiresUpdate:false}],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}});
async function mock(page:Page,signedIn:boolean,{status='pending',history=false}={}){
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:any=null;
  if(path.endsWith('/bootstrap')){data=bootstrap(signedIn);if(history)Object.assign(data.data,{creators:[{id:'creator-one',name:'맛집 크리에이터',handle:'food',image:'',cover:'',bio:'',category:'',followers:0}],plans:[{id:'plan-one',creatorId:'creator-one',name:'맛집 탐험',price:10000,rank:1,benefits:[],available:true}],paymentHistory:[{creatorId:'creator-one',planId:'plan-one',status:'active',price:10000,paidAt:'2026-11-07T01:00:00.000Z',renewAt:'2026-12-07'}]});}
  else if(path.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test',guidance:''},paymentMethods:bootstrap(signedIn).account.paymentMethods,paymentGuidance:''};
  else if(path.endsWith('/checkout/notice-order'))data={...order,status};
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
// 2026-11-07 user decision: the written contract records (payment completion and the payment detail receipt) repeat the
// seller and the intermediary notice, the notice never smaller than the seller line (시행규칙 제11조의2).
const px=(v:string)=>parseFloat(v);
test('membership payment completion names the seller and the intermediary notice in one size',async({page},info)=>{
 await mock(page,true,{status:'paid'});await page.goto('/service/checkout/notice-order');
 await expect(page.getByText('멤버십 가입이 완료됐어요')).toBeVisible();
 const seller=page.getByLabel('판매자 안내');await expect(seller).toContainText('판매자: 맛집 크리에이터');await expect(seller).toContainText(NOTICE);
 const sizes=await seller.locator('p').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).fontSize));expect(sizes.length).toBe(2);expect(px(sizes[1])).toBeGreaterThanOrEqual(px(sizes[0]));
 await noOverflow(page);await page.getByRole('region',{name:'가입한 멤버십'}).screenshot({path:info.outputPath('membership-complete.png')});
});
test('payment detail receipt names the seller and the intermediary notice in one size',async({page},info)=>{
 await mock(page,true,{history:true});await page.goto('/service/subscriptions?tab=payments');
 await page.getByRole('button',{name:/상세 보기/}).first().click();
 const dialog=page.getByRole('dialog',{name:'결제 상세'});await expect(dialog).toBeVisible();
 const row=dialog.locator('dt',{hasText:'판매자'}).locator('..');await expect(row).toContainText('맛집 크리에이터');
 const notice=dialog.getByText(NOTICE,{exact:true});await expect(notice).toBeVisible();
 const sellerSize=await row.locator('dd').evaluate(n=>getComputedStyle(n).fontSize),noticeSize=await notice.evaluate(n=>getComputedStyle(n).fontSize);
 expect(px(noticeSize)).toBeGreaterThanOrEqual(px(sellerSize));
 await noOverflow(page);await dialog.screenshot({path:info.outputPath('payment-detail.png')});
});
