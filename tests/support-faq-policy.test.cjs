const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {betaFaqs}=loadTypeScript('lib/crefans/support.ts'),{creatorPayoutPolicy}=loadTypeScript('lib/crefans/creator-payout-policy.ts');
test('creator payout FAQ quotes the shared payout policy, not a stale amount',()=>{
 const answer=betaFaqs.find(f=>f.question==='크리에이터 수수료와 출금 기준은 무엇인가요?').answer,{feeRatePercent,settlementHoldDays,minimumWithdrawalKrw,payoutWeekday}=creatorPayoutPolicy;
 assert.equal(minimumWithdrawalKrw,100000);
 assert.ok(answer.includes(`최소 ${minimumWithdrawalKrw/10000}만 원부터`),answer);
 for(const part of[`${feeRatePercent}%`,`${settlementHoldDays}일 보류`,payoutWeekday])assert.ok(answer.includes(part),part);
 assert.ok(!answer.includes('최소 1만 원'),'stale 10,000 won minimum must not return');
});
