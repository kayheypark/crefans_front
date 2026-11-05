import {test,expect,type Page} from '@playwright/test';

async function mockSubscriptions(page:Page,error=false){
 const requests:any[]=[];
 const plan={id:'plan-one',name:'맛집 탐험',price:10000,rank:1,benefits:['멤버십 전용 게시물']};
 const subscription={id:'sub-one',creatorId:'creator-one',planId:plan.id,status:'cancelled',renewAt:'2030-02-05',price:10000,planSnapshot:plan};
 const bootstrap={data:{creators:[{id:'creator-one',name:'크레팬스',handle:'crefans',tags:[],image:'',position:'center',bio:'',followers:'0',isVerified:true}],posts:[],plans:[plan],creatorPlans:{'creator-one':[plan]},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'화면 검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[subscription],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data:any=null;
  if(path.endsWith('/bootstrap'))data=bootstrap;
  else if(path.endsWith('/common'))data={notices:[],legal:{},auth:{email:'qa@example.test',guidance:''},paymentMethods:[],paymentGuidance:''};
  else if(path==='/api/v1/subscriptions/sub-one/resume'){
   requests.push({path,body:route.request().postDataJSON()});
   if(error){await route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({success:false,data:null,errorMessage:'결제수단 관리에서 기본 카드를 등록해주세요.',errorCode:'PAYMENT_METHOD_REQUIRED'})});return;}
   subscription.status='active';data={message:'자동 갱신을 다시 시작했습니다. 다음 결제일부터 결제됩니다.'};
  }else if(route.request().method()!=='GET')throw new Error('Unexpected mutation: '+path);
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 return requests;
}
const overflow=async(page:Page)=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

test('cancelled subscription shows 다시 이용할래요 and consent resumes without a payment request',async({page},info)=>{
 const requests=await mockSubscriptions(page);await page.goto('/service/subscriptions');
 await expect(page.getByRole('heading',{name:'내 구독',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'다시 이용할래요',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'갱신 해지',exact:true})).toHaveCount(0);
 await overflow(page);await page.screenshot({path:info.outputPath('subscription.png'),fullPage:true});
 await page.getByRole('button',{name:'다시 이용할래요',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'다시 이용할까요?'}),confirm=dialog.getByRole('button',{name:'다시 이용할래요',exact:true});
 await expect(dialog).toBeVisible();await expect(dialog).toHaveCSS('opacity','1');await expect(confirm).toBeDisabled();expect(requests).toHaveLength(0);
 await expect(dialog.getByText('2030.02.05',{exact:true})).toBeVisible();await expect(dialog.getByText(/지금은 결제하지 않아요/)).toBeVisible();await expect(dialog.getByText('10,000원',{exact:false})).toBeVisible();
 await overflow(page);await page.screenshot({path:info.outputPath('confirmation.png'),fullPage:true});
 await dialog.getByRole('checkbox').check();await confirm.click();await expect(dialog).toBeHidden();
 await expect(page.getByRole('button',{name:'갱신 해지',exact:true})).toBeVisible();await expect(page.getByText('다음 갱신 2030.02.05',{exact:true})).toBeVisible();
 expect(requests).toEqual([{path:'/api/v1/subscriptions/sub-one/resume',body:{renewAt:'2030-02-05',price:10000,paymentTerms:'2026-11-02.1'}}]);
});

test('failed resume retains cancelled subscription and a clear card-management path',async({page},info)=>{
 const requests=await mockSubscriptions(page,true);await page.goto('/service/subscriptions');await page.getByRole('button',{name:'다시 이용할래요',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'다시 이용할까요?'});await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'다시 이용할래요',exact:true}).click();
 await expect(dialog.getByRole('alert')).toHaveText('결제수단 관리에서 기본 카드를 등록해주세요.');await expect(dialog.getByRole('link',{name:'결제수단 관리',exact:true})).toHaveAttribute('href','/service/payment-methods');
 expect(requests).toHaveLength(1);await overflow(page);await page.screenshot({path:info.outputPath('error.png'),fullPage:true});
 await dialog.getByRole('button',{name:'취소',exact:true}).click();await expect(dialog).toBeHidden();await expect(page.getByText('종료일까지 이용 가능',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'다시 이용할래요',exact:true}).click();await expect(dialog.getByRole('checkbox')).not.toBeChecked();
});

test('preview uses the same cancel-and-resume UI without changing paid dates',async({page})=>{
 await page.goto('/preview/subscriptions');const card=page.locator('article').filter({has:page.getByRole('button',{name:'다시 이용할래요',exact:true})}).first();
 const before=await card.innerText();await card.getByRole('button',{name:'다시 이용할래요',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'다시 이용할까요?'});await dialog.getByRole('checkbox').check();await dialog.getByRole('button',{name:'다시 이용할래요',exact:true}).click();await expect(dialog).toBeHidden();
 await expect(page.getByText('다음 갱신 2026.10.05',{exact:true})).toBeVisible();expect(before).toContain('2026.10.05');await overflow(page);
});
