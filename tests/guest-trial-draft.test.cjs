// 2026-11-23 user request (C 테스트): a trial draft survives sign-up — summarized for the link question, handed to the member after linking.
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const lib=loadTypeScript('lib/crefans/guest-trial-draft.ts',{});
const KEY='crefans:guest-trial-draft';
function withStore(run){const store=new Map(),prev=global.localStorage;global.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};try{return run(store);}finally{global.localStorage=prev;}}
const media=[{id:'up1',type:'image',url:'/api/v1/media/up1/file'},{id:'ai1',type:'image',url:'/api/v1/media/ai1/file',aiGenerated:true}];
test('summary counts photos of a live trial draft only',()=>withStore(store=>{
 assert.equal(lib.guestTrialDraftSummary(),null);
 store.set(KEY,JSON.stringify({at:Date.now(),owner:'guest:abc',media,title:'제목',body:''}));assert.deepEqual(lib.guestTrialDraftSummary(),{photos:2,text:true});
 store.set(KEY,JSON.stringify({at:Date.now()-25*3600000,owner:'guest:abc',media,title:'',body:''}));assert.equal(lib.guestTrialDraftSummary(),null,'expired');
 store.set(KEY,JSON.stringify({at:Date.now(),owner:'member:m1',media,title:'',body:''}));assert.equal(lib.guestTrialDraftSummary(),null,'already handed over');
 store.set(KEY,JSON.stringify({at:Date.now(),owner:'guest:abc',media:[],title:' ',body:''}));assert.equal(lib.guestTrialDraftSummary(),null,'empty');
}));
test('adopt hands the trial draft to the member; the member loader leaves other drafts in place',()=>withStore(store=>{
 assert.equal(lib.adoptGuestTrialDraft('m1'),false,'nothing to adopt');
 store.set(KEY,JSON.stringify({at:Date.now()-3600000,owner:'guest:abc',media,title:'제목',body:'본문'}));
 assert.equal(lib.loadGuestTrialDraft(lib.memberDraftOwner('m1'),Date.now(),false),null);assert.ok(store.has(KEY),'not removed by the member loader');
 assert.equal(lib.adoptGuestTrialDraft(undefined),false);assert.equal(lib.adoptGuestTrialDraft('m1'),true);
 assert.equal(JSON.parse(store.get(KEY)).owner,'member:m1');
 const draft=lib.loadGuestTrialDraft('member:m1',Date.now(),false);assert.deepEqual(draft.media.map(m=>m.id),['up1','ai1']);assert.equal(draft.title,'제목');assert.equal(draft.body,'본문');
 assert.equal(lib.adoptGuestTrialDraft('m2'),false,'a handed-over draft is not handed again');
 assert.equal(lib.loadGuestTrialDraft('guest:abc'),null);assert.ok(!store.has(KEY),'the trial loader still drops a draft that is not its own');
}));
