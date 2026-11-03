import {test,expect,type Page} from '@playwright/test';

async function service(page:Page,{fan=false,guest=false,failure=false,mediaTab=false,memberships=false}={}){
 const requests:string[]=[];
 const creator={id:'qa-owner',name:'프로필 검증 작가',handle:'qa_owner',bio:'내가 올린 이야기를 한곳에서 만나요.',image:'/brand/featured-creators-v1.png',cover:'',tags:[],followers:3,followingCount:0,isCreator:true,isVerified:true,plans:memberships?[{id:'qa-plan',name:'나의 멤버십',price:10000,rank:1,benefits:[],available:true},{id:'qa-hidden',name:'판매 중지 멤버십',price:20000,rank:2,benefits:[],available:false}]:[]};
 const post=(id:string,title:string,extra={})=>({id,title,creatorId:creator.id,body:'내 프로필 게시글 표시를 확인하는 테스트입니다.',image:'',position:'center',likes:2,comments:0,views:10,requiredRank:0,time:'2026-11-02T09:00:00.000Z',canAccess:true,tipsEnabled:false,...extra});
 const posts=[post('qa-text','내가 쓴 첫 이야기'),post('qa-photo','내가 올린 사진',{image:'/brand/featured-creators-v1.png'}),post('qa-video','내가 올린 영상',{media:[{type:'video',url:mediaTab?'/video_1.mp4':'/api/v1/media/qa-video/file',processing:!mediaTab}]})];
 if(mediaTab){
  const photo={type:'image',url:'/illustrations/creators/jiwoo/coastal-walk-v2.png'},video={type:'video',url:'/video_1.mp4'};
  posts.push(post('qa-mixed','사진과 동영상',{image:photo.url,media:[video,photo,photo]}),post('qa-images','사진 모음',{media:[photo,photo]}),post('qa-processing','처리 중 영상',{media:[{...video,url:'/api/v1/media/unavailable/file',processing:true}]}),post('qa-locked','멤버십 미디어',{canAccess:false,requiredRank:1,media:[{...photo,url:'/api/v1/media/private/file'}]}),post('qa-empty','텍스트 전용',{image:photo.url,media:[]}));
 }
 const older=post('qa-older','이전 게시물도 보여요');
 const other=post('qa-other','다른 작가의 저장한 글',{creatorId:'qa-other-creator',image:'/brand/featured-creators-v1.png'});
 await page.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname;requests.push(path+url.search);
  let data:any=null;
  if(path.endsWith('/bootstrap'))data={data:{creators:[],posts:[other],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{...creator},signedIn:!guest,ownCreatorIds:fan||guest?[]:[creator.id],following:[],liked:['qa-other'],saved:['qa-other'],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:fan?0:mediaTab?posts.length+1:4,followers:3},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
  if(memberships)posts.length=0;
  if(path.endsWith('/posts'))data={posts:url.searchParams.has('cursor')?[older]:posts,creators:memberships?[]:[creator],nextCursor:memberships?null:url.searchParams.has('cursor')?null:'qa-next'};
  if(path.endsWith('/comments-page'))data={comments:[],nextOffset:null};
  if(path.endsWith('/profiles/qa-owner'))data=creator;
  if(path.includes('/posts/qa-')&&!path.endsWith('/comments-page'))data={post:posts.find(item=>path.endsWith(`/posts/${item.id}`)),creator};
  const failed=failure&&path.endsWith('/posts');
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(failed?{success:false,data:null,errorMessage:'게시물을 불러오지 못했어요.',errorCode:'UNAVAILABLE'}:{success:true,data,errorMessage:null,errorCode:null})});
 });
 return requests;
}

test('owner feed, photo/video tabs and detail links work on my profile and public profile',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const requests=await service(page);
 await page.goto('/service/me',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'내가 쓴 첫 이야기',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'내가 올린 영상',exact:true})).toHaveCount(1);
 await expect(page.getByText('아직 게시물이 없어요',{exact:true})).toHaveCount(0);await expect(page.getByText('다른 작가의 저장한 글',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'피드3',exact:true})).toBeVisible();expect(requests).toContain('/api/v1/posts?creatorId=qa-owner');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('my-profile-feed.png'),fullPage:true});
 await page.getByRole('button',{name:'미디어2',exact:true}).click();
 await expect(page.getByRole('link',{name:'내가 올린 사진 · 사진 1장, 동영상 0개',exact:true})).toBeVisible();await expect(page.getByRole('link',{name:'내가 올린 영상 · 사진 0장, 동영상 1개',exact:true})).toBeVisible();
 await page.screenshot({path:info.outputPath('my-profile-media.png'),fullPage:true});
 await page.getByRole('link',{name:'내가 올린 사진 · 사진 1장, 동영상 0개',exact:true}).click();await expect(page).toHaveURL(/\/service\/post\/qa-photo$/);await expect(page.getByRole('heading',{name:'내가 올린 사진'})).toBeVisible();
 await page.goto('/service/creator/qa-owner',{waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{name:'내가 쓴 첫 이야기',exact:true})).toBeVisible();expect(errors).toEqual([]);
});

