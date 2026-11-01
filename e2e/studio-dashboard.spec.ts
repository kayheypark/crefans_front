import {test,expect,type Page} from '@playwright/test';

async function ready(page:Page){
 await expect(page.getByRole('heading',{name:'대시보드',exact:true})).toBeVisible();
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:'nextjs-portal{display:none}'});
}
async function loadThumbnails(page:Page){
 for(const image of await page.locator('#studio-content img').all()){
  await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 }
 await page.evaluate(()=>window.scrollTo(0,0));
}
test('빠른 작업은 지표보다 먼저 표시되고 현재 메뉴의 목적지로 이동한다',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/preview/studio');await ready(page);
 const main=page.locator('#studio-content'),actions=page.getByRole('region',{name:'빠른 작업'}),summary=page.getByRole('region',{name:'주요 지표'});
 const nav=actions.getByRole('navigation');await expect(nav.getByRole('link')).toHaveCount(6);
 const layout=await nav.evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.split(' ').length,rows:new Set(Array.from(el.children).map(child=>Math.round(child.getBoundingClientRect().top))).size}));expect(layout).toEqual({columns:2,rows:3});
 const actionBox=await actions.boundingBox(),summaryBox=await summary.boundingBox();
 if(info.project.name!=='desktop')expect(summaryBox!.y).toBeGreaterThan(actionBox!.y+actionBox!.height);
 for(const link of await actions.getByRole('link').all())expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 await expect(summary).toContainText('1,904,800원');await expect(summary).toContainText('2명');
 await expect(main.getByText(/콘텐츠 관리|소통 관리|통계 더보기/)).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await loadThumbnails(page);await page.screenshot({path:info.outputPath('dashboard.png'),fullPage:true});
 const links=[['새 게시물 작성','content/new','게시물 작성'],['게시물','content','게시물'],['댓글','comments','댓글'],['메시지','messages','메시지'],['출금 신청','withdraw','출금 신청'],['콩 후원·출금','beans','콩 후원·출금'],['크리에이터 설정','settings','크리에이터 설정'],['순수익 리포트','reports/revenue','순수익 리포트'],['구독자 리포트','reports/subscribers','구독자 리포트'],['팔로워 리포트','reports/followers','팔로워 리포트'],['통계 요약','analytics','통계 요약']];
 for(const [label,path,heading] of links){
  await main.getByRole('link',{name:label,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/preview/studio/${path}$`));
  await expect(main.getByRole('heading',{name:heading,exact:true})).toBeVisible();
  await page.goto('/preview/studio');await ready(page);
 }
 await main.getByRole('link',{name:'임시저장 1개',exact:true}).click();await expect(page).toHaveURL(/\/content\?status=draft$/);
 expect(errors).toEqual([]);
});

test('서비스 API 데이터의 금액·단위·활동 목적지를 표시하며 빈 목록을 목업으로 채우지 않는다',async({page},info)=>{
 let empty=false;const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const boot={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'대시보드 검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  const overview={started:true,profile:{name:'서버에서 받은 활동명',handle:'qa',avatar:'',bio:''},management:{},tasks:empty?[]:[{id:'draft',title:'임시저장 3개',description:'',path:'content?status=draft'}],metrics:[{id:'revenue',label:'누적 순수익',value:empty?'0':'1234567',description:'원',points:[]},{id:'subscribers',label:'구독자',value:empty?'0':'12',description:'이용 기간이 남은 구독자',points:[]},{id:'followers',label:'팔로워',value:empty?'0명':'35명',description:'',points:[]}],activities:empty?[]:[{id:'a',title:'서버의 새 게시물',description:'게시물 발행',time:'2026-11-01T12:00:00Z',path:'content/server-post/edit'}],contentPerformance:empty?[]:[{id:'server-post',title:'서버의 게시물 성과',image:'',views:71,likes:8,comments:2}]};
  const data=path.endsWith('/bootstrap')?boot:path.endsWith('/studio/overview')?overview:path.endsWith('/studio/community')?{posts:[],comments:[],contacts:[],messagesByCreator:{}}:{};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
 await page.goto('/service/studio');await ready(page);
 const main=page.locator('#studio-content');await expect(main).toContainText('서버에서 받은 활동명님, 반가워요');await expect(main).toContainText('1,234,567원');await expect(main).toContainText('12명');await expect(main).toContainText('35명');await expect(main).not.toContainText('35명명');
 await expect(main.getByRole('link',{name:/서버의 새 게시물/})).toHaveAttribute('href','/service/studio/content/server-post/edit');
 await expect(main.getByRole('link',{name:/서버의 게시물 성과/})).toHaveAttribute('href','/service/studio/content/server-post/edit');
 await page.screenshot({path:info.outputPath('service-data.png'),fullPage:true});
 empty=true;await page.reload();await ready(page);
 await expect(main).toContainText('아직 활동이 없어요');await expect(main).toContainText('아직 게시물이 없어요');await expect(main).not.toContainText('서버의 새 게시물');await expect(main).not.toContainText('하늘');
 await expect(main.getByRole('region',{name:'주요 지표'})).toContainText('0원');
 await expect(main.getByRole('navigation',{name:'빠른 작업 바로가기'}).getByRole('link')).toHaveCount(6);
 await page.screenshot({path:info.outputPath('service-empty.png'),fullPage:true});expect(errors).toEqual([]);
});

test('디자인 시스템의 빈 목록·긴 활동명도 공용 대시보드로 표시한다',async({page},info)=>{
 await page.goto('/design-system');await page.getByRole('button',{name:/서비스 UI/}).click();
 const section=page.locator('#studio-dashboard');await section.scrollIntoViewIfNeeded();
 async function choose(label:string){await section.getByRole('combobox',{name:'대시보드 데이터 상태'}).click();await page.getByRole('option',{name:label,exact:true}).click();}
 await choose('첫 이용 · 빈 목록');await expect(section).toContainText('아직 활동이 없어요');await expect(section).toContainText('아직 게시물이 없어요');
 await choose('긴 활동명');await expect(section.getByRole('heading',{name:/아주 긴 활동명/})).toBeVisible();
 await expect(section.getByRole('link',{name:'새 게시물 작성',exact:true})).toHaveCSS('color','rgb(255, 255, 255)');
 await expect(section.getByRole('link',{name:'순수익 리포트',exact:true})).toHaveCSS('color','rgb(37, 99, 235)');
 await expect(section.getByRole('link',{name:'게시물',exact:true})).toHaveCSS('text-decoration-line','none');
 await page.emulateMedia({reducedMotion:'reduce'});await page.addStyleTag({content:'nextjs-portal{display:none}'});
 expect(await section.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await section.screenshot({path:info.outputPath('catalog-long-name.png')});
});
