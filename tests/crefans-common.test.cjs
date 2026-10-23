const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement;
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const ui={Action:({children,variant,...props})=>el('button',props,children),Avatar:({creator})=>el('img',{src:creator?.image,alt:creator?.name}),Empty:({title})=>el('p',{'data-empty':true},title),Notice:({children})=>el('p',null,children),PageTitle:({children,action})=>el('header',null,el('h1',null,children),action)};
const primitives={Dialog:({open,children})=>open?el('dialog',null,children):null,Field:({label,hint,error,...props})=>el('label',null,label,el('input',{'data-label':label,...props}),error&&el('p',{role:'alert'},error))};
const pages=loadTypeScript('components/crefans/CommonPages.tsx',{'./common.module.css':styles,'./choice.module.css':styles,'./select.module.css':styles,'./field.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./ServiceUI':ui,'./Icon':()=>el('svg'),'@/components/ui/Primitives':primitives,'next/link':({children,...props})=>el('a',props,children)});
const {useMockCommon}=loadTypeScript('components/preview/service/useMockCommon.ts');
const ok={success:true,data:{message:'API 처리 완료'},errorMessage:null,errorCode:null};
function model(overrides={}){return {notices:[],legal:{terms:{title:'전달된 약관',updatedAt:'2030-01-01',sections:[]},privacy:{title:'전달된 개인정보 문서',updatedAt:'2030-01-01',sections:[]},policy:{title:'전달된 정책',updatedAt:'2030-01-01',sections:[]}},auth:{email:'member@example.com',verified:false,guidance:'외부 모델 안내'},paymentMethods:[],paymentGuidance:'외부 모델 결제 안내',actions:{requestVerification:async()=>ok,verifyEmail:async()=>ok,requestPasswordReset:async()=>ok,resetPassword:async()=>ok,addPaymentMethod:async()=>ok,removePaymentMethod:async()=>ok,setDefaultPaymentMethod:async()=>ok},...overrides};}
function mount(Component,props){let tree;act(()=>{tree=create(el(Component,props));});return tree;}
const close=tree=>act(()=>tree.unmount());

test('common document screens render only injected records and gracefully handle missing notices',()=>{
 const input=model({notices:[{id:'api-notice',title:'주입된 새 공지',category:'소식',date:'2030.01.01',pinned:false,paragraphs:['서버에서 받은 본문']} ]});
 const tree=mount(pages.NoticesPage,{model:input,basePath:'/service'});
 assert.ok(tree.root.findAllByType('a').some(a=>a.props.href==='/service/notices/api-notice'));
 assert.doesNotMatch(JSON.stringify(tree.toJSON()),/welcome|2026/);
 close(tree);
 const detail=mount(pages.NoticeDetailPage,{id:'missing',model:input,basePath:'/service'});
 assert.match(JSON.stringify(detail.toJSON()),/찾을 수 없어요/);close(detail);
 const legal=mount(pages.LegalPage,{kind:'terms',model:input,basePath:'/service'});
 assert.match(JSON.stringify(legal.toJSON()),/전달된 약관/);close(legal);
});

test('password reset validates confirmation and preserves all fields after a rejected injected action',async()=>{
 let calls=0;const input=model();input.actions.resetPassword=async()=>{calls++;return{success:false,data:null,errorMessage:'인증 코드가 만료되었습니다.',errorCode:'EXPIRED'};};
 const tree=mount(pages.PasswordResetPage,{model:input,basePath:'/service'});
 await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
 const field=label=>tree.root.findByProps({'data-label':label});
 act(()=>{field('인증 코드').props.onChange({target:{value:'expired-code'}});field('새 비밀번호').props.onChange({target:{value:'password123'}});field('새 비밀번호 확인').props.onChange({target:{value:'different'}});});
 await act(async()=>tree.root.findAllByType('form')[1].props.onSubmit({preventDefault(){}}));assert.equal(calls,0);
 act(()=>field('새 비밀번호 확인').props.onChange({target:{value:'password123'}}));
 await act(async()=>tree.root.findAllByType('form')[1].props.onSubmit({preventDefault(){}}));
 assert.equal(calls,1);assert.equal(field('새 비밀번호').props.value,'password123');assert.equal(field('인증 코드').props.value,'expired-code');assert.match(JSON.stringify(tree.toJSON()),/인증 코드가 만료되었습니다/);close(tree);
});

test('mock password reset requires a request and correct code and consumes successful challenges',async()=>{
 let value;function Probe(){value=useMockCommon();return null;}const tree=mount(Probe);let result;
 await act(async()=>{await value.actions.requestPasswordReset('a@example.com');});
 await act(async()=>{result=await value.actions.resetPassword({email:'a@example.com',code:'123456',password:'valid-password'});});assert.equal(result.success,true);
 await act(async()=>{result=await value.actions.resetPassword({email:'a@example.com',code:'123456',password:'valid-password'});});assert.equal(result.errorCode,'REQUEST_REQUIRED');close(tree);
});

