import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
// 2026-10-30: leaving with purchased beans points to the wallet refund; creator conditions show only to creators (fan side: tests/crefans-account.test.cjs).
test('탈퇴 창은 충전 콩 환불 경로를 안내하고, 스튜디오가 있는 회원에게 크리에이터 조건을 보인다(팬 쪽은 단위 테스트)',async({page})=>{
  // 2026-11-07: 회원 탈퇴는 설정이 아니라 고객센터 FAQ 맨 아래 항목에 있다.
  await page.goto('/preview/settings');await expect(page.getByRole('button',{name:'회원 탈퇴',exact:true})).toHaveCount(0);
  await page.goto('/preview/support');
  await page.getByRole('button',{name:'회원 탈퇴는 어떻게 하나요?'}).click();
  await page.getByRole('button',{name:'회원 탈퇴',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toContainText('남은 충전 콩은 지갑의 충전 내역에서 환불을 신청한 뒤 탈퇴해주세요.');
  await expect(dialog.getByRole('link',{name:'충전 내역에서 환불하기'})).toHaveAttribute('href',/\/beans\/charges$/);
  await expect(dialog).toContainText('크리에이터는 멤버십 판매 중단');// preview viewer owns the haneul studio
});
