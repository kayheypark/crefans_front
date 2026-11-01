import {test,expect} from '@playwright/test';
// 2026-10-31 user request: beta.crefans.com shows "비공개 베타 서비스가 종료되었습니다" with 본 서비스로 이동하기 / 체험하기 (sample explore page).
// Chromium maps beta.crefans.com to the local E2E server; WebKit has no host-resolver switch.
test.use({launchOptions:{args:['--host-resolver-rules=MAP beta.crefans.com 127.0.0.1']}});
test.skip(({browserName})=>browserName!=='chromium','host mapping needs Chromium');
const port=new URL(process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3011').port||'3011';
const beta=(path:string)=>`http://beta.crefans.com:${port}${path}`;
const title='비공개 베타 서비스가 종료되었습니다';

test('the closed beta host offers the main service or the sample explore page',async({page})=>{
 await page.route('https://crefans.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>main</title>main service'}));
 await page.goto(beta('/service/feed'));
 const dialog=page.getByRole('dialog',{name:title});await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('button',{name:'체험하기'})).toBeVisible();
 await dialog.getByRole('button',{name:'체험하기'}).click();
 await expect(page).toHaveURL(beta('/preview/explore'));
 await expect(page.getByRole('dialog',{name:title})).toHaveCount(0);
 await page.goto(beta('/service/explore?category=%EC%A0%84%EC%B2%B4'));
 await page.getByRole('dialog',{name:title}).getByRole('button',{name:'본 서비스로 이동하기'}).click();
 await expect(page).toHaveURL('https://crefans.com/service/explore?category=%EC%A0%84%EC%B2%B4');
});

test('closing the notice also moves to the main service, and other hosts never see it',async({page})=>{
 await page.route('https://crefans.com/**',route=>route.fulfill({contentType:'text/html',body:'main service'}));
 await page.goto(beta('/service/landing'));
 await page.getByRole('dialog',{name:title}).getByRole('button',{name:'닫기',exact:true}).click();
 await expect(page).toHaveURL('https://crefans.com/service/landing');
 await page.goto('/service/feed');await page.waitForLoadState('networkidle');
 await expect(page.getByRole('dialog',{name:title})).toHaveCount(0);
});