test('both profile tabs paginate only the owner and retain loaded posts',async({page})=>{
 const requests=await service(page);await page.goto('/service/me',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'미디어2',exact:true}).click();await page.getByRole('button',{name:'더 보기',exact:true}).click();
 await expect(page.getByRole('button',{name:'피드4',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'더 보기',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'피드4',exact:true}).click();await expect(page.getByRole('heading',{name:'이전 게시물도 보여요'})).toBeVisible();expect(requests).toContain('/api/v1/posts?cursor=qa-next&creatorId=qa-owner');
});

test('saved, liked and fan empty states stay separate from the owner feed',async({page})=>{
 const requests=await service(page,{fan:true});await page.goto('/service/me',{waitUntil:'domcontentloaded'});await expect(page.getByText('아직 게시물이 없어요',{exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'멤버십',exact:true})).toHaveCount(0);
 for(const tab of ['saved','liked']){await page.goto(`/service/me?tab=${tab}`,{waitUntil:'domcontentloaded'});await expect(page.getByRole('link',{name:'다른 작가의 저장한 글'})).toBeVisible();expect(requests).toContain(`/api/v1/bootstrap?collection=${tab}`);}
 expect(requests.some(path=>path.startsWith('/api/v1/posts?'))).toBe(false);
});

test('failed profile lookup shows an error instead of unrelated bootstrap posts',async({page},info)=>{
 await service(page,{failure:true});await page.goto('/service/me',{waitUntil:'domcontentloaded'});await expect(page.getByRole('dialog',{name:'화면을 불러오지 못했어요'})).toBeVisible();await expect(page.getByText('다른 작가의 저장한 글',{exact:true})).toHaveCount(0);await page.screenshot({path:info.outputPath('my-profile-error.png')});
});

for(const destination of ['/service/me','/service/creator/qa-owner']){
 test(`media thumbnails and counts: ${destination}`,async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));const requests=await service(page,{mediaTab:true});
  await page.goto(destination,{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'미디어6',exact:true}).click();
  const tiles=page.locator('a[href^="/service/post/"]');await expect(tiles).toHaveCount(6);
  await expect(page.getByRole('link',{name:/텍스트 전용|내가 쓴 첫 이야기/})).toHaveCount(0);
  const mixed=page.getByRole('link',{name:'사진과 동영상 · 사진 2장, 동영상 1개',exact:true});
  await expect(mixed.locator('video')).toBeVisible();await expect.poll(()=>mixed.locator('video').evaluate((el:HTMLVideoElement)=>el.readyState)).toBeGreaterThanOrEqual(2);
  expect(await mixed.locator('video').evaluate((el:HTMLVideoElement)=>({paused:el.paused,controls:el.controls,inline:el.playsInline,width:el.videoWidth}))).toMatchObject({paused:true,controls:false,inline:true});
  await expect.poll(()=>page.getByRole('link',{name:'사진 모음 · 사진 2장, 동영상 0개',exact:true}).locator('img').evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByLabel('처리 중 영상 · 영상 최적화 중',{exact:true})).toBeVisible();
  expect(requests.some(url=>url.includes('/media/unavailable/')||url.includes('/media/private/'))).toBe(false);
  for(const tile of await tiles.all()){
   const box=await tile.boundingBox();expect(box).not.toBeNull();
   for(const badge of await tile.locator('span[aria-label^="사진"] > span').all()){
    const b=await badge.boundingBox();expect(b).not.toBeNull();expect(b!.x).toBeGreaterThanOrEqual(box!.x);expect(b!.x+b!.width).toBeLessThanOrEqual(box!.x+box!.width+1);
   }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await mixed.scrollIntoViewIfNeeded();await page.screenshot({path:info.outputPath('media-tab.png'),fullPage:true});
  await mixed.click();await expect(page).toHaveURL(/\/service\/post\/qa-mixed$/);await expect(page.getByRole('heading',{name:'사진과 동영상',exact:true})).toBeVisible();expect(errors).toEqual([]);
 });
}

 test('own memberships load without posts and lead to management, not self subscription',async({page},info)=>{
  const requests=await service(page,{memberships:true});
  await page.goto('/service/me');
  const section=page.getByRole('region',{name:'멤버십',exact:true});
  await expect(section.getByText('나의 멤버십',{exact:true})).toBeVisible();
  await expect(section.getByText('₩10,000',{exact:true})).toBeVisible();
  await expect(section.getByText('판매 중지 멤버십')).toHaveCount(0);
  await expect(section.getByRole('button',{name:'가입하기'})).toHaveCount(0);
  expect(requests).toContain('/api/v1/profiles/qa-owner');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('my-profile-memberships.png'),fullPage:true});
  await section.getByRole('button',{name:'멤버십 관리',exact:true}).click();
  await expect(page).toHaveURL(/\/service\/studio\/memberships$/);
 });
