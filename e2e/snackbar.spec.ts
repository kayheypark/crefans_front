import {test,expect,type Page} from '@playwright/test';
const toast=(page:Page)=>page.locator('[role="status"] > [data-state="open"]').filter({has:page.getByRole('button',{name:'알림 닫기',exact:true})});
async function ready(page:Page,path:string){await page.goto(path);await expect(page.locator('main')).not.toHaveAttribute('aria-busy','true');}
async function saveSettings(page:Page){await page.getByRole('button',{name:'알림 설정',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'저장하기',exact:true}).click();}
test('설정 저장은 하단 스낵바이며 본문 높이·모바일 메뉴·자동 닫힘을 유지한다',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await ready(page,'/preview/settings');
 const before=await page.locator('main').evaluate(e=>e.scrollHeight);await saveSettings(page);
 const snack=toast(page);await expect(snack).toContainText('설정을 저장했습니다.');await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect.poll(()=>page.locator('main').evaluate(e=>e.scrollHeight)).toBe(before);
 expect(await snack.evaluate(e=>getComputedStyle(e).position)).toBe('fixed');expect(await snack.evaluate(e=>e.matches(':popover-open'))).toBe(true);
 expect(await snack.getByRole('button').evaluate(e=>e===document.activeElement)).toBe(false);
 const box=(await snack.boundingBox())!;expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
 if(page.viewportSize()!.width<768){const nav=(await page.getByRole('navigation',{name:'하단 메뉴',exact:true}).boundingBox())!;expect(box.y+box.height).toBeLessThan(nav.y);}
 await page.screenshot({path:info.outputPath('settings-snackbar.png')});await expect(snack).toHaveCount(0,{timeout:6500});
 await saveSettings(page);await expect(toast(page)).toBeVisible();await page.getByRole('button',{name:'알림 닫기',exact:true}).click();await expect(toast(page)).toHaveCount(0);expect(errors).toEqual([]);
});
test('스튜디오 저장·모달 내 공유 안내도 같은 스낵바를 쓴다',async({page},info)=>{
 await ready(page,'/preview/studio/settings');await page.getByRole('button',{name:'공개 프로필 저장',exact:true}).click();await expect(toast(page)).toContainText('저장');await page.getByRole('button',{name:'알림 닫기',exact:true}).click();
 await page.goto('/design-system');await page.getByRole('button',{name:/서비스 UI/}).click();await page.getByRole('button',{name:'공유 레이어 열기',exact:true}).click();const dialog=page.getByRole('dialog',{name:'게시물 공유'});await dialog.getByRole('button',{name:'복사',exact:true}).click();
 const snack=toast(page);await expect(snack).toContainText('복사 동작 예시');await expect.poll(()=>snack.evaluate(e=>!!e.closest('dialog[open]'))).toBe(true);await expect.poll(()=>snack.evaluate(e=>e.matches(':popover-open'))).toBe(true);await page.screenshot({path:info.outputPath('dialog-snackbar.png')});
 await snack.getByRole('button',{name:'알림 닫기',exact:true}).click();await expect(snack).toHaveCount(0);await expect(dialog).toBeVisible();
});
test('서비스 API 성공만 스낵바로 알리고 실패는 폼에 남긴다 (API 대역)',async({page})=>{
 let fail=false;const data={data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'테스트',handle:'test',bio:'',image:''},signedIn:true,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'test@example.test',stats:{posts:0,followers:0},preferences:{contentAlert:true,messageAlert:true,marketingAlert:false,showActivity:true,allowSearch:true,showFollowers:true,showFollowing:true},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}};
 await page.context().route('**/api/v1/**',async route=>{const path=new URL(route.request().url()).pathname;const isSave=path==='/api/v1/me/settings';await route.fulfill({contentType:'application/json',body:JSON.stringify(isSave&&fail?{success:false,data:null,errorMessage:'저장 검증 오류',errorCode:'TEST'}:{success:true,data:path==='/api/v1/bootstrap'?data:isSave?{message:'설정을 저장했습니다.'}:{},errorMessage:null,errorCode:null})});});
 await ready(page,'/service/settings');await saveSettings(page);await expect(toast(page)).toContainText('설정을 저장했습니다.');await page.getByRole('button',{name:'알림 닫기'}).click();fail=true;await saveSettings(page);await expect(page.getByRole('dialog').getByRole('alert')).toContainText('저장 검증 오류');await expect(toast(page)).toHaveCount(0);
});
