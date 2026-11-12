const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const fieldMocks={'./field.module.css':styles};
const {Field}=loadTypeScript('components/ui/Field.tsx',fieldMocks);
const link=props=>React.createElement('a',props);
const mocks={
 ...fieldMocks,'./finance.module.css':styles,'./withdrawal-security.module.css':styles,
 'next/link':link,
 '@/components/ui/TextLink':{TextLink:link},
 '@/components/ui/SelectField':{SelectField:()=>null},
 '@/components/ui/AmountPresets':{AmountPresets:()=>null},
 '@/components/ui/DialogActions':{DialogActions:({children})=>React.createElement('footer',null,children)},
 '@/components/ui/Primitives':{Field,Dialog:({open,onClose,title,children})=>open?React.createElement('section',{'data-dialog':true,'aria-label':title},React.createElement('button',{type:'button',onClick:onClose,'aria-label':'모달 닫기'},'×'),children):null},
 '../ServiceUI':{
  ActionLink:({variant,...props})=>link(props),
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

const {usePinPad,shuffledDigits}=loadTypeScript('hooks/usePinPad.ts');
const {PinPad}=loadTypeScript('components/ui/PinPad.tsx');
const text=node=>typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):node?.children?text(node.children):'';
const digitKeys=view=>view.root.findAll(node=>node.type==='button'&&/^\d$/.test(text(node)));
function digitButton(view,digit){return digitKeys(view).find(node=>text(node)===digit);}
async function typePin(view,pin){for(const digit of pin){const key=digitButton(view,digit);assert.ok(key,`key ${digit}`);await act(async()=>{key.props.onClick();});}}
const pads=view=>view.root.findAll(node=>node.props&&node.props.role==='group'&&node.type==='div');
const status=view=>text(view.root.find(node=>node.props&&node.props['aria-live']==='polite'&&node.type==='p'));
let harnessPad;function Harness({onComplete}){const pad=usePinPad({onComplete});harnessPad=pad;return React.createElement(PinPad,{pad,title:'PIN',autoFocus:false});}

test('usePinPad shuffles all ten digits without bias and PinPad shows dots, never the digits typed',async()=>{
 assert.deepEqual(shuffledDigits(()=>0),['1','2','3','4','5','6','7','8','9','0']);
 const done=[];const view=mount(Harness,{onComplete:pin=>done.push(pin)});
 try{
  const keys=digitKeys(view).map(text);
  assert.deepEqual([...keys].sort(),['0','1','2','3','4','5','6','7','8','9']);
  await typePin(view,'1234567');assert.deepEqual(done,['123456'],'completes once at six digits; the seventh key is ignored');
  assert.equal(status(view),'6자리 중 6자리 입력');assert.equal(JSON.stringify(view.toJSON()).includes('123456'),false,'digits are not rendered');
  const back=view.root.findByProps({'aria-label':'한 자리 지우기'});act(()=>back.props.onClick());assert.equal(status(view),'6자리 중 5자리 입력');
  act(()=>view.root.find(node=>node.type==='button'&&text(node)==='전체삭제').props.onClick());assert.equal(status(view),'6자리 중 0자리 입력');
  for(const key of ['9','x','Backspace','8','7'])act(()=>harnessPad.onKeyDown({key,preventDefault(){},metaKey:false,ctrlKey:false,altKey:false}));
  assert.equal(status(view),'6자리 중 2자리 입력','PC number keys and Backspace work; other keys are ignored');
 }finally{close(view);}
});

test('PIN setup takes the PIN twice on the pad and never reports success on rejected setup',async()=>{
 const pins=[];const view=mount(WithdrawalSecurityPage,{basePath:'/preview/studio',model:model({pinConfigured:false,setupWithdrawalPin:async pin=>{pins.push(pin);return fail('설정할 수 없습니다.');}})});
 try{
  await typePin(view,'246813');assert.match(text(view.root),/한 번 더 입력/);await typePin(view,'864213');
  assert.equal(pins.length,0);assert.match(text(view.root.findByProps({role:'alert'})),/서로 달라/);assert.match(text(view.root),/새 출금 PIN 입력/,'a mismatch starts over');
  await typePin(view,'246813');await typePin(view,'246813');
  assert.deepEqual(pins,['246813']);assert.equal(status(view),'6자리 중 0자리 입력');
  assert.equal(text(view.root.findByProps({role:'alert'})),'설정할 수 없습니다.');
 }finally{close(view);}
});

test('a common PIN is refused on the first pass, before the PASS step, with the server rule',async()=>{
 const pins=[];const view=mount(WithdrawalSecurityPage,{basePath:'/preview/studio',model:model({pinConfigured:false,setupWithdrawalPin:async pin=>{pins.push(pin);return ok({message:'설정'});}})});
 try{
  for(const weak of['111111','123456','987654']){await typePin(view,weak);assert.match(text(view.root.findByProps({role:'alert'})),/추측하기 쉬운 번호/);assert.match(text(view.root),/새 출금 PIN 입력/,weak);}
  assert.deepEqual(pins,[]);await typePin(view,'246813');await typePin(view,'246813');assert.deepEqual(pins,['246813']);
 }finally{close(view);}
});

test('unconfigured withdrawal cannot advance and configured security page shows no pad, only a link to reset',()=>{
 const view=mount(WithdrawalPage,{model:model({pinConfigured:false}),basePath:'/preview/studio'});
 try{assert.equal(view.root.findAllByType('form').length,0);assert.ok(view.root.findAllByType('a').some(item=>item.props.href==='/preview/studio/security'));}finally{close(view);}
 const configured=mount(WithdrawalSecurityPage,{model:model(),basePath:'/preview/studio'});
 try{assert.equal(pads(configured).length,0);const hrefs=configured.root.findAllByType('a').map(item=>item.props.href);assert.ok(hrefs.includes('/preview/studio/withdraw'));assert.ok(hrefs.includes('/preview/studio/security/reset'));}finally{close(configured);}
});

// 2026-11-12 user decision (ask-me): without the partner contract (verified badge) the form is replaced by a notice and a
// contract inquiry link; the PIN page stays reachable from the studio security menu.
test('a creator without the partner contract sees the contract notice and inquiry link instead of the withdrawal form',()=>{
 const m=model();const view=mount(WithdrawalPage,{model:{...m,data:{...m.data,payoutPartner:false}},basePath:'/service/studio'});
 try{assert.equal(view.root.findAllByType('form').length,0);assert.ok(view.root.findAllByType('a').some(item=>item.props.href==='/service/support?tab=qna'));
  assert.match(JSON.stringify(view.toJSON()),/파트너 계약을 맺은 크리에이터\(인증 배지\)만/);}finally{close(view);}
 const partner=mount(WithdrawalPage,{model:model(),basePath:'/service/studio'});
 try{assert.equal(partner.root.findAllByType('form').length,1,'partner (or older response without the field) keeps the form');}finally{close(partner);}
});

test('PIN reset replaces a configured PIN with the same two passes, then confirms without offering another reset',async()=>{
 const pins=[];let answer=fail('본인인증이 만료되었거나 일치하지 않습니다.');
 const view=mount(WithdrawalSecurityPage,{basePath:'/preview/studio',reset:true,model:model({setupWithdrawalPin:async pin=>{pins.push(pin);return answer;}})});
 try{
  assert.match(text(view.root),/출금 PIN 재설정/);assert.equal(pads(view).length,1,'a configured PIN still gets the pad on the reset page');
  await typePin(view,'246810');assert.match(text(view.root),/본인인증 창이 열려요/);await typePin(view,'246810');
  assert.deepEqual(pins,['246810']);assert.equal(text(view.root.findByProps({role:'alert'})),'본인인증이 만료되었거나 일치하지 않습니다.');assert.match(text(view.root),/새 출금 PIN 입력/,'a failed reset starts over');
  answer=ok({message:'간편비밀번호를 설정했습니다.'});await typePin(view,'135790');await typePin(view,'135790');
  assert.deepEqual(pins,['246810','135790']);assert.equal(pads(view).length,0);assert.match(text(view.root),/새 출금 PIN으로 바꿨어요/);
  assert.equal(view.root.findAllByType('a').some(item=>item.props.href==='/preview/studio/security/reset'),false);
 }finally{close(view);}
});

test('membership PIN confirmation links to the reset page',async()=>{
 const view=mount(WithdrawalPage,{model:model(),basePath:'/preview/studio'});
 try{await openConfirmation(view);const link=view.root.findAllByType('a').find(item=>item.props.href==='/preview/studio/security/reset');assert.ok(link);assert.equal(text(link),'PIN을 잊으셨나요?');}finally{close(view);}
});

test('wrong PIN blocks withdrawal, clears the pad, and closing the dialog clears the error',async()=>{
 let requests=0;const view=mount(WithdrawalPage,{model:model({verifyWithdrawalPin:async()=>fail('PIN이 일치하지 않아요.'),requestWithdrawal:async()=>{requests++;}}),basePath:'/preview/studio'});
 try{
  await openConfirmation(view);await typePin(view,'111111');
  assert.equal(requests,0);assert.equal(status(view),'6자리 중 0자리 입력');assert.equal(text(view.root.findByProps({role:'alert'})),'PIN이 일치하지 않아요.');
  await typePin(view,'12');act(()=>view.root.findByProps({'aria-label':'모달 닫기'}).props.onClick());
  act(()=>button(view,'출금 요청하기').props.onClick());assert.equal(status(view),'6자리 중 0자리 입력');assert.equal(view.root.findAllByProps({role:'alert'}).length,0);
 }finally{close(view);}
});

test('withdrawal waits for the verified PIN and sends its amount-bound authorization before displaying success',async()=>{
 const calls=[];const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:async(pin,input)=>{calls.push({kind:'verify',pin,input});return ok({authorizationId:'exact-grant'});},requestWithdrawal:async input=>{calls.push({kind:'request',input});return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);await typePin(view,'12345');assert.equal(calls.length,0,'five digits send nothing');
  await typePin(view,'6');
  assert.equal(calls[0].kind,'verify');assert.equal(calls[0].pin,'123456');assert.deepEqual(calls[0].input,{amount:5000,accountId:'account-1'});
  assert.equal(calls[1].input.authorizationId,'exact-grant');assert.equal(calls[1].input.amount,5000);assert.equal(calls[1].input.accountId,'account-1');assert.ok(calls[1].input.requestId);
  assert.equal(pads(view).length,0);assert.ok(button(view,'새 출금 요청'));
 }finally{close(view);}
});

