const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-06 user decision: the initial screen shows the hosting provider and the intermediary notice
// (전자상거래법 제10조①·시행령 제11조의4·시행규칙 제7조, 제20조①·시행규칙 제11조의2), and the membership checkout
// repeats the notice next to the seller in the same type size. Wording matches 이용약관 제1조.
const NOTICE='크레팬스는 크리에이터 멤버십 거래의 통신판매중개자로 거래 당사자가 아니며, 멤버십의 판매자는 각 크리에이터입니다. 콩은 크레팬스가 직접 판매합니다.';
const text=tree=>JSON.stringify(tree.toJSON());
const inner=node=>typeof node==='string'?node:node.children.map(inner).join('');
test('business info names the hosting provider and carries the intermediary notice',()=>{
 const {businessInfo,intermediaryNotice}=loadTypeScript('lib/content/business.ts');
 assert.equal(businessInfo.hostingProvider,'Amazon Web Services Korea LLC');assert.equal(intermediaryNotice,NOTICE);
 const {BusinessInfo}=loadTypeScript('components/crefans/BusinessInfo.tsx');let tree;act(()=>{tree=create(React.createElement(BusinessInfo));});
 try{const page=text(tree);for(const phrase of['호스팅서비스 제공자','Amazon Web Services Korea LLC',NOTICE,'통신판매업 신고번호'])assert.ok(page.includes(phrase),phrase);}finally{act(()=>tree.unmount());}
});
function checkout(sellerName){
 const Action=({children,...p})=>React.createElement('button',p,children),Plain=({children})=>React.createElement('div',null,children);
 const {MembershipCheckout}=loadTypeScript('components/crefans/MembershipCheckout.tsx',{'next/link':Plain,'./ServiceUI':{Action,PageTitle:Plain},'./BackButton':{BackButton:Plain},'./MembershipCompletePage':{MembershipCompletePage:Plain}});
 const order={id:'o',amount:9900,status:'pending',snapshot:{name:'월 구독',benefits:[],creatorId:'c1',refundWindowDays:7}};
 let tree;act(()=>{tree=create(React.createElement(MembershipCheckout,{order,error:'',basePath:'/service',canRegister:true,busy:false,registering:false,agreed:false,onAgree(){},onRegister(){},onPay(){},onOneTime(){},sellerName}));});return tree;
}
test('membership checkout names the seller and the intermediary notice together in the payment confirmation, in one type size',()=>{
 const tree=checkout('하루작가');
 try{const box=tree.root.find(n=>n.props['aria-label']==='판매자 안내');
  const paragraphs=box.findAllByType('p');assert.ok(paragraphs.every(p=>!p.props.className&&!p.props.style),'both lines inherit the one box style (CSS .seller p{font-size:inherit})');
  const lines=paragraphs.map(inner);assert.equal(lines.length,2);assert.equal(lines[0],'판매자: 하루작가');assert.equal(lines[1],NOTICE);
  const page=text(tree);assert.ok(page.indexOf('결제 전 확인')<page.indexOf(NOTICE)&&page.indexOf(NOTICE)<page.indexOf('결제하고 가입'),'notice sits in the confirmation before the pay button');
 }finally{act(()=>tree.unmount());}
 const unnamed=checkout(undefined);try{const page=text(unnamed);assert.ok(page.includes('이 멤버십을 운영하는 크리에이터'));assert.ok(page.includes(NOTICE));}finally{act(()=>unnamed.unmount());}
});
test('the checkout model loads the seller name from the creator profile',async()=>{
 const calls=[];const api=async url=>{calls.push(url);return url.startsWith('/checkout/')?{success:true,data:{id:'o',status:'pending',snapshot:{creatorId:'c 1'}}}:{success:true,data:{name:'하루작가'}};};
 const {useCheckoutModel}=loadTypeScript('features/service/useCheckoutModel.ts',{'@/lib/api/platform':{platformRequest:api},'next/navigation':{useSearchParams:()=>new URLSearchParams(),useRouter:()=>({replace(){}})},'@/lib/api/billing':{}});
 let seen;const Probe=()=>{seen=useCheckoutModel('o',async()=>{}).sellerName;return null;};
 let tree;await act(async()=>{tree=create(React.createElement(Probe));});await act(async()=>{await new Promise(r=>setTimeout(r,0));});
 try{assert.equal(seen,'하루작가');assert.deepEqual(calls,['/checkout/o','/profiles/c%201']);}finally{act(()=>tree.unmount());}
});
test('bean charges are sold by CREFANS itself, so their payment confirmation carries no intermediary notice',()=>{
 for(const file of['components/crefans/BeanChargePage.tsx','components/crefans/BeanWalletPages.tsx'])assert.ok(!/intermediaryNotice|seller=/.test(fs.readFileSync(path.join(__dirname,'..',file),'utf8')),file);
});
test('membership payment completion names the seller and the intermediary notice together, in one type size',()=>{
 const Plain=({children})=>React.createElement('div',null,children);
 const {MembershipCompletePage}=loadTypeScript('components/crefans/MembershipCompletePage.tsx',{'./ServiceUI':{ActionLink:Plain,PageTitle:Plain},'./BackButton':{BackButton:Plain}});
 const order={id:'o',amount:9900,status:'paid',snapshot:{name:'월 구독',benefits:[],creatorId:'c1'}};
 const render=sellerName=>{let tree;act(()=>{tree=create(React.createElement(MembershipCompletePage,{basePath:'/service',backHref:'/service',order,sellerName}));});return tree;};
 const tree=render('하루작가');
 try{const box=tree.root.find(n=>n.props['aria-label']==='판매자 안내');const paragraphs=box.findAllByType('p');
  assert.ok(paragraphs.every(p=>!p.props.className&&!p.props.style),'both lines inherit the one box style (CSS .seller p{font-size:inherit})');
  assert.deepEqual(paragraphs.map(inner),['판매자: 하루작가',NOTICE]);
  const css=fs.readFileSync(path.join(__dirname,'..','components/crefans/membership-complete.module.css'),'utf8');
  assert.match(css,/\.seller p\{[^}]*font-size:inherit/);assert.match(css,/\.seller strong\{[^}]*font-size:inherit/);
 }finally{act(()=>tree.unmount());}
 const unnamed=render(undefined);try{const page=text(unnamed);assert.ok(page.includes('이 멤버십을 운영하는 크리에이터'));assert.ok(page.includes(NOTICE));}finally{act(()=>unnamed.unmount());}
});
