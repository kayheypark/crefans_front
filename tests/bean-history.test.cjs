const {test}=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{act,create}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {beanOrderNumber,beanHistoryQuery,beanHistoryParams,filterBeanHistory,emptyBeanHistoryFilters}=loadTypeScript('lib/crefans/bean-history.ts');
test('display order reference uses creation time to seconds in Korea and never invents absent dates',()=>{
 assert.equal(beanOrderNumber('2026-10-25T15:02:07.999Z'),'CF-20261026000207');
 assert.equal(beanOrderNumber('2026-10-26T09:02:07+09:00'),'CF-20261026090207');
 for(const value of [undefined,null,'','invalid'])assert.equal(beanOrderNumber(value),'확인 불가');
});
test('period dates clamp month ends, include today in Korea and serialize only relevant endpoint filters',()=>{
 const filters={...emptyBeanHistoryFilters,period:'1',status:'paid',direction:'out',search:'  모카 & 작품  '};
 const q=beanHistoryQuery(filters,new Date('2024-03-30T15:00:00Z'));
 assert.deepEqual(q,{from:'2024-02-29',to:'2024-03-31',status:'paid',direction:'out',q:'모카 & 작품'});
 assert.deepEqual(beanHistoryQuery(emptyBeanHistoryFilters),{});
 const tips=new URLSearchParams(beanHistoryParams(2,q,true)),wallet=new URLSearchParams(beanHistoryParams(2,q));
 assert.equal(tips.get('q'),'모카 & 작품');assert.equal(tips.has('status'),false);assert.equal(wallet.has('q'),false);assert.equal(wallet.get('status'),'paid');
});
test('full fixture filtering preserves page two matches and Korean day bounds before slicing',()=>{
 const charges=Array.from({length:25},(_,i)=>({id:String(i),status:i<20?'paid':'failed',createdAt:'2026-10-25T15:00:00Z'}));
 charges.push({id:'end',status:'failed',createdAt:'2026-10-26T14:59:59.999Z'},{id:'next',status:'failed',createdAt:'2026-10-26T15:00:00Z'});
 const entries=[{delta:'10',created_at:'2026-10-25T15:00:00Z'},{delta:'-10',created_at:'2026-10-25T14:59:59.999Z'}];
 const tips=[{creatorName:'모카',message:'응원💚',created_at:'2026-10-26T00:00:00Z'},{creatorName:'시온',message:'Moka!',created_at:'2026-10-26T00:00:00Z'}];
 const filtered=filterBeanHistory(charges,entries,tips,{from:'2026-10-26',to:'2026-10-26',status:'failed',direction:'in',q:'모카'});
 assert.equal(filtered.charges.length,6);assert.equal(filtered.entries.length,1);assert.equal(filtered.tips.length,1);
 assert.equal(filterBeanHistory([],[],tips,{q:'moka'}).tips.length,1);assert.equal(filterBeanHistory([],[],tips,{q:'%'}).tips.length,0);
});
test('shared order list and receipt show the same reference while links and payment callbacks keep IDs',()=>{
 const mocks={'next/link':({children,...p})=>React.createElement('a',p,children)};
 const {BeanHistoryView}=loadTypeScript('components/crefans/BeanWalletPages.tsx',mocks),{BeanPaymentResultPage}=loadTypeScript('components/crefans/BeanPaymentResultPage.tsx',mocks);
 const charge={id:'00000000-0000-4000-8000-000000000001',quantity:10,amount:1100,status:'paid',environment:'test',createdAt:'2026-10-25T15:02:07Z'};
 for(const [component,props] of [[BeanHistoryView,{kind:'charges',model:{basePath:'/service',wallet:{page:1,charges:[charge],chargesTotal:1},sent:[],loading:false,error:''},onPage(){},onPay(){}}],[BeanPaymentResultPage,{basePath:'/service',status:'success',charge,message:'',onRetry(){}}]]){
  let tree;act(()=>tree=create(React.createElement(component,props)));
  const visible=node=>typeof node==='string'?node:(node?.children||[]).map(visible).join('');
  try{assert.match(visible(tree.toJSON()),/CF-20261026000207/);assert.doesNotMatch(visible(tree.toJSON()),/00000000-0000/);
   if(component===BeanHistoryView)assert.equal(tree.root.findAllByType('a').some(a=>a.props.href.endsWith(charge.id)),true);
  }finally{act(()=>tree.unmount());}
 }
});

test('live model passes filters to the server and discards responses from an older filter',async()=>{
 const calls=[],queue=[];let deferred=false,state,tree;
 const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
 const api=url=>{calls.push(url);const params=new URL(url,'http://local').searchParams;const data=url.startsWith('/beans/wallet')?{page:Number(params.get('page')),charges:[],entries:[],chargesTotal:7,entriesTotal:8}:{items:[],total:9};return deferred?new Promise(resolve=>queue.push(()=>resolve(ok(data)))):Promise.resolve(ok(data));};
 const {useBeansModel}=loadTypeScript('features/service/useBeansModel.ts',{'@/lib/api/platform':{platformRequest:api}});
 function Harness(){state=useBeansModel(true,true,[]);return null;}
 await act(async()=>{tree=create(React.createElement(Harness));});
 try{
  await act(async()=>{await state.refresh(false,2,{from:'2026-10-01',to:'2026-10-26',status:'paid',q:'모카 & 여행'});});
  const wallet=new URL(calls.at(-2),'http://local').searchParams,tips=new URL(calls.at(-1),'http://local').searchParams;
  assert.equal(wallet.get('status'),'paid');assert.equal(wallet.has('q'),false);assert.equal(tips.get('q'),'모카 & 여행');assert.equal(tips.has('status'),false);assert.equal(state.sentTotal,9);
  deferred=true;let first,second;act(()=>{first=state.refresh(false,2,{status:'failed'});second=state.refresh(false,1,{direction:'in'});});
  await act(async()=>{queue[2]();queue[3]();await second;});assert.equal(state.wallet.page,1);
  await act(async()=>{queue[0]();queue[1]();await first;});assert.equal(state.wallet.page,1);assert.equal(state.wallet.entriesTotal,8);
 }finally{act(()=>tree.unmount());}
});