test('uncertain request retries the same grant and idempotency key without an extra PIN check or editable amount',async()=>{
 let verifies=0;const requests=[];const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:async()=>{verifies++;return ok({authorizationId:'retry-grant'});},requestWithdrawal:async input=>{requests.push(input);if(requests.length===1)throw new Error('response lost');return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);await typePin(view,'123456');
  assert.equal(button(view,'다시 입력').props.disabled,true);assert.equal(pads(view).length,0,'no PIN pad while re-checking');
  const retry=view.root.findAllByType('button').filter(item=>text(item)==='접수 결과 다시 확인').pop();await act(async()=>{await retry.props.onClick();});
  assert.equal(verifies,1);assert.equal(requests.length,2);assert.deepEqual(requests[0],requests[1]);assert.ok(button(view,'새 출금 요청'));
 }finally{close(view);}
});

test('pending PIN verification ignores more keys and keeps the dialog until it settles',async()=>{
 let resolve,verifies=0,requests=0;
 const verification=new Promise(done=>{resolve=done;});
 const view=mount(WithdrawalPage,{basePath:'/preview/studio',model:model({verifyWithdrawalPin:()=>{verifies++;return verification;},requestWithdrawal:async input=>{requests++;return model().requestWithdrawal(input);}})});
 try{
  await openConfirmation(view);await typePin(view,'123456');
  assert.equal(verifies,1);assert.equal(requests,0);assert.equal(digitButton(view,'1').props.disabled,true);
  act(()=>view.root.findByProps({'aria-label':'모달 닫기'}).props.onClick());assert.equal(view.root.findAllByProps({'data-dialog':true}).length,1);
  await act(async()=>{resolve(ok({authorizationId:'pending-grant'}));await verification;});
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

test('the membership payout minimum follows the creator’s individual terms, falling back to the default 100,000원',()=>{
 for(const [terms,expected] of [[null,100000],[{platformFeeBps:null,settlementHoldDays:null,beanWithdrawalFeeBps:null,minimumWithdrawalKrw:50000},50000]]){
  const base=model(),view=mount(WithdrawalPage,{basePath:'/preview/studio',model:{...base,data:{...base.data,creatorTerms:terms}}});
  try{
   const input=view.root.findByProps({type:'number'});assert.equal(input.props.min,expected);
   change(input,'60000');assert.equal(button(view,'신청 내용 확인').props.disabled,expected>60000,`minimum ${expected}`);
  }finally{close(view);}
 }
});
