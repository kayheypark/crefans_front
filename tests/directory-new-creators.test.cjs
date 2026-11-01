const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
test('directory keeps newest cards across paging and ignores a stale search response',async t=>{
 let model,resolveOld;const errors=[],onError=msg=>errors.push(msg);
 const {useDirectoryModel}=loadTypeScript('features/service/useDirectoryModel.ts',{'@/lib/api/platform':{platformRequest:async path=>{
  const p=new URL(path,'https://example.invalid').searchParams;
  if(p.get('query')==='old')return new Promise(resolve=>{resolveOld=resolve;});
  if(p.has('cursor'))return ok({creators:[{id:'page2'}],newCreators:[],nextCursor:null});
  return ok({creators:[{id:'page1'}],newCreators:[{id:p.get('query')||'newest'}],nextCursor:'cursor'});
 }}});
 function Probe(){model=useDirectoryModel(true,onError);return null;}let tree;await act(async()=>{tree=create(React.createElement(Probe));});t.after(()=>act(()=>tree.unmount()));
 const settle=()=>act(()=>new Promise(resolve=>setTimeout(resolve,280)));
 await settle();assert.deepEqual(model.newCreators.map(c=>c.id),['newest']);
 await act(async()=>model.loadMore());assert.deepEqual(model.newCreators.map(c=>c.id),['newest']);assert.equal(model.creators.length,2);
 act(()=>model.search('old','전체'));await settle();act(()=>model.search('latest','전체'));await settle();
 await act(async()=>resolveOld(ok({creators:[{id:'stale'}],newCreators:[{id:'stale'}],nextCursor:null})));
 assert.deepEqual(model.newCreators.map(c=>c.id),['latest']);assert.deepEqual(errors,[]);
});
