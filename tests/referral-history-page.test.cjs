const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// Invite history (design A, 2026-11-01): masked names from the server, status chips, loading rule (/ux-spinner).
const {BeanContext}=loadTypeScript('components/crefans/BeanContext.tsx');
const {ReferralHistoryPage}=loadTypeScript('components/crefans/ReferralHistoryPage.tsx',{'next/link':({children,...props})=>React.createElement('a',props,children),'./BeanContext':{useBeans:()=>React.useContext(BeanContext),BeanContext}});
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const item=(id,status,name)=>({id,name,status,joinedAt:'2026-10-30T03:00:00Z',dueAt:status==='waiting'?'2026-11-06T03:00:00Z':null,rewardedAt:status==='rewarded'?'2026-11-01T03:00:00Z':null,rewardBeans:status==='rewarded'?100:0});
const result=items=>({success:true,errorMessage:null,errorCode:null,data:{summary:{invited:2,waiting:1,rewardBeans:100},items,total:items.length,page:1,pageSize:20}});
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}
function mount(load){const model={enabled:true,signedIn:true,basePath:'/service',referralHistory:load,referral:{holdDays:7}};let tree;act(()=>{tree=create(React.createElement(BeanContext.Provider,{value:model},React.createElement(ReferralHistoryPage)));});return tree;}
const rows=tree=>tree.root.findAll(n=>n.type==='li').map(text);
const spinners=tree=>tree.root.findAll(n=>n.props?.role==='status'&&n.props?.['aria-live']==='polite'&&typeof n.type==='string').length;
const chip=(tree,label)=>tree.root.findAll(n=>n.type==='button'&&text(n)===label)[0];

test('first load stays blank for 1s, then a spinner; the list and masked names come only with the response',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const first=deferred();const tree=mount(()=>first.promise);
 try{
  assert.equal(rows(tree).length,0);assert.equal(spinners(tree),0);assert.doesNotMatch(text(tree.toJSON()),/없어요/);
  act(()=>t.mock.timers.tick(1000));assert.equal(spinners(tree),1);
  await act(async()=>{first.resolve(result([item('a','rewarded','kay**********'),item('b','waiting','min**********')]));});
  assert.equal(spinners(tree),0);assert.deepEqual(rows(tree).map(r=>r.split(/\d/)[0]),['kay**********','min**********']);assert.match(rows(tree)[0],/\+100콩/);assert.match(rows(tree)[1],/확정 대기/);
 }finally{act(()=>tree.unmount());}
});
test('switching a filter keeps the previous list (overlay spinner after 1s) and only the last request is applied',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const calls=[];const pending=[];
 const tree=mount(query=>{calls.push(query.status||'all');const d=deferred();pending.push(d);return d.promise;});
 try{
  await act(async()=>{pending[0].resolve(result([item('a','rewarded','kay**********'),item('b','waiting','min**********')]));});
  act(()=>chip(tree,'가입').props.onClick());act(()=>chip(tree,'확정 대기').props.onClick());
  assert.deepEqual(calls,['all','joined','waiting']);assert.equal(rows(tree).length,2,'previous list stays');assert.equal(spinners(tree),0);
  act(()=>t.mock.timers.tick(1000));assert.equal(spinners(tree),1);
  await act(async()=>{pending[2].resolve(result([item('b','waiting','min**********')]));});
  await act(async()=>{pending[1].resolve(result([item('c','joined','joo**********')]));});
  assert.equal(rows(tree).length,1);assert.match(rows(tree)[0],/^min/,'a late older response is ignored');
 }finally{act(()=>tree.unmount());}
});
test('empty and error answers appear only after the response',async()=>{
 let tree=mount(async()=>result([]));await act(async()=>{});try{assert.match(text(tree.toJSON()),/아직 초대로 가입한 친구가 없어요/);}finally{act(()=>tree.unmount());}
 tree=mount(async()=>({success:false,data:null,errorMessage:'불러오지 못했어요',errorCode:'X'}));await act(async()=>{});try{assert.match(text(tree.toJSON()),/불러오지 못했어요/);assert.doesNotMatch(text(tree.toJSON()),/없어요/);}finally{act(()=>tree.unmount());}
});
