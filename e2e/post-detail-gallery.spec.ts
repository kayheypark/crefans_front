import {test,expect,type Page} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);

async function checkGallery(page:Page){
  const article=page.locator('[data-post-detail] > article');
  await article.getByRole('button',{name:/크게 보기/}).nth(1).click();
  const dialog=page.getByRole('dialog'),track=dialog.locator('[data-index]');
  await expect(dialog).toHaveAttribute('data-state','open');
  await expect(track).toHaveAttribute('data-index','2');
  await expect(dialog.getByRole('button',{name:'이전 게시물',exact:true})).toHaveCount(0);
  await expect(dialog.getByRole('button',{name:'댓글 쓰기',exact:true})).toBeHidden();
  await expect(dialog.getByRole('button',{name:'닫기',exact:true}).locator('svg')).toHaveCSS('width','24px');/* 24px soft close icon shipped 2026-10-25 (gallery-close-soft-deployment-20261025) */
  await dialog.getByRole('button',{name:'이전 미디어',exact:true}).click();
  await expect(track).toHaveAttribute('data-index','1');
  await expect(dialog.locator('video[controls]')).toHaveCount(1);
  await dialog.getByRole('button',{name:'이전 미디어',exact:true}).click();
  await expect(track).toHaveAttribute('data-index','0');
  await expect(dialog).toHaveCSS('opacity','1');
  await track.evaluate(async node=>{await Promise.all(node.getAnimations().map(animation=>animation.finished));});
  await page.screenshot({path:test.info().outputPath('detail-gallery.png'),timeout:10000});
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await article.getByRole('button',{name:/크게 보기/}).first().click();
  await expect(track).toHaveAttribute('data-index','0');
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  expect(await page.locator('body').evaluate(node=>node.style.overflow)).not.toBe('hidden');
}

test('목업 상세는 선택한 사진부터 공용 갤러리를 열고 이미지와 동영상을 넘긴다',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/post/morning');await checkGallery(page);expect(errors).toEqual([]);
});

test('실서비스 상세도 갤러리를 열며 잠긴 미디어와 텍스트 전용 글은 열기 버튼이 없다',async({page})=>{
  const errors:string[]=[],privateRequests:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  page.context().on('request',r=>{if(r.url().includes('should-not-load-private-media'))privateRequests.push(r.url());});
  const creator={id:'gallery-artist',name:'갤러리 작가',handle:'gallery',image:'',position:'center',tags:[],bio:'',followers:'0'};
  const post={id:'open',creatorId:creator.id,title:'상세 갤러리 QA',body:'갤러리 본문',image:'/illustrations/redesign/hero-woman.png',position:'center',likes:0,comments:0,requiredRank:0,time:'오늘',canAccess:true,media:[{type:'image',url:'/illustrations/redesign/hero-woman.png'},{type:'video',url:'/video_1.mp4'},{type:'image',url:'/illustrations/redesign/beach-day.png'}]};
  await page.context().route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data:unknown={};
    if(path==='/api/v1/bootstrap')data={data:{creators:[],posts:[],creatorPlans:{},plans:[],notifications:[],categories:[],messages:{},paymentHistory:[],faqs:[]},viewer:{name:'QA 팬',handle:'qa',image:'',bio:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{}}};
    else if(path.endsWith('/comments-page'))data={comments:[],nextOffset:null};
    else if(path.startsWith('/api/v1/posts/')){
      const id=path.split('/').at(-1);
      data={creator,post:{...post,id,canAccess:id!=='locked',requiredRank:id==='locked'?2:0,...(id==='locked'?{image:'/should-not-load-private-media.png',media:[{type:'image',url:'/should-not-load-private-media.png'}]}:id==='text'?{image:'',media:[]}: {})}};
    }
    await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
  });
  await page.goto('/service/post/open');await checkGallery(page);
  for(const id of ['locked','text']){
    // Each direct-entry case gets its own document; replacing the previous one aborts its prefetches in WebKit.
    const target=await page.context().newPage();target.on('pageerror',e=>errors.push(e.message));
    await target.goto('/service/post/'+id);await expect(target.getByRole('heading',{name:post.title,exact:true})).toBeVisible();
    await expect(target.getByRole('button',{name:/크게 보기/})).toHaveCount(0);await expect(target.getByRole('dialog')).toHaveCount(0);
  }
  expect(privateRequests).toEqual([]);expect(errors).toEqual([]);
});
