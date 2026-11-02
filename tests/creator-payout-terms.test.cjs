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
 assert.equal(membershipPriceHint(9900,none),'나의 공제율: 0% · 예상 수익: 9,900원 / 결제 1건');
 assert.deepEqual(membershipRevenuePreview(9999,{...none,platformFeeBps:1550}),{fee:1549,net:8450});
 assert.equal(membershipRevenuePreview(9900),null);assert.equal(membershipPriceHint(9900,null),'나의 공제율: 확인 필요');
 assert.equal(membershipPriceHint(10000,{...none,platformFeeBps:1550}),'나의 공제율: 15.5% · 예상 수익: 8,450원 / 결제 1건');
 for(const bps of [null,undefined,-1,10001,15.5,NaN])assert.equal(membershipRevenuePreview(10000,{...none,platformFeeBps:bps}),null);
 for(const price of [0,-1,NaN,1.5])assert.equal(membershipRevenuePreview(price,none),null);
 assert.equal(membershipPriceHint(0,none),'나의 공제율: 0%');
 assert.deepEqual(membershipRevenuePreview(9900,{...none,platformFeeBps:10000}),{fee:9900,net:0});
});
