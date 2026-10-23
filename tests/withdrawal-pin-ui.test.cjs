const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const fieldMocks={'./field.module.css':styles,'./pin-field.module.css':styles};
const {Field}=loadTypeScript('components/ui/Field.tsx',fieldMocks);
const {PinField}=loadTypeScript('components/ui/PinField.tsx',fieldMocks);
const link=props=>React.createElement('a',props);
const mocks={
 ...fieldMocks,'./finance.module.css':styles,'./withdrawal-security.module.css':styles,
 'next/link':link,
 '@/components/ui/TextLink':{TextLink:link},
 '@/components/ui/PinField':{PinField},
 '@/components/ui/SelectField':{SelectField:()=>null},
 '@/components/ui/AmountPresets':{AmountPresets:()=>null},
 '@/components/ui/DialogActions':{DialogActions:({children})=>React.createElement('footer',null,children)},
 '@/components/ui/Primitives':{Field,Dialog:({open,onClose,title,children})=>open?React.createElement('section',{'data-dialog':true,'aria-label':title},React.createElement('button',{type:'button',onClick:onClose,'aria-label':'모달 닫기'},'×'),children):null},
 '../ServiceUI':{
  Action:({variant,...props})=>React.createElement('button',props),
  PageTitle:({children,action})=>React.createElement('header',null,React.createElement('h1',null,children),action),
  Notice:({children})=>React.createElement('aside',null,children),
  Empty:({title})=>React.createElement('p',null,title),
 },
 '../Icon':()=>null,
};
const {WithdrawalPage}=loadTypeScript('components/crefans/studio/FinancePages.tsx',mocks);
const {WithdrawalSecurityPage}=loadTypeScript('components/crefans/studio/WithdrawalSecurityPage.tsx',mocks);
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const fail=message=>({success:false,data:null,errorMessage:message,errorCode:'PIN_INVALID'});
const account={id:'account-1',bank:'예시 은행',holderAlias:'창작자',lastFour:'1234',verified:true,isDefault:true};
const quote={amount:5000,account,availableAfterRequest:95000};
function model(overrides={}){return {pinConfigured:true,mode:'mock',today:'2026-09-13',data:{summary:{available:100000},accounts:[account]},reviewWithdrawal:async()=>ok(quote),verifyWithdrawalPin:async()=>ok({authorizationId:'grant-1'}),requestWithdrawal:async()=>ok({withdrawal:{id:'request-1',amount:5000,accountLabel:'예시 은행',requestedAt:'2026-09-13',status:'requested',statusNote:'접수됨'},message:'접수되었습니다.'}),...overrides};}
function mount(Page,props){let view;act(()=>{view=create(React.createElement(Page,props));});return view;}
function button(view,label){return view.root.findAllByType('button').find(item=>item.children.join('')===label);}
function change(input,value){act(()=>input.props.onChange({target:{value}}));}
async function submit(view){await act(async()=>{await view.root.findByType('form').props.onSubmit({preventDefault(){}});});}
async function openConfirmation(view){change(view.root.findByProps({type:'number'}),'5000');await submit(view);act(()=>button(view,'출금 요청하기').props.onClick());}
function close(view){act(()=>view.unmount());}

test('PinField masks controlled input and emits only six numeric digits without leaking values in helper text',()=>{
 const values=[];const view=mount(PinField,{label:'출금 PIN',value:'12',onChange:value=>values.push(value),required:true,hint:'숫자 6자리'});
 try{
  const input=view.root.findByType('input');
  assert.equal(input.props.type,'password');assert.equal(input.props.inputMode,'numeric');assert.equal(input.props.maxLength,6);assert.equal(input.props.autoComplete,'off');
  change(input,'12a345678');assert.deepEqual(values,['123456']);assert.equal(input.props.value,'12');
  act(()=>view.update(React.createElement(PinField,{label:'출금 PIN',value:'',onChange:value=>values.push(value),readOnly:true})));
  change(view.root.findByType('input'),'999999');assert.equal(values.length,1);
 }finally{close(view);}
});

test('PIN setup requires matching six digits and never reports success on rejected setup',async()=>{
 const pins=[];const view=mount(WithdrawalSecurityPage,{basePath:'/preview/studio',model:model({pinConfigured:false,setupWithdrawalPin:async pin=>{pins.push(pin);return fail('설정할 수 없습니다.');}})});
 try{
  change(view.root.findAllByType('input')[0],'123456');change(view.root.findAllByType('input')[1],'654321');await submit(view);
  assert.equal(pins.length,0);assert.match(view.root.findByProps({role:'alert'}).children.join(''),/서로 달라/);
  change(view.root.findAllByType('input')[1],'123456');await submit(view);
  assert.deepEqual(pins,['123456']);assert.deepEqual(view.root.findAllByType('input').map(input=>input.props.value),['','']);
  assert.equal(view.root.findByProps({role:'alert'}).children[0],'설정할 수 없습니다.');
 }finally{close(view);}
});

