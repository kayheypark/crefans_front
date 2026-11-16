// 2026-11-16 AI 이용권 구독형(월 자동결제) | 횟수형 sections, subscription apply and management.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement,css=new Proxy({},{get:(_,k)=>String(k)}),words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(' '):(n.children||[]).map(words).join(' ');
const ui={Action:({children,variant,...p})=>el('button',p,children),Empty:({title})=>el('section',null,title),PageTitle:({children})=>el('h1',null,children)};
const submitted=[];
const mocks={'../ServiceUI':ui,'@/components/ui/Primitives':{Dialog:({open,title,children})=>open?el('div',{role:'dialog','aria-label':title},children):null,Chip:({children,selected,...p})=>el('button',{...p,'aria-pressed':!!selected},children)},'@/components/ui/Toast':{Toast:()=>null},'@/components/ui/LoadingSpinner':{LoadingSpinner:()=>null},'@/components/ui/useDelayedLoading':{useDelayedLoading:()=>false},'@/components/ui/DialogActions':{DialogActions:({children})=>el('div',null,children)},'../BackButton':{BackButton:()=>null},'./shop.module.css':{__esModule:true,default:css},'./AdvertisingPage':{AdvertisingPage:()=>null},'@/lib/crefans/payment-window':{submitPaymentWindow:w=>submitted.push(w)}};
const {ShopPage}=loadTypeScript('components/crefans/studio/ShopPage.tsx',mocks);
const {submitPaymentWindow}=loadTypeScript('lib/crefans/payment-window.ts');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const pack={id:'p1',name:'AI 사진 10회권',description:'',benefit:'AI 사진 10회 생성',amount:1000,validityLabel:'구매 후 30일',terms:'',termsVersion:'v1',onSale:true,version:1};
const plan={...pack,id:'m1',name:'월 30회 구독',kind:'subscription',kindLabel:'AI 이용권 구독형',amount:3000,quantity:30,unitPrice:100,validityDays:30,version:2};
const model=patch=>({products:[pack,plan],orders:[],loading:false,error:'',refresh:async()=>{},purchase:async()=>({success:false}),refund:async()=>({success:false}),subscriptions:{available:true,items:[]},...patch});
const flat=t=>words(t.toJSON()).replace(/\s+/g,'');
const buttons=t=>t.root.findAll(n=>n.type==='button');const byText=(t,s)=>buttons(t).find(b=>words(b.props.children).trim()===s);
const render=m=>{let t;act(()=>{t=create(el(ShopPage,{model:m,basePath:'/service/studio'}));});return t;};
const openPlan=t=>act(()=>byText(t,'구독하기').props.onClick());
const agree=t=>act(()=>t.root.find(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}}));
const applyButton=t=>byText(t,'월 3,000원 구독 신청');

test('subscription plans sit in their own section; the 횟수형 list keeps only packs (kind missing → pack)',()=>{
 const t=render(model());
 try{
  const text=words(t.toJSON());
  assert.match(text,/AI 이용권 구독형/);assert.match(text,/AI 이용권 횟수형/);assert.match(flat(t),/월3,000원/);assert.match(flat(t),/매달AI사진30회/);assert.match(flat(t),/1회100원/);
  assert.equal(buttons(t).filter(b=>words(b.props.children).trim()==='구매하기').length,1,'only the pack can be bought once');
  assert.ok(byText(t,'구독하기'));
 }finally{act(()=>t.unmount());}
 const old=render(model({subscriptions:null}));
 try{const text=words(old.toJSON());assert.doesNotMatch(text,/구독형/,'older server: section hidden');assert.doesNotMatch(text,/월 30회 구독/);}finally{act(()=>old.unmount());}
});

test('apply stays disabled until the auto-billing terms are agreed; the window posts the card form',async()=>{
 const calls=[],w={action:'https://stdpay.inicis.com/payMain/pay',fields:{mid:'INIBillTst',oid:'abc'}};
 const t=render(model({subscribe:async p=>{calls.push(p.id);return ok({id:'s1',amount:3000,name:p.name,window:w});}}));
 try{
  openPlan(t);const text=words(t.toJSON());
  for(const term of[/매달 같은 날/,/이월되지 않아요/,/24시간 간격으로 3번/,/해지 예약할 수 있어요/,/남은 횟수 × 1회 단가/])assert.match(text,term);
  assert.equal(applyButton(t).props.disabled,true,'disabled before consent');
  agree(t);assert.equal(applyButton(t).props.disabled,false);
  await act(async()=>{await applyButton(t).props.onClick();});
  assert.deepEqual(calls,['m1']);assert.deepEqual(submitted.at(-1),w);
 }finally{act(()=>t.unmount());}
});

