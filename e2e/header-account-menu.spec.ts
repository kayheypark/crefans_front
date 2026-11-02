import {test,expect,type Page} from '@playwright/test';

async function service(page:Page,{held=false,failure=false}={}){
 let signedIn=true,calls=0,release=()=>{};
 const gate=held?new Promise<void>(resolve=>{release=resolve;}):Promise.resolve();
 const bootstrap=()=>({data:{creators:[],posts:[],plans:[],creatorPlans:{},notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},viewer:{name:'메뉴 검증',handle:'qa',bio:'',image:''},signedIn,ownCreatorIds:[],following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{email:'qa@example.test',stats:{posts:0,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{},guidance:{},route:{}}});
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.endsWith('/bootstrap'))await gate;
  if(path.endsWith('/auth/logout')){calls++;if(!failure)signedIn=false;await new Promise(resolve=>setTimeout(resolve,350));}
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(path.endsWith('/auth/logout')&&failure?{success:false,data:null,errorMessage:'연결을 확인해 주세요.',errorCode:'NETWORK_ERROR'}:{success:true,data:path.endsWith('/bootstrap')?bootstrap():path.endsWith('/auth/logout')?{message:'로그아웃되었습니다.'}:null,errorMessage:null,errorCode:null})});
 });
 return {release,calls:()=>calls};
}

test('PC authentication pending never exposes guest actions; delayed spinner resolves to avatar',async({page},info)=>{
 const api=await service(page,{held:true});await page.goto('/service/notifications',{waitUntil:'domcontentloaded'});
 const header=page.getByRole('banner');
 await expect(header.getByRole('link',{name:'로그인',exact:true})).toHaveCount(0);
 await expect(header.getByRole('link',{name:'회원가입',exact:true})).toHaveCount(0);
 await expect(header.getByRole('status').filter({hasText:'불러오는 중'})).toBeVisible();
 await page.screenshot({path:info.outputPath('auth-pending.png')});api.release();
 await expect(header.getByRole('button',{name:'계정 메뉴'})).toBeVisible();await expect(header.getByRole('status').filter({hasText:'불러오는 중'})).toHaveCount(0);
});

test('PC account menu supports keyboard, outside close, correct destinations and successful logout',async({page},info)=>{
 const api=await service(page);await page.goto('/service/notifications',{waitUntil:'domcontentloaded'});
 const trigger=page.getByRole('button',{name:'계정 메뉴',exact:true}),menu=page.getByRole('navigation',{name:'계정 메뉴',exact:true});
 await trigger.focus();await trigger.press('Enter');await expect(menu).toBeVisible();
 await expect(menu.getByRole('link',{name:'내 프로필',exact:true})).toHaveAttribute('href','/service/me');
 await expect(menu.getByRole('link',{name:'설정',exact:true})).toHaveAttribute('href','/service/settings');
 await page.keyboard.press(info.project.name==='webkit'?'Alt+Tab':'Tab');await expect(menu.getByRole('link',{name:'내 프로필',exact:true})).toBeFocused();
 await page.keyboard.press(info.project.name==='webkit'?'Alt+Tab':'Tab');await expect(menu.getByRole('link',{name:'설정',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(menu).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await page.getByRole('heading',{name:'알림',exact:true}).click();await expect(menu).toHaveCount(0);
 await trigger.click();await page.screenshot({path:info.outputPath('account-menu.png')});
 const button=menu.getByRole('button',{name:'로그아웃',exact:true});await button.click();await expect(button).toBeDisabled();
 await expect(page.getByRole('banner').getByRole('link',{name:'로그인',exact:true})).toBeVisible();expect(api.calls()).toBe(1);
});

test('failed logout keeps signed-in account and shows the shared dialog',async({page},info)=>{
 const api=await service(page,{failure:true});await page.goto('/service/notifications',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'계정 메뉴',exact:true}).click();await page.getByRole('navigation',{name:'계정 메뉴',exact:true}).getByRole('button',{name:'로그아웃'}).click();
 await expect(page.getByRole('heading',{name:'로그아웃하지 못했어요'})).toBeVisible();
 await expect(page.getByRole('banner').getByRole('link',{name:'로그인',exact:true})).toHaveCount(0);expect(api.calls()).toBe(1);
 await page.screenshot({path:info.outputPath('logout-error.png')});
 await page.getByRole('button',{name:'확인',exact:true}).click();await expect(page.getByRole('button',{name:'계정 메뉴',exact:true})).toBeVisible();
});

test('mobile keeps profile navigation and no desktop account dropdown',async({page},info)=>{
 await page.setViewportSize({width:390,height:844});await service(page);await page.goto('/service/notifications',{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('heading',{name:'알림',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'계정 메뉴',exact:true})).toBeHidden();
 await expect(page.getByRole('link',{name:'내 프로필',exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:info.outputPath('mobile-navigation.png')});
});
