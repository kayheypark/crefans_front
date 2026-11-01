const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-01: the studio bean page is an overview like the wallet (balance, folded breakdown, withdraw button, links to
// received tips / payout history); withdraw, tips and payouts each have their own page; notices sit at the very bottom.
global.IS_REACT_ACT_ENVIRONMENT=true;
const {BeanContext}=loadTypeScript('components/crefans/BeanContext.tsx');
const {BeanStudioPage}=loadTypeScript('components/crefans/BeanPages.tsx',{'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'next/image':({sizes,draggable,...props})=>React.createElement('img',props),'./BeanContext':{useBeans:()=>React.useContext(BeanContext),BeanContext}});
const studio={availableBeans:3050,pinConfigured:true,policy:{minimumWithdrawalBeans:1000,withdrawalFeeBps:2000,minimumWithdrawalKrw:100000},accounts:[{id:'a1',label:'국민은행 · •••• 1234',isDefault:true,verified:true}],
 receivedByType:[{sourceType:'post',count:1,paid:2000,promotion:0}],tips:{items:[],page:1},payouts:[],wallet:{spendableBeans:2600,withdrawableBeans:3050,accounts:[]}};
const model={enabled:true,signedIn:true,basePath:'/service',mode:'live',loading:false,error:'',wallet:studio.wallet,studio,refresh:async()=>{},quote:async()=>({success:false}),authorize:async()=>({success:false}),withdraw:async()=>({success:false})};
const words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(''):(n.children||[]).map(words).join('');
function render(view){let tree;act(()=>{tree=create(React.createElement(BeanContext.Provider,{value:model},React.createElement(BeanStudioPage,{view})));});const page=words(tree.toJSON()),links=tree.root.findAllByType('a').map(a=>a.props.href);act(()=>tree.unmount());return{page,links};}

test('overview: balance, withdraw button, links to the two history pages; no form or lists; notices at the very bottom',()=>{
 const {page,links}=render('overview');
 assert.match(page,/^콩 후원·출금/);assert.ok(links.includes('/service/studio/beans/withdraw'));
 assert.ok(links.includes('/service/studio/beans/tips')&&links.includes('/service/studio/beans/payouts'));
 assert.doesNotMatch(page,/출금 내용 확인|출금할 콩|다음 후원/);
 assert.ok(page.indexOf('콩 출금 기준')>page.indexOf('콩 출금 내역'),'policy notice after the links');
});
test('the breakdown starts folded on the overview',()=>{
 let tree;act(()=>{tree=create(React.createElement(BeanContext.Provider,{value:model},React.createElement(BeanStudioPage,{view:'overview'})));});
 try{const details=tree.root.findAll(n=>n.props&&'defaultOpen' in n.props);assert.ok(details.length>0);assert.ok(details.every(n=>n.props.defaultOpen===false));}finally{act(()=>tree.unmount());}
});
test('withdraw page: amount available, the form, policy notice last; no tip or payout lists; back goes to the overview',()=>{
 const {page,links}=render('withdraw');
 assert.match(page,/^후원콩 출금/);assert.match(page,/출금 가능한 콩 3,050콩/);assert.match(page,/출금 내용 확인/);
 assert.doesNotMatch(page,/다음 후원|최근 50건/);assert.ok(page.indexOf('콩 출금 기준')>page.indexOf('출금 내용 확인'));
 assert.ok(links.includes('/service/studio/beans'));
});
test('tips and payouts pages show only their own list without notices',()=>{
 const tips=render('tips'),payouts=render('payouts');
 assert.match(tips.page,/^받은 후원/);assert.doesNotMatch(tips.page,/출금 내용 확인|최근 50건|콩 출금 기준/);
 assert.match(payouts.page,/^콩 출금 내역/);assert.match(payouts.page,/최근 50건/);assert.doesNotMatch(payouts.page,/출금 내용 확인|다음 후원|콩 출금 기준/);
});
