const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {betaFaqs}=loadTypeScript('lib/crefans/support.ts'),{creatorPayoutPolicy}=loadTypeScript('lib/crefans/creator-payout-policy.ts');
test('creator payout FAQ quotes the shared payout policy, not a stale amount',()=>{
 const answer=betaFaqs.find(f=>f.question==='크리에이터 수수료와 출금 기준은 무엇인가요?').answer,{feeRatePercent,settlementHoldDays,minimumWithdrawalKrw,payoutWeekday}=creatorPayoutPolicy;
 assert.equal(minimumWithdrawalKrw,100000);
 assert.ok(answer.includes(`최소 ${minimumWithdrawalKrw/10000}만 원부터`),answer);
 for(const part of[`${feeRatePercent}%`,`${settlementHoldDays}일 보류`,payoutWeekday])assert.ok(answer.includes(part),part);
 assert.ok(!answer.includes('최소 1만 원'),'stale 10,000 won minimum must not return');
});
test('payment, signup and bean-expiry FAQs match the live product (2026-11-18)',()=>{
 const answer=question=>betaFaqs.find(f=>f.question===question).answer;
 const payment=answer('지금 결제하면 실제로 청구되나요?');
 assert.match(payment,/무통장입금으로 실제 결제/);assert.match(payment,/멤버십 카드 결제는 아직 테스트 결제/);assert.doesNotMatch(payment,/결제는 개시 전/);
 assert.match(answer('누가 가입할 수 있나요?'),/휴대폰 번호 확인/);
 const beans=answer('콩은 환불되나요? 유효기간이 있나요?');assert.match(beans,/프로모션 100콩과 광고성 정보 수신에 처음 동의해 받은 프로모션 10콩은 받은 시각부터 30일/);assert.match(beans,/기한 7일 전에 알려 드립니다/);
 // 2026-11-18 /pilot-work: terms 2026-11-18.beans.1 (bean withdrawal fee/minimum) and the settings toggle name.
 assert.match(answer('크리에이터 수수료와 출금 기준은 무엇인가요?'),/후원받은 콩은 출금할 때 20%를 공제하고 최소 1,000콩부터/);
 const ad=answer('광고 메일 수신을 중단하고 싶어요.');assert.match(ad,/알림 설정에서 '광고성 정보 수신'을 끄거나/);assert.doesNotMatch(ad,/마케팅/);
});
