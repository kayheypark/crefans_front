const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const {BeanWalletOverview,BeanHistoryView}=loadTypeScript('components/crefans/BeanWalletPages.tsx',{'next/link':({children,...props})=>React.createElement('a',props,children)});
const base={basePath:'/service',loading:false,error:'',wallet:{page:1,accounts:[],charges:[{id:'paid-order',quantity:30,amount:3000,status:'paid',environment:'test'},{id:'pending-order',quantity:10,amount:1100,status:'pending',environment:'test'}],entries:[{id:'entry',delta:'-10',created_at:'2026-10-26T00:00:00Z',movement:{reason:'일회성 후원'}}]},sent:[{id:'tip',creator_id:'creator-1',creatorName:'이름이 긴 크리에이터의 이름',quantity:10,message:'응원합니다',created_at:'2026-10-26T00:00:00Z'}]};
function mount(Component,props){let tree;act(()=>tree=create(React.createElement(Component,props)));return tree;}
test('wallet overview offers three dedicated routes, single-bean charge action and details folded by default (2026-10-31)',()=>{
 const tree=mount(BeanWalletOverview,base);try{assert.equal(text(tree.root.findByType('h1')),'지갑');const nav=tree.root.findByProps({'aria-label':'지갑 내역'});assert.deepEqual(nav.findAllByType('a').map(a=>a.props.href),['/service/beans/charges','/service/beans/history','/service/beans/tips']);assert.equal(tree.root.findByProps({'aria-controls':tree.root.findByProps({role:'region'}).props.id}).props['aria-expanded'],false);assert.equal(tree.root.findAllByType('img').filter(img=>img.props.src==='/brand/beans/soft3d-v2/10.png').length,1);assert.equal(tree.root.findAllByType('li').some(n=>text(n).includes('paid-order')),false);}finally{act(()=>tree.unmount());}
});
test('wallet totals before the first response stay blank, never \'확인할 수 없습니다\' (loading rule 2026-11-01)',()=>{
 for(const [props,expected] of [[{...base,wallet:null},['','']],[{...base,wallet:null,error:'조회 실패'},['확인할 수 없습니다','확인할 수 없습니다']]]){const tree=mount(BeanWalletOverview,props);try{assert.deepEqual(tree.root.findByProps({'aria-label':'콩 잔액'}).findAllByType('dd').map(text),expected);}finally{act(()=>tree.unmount());}}
});
test('charge page preserves old order amount and resumes only its pending order',()=>{
 const calls=[],tree=mount(BeanHistoryView,{kind:'charges',model:base,onPay:o=>calls.push(o.id),onPage(){}});try{assert.match(text(tree.toJSON()),/3,000원/);const button=tree.root.findAllByType('button').find(n=>text(n)==='결제 계속');act(()=>button.props.onClick());assert.deepEqual(calls,['pending-order']);assert.ok(tree.root.findAllByType('a').some(n=>n.props.href==='/service/beans/success?id=paid-order'));assert.equal(tree.root.findAllByType('li').length,2);}finally{act(()=>tree.unmount());}
});
test('history and sent tips stay separate, retain reasons and messages, and page only full lists',()=>{
 for(const kind of ['history','tips']){const calls=[],tree=mount(BeanHistoryView,{kind,model:base,onPay(){},onPage:p=>calls.push(p)});try{assert.match(text(tree.toJSON()),kind==='history'?/-10콩/:/응원합니다/);assert.equal(tree.root.findAllByProps({'aria-label':'내역 페이지'}).length,0);const model={...base,wallet:{...base.wallet,page:2,entries:Array.from({length:20},(_,i)=>({...base.wallet.entries[0],id:`entry-${i}`}))},sent:Array.from({length:20},(_,i)=>({...base.sent[0],id:`tip-${i}`}))};act(()=>tree.update(React.createElement(BeanHistoryView,{kind,model,onPay(){},onPage:p=>calls.push(p)})));const buttons=tree.root.findAllByType('button');act(()=>buttons.find(b=>text(b)==='이전 내역').props.onClick());act(()=>buttons.find(b=>text(b)==='다음 내역').props.onClick());assert.deepEqual(calls,[1,3]);}finally{act(()=>tree.unmount());}}
});
test('loading and fetch errors never label old records as current or as an empty result',()=>{
 {const tree=mount(BeanHistoryView,{kind:'charges',model:{...base,error:'조회 실패'},onPay(){},onPage(){}});try{assert.equal(tree.root.findAllByType('li').length,0);assert.doesNotMatch(text(tree.toJSON()),/충전 주문이 없습니다/);}finally{act(()=>tree.unmount());}}
 // Loading rule: a refresh keeps the previous page (no spinner yet) and never shows the empty state while it waits.
 {const tree=mount(BeanHistoryView,{kind:'charges',model:{...base,loading:true},onPay(){},onPage(){}});try{assert.ok(tree.root.findAllByType('li').length>0,'previous page stays');assert.doesNotMatch(text(tree.toJSON()),/충전 주문이 없습니다|불러오는 중/);}finally{act(()=>tree.unmount());}}
 // A first load (no response yet) shows neither records nor the empty state.
 {const tree=mount(BeanHistoryView,{kind:'charges',model:{...base,wallet:null,sentTotal:undefined,loading:true},onPay(){},onPage(){}});try{assert.equal(tree.root.findAllByType('li').length,0);assert.doesNotMatch(text(tree.toJSON()),/충전 주문이 없습니다/);}finally{act(()=>tree.unmount());}}
 const tree=mount(BeanHistoryView,{kind:'tips',model:{...base,sent:[]},onPay(){},onPage(){}});try{assert.match(text(tree.toJSON()),/보낸 후원이 없습니다/);}finally{act(()=>tree.unmount());}
});
