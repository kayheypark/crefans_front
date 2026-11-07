import {test,expect,type Page} from '@playwright/test';

const section=(page:Page)=>page.getByRole('region',{name:'콘텐츠 성과',exact:true});
async function noOverflow(page:Page){expect(await section(page).evaluate(root=>[root,...Array.from(root.querySelectorAll('*'))].filter(el=>el instanceof HTMLElement&&el.clientWidth>0).every(el=>el.scrollWidth<=el.clientWidth+1))).toBe(true);}
async function connectedGrid(page:Page){
 const dl=section(page).locator('dl[aria-label="열람 통계"]').first();
 const result=await dl.evaluate(el=>{
  const cells=Array.from(el.children).map(x=>x.getBoundingClientRect()),style=getComputedStyle(el),blank=getComputedStyle(el,'::after');
  return {columns:style.gridTemplateColumns.split(' ').length,gap:style.gap,blank:blank.content,horizontal:cells[3].top-cells[0].bottom,vertical:cells[1].left-cells[0].right,aligned:cells[3].left===cells[0].left&&cells[4].left===cells[1].left,bg:style.backgroundColor,fill:getComputedStyle(el.children[0]).backgroundColor};
 });
 expect(result.columns).toBe(3);expect(result.gap).toBe('1px');expect(result.blank).toBe('""');expect(result.horizontal).toBeCloseTo(1,1);expect(result.vertical).toBeCloseTo(1,1);expect(result.aligned).toBe(true);expect(result.bg).not.toBe(result.fill);
}
test('공용 목업: 첫 항목 펼침, 연결된 격자, 도움말 및 키보드 접기',async({page},info)=>{
 await page.goto('/preview/studio/analytics');const root=section(page);await root.scrollIntoViewIfNeeded();
 const rows=root.locator('article'),first=rows.first().getByRole('button').first();
 await expect(rows).toHaveCount(2);await expect(first).toHaveAttribute('aria-expanded','true');await expect(rows.nth(1).getByRole('button').first()).toHaveAttribute('aria-expanded','false');
 await expect(rows.first()).toContainText('2,840');await expect(rows.first().locator('dl[aria-label="열람 통계"]')).toContainText('2,800');await expect(rows.first()).toContainText('방문수 (30분)');await connectedGrid(page);await noOverflow(page);
 await root.getByRole('button',{name:'콘텐츠 성과 집계 기준'}).click();await expect(page.getByRole('tooltip')).toContainText('50% 이상·1초 이상');await expect(page.getByRole('tooltip')).toContainText('실제 사람 수와 다릅니다');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
 await expect(root.getByRole('button',{name:/통계 접기/})).toHaveCount(0);await first.click();await expect(first).toHaveAttribute('aria-expanded','false');await expect(rows.first().locator('dl[aria-label="열람 통계"]')).toBeHidden();
 await first.focus();await expect(first).toBeFocused();await first.press('Enter');await expect(first).toHaveAttribute('aria-expanded','true');await first.press('Space');await expect(first).toHaveAttribute('aria-expanded','false');await first.press('Enter');
 await root.getByRole('heading',{name:'콘텐츠 성과',exact:true}).click();await root.screenshot({path:info.outputPath('content-performance.png')});
});

async function service(page:Page,empty=false){
 const boot={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'검증',handle:'qa',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 const overview={started:true,profile:{name:'검증',handle:'qa',avatar:'',bio:''},management:{},metrics:[],activities:[],series:[],contentPerformance:empty?[]:[{id:'zero',title:'집계된 게시물',image:'',views:0,likes:5,comments:2,analytics:{feed:38,detail:7,shared:0,kakao:0,copy:0,native:0,external:0,video:0,visits:38}},{id:'missing',title:'세부 통계가 없는 텍스트 게시물',image:'',views:21,likes:3,comments:1}]};
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname,data=path.endsWith('/bootstrap')?boot:path.endsWith('/studio/overview')?overview:path.endsWith('/studio/community')?{posts:[],comments:[],contacts:[],messagesByCreator:{}}:{};
  await route.fulfill({contentType:'application/json',body:JSON.stringify({success:true,data,errorMessage:null,errorCode:null})});
 });
}
test('서비스 API 대역: 조회를 합산하지 않고 0·세부 통계 누락·반응 유지',async({page},info)=>{
 await service(page);await page.goto('/service/studio/analytics');const root=section(page);await root.scrollIntoViewIfNeeded();
 const first=root.locator('article').first();await expect(first.getByRole('button').first()).toContainText('조회0');await expect(first.locator('dl[aria-label="열람 통계"]')).toContainText('피드 노출38');await expect(first.locator('dl[aria-label="게시물 반응"]')).toContainText('좋아요5');
 const second=root.locator('article').nth(1);await second.getByRole('button').first().click();await expect(second).toContainText('세부 통계가 아직 없어요.');await expect(second.locator('dl[aria-label="열람 통계"]')).toHaveCount(0);await expect(second).toContainText('댓글1');await noOverflow(page);await root.screenshot({path:info.outputPath('service-statistics.png')});
});
test('서비스 API 대역: 게시물이 없으면 빈 상태만 표시',async({page})=>{
 await service(page,true);await page.goto('/service/studio/analytics');await expect(section(page)).toContainText('아직 게시물이 없어요');await expect(section(page).locator('article')).toHaveCount(0);
});
test('카탈로그: 긴 제목과 큰 수치·0·미집계·빈 목록',async({page},info)=>{
 await page.goto('/design-system');await page.getByRole('button',{name:/서비스 UI/}).click();const root=page.locator('#content-performance-catalog');await root.scrollIntoViewIfNeeded();
 async function choose(name:string){await root.getByRole('combobox',{name:'콘텐츠 성과 데이터 상태'}).click();await page.getByRole('option',{name,exact:true}).click();}
 await choose('긴 제목·큰 수치');await expect(root).toContainText('1.2억');await expect(root.getByRole('img',{name:'123,456,789',exact:true}).first()).toHaveAttribute('title','123,456,789');await noOverflow(page);await root.screenshot({path:info.outputPath('long-values.png')});
 await choose('집계 0');await expect(root.locator('dl[aria-label="열람 통계"]').first()).toContainText('피드 노출0');
 await choose('세부 통계 없음');await expect(root).toContainText('세부 통계가 아직 없어요.');
 await choose('게시물 없음');await expect(root).toContainText('아직 게시물이 없어요');
});