test('mock payment removal preserves exactly one default method and rejects unknown ids',async()=>{
 let value;function Probe(){value=useMockCommon();return null;}const tree=mount(Probe);let result;
 await act(async()=>{await value.actions.addPaymentMethod();});await act(async()=>{await value.actions.addPaymentMethod();});
 assert.equal(new Set(value.paymentMethods.map(item=>item.id)).size,2);assert.equal(value.paymentMethods.filter(item=>item.isDefault).length,1);
 const first=value.paymentMethods.find(item=>item.isDefault).id;
 await act(async()=>{await value.actions.removePaymentMethod(first);});assert.equal(value.paymentMethods.length,1);assert.equal(value.paymentMethods[0].isDefault,true);
 await act(async()=>{result=await value.actions.removePaymentMethod('missing');});assert.equal(result.success,false);assert.equal(value.paymentMethods.length,1);close(tree);
});

test('following list keeps an unfollowed creator on screen so the fan can follow again',()=>{
  const creators=[{id:'haneul',name:'하늘',handle:'haneul',image:'',bio:'소개'},{id:'jiwoo',name:'지우',handle:'jiwoo',image:'',bio:'소개'}];
  const follows=['haneul','jiwoo'];
  const serviceModel=()=>({basePath:'/catalogue',data:{creators},following:[...follows],toggleFollow(id){const index=follows.indexOf(id);if(index>=0)follows.splice(index,1);else follows.push(id);}});
  const tree=mount(pages.FollowingPage,{model:serviceModel()});
  const buttons=()=>tree.root.findAllByType('button').filter(node=>node.props['aria-pressed']!==undefined);
  assert.equal(buttons().length,2);
  act(()=>buttons()[0].props.onClick());
  act(()=>tree.root.findAllByType('button').find(node=>[].concat(node.props.children).includes('팔로우 해제')).props.onClick());
  act(()=>tree.update(el(pages.FollowingPage,{model:serviceModel()})));
  assert.deepEqual(follows,['jiwoo']);
  assert.deepEqual(buttons().map(node=>node.props['aria-pressed']),[false,true],'the unfollowed row stays, now offering 팔로우');
  assert.match(JSON.stringify(tree.toJSON()),/팔로잉 목록.*1/);
  act(()=>buttons()[0].props.onClick());
  act(()=>tree.update(el(pages.FollowingPage,{model:serviceModel()})));
  assert.deepEqual(follows,['jiwoo','haneul']);
  assert.deepEqual(buttons().map(node=>node.props['aria-pressed']),[true,true]);
  close(tree);
});

test('followers page lists the injected followers read-only with search and an empty state',()=>{
  const followers=[{id:'f1',name:'김지민',handle:'fan1',image:''},{id:'f2',name:'이서연',handle:'fan2',image:''}];
  const tree=mount(pages.FollowersPage,{model:{basePath:'/catalogue',data:{followers}}});
  assert.match(JSON.stringify(tree.toJSON()),/팔로워 목록.*2/);
  assert.equal(tree.root.findAllByType('button').filter(node=>node.props['aria-pressed']!==undefined).length,0,'no follow-back toggles');
  assert.match(JSON.stringify(tree.toJSON()),/김지민.*이서연/);
  act(()=>tree.root.findByType('input').props.onChange({target:{value:'서연'}}));
  assert.doesNotMatch(JSON.stringify(tree.toJSON()),/김지민/);assert.match(JSON.stringify(tree.toJSON()),/이서연/);
  act(()=>tree.root.findByType('input').props.onChange({target:{value:'없는사람'}}));
  assert.match(JSON.stringify(tree.toJSON()),/검색 결과가 없어요/);
  close(tree);
  const empty=mount(pages.FollowersPage,{model:{basePath:'/catalogue',data:{}}});
  assert.match(JSON.stringify(empty.toJSON()),/아직 팔로워가 없어요/);
  close(empty);
});

test('mock registration requires consent and correct identity code before injected card registration',async()=>{let selected='';const input=model({registrationPreview:{cards:[{value:'shinhan',label:'주입 카드',number:'•••• 1111'}],expiry:'12 / 30',code:'654321'}});input.actions.addPaymentMethod=async value=>{selected=value.previewCard;return ok;};const tree=mount(pages.PaymentMethodsPage,{model:input,basePath:'/preview'});const button=text=>tree.root.findAllByType('button').find(node=>node.children.join('')===text);act(()=>button('결제수단 등록').props.onClick());assert.equal(button('다음').props.disabled,true);act(()=>tree.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}}));act(()=>button('다음').props.onClick());assert.equal(button('인증하고 등록').props.disabled,true);const code=()=>tree.root.findByProps({'data-label':'인증번호'});act(()=>code().props.onChange({target:{value:'000000'}}));assert.equal(button('인증하고 등록').props.disabled,true);act(()=>code().props.onChange({target:{value:'654321'}}));assert.equal(button('인증하고 등록').props.disabled,false);await act(async()=>button('인증하고 등록').props.onClick());assert.equal(selected,'shinhan');assert.equal(tree.root.findAllByType('dialog').length,0);close(tree);});
test('live registration calls injected PG action directly and result preserves checkout return link',async()=>{let called=0;const input=model();input.actions.addPaymentMethod=async()=>{called++;return ok;};const tree=mount(pages.PaymentMethodsPage,{model:input,basePath:'/service'});await act(async()=>tree.root.findAllByType('button').find(node=>node.children.join('')==='결제수단 등록').props.onClick());assert.equal(called,1);assert.equal(tree.root.findAllByType('dialog').length,0);close(tree);const result=mount(pages.BillingRegistrationResultPage,{status:'cancelled',message:'취소',returnPath:'/service/checkout/test',onRetry:()=>{}});assert.ok(result.root.findAllByType('a').some(node=>node.props.href==='/service/checkout/test'));close(result);});
