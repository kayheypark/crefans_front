const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const fail=message=>({success:false,data:null,errorMessage:message,errorCode:'REJECTED'});
function setup(overrides={}){
 const calls={created:[],paid:[]},model={enabled:true,signedIn:true,mode:'mock',basePath:'/preview',wallet:{accounts:[{bucket:'purchased',balance:'100'}]},refresh:async()=>{},createCharge:async(q,key)=>{calls.created.push({q,key});return ok({id:key,quantity:q,amount:q*110,status:'pending',environment:'test'});},payCharge:async(id,terms)=>{calls.paid.push(id);calls.terms=(calls.terms||[]).concat(terms);return ok({message:'대역 결제 완료'});},...overrides};
 const {BeanChargePage}=loadTypeScript('components/crefans/BeanChargePage.tsx',{'./BeanContext':{useBeans:()=>model},'next/link':({children,...p})=>React.createElement('a',p,children),'@/components/ui/InfoTooltip':{InfoTooltip:()=>null}});
 let tree;act(()=>{tree=create(React.createElement(BeanChargePage));});return{tree,calls,model};
}
const submit=tree=>tree.root.findByType('form').props.onSubmit({preventDefault(){}});
const select=(tree,q)=>act(()=>tree.root.findAllByType('input').find(n=>Number(n.props.value)===q).props.onChange({target:{checked:true}}));
// 2026-11-02: paying needs the agreement right above the button; the summary amount is the second dd (the conditions list follows).
const agree=tree=>act(()=>tree.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}}));
const amount=tree=>tree.root.findAllByType('dd')[1].children.join('');
test('nine fixed choices charge 110 KRW per bean including VAT and require a selection',async()=>{
 for(const q of [10,30,50,100,300,500,1000,5000,10000]){
  const {tree,calls}=setup();try{
   assert.equal(tree.root.findAllByType('input').length,9);
   assert.equal(tree.root.findByProps({type:'submit'}).props.disabled,true);
   await act(async()=>submit(tree));assert.equal(calls.created.length,0);
   select(tree,q);assert.equal(tree.root.findByProps({type:'submit'}).props.disabled,true,'not agreed yet');await act(async()=>submit(tree));assert.equal(calls.created.length,0);
   agree(tree);assert.equal(tree.root.findByProps({type:'submit'}).props.disabled,false);
   const option=tree.root.findAllByType('input').find(n=>Number(n.props.value)===q);
   assert.equal(amount(tree),(q*110).toLocaleString('ko-KR')+'원');assert.match(JSON.stringify(tree.toJSON()),/결제 전 확인/);
   assert.equal(option.props['aria-label'],`${q.toLocaleString('ko-KR')}콩 · ${(q*110).toLocaleString('ko-KR')}원 · VAT 포함 가격`);
   await act(async()=>submit(tree));assert.equal(calls.created.length,1);assert.equal(calls.created[0].q,q);assert.deepEqual(calls.paid,[calls.created[0].key]);assert.deepEqual(calls.terms,['2026-11-02.1']);
  }finally{act(()=>tree.unmount());}
 }
});
test('canceled payment retries its existing order and cannot change the selected package',async()=>{
 const paid=[],{tree,calls}=setup({mode:'live',payCharge:async id=>{paid.push(id);return fail('결제창 취소');}});
 try{select(tree,30);agree(tree);await act(async()=>submit(tree));assert.equal(tree.root.findByType('fieldset').props.disabled,true);select(tree,100);await act(async()=>submit(tree));assert.equal(calls.created.length,1);assert.equal(calls.created[0].q,30);assert.deepEqual(paid,[calls.created[0].key,calls.created[0].key]);assert.match(JSON.stringify(tree.toJSON()),/결제창 취소/);}finally{act(()=>tree.unmount());}
});
test('concurrent submit has one order creation and no duplicate payment request',async()=>{
 let release;const hold=new Promise(resolve=>release=resolve),calls=[];
 const {tree}=setup({createCharge:async(q,key)=>{calls.push(q);await hold;return ok({id:key,quantity:q,amount:q*110,status:'pending',environment:'test'});}});
 try{select(tree,50);agree(tree);act(()=>{submit(tree);submit(tree);});assert.deepEqual(calls,[50]);assert.equal(tree.root.findByProps({type:'submit'}).props.disabled,true);await act(async()=>{release();await hold;});}finally{act(()=>tree.unmount());}
});
test('anonymous or disabled feature never creates a charge form',()=>{
 for(const state of [{signedIn:false},{enabled:false}]){const{tree}=setup(state);try{assert.equal(tree.root.findAllByType('form').length,0);}finally{act(()=>tree.unmount());}}
});

test('a pre-existing charge keeps its stored amount when retrying after a price change',async()=>{
 const {tree,calls}=setup({mode:'live',createCharge:async(q)=>ok({id:'legacy-charge',quantity:q,amount:3000,status:'pending',environment:'test'}),payCharge:async()=>fail('결제창 취소')});
 try{select(tree,30);assert.equal(amount(tree),'3,300원');agree(tree);await act(async()=>submit(tree));assert.equal(amount(tree),'3,000원');await act(async()=>submit(tree));assert.equal(amount(tree),'3,000원');}finally{act(()=>tree.unmount());}
});
