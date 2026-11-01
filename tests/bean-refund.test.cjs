const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const {beanRefundTerms,unusedPurchasedBeans,expiringSoonBeans,beanExpiryDate,beanRefundOutcome}=loadTypeScript('lib/crefans/bean-refund.ts');
const day=86400000,now=new Date('2026-10-30T03:00:00Z'),ago=n=>new Date(now.getTime()-n*day).toISOString();

test('refund terms: unused beans only, full within 7 days, 10% kept after, nothing once expired',()=>{
 const charge={amount:110000,quantity:1000};
 assert.deepEqual(beanRefundTerms({...charge,paidAt:ago(7)},400,now),{quantity:400,gross:44000,deduction:0,amount:44000,fullRefundWindow:true,waived:false});
 assert.deepEqual(beanRefundTerms({...charge,paidAt:ago(7.01)},400,now),{quantity:400,gross:44000,deduction:4400,amount:39600,fullRefundWindow:false,waived:false});
 assert.equal(beanRefundTerms({amount:3300,quantity:30,paidAt:ago(30)},7,now).deduction,77);// floor(770*0.1)
 assert.equal(beanRefundTerms({...charge,paidAt:ago(1)},0,now).quantity,0);
 assert.equal(beanRefundTerms({...charge,paidAt:'2021-10-29T00:00:00Z'},1000,now).quantity,0,'expired after 5 years');
 assert.equal(beanRefundTerms({...charge,paidAt:null},1000,now).quantity,0,'unpaid');
});
test('unused purchased beans belong to the newest paid charges and exclude refunded ones',()=>{
 const charges=[{id:'old',quantity:1000,status:'paid',paidAt:ago(40)},{id:'mid',quantity:500,status:'paid',paidAt:ago(20),refundedQuantity:100},{id:'new',quantity:300,status:'paid',paidAt:ago(1)},{id:'pending',quantity:900,status:'pending'}];
 assert.deepEqual(Object.fromEntries(unusedPurchasedBeans(charges,1000)),{new:300,mid:400,old:300});
 assert.deepEqual(Object.fromEntries(unusedPurchasedBeans(charges,200)),{new:200,mid:0,old:0});
});
test('expiry notice covers lots ending within 30 days and reports the earliest date',()=>{
 const lots=[{quantity:100,from:'2021-11-20T00:00:00Z'},{quantity:30,from:'2021-11-10T00:00:00Z'},{quantity:5,from:'2021-12-30T00:00:00Z'},{quantity:9,from:'2021-10-01T00:00:00Z'},{quantity:0,from:'2021-11-01T00:00:00Z'}];
 assert.deepEqual(expiringSoonBeans(lots,now),{quantity:130,expiresAt:'2026-11-10T00:00:00.000Z'});
 assert.equal(expiringSoonBeans([{quantity:5,from:'2021-12-30T00:00:00Z'}],now),null);
 assert.equal(beanExpiryDate('2026-11-09T16:00:00Z'),'2026.11.10');
});

