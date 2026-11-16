// 2026-11-16 user decision: AI passes and ad products share one shop page; 구매 내역 sits on the right of the same row.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement,css=new Proxy({},{get:(_,k)=>String(k)}),words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(' '):(n.children||[]).map(words).join(' ');
const ui={Action:({children,variant,...p})=>el('button',p,children),Empty:({title,description})=>el('section',{'data-empty':true},title,description),PageTitle:({children,back,action})=>el('header',null,back,el('h1',null,children),action)};
const common={'../ServiceUI':ui,'@/components/ui/Primitives':{Dialog:()=>null,Chip:({children,selected,...p})=>el('button',{...p,'aria-pressed':!!selected},children)},'@/components/ui/Toast':{Toast:()=>null},'@/components/ui/SnackbarProvider':{useSnackbarMessage:()=>React.useState('')},'@/components/ui/LoadingSpinner':{LoadingSpinner:()=>null},'@/components/ui/useDelayedLoading':{useDelayedLoading:()=>false},'@/components/ui/DialogActions':{DialogActions:({children})=>el('div',null,children)},'../BackButton':{BackButton:()=>null},'next/link':({children,...p})=>el('a',p,children),'./shop.module.css':{__esModule:true,default:css},'./advertising.module.css':{__esModule:true,default:css}};
const {AdvertisingPage}=loadTypeScript('components/crefans/studio/AdvertisingPage.tsx',common);
const {ShopPage}=loadTypeScript('components/crefans/studio/ShopPage.tsx',{...common,'./AdvertisingPage':{AdvertisingPage}});
const shop={products:[{id:'s1',name:'AI 사진 10회권',description:'',benefit:'AI 사진 10회 생성',amount:1000,validityLabel:'구매 후 30일',terms:'',termsVersion:'v',onSale:true,version:1}],orders:[],loading:false,error:'',refresh:async()=>{},purchase:async()=>({success:false}),refund:async()=>({success:false})};
const ads={products:[{id:'a1',name:'주목할 크리에이터 7일',description:'',terms:'',placement:'featured_creator',amount:11000,durationDays:7,onSale:true,visible:true,sortOrder:0,version:1}],orders:[],loading:false,error:'',purchaseReady:false,guidance:'',refresh:async()=>{},purchase:async()=>({success:false}),activate:async()=>({success:false})};
const buttons=t=>t.root.findAll(n=>n.type==='button');const byText=(t,s)=>buttons(t).find(b=>words(b.props.children).trim()===s);

test('chips 콩 충전 | AI 이용권 | 광고상품, and 구매 내역 as a button beside the title',()=>{
 let t;act(()=>{t=create(el(ShopPage,{model:shop,advertising:ads,basePath:'/service/studio'}));});
 try{
  // 2026-11-16 revision: 구매 내역 moved to a pill button beside the title; 콩 충전 is the first chip of the row.
  const header=t.root.findByType('header');assert.equal(header.findAll(n=>n.type==='button'&&n.props.className==='historyButton').length,1,'구매 내역 sits in the title row');
  const chips=t.root.find(n=>n.props?.className==='categories').findAllByType('button').map(b=>words(b.props.children).trim());assert.deepEqual(chips,['콩 충전','AI 이용권','광고상품']);
  assert.ok(byText(t,'AI 이용권')&&byText(t,'광고상품')&&byText(t,'구매 내역'));
  assert.match(words(t.toJSON()),/AI 사진 10회권/);assert.doesNotMatch(words(t.toJSON()),/광고상품 보기/);
  act(()=>byText(t,'광고상품').props.onClick());
  assert.match(words(t.toJSON()),/주목할 크리에이터 7일/);assert.doesNotMatch(words(t.toJSON()),/AI 사진 10회권/);
  assert.equal(t.root.findAll(n=>n.type==='h1').length,1,'embedded ads page adds no second title');
  act(()=>byText(t,'구매 내역').props.onClick());assert.equal(byText(t,'구매 내역').props['aria-pressed'],true);
  assert.doesNotMatch(words(t.toJSON()),/주목할 크리에이터 7일/,'ad orders view');
 }finally{act(()=>t.unmount());}
});

test('opening /studio/advertising starts on the 광고상품 category',()=>{
 let t;act(()=>{t=create(el(ShopPage,{model:shop,advertising:ads,initialCategory:'ads',basePath:'/service/studio'}));});
 try{assert.match(words(t.toJSON()),/주목할 크리에이터 7일/);assert.equal(byText(t,'광고상품').props['aria-pressed'],true);}finally{act(()=>t.unmount());}
});