test('unconfigured withdrawal cannot advance and configured security page exposes no reset form',()=>{
 const view=mount(WithdrawalPage,{model:model({pinConfigured:false}),basePath:'/preview/studio'});
 try{assert.equal(view.root.findAllByType('form').length,0);assert.ok(view.root.findAllByType('a').some(item=>item.props.href==='/preview/studio/security'));}finally{close(view);}
 const configured=mount(WithdrawalSecurityPage,{model:model(),basePath:'/preview/studio'});
 try{assert.equal(configured.root.findAllByType('input').length,0);assert.ok(configured.root.findAllByType('a').some(item=>item.props.href==='/preview/studio/withdraw'));}finally{close(configured);}
});

test('wrong PIN blocks withdrawal, clears the secret, and closing the dialog clears entered PIN',async()=>{
 let requests=0;const view=mount(WithdrawalPage,{model:model({verifyWithdrawalPin:async()=>fail('PIN이 일치하지 않아요.'),requestWithdrawal:async()=>{requests++;}}),basePath:'/preview/studio'});
 try{
  await openConfirmation(view);change(view.root.findByProps({type:'password'}),'111111');await submit(view);
  assert.equal(requests,0);assert.equal(view.root.findByProps({type:'password'}).props.value,'');assert.equal(view.root.findByProps({role:'alert'}).children[0],'PIN이 일치하지 않아요.');
  change(view.root.findByProps({type:'password'}),'123456');act(()=>view.root.findByProps({'aria-label':'모달 닫기'}).props.onClick());
  act(()=>button(view,'출금 요청하기').props.onClick());assert.equal(view.root.findByProps({type:'password'}).props.value,'');assert.equal(view.root.findAllByProps({role:'alert'}).length,0);
 }finally{close(view);}
});

test('withdrawal waits for verified PIN and sends its amount-bound authorization before displaying success',async()=>{
 const calls=[];const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:async(pin,input)=>{calls.push({kind:'verify',pin,input});return ok({authorizationId:'exact-grant'});},requestWithdrawal:async input=>{calls.push({kind:'request',input});return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);await submit(view);assert.equal(calls.length,0);
  change(view.root.findByProps({type:'password'}),'123456');await submit(view);
  assert.equal(calls[0].kind,'verify');assert.deepEqual(calls[0].input,{amount:5000,accountId:'account-1'});
  assert.equal(calls[1].input.authorizationId,'exact-grant');assert.equal(calls[1].input.amount,5000);assert.equal(calls[1].input.accountId,'account-1');assert.ok(calls[1].input.requestId);
  assert.equal(view.root.findAllByProps({type:'password'}).length,0);assert.ok(button(view,'새 출금 요청'));
 }finally{close(view);}
});

test('uncertain request retries the same grant and idempotency key without an extra PIN check or editable amount',async()=>{
 let verifies=0;const requests=[];const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:async()=>{verifies++;return ok({authorizationId:'retry-grant'});},requestWithdrawal:async input=>{requests.push(input);if(requests.length===1)throw new Error('response lost');return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);change(view.root.findByProps({type:'password'}),'123456');await submit(view);
  assert.equal(button(view,'다시 입력').props.disabled,true);assert.equal(view.root.findAllByProps({type:'password'}).length,0);
  await submit(view);assert.equal(verifies,1);assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);assert.ok(button(view,'새 출금 요청'));
 }finally{close(view);}
});

test('pending PIN verification prevents duplicate requests and dismissal until it settles',async()=>{
 let resolve,verifies=0,requests=0;
 const verification=new Promise(done=>{resolve=done;});
 const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:()=>{verifies++;return verification;},requestWithdrawal:async input=>{requests++;return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);change(view.root.findByProps({type:'password'}),'123456');
  const form=view.root.findByType('form');let pending;
  await act(async()=>{pending=form.props.onSubmit({preventDefault(){}});await form.props.onSubmit({preventDefault(){}});});
  assert.equal(verifies,1);assert.equal(requests,0);assert.equal(view.root.findByProps({type:'password'}).props.disabled,true);
  act(()=>view.root.findByProps({'aria-label':'모달 닫기'}).props.onClick());assert.equal(view.root.findAllByProps({'data-dialog':true}).length,1);
  await act(async()=>{resolve(ok({authorizationId:'pending-grant'}));await pending;});
  assert.equal(requests,1);assert.equal(view.root.findAllByProps({'data-dialog':true}).length,0);
 }finally{close(view);}
});


test('withdrawal balance shows the remainder and does not invent a balance for invalid input',()=>{
 const view=mount(WithdrawalPage,{model:model(),basePath:'/preview/studio'});
 const remainder=()=>view.root.findByProps({'aria-live':'polite'}).children.join('');
 try{
  assert.equal(remainder(),'₩100,000');
  change(view.root.findByProps({type:'number'}),'30000');assert.equal(remainder(),'₩70,000');
  change(view.root.findByProps({type:'number'}),'100000');assert.equal(remainder(),'₩0');
  change(view.root.findByProps({type:'number'}),'100001');assert.equal(remainder(),'금액을 확인해 주세요');
  change(view.root.findByProps({type:'number'}),'');assert.equal(remainder(),'₩100,000');
 }finally{close(view);}
});