const nav={'next/navigation':{useRouter:()=>({push(){}})}};
const {useMockBeans}=loadTypeScript('components/preview/service/useMockBeans.ts',nav);
function mockBeans(){let model,tree;function Probe(){model=useMockBeans(true,[],[]);return null;}
 act(()=>{tree=create(React.createElement(Probe));});return{get model(){return model;},close(){act(()=>tree.unmount());}};}
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
test('mock wallet refunds like the server: deduction after 7 days, full for a new charge, used and promotion beans never',async()=>{
 const view=mockBeans();try{
  const promotion=view.model.wallet.spendableBreakdown.promotion;
  let q;await act(async()=>{q=await view.model.refundQuote(id(1));});assert.equal(q.data.quantity,0,'oldest charge was spent first');
  await act(async()=>{q=await view.model.refundQuote(id(2));});assert.deepEqual([q.data.quantity,q.data.gross,q.data.deduction,q.data.amount,q.data.fullRefundWindow],[500,55000,5500,49500,false]);
  let r;await act(async()=>{r=await view.model.refundCharge(id(2),'req-1');});assert.equal(r.success,true);assert.equal(r.data.amount,49500);
  let again;await act(async()=>{again=await view.model.refundCharge(id(2),'req-1');});assert.equal(again.data.id,r.data.id,'same request id is idempotent');
  await act(async()=>{again=await view.model.refundCharge(id(2),'req-2');});assert.equal(again.errorCode,'NO_REFUNDABLE_BEANS');
  const charge=view.model.wallet.charges.find(c=>c.id===id(2));assert.deepEqual([charge.refundedQuantity,charge.refundedAmount],[500,49500]);
  assert.equal(view.model.wallet.spendableBreakdown.purchased,2000);assert.equal(view.model.wallet.spendableBreakdown.promotion,promotion);
  let created;await act(async()=>{created=await view.model.createCharge(100,'new-charge');await view.model.confirmCharge(created.data.id,{});});
  await act(async()=>{q=await view.model.refundQuote('new-charge');});assert.deepEqual([q.data.quantity,q.data.amount,q.data.deduction,q.data.fullRefundWindow],[100,11000,0,true]);
  await act(async()=>{q=await view.model.refundQuote(id(11));});assert.equal(q.errorCode,'BEAN_REFUND_UNAVAILABLE');
 }finally{view.close();}
});
test('mock bean closing withdrawal must take every withdrawable bean and may go below the minimum',async()=>{
 const view=mockBeans();try{let r;
  await act(async()=>{r=await view.model.quote(1000,'mock-account',true);});assert.equal(r.errorCode,'CLOSING_WITHDRAWAL_ALL');
  await act(async()=>{r=await view.model.quote(3050,'mock-account',true);});assert.equal(r.success,true);
  let a;await act(async()=>{a=await view.model.authorize(3050,'mock-account','123456',true);});
  await act(async()=>{r=await view.model.withdraw({quantity:3050,accountId:'mock-account',authorizationId:a.data.authorizationId,requestId:'close-1'});});assert.equal(r.success,false,'authorization was for a closing withdrawal');
  await act(async()=>{a=await view.model.authorize(3050,'mock-account','123456',true);r=await view.model.withdraw({quantity:3050,accountId:'mock-account',authorizationId:a.data.authorizationId,requestId:'close-2',closing:true});});assert.equal(r.success,true);
 }finally{view.close();}
});

