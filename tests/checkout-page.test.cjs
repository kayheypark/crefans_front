const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-02 user decision: closing the one-time payment window must not lock the order out of the monthly card payment.
function render(order){
 const Action=({children,...p})=>React.createElement('button',p,children),Plain=({children})=>React.createElement('div',null,children);
 const {CheckoutPage}=loadTypeScript('components/service/CheckoutPage.tsx',{'@/features/service/useCheckoutModel':{useCheckoutModel:()=>({order,error:'',busy:false,pay:async()=>{},setError:()=>{}}),useBillingResult:()=>({})},'next/link':Plain,'@/features/service/useOneTimePayment':{startOneTimePayment:async()=>({success:true})},'@/components/crefans/AccountPages':{SignInPrompt:Plain},'@/components/crefans/CommonPages':{BillingRegistrationResultPage:Plain},'@/components/crefans/ServiceUI':{Action,PageTitle:Plain},'./ServiceProvider':{useService:()=>({refresh:async()=>{},common:{paymentMethods:[{id:'card',label:'테스트카드',isDefault:true,requiresUpdate:false}],actions:{}}})}});
 let tree;act(()=>{tree=create(React.createElement(CheckoutPage,{id:order.id}));});return tree;
}
const base={id:'12345678-1234-1234-1234-123456789012',amount:9900,snapshot:{name:'월 구독',benefits:['혜택'],paymentEnvironment:'test'}};
const text=tree=>JSON.stringify(tree.toJSON());
test('an order whose one-time window was closed still offers the monthly card payment and shows the monthly price',()=>{
 const tree=render({...base,status:'pending',snapshot:{...base.snapshot,paymentMode:'one-time'}});
 try{const subscribe=tree.root.findAll(n=>n.type==='button'&&n.children.includes('결제하고 가입'))[0];assert.equal(subscribe.props.disabled,false);assert.match(text(tree),/"월","9,900","원"/);}finally{act(()=>tree.unmount());}
});
test('a one-time payment in progress lets the fan check the result; a paid one-time order shows one month',()=>{
 const tree=render({...base,status:'processing',snapshot:{...base.snapshot,paymentMode:'one-time'}});
 try{const check=tree.root.findAll(n=>n.type==='button'&&n.children.includes('결제 결과 확인'))[0];assert.equal(check.props.disabled,false);}finally{act(()=>tree.unmount());}
 const paid=render({...base,status:'paid',snapshot:{...base.snapshot,paymentMode:'one-time'}});try{assert.match(text(paid),/한 달 이용/);}finally{act(()=>paid.unmount());}
});