test('available=false: button stays enabled, click shows the 점검 alert without calling the server; 503 shows the same alert',async()=>{
 const calls=[];
 let t=render(model({subscriptions:{available:false,items:[]},subscribe:async()=>{calls.push(1);return ok({window:null});}}));
 try{
  assert.equal(byText(t,'구독하기').props.disabled,false);assert.doesNotMatch(words(t.toJSON()),/준비 중|연동 전/);
  openPlan(t);agree(t);assert.equal(applyButton(t).props.disabled,false);
  await act(async()=>{await applyButton(t).props.onClick();});
  assert.equal(calls.length,0,'no server call');assert.ok(t.root.findAll(n=>n.props?.['aria-label']==='점검 중입니다').length);
  assert.match(words(t.toJSON()),/카드 결제 점검 중입니다/);
 }finally{act(()=>t.unmount());}
 t=render(model({subscribe:async()=>({success:false,data:null,errorCode:'BILLING_UNAVAILABLE',errorMessage:'구독 결제를 준비 중이에요.'})}));
 try{openPlan(t);agree(t);await act(async()=>{await applyButton(t).props.onClick();});assert.match(words(t.toJSON()),/카드 결제 점검 중입니다/);assert.doesNotMatch(words(t.toJSON()),/준비 중/);}finally{act(()=>t.unmount());}
});

test('my subscription card: status, card, period, next charge, remaining, cancel and confirmed refund',async()=>{
 const done=[],item={id:'sub1',productId:'m1',name:'월 30회 구독',amount:3000,quantity:30,unitPrice:100,status:'active',statusLabel:'구독 중',cardLabel:'신한카드 1234',currentPeriodStart:'2026-11-16T03:00:00.000Z',currentPeriodEnd:'2026-12-16T03:00:00.000Z',nextChargeAt:'2026-12-16T03:00:00.000Z',remaining:12,lastFailureCode:null};
 const t=render(model({subscriptions:{available:true,items:[item,{...item,id:'old',status:'ended',statusLabel:'구독 종료'}]},refundSubscription:async id=>{done.push(['refund',id]);return ok({...item,status:'refunded'});},cancelSubscription:async id=>{done.push(['cancel',id]);return ok(item);}}));
 try{
  const text=words(t.toJSON());
  assert.match(text,/구독 중/);assert.match(text,/신한카드 1234/);assert.match(flat(t),/이번기간2026\.11\.16~2026\.12\.16/);assert.match(flat(t),/다음결제일2026\.12\.16/);assert.match(flat(t),/남은12회/);assert.doesNotMatch(text,/구독 종료/,'ended subscriptions are not listed');
  act(()=>byText(t,'남은 횟수 환불').props.onClick());assert.equal(done.length,0,'refund waits for confirmation');
  assert.match(flat(t),/남은12회×1회100원=1,200원을결제한카드로환불/);
  await act(async()=>{await byText(t,'환불 요청').props.onClick();});assert.deepEqual(done,[['refund','sub1']]);
  act(()=>byText(t,'해지 예약').props.onClick());await act(async()=>{await buttons(t).filter(b=>words(b.props.children).trim()==='해지 예약').at(-1).props.onClick();});assert.deepEqual(done.at(-1),['cancel','sub1']);
 }finally{act(()=>t.unmount());}
 const none=render(model({subscriptions:{available:true,items:[{...item,status:'cancel_scheduled',statusLabel:'해지 예약',remaining:0,nextChargeAt:null}]}}));
 try{assert.equal(byText(none,'남은 횟수 환불'),undefined);assert.equal(buttons(none).filter(b=>words(b.props.children).trim()==='해지 예약').length,0);}finally{act(()=>none.unmount());}
});

test('submitPaymentWindow builds a hidden POST form with the given action and fields',()=>{
 const made=[],node=tag=>{const n={tag,children:[],appendChild:c=>n.children.push(c),submit:()=>made.push(n)};return n;};
 const doc={createElement:node,body:{appendChild:()=>{}}};
 const form=submitPaymentWindow({action:'https://stdpay.inicis.com/payMain/pay',fields:{mid:'INIBillTst',price:'3000'}},doc);
 assert.equal(form.method,'POST');assert.equal(form.action,'https://stdpay.inicis.com/payMain/pay');assert.equal(form.hidden,true);assert.deepEqual(made,[form]);
 assert.deepEqual(form.children.map(i=>[i.type,i.name,i.value]),[['hidden','mid','INIBillTst'],['hidden','price','3000']]);
 assert.throws(()=>submitPaymentWindow({action:'http://evil.example/',fields:{}},doc));
});
