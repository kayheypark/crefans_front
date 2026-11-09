import {test,expect} from './fixtures';
import type {Page} from '@playwright/test';
// Studio state lives in the preview layout, so moves between studio screens use in-app links (a reload resets the mock).
async function studioNav(page:Page,path:string,group='수익,정산,출금 관리'){const menu=page.getByRole('button',{name:'스튜디오 메뉴 열기',exact:true});if(await menu.isVisible())await menu.click();// phones open the studio menu first
 const toggle=page.getByRole('button',{name:group,exact:true}).first();if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect(async()=>{await page.locator(`a[href="/preview/studio/${path}"]:visible`).first().click({timeout:3000});await expect(page).toHaveURL(new RegExp(`/preview/studio/${path}$`),{timeout:3000});}).toPass();}

test('콩 환불: 7일 이내 새 충전은 전액, 지난 충전은 10% 공제 후 환불하고 내역에 표시',async({page})=>{
 await page.goto('/preview/beans/charge');await page.getByText('100콩',{exact:true}).click();await page.getByRole('checkbox',{name:/결제에 동의합니다/}).check();await page.getByRole('button',{name:'충전 결제하기',exact:true}).click();
 await expect(page.getByRole('heading',{name:'콩 충전 완료',exact:true})).toBeVisible();await page.getByRole('link',{name:'내 콩 지갑 보기',exact:true}).click();await page.getByRole('link',{name:'충전 내역'}).click();
 const refundable=page.locator('li').filter({has:page.getByRole('button',{name:'환불 신청',exact:true})});
 await refundable.first().getByRole('button',{name:'환불 신청',exact:true}).click();let dialog=page.getByRole('dialog');
 await expect(dialog).toContainText('환불 콩 수100콩');await expect(dialog).toContainText('공제액(7일 이후 10%)0원');await expect(dialog).toContainText('환불 예정 금액11,000원');await expect(dialog).toContainText('공제 없이 환불');await expect(dialog).toContainText('영업일 기준 3~4일');
 await dialog.getByRole('button',{name:'11,000원 환불 신청',exact:true}).click();await expect(page.getByText('100콩을 환불했어요. 11,000원이 원래 결제수단으로 돌아갑니다.')).toBeVisible();
 await expect(page.locator('li').filter({hasText:'환불 100콩 · 11,000원'})).toHaveCount(1);
 // The newest older paid charge (10콩, paid 39 days before the fixture date) is past 7 days: 1,100원 basis − 110원.
 const old=refundable.first();await expect(old).toContainText('10콩');await old.getByRole('button',{name:'환불 신청',exact:true}).click();dialog=page.getByRole('dialog');
 await expect(dialog).toContainText('결제 금액 기준1,100원');await expect(dialog).toContainText('공제액(7일 이후 10%)− 110원');await expect(dialog).toContainText('환불 예정 금액990원');
 await dialog.getByRole('button',{name:'990원 환불 신청',exact:true}).click();await expect(page.getByText('10콩을 환불했어요. 990원이 원래 결제수단으로 돌아갑니다.')).toBeVisible();
 await expect(page.locator('li').filter({hasText:'환불 10콩 · 990원'})).toHaveCount(1);
 await page.getByRole('link',{name:'지갑으로 돌아가기'}).click();await page.getByRole('button',{name:'콩 세부 내역',exact:true}).click();// folded by default since 011a24a
 await expect(page.getByRole('listitem').filter({hasText:/^일반콩\s*2,490콩$/})).toHaveCount(1);await expect(page.getByRole('listitem').filter({hasText:/^프로모션콩\s*100콩$/})).toHaveCount(1);
 await page.screenshot({path:'test-results/bean-refund.png',fullPage:true});
});

test('콩 유효기간: 30일 안에 끝나는 콩이 있을 때만 지갑에 한 줄 안내',async({page})=>{
 await page.goto('/preview/beans');await expect(page.getByRole('heading',{name:'지갑',exact:true})).toBeVisible();await expect(page.getByText(/유효기간이 끝나요/)).toHaveCount(0);
 // The welcome promotion beans (granted 2026-08-27 in the mock) expire five years later: the preview mock still uses lib/crefans/bean-refund.ts validityYears:5,
 // while the live server (bean-policy.ts validityYears:1) and the notice below say 1년 since fef0a50 (2026-11-06). Mock mismatch reported separately.
 // The clock moves after hydration and the wallet re-renders through in-app links, so server and client HTML still match.
 await page.clock.install({time:new Date('2031-08-01T09:00:00+09:00')});await page.getByRole('link',{name:'충전 내역'}).click();await page.getByRole('link',{name:'지갑으로 돌아가기'}).click();
 await expect(page.getByText(/유효기간이 끝나요/)).toHaveText('100콩이 2031.08.27에 유효기간이 끝나요');
 await page.getByRole('link',{name:'콩 충전',exact:true}).click();const notes=page.getByRole('region',{name:'환불·유효기간'});await expect(notes).toContainText('7일 이내');await expect(notes).toContainText('10%를 공제');await expect(notes).toContainText('프로모션콩은 환불되지 않습니다');await expect(notes).toContainText('콩 유효기간은 충전·지급일로부터 1년');await expect(notes).not.toContainText('5년');
});

