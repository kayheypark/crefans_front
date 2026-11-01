import {test,expect} from '@playwright/test';
import {creators} from '../components/preview/service/fixtures';
test('preview new creators share the cards, sprout, category filter and profile links',async({page},info)=>{
 await page.goto('/preview/explore');
 const section=page.getByRole('region',{name:'신규 크리에이터'});
 await expect(section.locator('article')).toHaveCount(3);
 const icon=section.locator('h2 img');await expect(icon).toHaveAttribute('src',/new-creators-sprout-v1/);await expect.poll(()=>icon.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
 await section.getByRole('heading').evaluate(el=>el.scrollIntoView({block:'start'}));await page.evaluate(()=>window.scrollBy(0,-80));await page.screenshot({path:info.outputPath('preview-new-creators.png')});
 await page.getByRole('button',{name:'여행',exact:true}).click();await expect(section.locator('article')).toHaveCount(1);await expect(section).toContainText('지우');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await section.locator('article a').first().click();await expect(page).toHaveURL(/\/preview\/creator\/jiwoo$/);
});
test('live newest cards use their own response, survive pagination and filter to an empty state',async({page},info)=>{
 const newer=creators.find(c=>c.id==='jiwoo')!,older=creators.find(c=>c.id==='haneul')!;
 const state={beanSupport:false,data:{creators:[],plans:[],creatorPlans:{},posts:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:['여행','음악'],followers:[]},viewer:{name:'',handle:'',bio:'',image:''},signedIn:false,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},commentsByPost:{},account:{email:'',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{}}};
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url()),p=url.pathname;
  let data:unknown={};
  if(p.endsWith('/bootstrap'))data=state;
  if(p.endsWith('/common'))data=null;
  if(p.endsWith('/creators')){
   const empty=url.searchParams.get('category')==='음악'||!!url.searchParams.get('query');
   data=empty?{creators:[],newCreators:[],nextCursor:null}:url.searchParams.has('cursor')?{creators:[{...older,id:'page2'}],newCreators:[],nextCursor:null}:{creators:[{...older,promoted:false}],newCreators:[newer],nextCursor:'page2'};
  }
  return route.fulfill({json:{success:true,data,errorMessage:null,errorCode:null}});
 });
 await page.goto('/service/explore');const section=page.getByRole('region',{name:'신규 크리에이터'});
 await expect(section).toContainText('지우');await expect(section.locator('article')).toHaveCount(1);
 await page.getByRole('button',{name:'크리에이터 더 보기',exact:true}).click();await expect(page.getByRole('button',{name:'크리에이터 더 보기',exact:true})).toHaveCount(0);await expect(section).toContainText('지우');
 await section.getByRole('heading').evaluate(el=>el.scrollIntoView({block:'start'}));await page.evaluate(()=>window.scrollBy(0,-80));await page.screenshot({path:info.outputPath('live-new-creators.png')});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'음악',exact:true}).click();await expect(section).toHaveCount(0);await expect(page.getByText('검색 결과가 없어요')).toBeVisible();
 expect(errors).toEqual([]);
});
