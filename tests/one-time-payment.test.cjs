const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
test('one-time callback clears provider secrets, confirms once and preserves order navigation',async()=>{
 const id='12345678-1234-1234-1234-123456789012',query=new URLSearchParams({id,orderId:id,amount:'1000',paymentKey:'private-test-key'}),urls=[],calls=[];let result;
 const {useOneTimePayment}=loadTypeScript('features/service/useOneTimePayment.ts',{'next/navigation':{useSearchParams:()=>query,useRouter:()=>({replace:u=>urls.push(u)})},'@/lib/api/one-time-payment':{},'@/lib/api/platform':{platformRequest:async(path,body)=>{calls.push({path,body});return{success:true,data:{message:'가입 완료'}};}}});
 function Probe(){result=useOneTimePayment(true,true);return null;}let tree;try{await act(async()=>{tree=create(React.createElement(Probe));});assert.equal(result.status,'success');assert.equal(result.returnPath,`/service/checkout/${id}`);assert.equal(calls[0].body.amount,1000);assert.ok(urls.every(u=>!u.includes('private-test-key')));await act(async()=>{await result.retry();});assert.equal(calls.length,1);}finally{act(()=>tree?.unmount());}
});
// 2026-11-02 user decision: refresh shows the stored result, failures map Toss codes to fixed wording and send the fan back to checkout.
function oneTime(query,responses){const urls=[],pushed=[],calls=[];const hook=loadTypeScript('features/service/useOneTimePayment.ts',{'next/navigation':{useSearchParams:()=>query,useRouter:()=>({replace:u=>urls.push(u),push:u=>pushed.push(u)})},'@/lib/api/one-time-payment':{},'@/lib/api/platform':{platformRequest:async(path,body)=>{calls.push({path,body});return responses(path,calls.length);}}});return{...hook,urls,pushed,calls};}
async function probe(h,success){let result,tree;function Probe(){result=h.useOneTimePayment(success,true);return null;}await act(async()=>{tree=create(React.createElement(Probe));});return{get:()=>result,unmount:()=>act(()=>tree.unmount())};}
const orderId='12345678-1234-1234-1234-123456789012';
test('a refreshed success page reads the stored order instead of reporting a missing payment',async()=>{
 let status='paid';const h=oneTime(new URLSearchParams({id:orderId}),path=>({success:true,data:{status}}));const p=await probe(h,true);
 try{assert.equal(p.get().status,'success');assert.deepEqual(h.calls.map(c=>c.path),[`/checkout/${orderId}`]);}finally{p.unmount();}
 status='processing';const q=await probe(oneTime(new URLSearchParams({id:orderId}),()=>({success:true,data:{status}})),true);
 try{assert.equal(q.get().status,'error');assert.equal(q.get().message,'결제 결과를 확인하고 있습니다. 같은 결제가 두 번 청구되지는 않습니다. 잠시 후 다시 확인해주세요.');}finally{q.unmount();}
 status='pending';const r=await probe(oneTime(new URLSearchParams({id:orderId}),()=>({success:true,data:{status}})),true);
 try{assert.equal(r.get().status,'cancelled');assert.equal(r.get().retryLabel,'다시 결제하기');}finally{r.unmount();}
});
test('an uncertain approval explains that nothing is charged twice and retries the same confirmation',async()=>{
 const h=oneTime(new URLSearchParams({id:orderId,orderId,amount:'1000',paymentKey:'test-window-key'}),(path,n)=>n===1?{success:false,data:null,errorCode:'PAYMENT_UNCERTAIN',errorMessage:'결제 응답 확인이 필요합니다.'}:{success:true,data:{message:'가입이 완료되었습니다.'}});const p=await probe(h,true);
 try{assert.equal(p.get().status,'error');assert.match(p.get().message,/두 번 청구되지는 않습니다/);assert.equal(p.get().retryLabel,undefined);await act(async()=>{await p.get().retry();});assert.equal(p.get().status,'success');assert.deepEqual(h.calls.map(c=>c.path),[`/checkout/${orderId}/confirm`,`/checkout/${orderId}/confirm`]);}finally{p.unmount();}
});
test('a failed window shows fixed wording for the Toss code, never the URL message, and returns to checkout',async()=>{
 const h=oneTime(new URLSearchParams({id:orderId,code:'REJECT_CARD_COMPANY',message:'고객센터 010-0000-0000으로 연락하세요'}),()=>{throw new Error('no API call on the fail page');});const p=await probe(h,false);
 try{assert.equal(p.get().status,'cancelled');assert.equal(p.get().message,'카드사에서 결제를 승인하지 않았습니다. 카드 정보와 한도를 확인하거나 다른 카드로 결제해주세요.');assert.equal(p.get().retryLabel,'다시 결제하기');await act(async()=>{await p.get().retry();});assert.deepEqual(h.pushed,[`/service/checkout/${orderId}`]);assert.equal(h.calls.length,0);assert.ok(h.urls.every(u=>!u.includes('code=')));}finally{p.unmount();}
 const cancel=await probe(oneTime(new URLSearchParams({id:orderId,code:'PAY_PROCESS_CANCELED'}),()=>({})),false);try{assert.equal(cancel.get().message,'결제를 취소했습니다.');}finally{cancel.unmount();}
 const lost=await probe(oneTime(new URLSearchParams({code:'PAY_PROCESS_CANCELED'}),()=>({})),false);try{assert.equal(lost.get().retryLabel,undefined,'no checkout to return to: the page links to subscriptions instead of a broken retry');}finally{lost.unmount();}
});
