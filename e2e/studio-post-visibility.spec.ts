import {test,expect,type Page} from '@playwright/test';
import path from 'node:path';
// Studio post unpublish (2026-11-07) against an API stand-in; server access rules are covered by server tests/platform-post-visibility.test.cjs.
const shots=path.resolve('.local/post-unpublish-20261107');
const mobile=(page:Page)=>(page.viewportSize()?.width||0)<768;
async function shot(page:Page,name:string){await page.screenshot({path:path.join(shots,`${mobile(page)?'mobile':'pc'}-${name}.png`),fullPage:true,animations:'disabled'});}
async function service(page:Page,{hidden=false,fail=false}={}){
 const calls:any[]=[];let unpublished=false;
 const boot={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 const content=()=>[{id:'post-1',title:'주말 촬영 비하인드',body:'촬영장 이야기',status:'published',scheduledAt:null,updatedAt:'2026-11-07T01:00:00Z',accessLevel:null,accessPlanId:null,commentsEnabled:true,tipsEnabled:true,media:[],...(unpublished?{unpublished:true}:{}),...(hidden?{hiddenByOperator:true}:{})},{id:'post-2',title:'공개 게시물',body:'본문',status:'published',scheduledAt:null,updatedAt:'2026-11-06T01:00:00Z',accessLevel:null,accessPlanId:null,commentsEnabled:true,media:[]}];
 await page.route('**/api/v1/**',async route=>{const url=new URL(route.request().url()),p=url.pathname,method=route.request().method();
  if(p.endsWith('/visibility')){calls.push({path:p,method,body:route.request().postDataJSON()});if(fail){await route.fulfill({contentType:'application/json',body:JSON.stringify({success:false,data:null,errorCode:'POST_NOT_FOUND',errorMessage:'게시물을 찾을 수 없습니다.'})});return;}unpublished=route.request().postDataJSON().public===false;await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data:{message:unpublished?'게시물을 미공개로 바꿨습니다. 작성자에게만 보입니다.':'게시물을 다시 공개했습니다.'},errorMessage:null,errorCode:null})});return;}
  const data=p.endsWith('/bootstrap')?boot:p.endsWith('/studio/overview')?{started:true,profile:{name:'검증',handle:'qa',avatar:'',bio:''},management:{contents:content(),memberships:[],subscribers:[],now:'2026-11-07T00:00:00Z'},metrics:[],activities:[],series:[],contentPerformance:[]}:p.endsWith('/studio/community')?{posts:[],comments:[],contacts:[],messagesByCreator:{}}:{};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});});
 return calls;
}
test('수정 화면에서 확인 후 미공개 전환·다시 공개, 목록에 미공개 표시 (API 대역)',async({page})=>{
 const calls=await service(page);await page.goto('/service/studio/content/post-1/edit');
 const box=page.getByRole('region',{name:'공개 상태'});await expect(box).toContainText('공개 중');await expect(box).toContainText('전체 공개 범위로 보여요');
 await expect(box).not.toContainText('운영자만 해제');await shot(page,'editor-public');
 await box.getByRole('button',{name:'미공개로 전환',exact:true}).click();
 let dialog=page.getByRole('dialog',{name:'게시물을 미공개로 바꿀까요?'});await expect(dialog).toContainText('멤버십 구독자 모두에게 보이지 않고');await expect(dialog).toContainText('언제든 다시 공개할 수 있어요');await shot(page,'unpublish-confirm');
 await dialog.getByRole('button',{name:'취소',exact:true}).click();await expect(dialog).toBeHidden();expect(calls).toEqual([]);
 await box.getByRole('button',{name:'미공개로 전환',exact:true}).click();dialog=page.getByRole('dialog',{name:'게시물을 미공개로 바꿀까요?'});await dialog.getByRole('button',{name:'미공개로 전환',exact:true}).click();
 await expect(dialog).toBeHidden();expect(calls).toEqual([{path:'/api/v1/studio/content/post-1/visibility',method:'PUT',body:{public:false}}]);
 await expect(box).toContainText('미공개 · 나만 볼 수 있어요');await expect(box.getByRole('button',{name:'다시 공개',exact:true})).toBeVisible();await expect(page.getByText('게시물을 미공개로 바꿨습니다. 작성자에게만 보입니다.')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await shot(page,'editor-unpublished');
 await page.goto('/service/studio/content');const root=mobile(page)?page.locator('[aria-label="게시물 카드 목록"]'):page.getByRole('region',{name:'게시물 목록 표'});
 const row=mobile(page)?root.locator('article').filter({hasText:'주말 촬영 비하인드'}):root.locator('tbody tr').filter({hasText:'주말 촬영 비하인드'});await expect(row).toContainText('미공개');
 await expect((mobile(page)?root.locator('article'):root.locator('tbody tr')).filter({hasText:'공개 게시물'})).not.toContainText('미공개');await shot(page,'list-unpublished');
 await page.goto('/service/studio/content/post-1/edit');await page.getByRole('region',{name:'공개 상태'}).getByRole('button',{name:'다시 공개',exact:true}).click();dialog=page.getByRole('dialog',{name:'게시물을 다시 공개할까요?'});await expect(dialog).toContainText('전체 공개 범위로 다시 보여 줍니다');await dialog.getByRole('button',{name:'다시 공개',exact:true}).click();
 expect(calls[1].body).toEqual({public:true});await expect(page.getByRole('region',{name:'공개 상태'})).toContainText('공개 중');
});
test('운영 숨김 게시물은 해제할 수 없다는 안내를 보여 준다 (API 대역)',async({page})=>{
 await service(page,{hidden:true});await page.goto('/service/studio/content/post-1/edit');const box=page.getByRole('region',{name:'공개 상태'});
 await expect(box).toContainText('운영 정책에 따라 숨겨진 게시물입니다. 숨김은 운영자만 해제할 수 있어서');await shot(page,'editor-operator-hidden');
 await box.getByRole('button',{name:'미공개로 전환',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'미공개로 전환',exact:true}).click();
 await box.getByRole('button',{name:'다시 공개',exact:true}).click();await expect(page.getByRole('dialog',{name:'게시물을 다시 공개할까요?'})).toContainText('운영자가 숨김을 해제하기 전까지는 다른 회원에게 보이지 않아요');await shot(page,'republish-operator-hidden');
});
test('전환 실패는 대화상자에 남기고 상태를 바꾸지 않는다 (API 대역)',async({page})=>{
 const calls=await service(page,{fail:true});await page.goto('/service/studio/content/post-1/edit');const box=page.getByRole('region',{name:'공개 상태'});
 await box.getByRole('button',{name:'미공개로 전환',exact:true}).click();const dialog=page.getByRole('dialog',{name:'게시물을 미공개로 바꿀까요?'});await dialog.getByRole('button',{name:'미공개로 전환',exact:true}).click();
 await expect(dialog.getByRole('alert')).toContainText('게시물을 찾을 수 없습니다.');await expect(dialog).toBeVisible();expect(calls.length).toBe(1);await dialog.getByRole('button',{name:'취소',exact:true}).click();await expect(box).toContainText('공개 중');
});
test('목업: 수정 화면 미공개 전환',async({page})=>{
 await page.goto('/preview/studio/content/morning/edit');const box=page.getByRole('region',{name:'공개 상태'});await expect(box).toContainText('공개 중');
 await box.getByRole('button',{name:'미공개로 전환',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'미공개로 전환',exact:true}).click();await expect(box).toContainText('미공개 · 나만 볼 수 있어요');
});
