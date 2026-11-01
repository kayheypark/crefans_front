const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
// A creator with console-set terms sees their own fee/minimum; others keep the published default notes.
const {membershipPayoutNotesFor,beanPayoutNotesFor,minimumWithdrawalHintFor,membershipPayoutNotes,minimumWithdrawalHint,membershipPriceHint,membershipRevenuePreview}=loadTypeScript('lib/crefans/creator-payout-policy.ts');
test('studio payout notes follow a creator\'s own terms and fall back per field',()=>{
 const terms={platformFeeBps:1550,settlementHoldDays:null,beanWithdrawalFeeBps:1000,minimumWithdrawalKrw:50000};
 const notes=membershipPayoutNotesFor(terms);assert.match(notes[0],/총 공제율 15\.5%/);assert.match(notes[1],/7일 보류/);assert.match(notes[2],/최소 50,000원/);
 assert.match(beanPayoutNotesFor(terms)[3],/500콩\(총액 50,000원\)부터 신청하며 수수료는 출금 시 10%/);
 assert.equal(minimumWithdrawalHintFor(terms),'최소 50,000원부터 신청할 수 있습니다. 전액은 출금 가능 금액을 입력합니다.');
 assert.deepEqual(membershipPayoutNotesFor(null),membershipPayoutNotes);assert.equal(minimumWithdrawalHintFor(undefined),minimumWithdrawalHint);assert.match(membershipPayoutNotes[0],/총 공제율 20%/);
});
test('membership price hint uses the creator\'s own fee with the server rounding',()=>{
 const none={platformFeeBps:0,settlementHoldDays:null,beanWithdrawalFeeBps:null,minimumWithdrawalKrw:null};
 assert.equal(membershipPriceHint(9900,none),'결제 시 총 공제율 0%가 차감되어 수익으로 기록됩니다. 원천징수가 필요하면 크레팬스가 부담합니다. 예상 수익 9,900원 (수수료 0원)');
 assert.deepEqual(membershipRevenuePreview(9999,{...none,platformFeeBps:1550}),{fee:1549,net:8450});
 assert.deepEqual(membershipRevenuePreview(9900),{fee:1980,net:7920});assert.match(membershipPriceHint(9900,null),/총 공제율 20%.*예상 수익 7,920원/);
});