const primitives=loadTypeScript('components/ui/Primitives.tsx');
const wallet=loadTypeScript('components/crefans/BeanWalletPages.tsx',{'next/link':({children,...props})=>React.createElement('a',props,children),'@/components/ui/Primitives':{...primitives,Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null}});
const charges=[{id:'paid',quantity:30,amount:3300,status:'paid',environment:'test',refundedQuantity:10,refundedAmount:1100},{id:'refunded',quantity:10,amount:1100,status:'paid',environment:'test',refundedQuantity:10,refundedAmount:1100},{id:'pending',quantity:10,amount:1100,status:'pending',environment:'test'}];
const model={basePath:'/service',loading:false,error:'',wallet:{page:1,accounts:[],charges,entries:[]},sent:[]};
test('charge list offers refund only on paid charges with beans left and shows refunded amounts',()=>{
 const calls=[];let tree;act(()=>{tree=create(React.createElement(wallet.BeanHistoryView,{kind:'charges',model,onPay(){},onPage(){},onRefund:c=>calls.push(c.id)}));});
 try{const buttons=tree.root.findAllByType('button').filter(b=>text(b)==='환불 신청');assert.equal(buttons.length,1);act(()=>buttons[0].props.onClick());assert.deepEqual(calls,['paid']);assert.match(text(tree.toJSON()),/환불 10콩 · 1,100원/);}finally{act(()=>tree.unmount());}
 act(()=>{tree=create(React.createElement(wallet.BeanHistoryView,{kind:'charges',model,onPay(){},onPage(){}}));});try{assert.equal(tree.root.findAllByType('button').filter(b=>text(b)==='환불 신청').length,0,'no refund without a handler');}finally{act(()=>tree.unmount());}
});
test('refund dialog shows quantity, basis, deduction, amount and the card notice, then confirms',()=>{
 const confirmed=[];let tree;const quote={chargeId:'paid',quantity:20,gross:2200,deduction:220,amount:1980,fullRefundWindow:false,waived:false};
 act(()=>{tree=create(React.createElement(wallet.BeanHistoryView,{kind:'charges',model,onPay(){},onPage(){},onRefund(){},refund:{quote,error:'처리 중인 환불이 있습니다.'},onRefundConfirm:()=>confirmed.push(1)}));});
 try{const dialog=tree.root.findByProps({'data-dialog':'콩 환불 신청'}),body=text(dialog);for(const part of ['환불 콩 수20콩','결제 금액 기준2,200원','공제액(7일 이후 10%)− 220원','환불 예정 금액1,980원','원래 결제수단','영업일 기준 3~4일','처리 중인 환불이 있습니다.'])assert.ok(body.includes(part),part);
  act(()=>dialog.findAllByType('button').find(b=>text(b)==='1,980원 환불 신청').props.onClick());assert.deepEqual(confirmed,[1]);}finally{act(()=>tree.unmount());}
 act(()=>{tree=create(React.createElement(wallet.BeanHistoryView,{kind:'charges',model,onPay(){},onPage(){},onRefund(){},refund:{quote:{...quote,quantity:0,gross:0,deduction:0,amount:0},error:''}}));});
 try{const dialog=tree.root.findByProps({'data-dialog':'콩 환불 신청'});assert.match(text(dialog),/환불할 수 있는 미사용 콩이 없습니다/);assert.equal(dialog.findAllByType('button').some(b=>/환불 신청/.test(text(b))),false);}finally{act(()=>tree.unmount());}
});
test('wallet shows one expiry line only when the server reports beans expiring soon',()=>{
 for(const [expiringSoon,expected] of [[{quantity:1200,expiresAt:'2026-11-09T16:00:00Z'},'1,200콩이 2026.11.10에 유효기간이 끝나요'],[null,null]]){let tree;act(()=>{tree=create(React.createElement(wallet.BeanWalletOverview,{basePath:'/service',loading:false,error:'',wallet:{page:1,accounts:[],entries:[],expiringSoon}}));});
  try{const lines=tree.root.findAll(n=>n.type==='p'&&/유효기간이 끝나요/.test(text(n)));assert.equal(lines.length,expected?1:0);if(expected)assert.equal(text(lines[0]),expected);}finally{act(()=>tree.unmount());}}
});

