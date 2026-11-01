const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const id='00000000-0000-4000-8000-000000000100';
const paid={id,quantity:30,amount:3000,status:'paid',environment:'test'};
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const fail=message=>({success:false,data:null,errorMessage:message,errorCode:'REJECTED'});
async function setup({query=`id=${id}`,success=true,overrides={}}={}){
 const calls={get:[],confirm:[],replace:[],refresh:0};
 const model={enabled:true,signedIn:true,basePath:'/service',getCharge:async key=>{calls.get.push(key);return ok(paid);},confirmCharge:async(key,body)=>{calls.confirm.push({key,body});return ok(paid);},refresh:async()=>{calls.refresh++;},...overrides};
 const params=new URLSearchParams(query),router={replace:url=>calls.replace.push(url)};
 const {useBeanPaymentResult}=loadTypeScript('features/service/useBeanPaymentResult.ts',{'next/navigation':{useSearchParams:()=>params,useRouter:()=>router}});
 let tree,state;function Harness(){state=useBeanPaymentResult(model,success);return null;}
 await act(async()=>{tree=create(React.createElement(Harness));});
 return{calls,model,read:()=>state,close:()=>act(()=>tree.unmount())};
}
test('paid order reload uses the stored price without confirming or minting again',async()=>{
 const h=await setup();try{assert.equal(h.read().status,'success');assert.equal(h.read().charge.amount,3000);assert.equal(h.calls.confirm.length,0);await act(async()=>{await h.read().retry();});assert.equal(h.calls.get.length,1);}finally{h.close();}
});
test('callback confirms once and removes payment credentials from the address',async()=>{
 const h=await setup({query:`id=${id}&orderId=${id}&amount=3000&paymentKey=test-key`,overrides:{getCharge:async()=>ok({...paid,status:'pending'})}});
 try{assert.equal(h.read().status,'success');assert.deepEqual(h.calls.confirm,[{key:id,body:{orderId:id,amount:3000,paymentKey:'test-key'}}]);assert.deepEqual(h.calls.replace,[`/service/beans/success?id=${id}`]);assert.equal(h.calls.refresh,1);}finally{h.close();}
});
test('pending or processing success URLs without approval do not display completion',async()=>{
 for(const status of ['pending','processing','failed','cancelled','disputed']){const h=await setup({overrides:{getCharge:async()=>ok({...paid,status})}});try{assert.notEqual(h.read().status,'success');assert.equal(h.read().charge,null);assert.equal(h.calls.confirm.length,0);}finally{h.close();}}
});
test('missing order and other owner rejection never confirm a charge',async()=>{
 for(const overrides of [{getCharge:async()=>fail('주문을 찾을 수 없습니다.')}]){const h=await setup({query:`id=${id}&paymentKey=test`,overrides});try{assert.equal(h.read().status,'error');assert.equal(h.calls.confirm.length,0);assert.equal(h.read().charge,null);}finally{h.close();}}
 const h=await setup({query:'id=invalid&paymentKey=test'});try{assert.equal(h.read().status,'error');assert.equal(h.calls.get.length,0);assert.deepEqual(h.calls.replace,['/service/beans/success?id=invalid']);}finally{h.close();}
});
test('cancelled callback is read-only and mock uses the preview route',async()=>{
 const h=await setup({success:false,query:`id=${id}&paymentKey=test`,overrides:{basePath:'/preview',getCharge:async()=>ok({...paid,status:'pending'})}});
 try{assert.equal(h.read().status,'cancelled');assert.equal(h.calls.confirm.length,0);assert.deepEqual(h.calls.replace,[`/preview/beans/fail?id=${id}`]);}finally{h.close();}
});
test('provider rejection remains an error and retry can recover that same order',async()=>{
 let count=0;const h=await setup({query:`id=${id}&orderId=${id}&amount=3000&paymentKey=test`,overrides:{getCharge:async()=>ok({...paid,status:'pending'}),confirmCharge:async()=>++count===1?fail('금액을 확인해주세요.'):ok(paid)}});
 try{assert.equal(h.read().status,'error');await act(async()=>{await h.read().retry();});assert.equal(count,2);assert.equal(h.read().status,'success');}finally{h.close();}
});
test('unknown approval and wallet refresh failure do not fake or erase payment success',async()=>{
 const h=await setup({query:`id=${id}&paymentKey=test`,overrides:{getCharge:async()=>ok({...paid,status:'pending'}),confirmCharge:async()=>ok({...paid,status:'processing'})}});
 try{assert.equal(h.read().status,'pending');assert.equal(h.read().charge,null);}finally{h.close();}
 const good=await setup({overrides:{refresh:async()=>{throw Error('offline');}}});try{assert.equal(good.read().status,'success');}finally{good.close();}
});
test('anonymous and feature-off states do not query or confirm payment',async()=>{
 for(const overrides of [{signedIn:false},{enabled:false}]){const h=await setup({overrides});try{assert.equal(h.calls.get.length,0);assert.equal(h.calls.confirm.length,0);}finally{h.close();}}
});
test('repeated clicks during approval cannot issue another confirmation',async()=>{
 let resolve,count=0;const hold=new Promise(r=>resolve=r);const h=await setup({query:`id=${id}&paymentKey=test`,overrides:{getCharge:async()=>ok({...paid,status:'pending'}),confirmCharge:async()=>{count++;return hold;}}});
 try{assert.equal(h.read().status,'loading');await act(async()=>{await h.read().retry();await h.read().retry();resolve(ok(paid));await hold;});assert.equal(h.read().status,'success');assert.equal(count,1);}finally{h.close();}
});
test('completion view shows receipt and destinations only for a paid order',()=>{
 const {BeanPaymentResultPage}=loadTypeScript('components/crefans/BeanPaymentResultPage.tsx',{'next/link':({children,...p})=>React.createElement('a',p,children)});
 for(const status of ['paid','pending']){let tree;act(()=>{tree=create(React.createElement(BeanPaymentResultPage,{basePath:'/preview',status:'success',charge:{...paid,status},message:'확인 필요',onRetry(){}}));});try{const text=JSON.stringify(tree.toJSON());assert.equal(tree.root.findAllByType('dd').some(n=>n.children.join('')==='3,000원'),status==='paid');assert.equal(tree.root.findAllByType('dl').length,status==='paid'?1:0);assert.ok(tree.root.findAllByType('a').some(n=>n.props.href==='/preview/beans'));}finally{act(()=>tree.unmount());}}
});
