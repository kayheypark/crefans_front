import {test,expect,type Locator,type Page} from '@playwright/test';
async function loaded(images:Locator){
  await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(node=>(node as HTMLImageElement).complete&&(node as HTMLImageElement).naturalWidth>0))).toBe(true);
}
async function fits(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}

test('목업 멤버십 안내와 차단 영역에 멤버십 사진을 표시한다',async({page})=>{
  await page.goto('/preview/post/moka-backstage');
  const notice=page.locator('[class*="lockedMedia"]');
  await expect(notice.locator('img')).toHaveCount(1);await expect(notice.locator('img')).toHaveAttribute('src',/backstage-v1.png$/);await loaded(notice.locator('img'));
  await expect(notice.getByRole('button',{name:'멤버십 안내',exact:true})).toBeVisible();await fits(page);
  await notice.scrollIntoViewIfNeeded();await page.screenshot({path:test.info().outputPath('notice.png'),timeout:10000});
  await notice.getByRole('button',{name:'멤버십 안내',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('img')).toHaveCount(2);await loaded(dialog.locator('img'));
  await expect(dialog.locator('img').nth(0)).toHaveAttribute('src',/backstage-v1.png$/);await expect(dialog.locator('img').nth(1)).toHaveAttribute('src',/cover-v1.png$/);
  await expect(dialog.getByText('₩9,900',{exact:true})).toBeVisible();await expect(dialog).toHaveCSS('opacity','1');await fits(page);
  await page.screenshot({path:test.info().outputPath('offers.png'),timeout:10000});
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();
});

test('서비스 이미지 계약은 등급·상품전용·이미지없음·실패를 처리하고 비공개 미디어는 요청하지 않는다',async({page})=>{
  const forbidden:string[]=[],errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('PRIVATE_POST_IMAGE'))forbidden.push(r.url());});
  const image1='/illustrations/redesign/hero-woman.png',image2='/illustrations/redesign/beach-day.png';
  const plan=(id:string,rank:number,image?:string,available=true)=>({id,name:id,rank,image,available,price:9900,benefits:['공개 멤버십 혜택']});
  const basePlans=[plan('입문',1,image2),plan('여행 클럽',2,image1),plan('플러스',3,image2),plan('종료 상품',4,image2,false)];
  await page.route('**/missing-membership-image.png',r=>r.fulfill({status:404,body:''}));
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data:unknown={};
    if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'QA 팬',handle:'qa',image:'',bio:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
    else if(path.endsWith('/comments-page'))data={comments:[],nextOffset:null};
    else if(path.startsWith('/api/v1/posts/')){
      const id=path.split('/').at(-1),plans=id==='none'?basePlans.map(p=>({...p,image:undefined})):id==='broken'?[plan('여행 클럽',2,'/missing-membership-image.png')]:basePlans;
      data={creator:{id:'artist',name:'QA 작가',handle:'artist',image:'',tags:[],position:'center',bio:'',followers:'0',plans},post:{id,creatorId:'artist',title:'잠긴 게시물',body:'PRIVATE_BODY',image:'/PRIVATE_POST_IMAGE.jpg',media:[{type:'image',url:'/PRIVATE_POST_IMAGE.jpg'}],position:'center',likes:0,comments:0,requiredRank:2,requiredPlanId:id==='exact'?'플러스':id==='retired'?'종료 상품':undefined,time:'오늘',canAccess:false}};
    }
    await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
  });
  for(const id of ['tier','exact','none','broken','retired']){
    await page.goto('/service/post/'+id);const notice=page.locator('[class*="lockedMedia"]');await expect(notice.getByText('멤버십 전용 콘텐츠입니다',{exact:true})).toBeVisible();
    if(id==='tier'||id==='exact'){
      await expect(notice.locator('img')).toHaveAttribute('src',id==='tier'?image1:image2);await loaded(notice.locator('img'));
      await expect(notice.locator('img')).toHaveCSS('filter','brightness(0.4)');
      const size=await notice.boundingBox(),picture=await notice.locator('img').boundingBox();expect(picture!.width).toBeCloseTo(size!.width,0);expect(picture!.height).toBeCloseTo(size!.height,0);
    }else await expect(notice.locator('img')).toHaveCount(0);
    await notice.getByRole('button',{name:'멤버십 안내',exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveCount(id==='tier'?2:id==='exact'?1:0);
    if(id==='tier'||id==='exact')await loaded(dialog.locator('img'));
    await expect(dialog.getByRole('link',{name:/선택하고 계속/})).toHaveCount(id==='retired'?0:id==='exact'||id==='broken'?1:2);
    await expect(dialog).not.toContainText('입문');await expect(dialog).not.toContainText('PRIVATE_BODY');await fits(page);
    await dialog.getByRole('button',{name:'닫기',exact:true}).click();await expect(dialog).toBeHidden();
  }
  expect(forbidden).toEqual([]);expect(errors).toEqual([]);
});

test('카탈로그도 같은 멤버십 이미지와 없음·실패 상태를 제공한다',async({page})=>{
  await page.route('**/missing-membership-image.png',r=>r.fulfill({status:404,body:''}));
  await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:false}).first().click();
  await page.getByLabel('멤버십 전용으로 잠그기',{exact:true}).check();
  const notice=page.locator('[class*="lockedMedia"]');await expect(notice.locator('img')).toHaveCount(1);await loaded(notice.locator('img'));
  for(const state of ['이미지 없음','이미지 로딩 실패']){
    await page.getByRole('combobox',{name:'멤버십 안내 상태',exact:true}).click();await page.getByRole('option',{name:state,exact:true}).click();
    await expect(notice.locator('img')).toHaveCount(0);await expect(notice.getByRole('button',{name:'멤버십 안내',exact:true})).toBeEnabled();
  }
});