const {mockClosingBlockers,reviewMockWithdrawal,calculateFinanceSummary}=loadTypeScript('components/preview/studio/useMockFinance.ts');
const {createInitialFinanceState}=loadTypeScript('components/preview/studio/finance-fixtures.ts');
test('mock closing blockers mirror the server order and clear only when all conditions are met',()=>{
 const codes=input=>mockClosingBlockers(input).map(b=>b.code);
 assert.deepEqual(codes({memberships:[{active:true}],subscribers:[{status:'cancelled',renewAt:'2026-10-05'},{status:'active',renewAt:'2026-10-12'}],today:'2026-09-12',receivables:[{id:'r',kind:'membership',amount:1,createdAt:'2026-09-10'}]}),['MEMBERSHIP_ON_SALE','PAID_PERIOD_REMAINS','RECEIVABLE_OPEN']);
 assert.match(mockClosingBlockers({subscribers:[{status:'cancelled',renewAt:'2026-10-05'},{status:'active',renewAt:'2026-10-12'}],today:'2026-09-12'})[0].message,/2026-10-12에 끝난 뒤/);
 assert.deepEqual(codes({memberships:[{active:false}],subscribers:[{status:'expired',renewAt:'2026-10-12'},{status:'active',renewAt:'2026-09-12'}],today:'2026-09-12'}),[]);
});
test('mock closing membership withdrawal needs no blocker, nothing on hold and the whole balance; minimum does not apply',()=>{
 const state=createInitialFinanceState(),blocked=[{code:'MEMBERSHIP_ON_SALE',message:'판매 중'}];
 assert.equal(reviewMockWithdrawal(state,{amount:1,accountId:'account-verified',closing:true},blocked).errorCode,'MEMBERSHIP_ON_SALE');
 assert.equal(reviewMockWithdrawal(state,{amount:1,accountId:'account-verified',closing:true}).errorCode,'EARNINGS_PENDING');
 const settled={...state,settlements:state.settlements.map(s=>({...s,status:'available'})),withdrawals:state.withdrawals.filter(w=>w.status!=='processing')},all=calculateFinanceSummary(settled).available;
 assert.equal(reviewMockWithdrawal(settled,{amount:all-1,accountId:'account-verified',closing:true}).errorCode,'CLOSING_WITHDRAWAL_ALL');
 const small={...settled,withdrawals:[...settled.withdrawals,{id:'w',requestId:'w',accountId:'account-verified',accountLabel:'',amount:all-5000,requestedAt:'2026-09-12',status:'paid',statusNote:''}]};
 assert.equal(reviewMockWithdrawal(small,{amount:5000,accountId:'account-verified'}).errorCode,'INVALID_AMOUNT');
 assert.equal(reviewMockWithdrawal(small,{amount:5000,accountId:'account-verified',closing:true}).success,true);
});
const {CreatorClosingNotes,closingAllowed}=loadTypeScript('components/crefans/CreatorClosingNotes.tsx');
test('receivable and closing notes come from the finance data and a missing list never allows closing',()=>{
 assert.equal(closingAllowed(undefined),false);assert.equal(closingAllowed([]),true);assert.equal(closingAllowed([{code:'X',message:'x'}]),false);
 let tree;act(()=>{tree=create(React.createElement(CreatorClosingNotes,{receivables:[{id:'1',kind:'membership',amount:15920,createdAt:'2026-09-10'},{id:'2',kind:'beans',amount:8000,createdAt:'2026-09-11'}],closingBlockers:[{code:'RECEIVABLE_OPEN',message:'미수금 정산이 끝난 뒤 탈퇴할 수 있습니다.'}]}));});
 try{const body=text(tree.toJSON().map?{children:tree.toJSON()}:tree.toJSON());assert.match(body,/멤버십 미수금 15,920원 \(2026\.09\.10\) · 이후 정산에서 차감됩니다/);assert.match(body,/콩 후원 미수금 8,000원 .* 콩 출금이 멈춥니다/);assert.match(body,/탈퇴 준비.*미수금 정산이 끝난 뒤 탈퇴할 수 있습니다/);}finally{act(()=>tree.unmount());}
 act(()=>{tree=create(React.createElement(CreatorClosingNotes,{}));});try{assert.equal(tree.toJSON(),null);}finally{act(()=>tree.unmount());}
});

test('a refund reply counts as done only when the server says done; a refusal gets a new request id, an unknown result keeps it',()=>{
 const fresh=()=>'new-id';
 assert.deepEqual(beanRefundOutcome({success:true,data:{status:'done'}},'req',fresh),{kind:'done',requestId:'req'});
 assert.deepEqual(beanRefundOutcome({success:true,data:{status:'processing'}},'req',fresh),{kind:'processing',requestId:'req'},'still being confirmed is not a refund');
 assert.deepEqual(beanRefundOutcome({success:false,errorCode:'PROVIDER_REJECTED'},'req',fresh),{kind:'error',requestId:'new-id'});
 assert.deepEqual(beanRefundOutcome({success:false,errorCode:'BEAN_REFUND_FAILED'},'req',fresh),{kind:'error',requestId:'new-id'});
 assert.deepEqual(beanRefundOutcome({success:false,errorCode:'PAYMENT_UNCERTAIN'},'req',fresh),{kind:'error',requestId:'req'});
});
