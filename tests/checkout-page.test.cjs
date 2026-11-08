const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-02 user decision: closing the one-time payment window must not lock the order out of the monthly card payment.
function render(order,paid=[]){
 const Action=({children,...p})=>React.createElement('button',p,children),Plain=({children})=>React.createElement('div',null,children);
 const {CheckoutPage}=loadTypeScript('components/service/CheckoutPage.tsx',{'@/features/service/useCheckoutModel':{useCheckoutModel:()=>({order,error:'',busy:false,pay:async terms=>{paid.push(terms);},setError:()=>{}}),useBillingResult:()=>({})},'next/link':Plain,'@/features/service/useOneTimePayment':{startOneTimePayment:async()=>({success:true})},'@/components/crefans/AccountPages':{SignInPrompt:Plain},'@/components/crefans/CommonPages':{BillingRegistrationResultPage:Plain},'@/components/crefans/ServiceUI':{Action,PageTitle:Plain},'@/components/crefans/BackButton':{BackButton:Plain},'./ServiceProvider':{useService:()=>({refresh:async()=>{},common:{paymentMethods:[{id:'card',label:'테스트카드',isDefault:true,requiresUpdate:false}],actions:{}}})}});
 let tree;act(()=>{tree=create(React.createElement(CheckoutPage,{id:order.id}));});return tree;
}
const base={id:'12345678-1234-1234-1234-123456789012',amount:9900,snapshot:{name:'월 구독',benefits:['혜택'],paymentEnvironment:'test',refundWindowDays:7}};
const text=tree=>JSON.stringify(tree.toJSON());
const button=(tree,label)=>tree.root.findAll(n=>n.type==='button'&&n.children.includes(label))[0];
const agree=tree=>act(()=>{tree.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}});});
test('an order whose one-time window was closed still offers the monthly card payment and shows the monthly price',()=>{
 const tree=render({...base,status:'pending',snapshot:{...base.snapshot,paymentMode:'one-time'}});
 try{agree(tree);assert.equal(button(tree,'결제하고 가입').props.disabled,false);assert.match(text(tree),/월간 멤버십/);assert.match(text(tree),/9,900/);}finally{act(()=>tree.unmount());}
});
// 2026-11-02 user decision: conditions right above the payment buttons, paying only after the required agreement, version sent to the server.
test('payment conditions sit above the buttons and both payments stay disabled until the fan agrees; the agreement version is sent',async()=>{
 const paid=[],tree=render({...base,status:'pending'},paid);
 try{const page=text(tree);for(const phrase of['결제 전 확인','9,900원 (VAT 포함)','매월 같은 날','자동 갱신되지 않습니다','내 구독에서 언제든 다음 결제를 해지','결제 후 7일 이내이고 멤버십 게시물을 열람하지 않았다면','이용약관','(필수)'])assert.ok(page.includes(phrase),phrase);
  assert.ok(page.indexOf('결제 전 확인')<page.indexOf('결제하고 가입'),'conditions come before the payment button');
  assert.match(page,/법정 청약철회·환불 권리를 제한하지 않습니다/,'2026-11-09: checkout refund copy keeps the statutory right stated in the terms');
  assert.equal(button(tree,'결제하고 가입').props.disabled,true);assert.equal(button(tree,'한 달만 결제하기').props.disabled,true);
  agree(tree);assert.equal(button(tree,'결제하고 가입').props.disabled,false);assert.equal(button(tree,'한 달만 결제하기').props.disabled,false);
  await act(async()=>{button(tree,'결제하고 가입').props.onClick();});assert.deepEqual(paid,['2026-11-02.1']);
 }finally{act(()=>tree.unmount());}
});
test('a one-time payment in progress lets the fan check the result; a paid one-time order shows one month',async()=>{
 const paid=[],tree=render({...base,status:'processing',snapshot:{...base.snapshot,paymentMode:'one-time'}},paid);
 try{const check=button(tree,'결제 결과 확인');assert.equal(check.props.disabled,false,'checking a result needs no new agreement');assert.ok(!text(tree).includes('결제 전 확인'));await act(async()=>{check.props.onClick();});assert.deepEqual(paid,[undefined]);}finally{act(()=>tree.unmount());}
 const done=render({...base,status:'paid',snapshot:{...base.snapshot,paymentMode:'one-time'}});try{assert.match(text(done),/한 달 이용/);}finally{act(()=>done.unmount());}
});