test('탈퇴 전 전액 출금: 탈퇴 준비 항목이 남으면 숨기고, 모두 끝나면 멤버십·콩 출금에 표시',async({page})=>{
 await page.goto('/preview/studio/security');await page.getByRole('textbox',{name:'새 출금 PIN',exact:true}).fill('246810');await page.getByRole('textbox',{name:'출금 PIN 확인',exact:true}).fill('246810');await page.getByRole('button',{name:'PIN 설정하기',exact:true}).click();await expect(page.getByText('출금 PIN이 설정되어 있어요')).toBeVisible();
 await studioNav(page,'withdraw');await expect(page.getByRole('heading',{name:'출금 신청',exact:true})).toBeVisible();
 const ready=page.getByRole('region',{name:'탈퇴 준비'});await expect(ready).toContainText('판매 중인 멤버십이 있습니다');await expect(ready).toContainText('2026-10-12에 끝난 뒤');await expect(ready).toContainText('미수금 정산이 끝난 뒤');
 await expect(page.getByRole('region',{name:'미수금'})).toContainText('멤버십 미수금 15,920원 (2026.09.10) · 이후 정산에서 차감됩니다.');
 await expect(page.getByRole('spinbutton',{name:'출금 금액',exact:true})).toBeVisible();await expect(page.getByText('탈퇴 전 전액 출금')).toHaveCount(0);
 await studioNav(page,'beans');await page.getByRole('link',{name:'후원콩 출금하기',exact:true}).click();await expect(page).toHaveURL(/\/preview\/studio\/beans\/withdraw$/);// bd6b951: the form moved to /studio/beans/withdraw
 await expect(page.getByLabel('출금할 콩',{exact:true})).toBeVisible();await expect(page.getByText('탈퇴 전 전액 출금')).toHaveCount(0);
});

test('탈퇴 전 전액 출금: 구독자가 없는 크리에이터가 판매를 모두 중단하면 전액 출금 선택 가능',async({page})=>{
 await page.addInitScript(()=>{sessionStorage.setItem('crefans-preview-creator','moka');sessionStorage.setItem('crefans-preview-signed-in','true');});
 await page.goto('/preview/studio/beans/withdraw');await expect(page.getByLabel('출금할 콩',{exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'탈퇴 준비'})).toHaveText(/판매 중인 멤버십이 있습니다/);await expect(page.getByText('탈퇴 전 전액 출금')).toHaveCount(0);
 await studioNav(page,'memberships','멤버십');await expect(page.getByRole('heading',{name:'멤버십',exact:true})).toBeVisible();
 const toggles=page.getByRole('switch',{name:/멤버십 활성화/});
 for(let i=0;i<10&&await toggles.count();i++){await toggles.first().click();await page.getByRole('dialog').getByRole('button',{name:'숨기기',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);}
 await expect(toggles).toHaveCount(0);
 await studioNav(page,'beans');await page.getByRole('link',{name:'후원콩 출금하기',exact:true}).click();await expect(page).toHaveURL(/\/preview\/studio\/beans\/withdraw$/);await expect(page.getByRole('region',{name:'탈퇴 준비'})).toHaveCount(0);
 const all=page.getByRole('checkbox',{name:/탈퇴 전 전액 출금/});await all.check();await expect(page.getByLabel('출금할 콩',{exact:true})).toHaveValue('3050');await expect(page.getByLabel('출금할 콩',{exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'출금 내용 확인',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('305,000원');
 await page.getByRole('dialog').getByRole('button',{name:'취소',exact:true}).click();
 await studioNav(page,'security','설정');await page.getByRole('textbox',{name:'새 출금 PIN',exact:true}).fill('246810');await page.getByRole('textbox',{name:'출금 PIN 확인',exact:true}).fill('246810');await page.getByRole('button',{name:'PIN 설정하기',exact:true}).click();await expect(page.getByText('출금 PIN이 설정되어 있어요')).toBeVisible();
 await studioNav(page,'withdraw');const closing=page.getByRole('checkbox',{name:/탈퇴 전 전액 출금/});await closing.check();await expect(page.getByRole('spinbutton',{name:'출금 금액',exact:true})).toHaveValue('962800');
 // The mock keeps a pending settlement and a processing withdrawal, so the server rule EARNINGS_PENDING applies.
 await page.getByRole('button',{name:'신청 내용 확인',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'보류 중이거나 처리 중인 수익이 있어 아직 전액 출금할 수 없습니다.'})).toHaveCount(1);
 await page.screenshot({path:'test-results/closing-withdrawal.png',fullPage:true});
});
