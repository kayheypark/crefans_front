import {test,expect} from '@playwright/test';
// 2026-10-30: leaving with purchased beans points to the wallet refund; creator conditions show only to creators (fan side: tests/crefans-account.test.cjs).
test('탈퇴 창은 충전 콩 환불 경로를 안내하고, 스튜디오가 있는 회원에게 크리에이터 조건을 보인다(팬 쪽은 단위 테스트)',async({page})=>{
  await page.goto('/preview/settings');
  await page.getByRole('button',{name:'회원 탈퇴',exact:true}).click();
  const dialog=page.getByRole('dialog');await expect(dialog).toContainText('남은 충전 콩은 지갑의 충전 내역에서 환불을 신청한 뒤 탈퇴해주세요.');
  await expect(dialog.getByRole('link',{name:'충전 내역에서 환불하기'})).toHaveAttribute('href',/\/beans\/charges$/);
  await expect(dialog).toContainText('크리에이터는 멤버십 판매 중단');// preview viewer owns the haneul studio
});
