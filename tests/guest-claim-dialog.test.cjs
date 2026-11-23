// 2026-11-16 user decision: after signing in, trial posts are linked only when the member agrees.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement,css=new Proxy({},{get:(_,k)=>String(k)}),words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(''):(n.children||[]).map(words).join('');
const {GuestClaimDialog}=loadTypeScript('components/service/GuestClaimDialog.tsx',{'./guest-claim.module.css':css,'@/components/ui/Primitives':{Dialog:({open,children,title})=>open?el('dialog',{title},children):null},'@/components/crefans/ServiceUI':{Action:({children,variant,...p})=>el('button',p,children)}});
test('asks with the post count; 연동하기 accepts, 연동하지 않을게요 declines; nothing shows without a prompt',async()=>{
 const calls=[];const claim={posts:3,busy:false,accept:async()=>{calls.push('accept');},decline:()=>calls.push('decline')};
 let t;act(()=>{t=create(el(GuestClaimDialog,{claim}));});
 assert.match(words(t.toJSON()),/3개/);assert.match(words(t.toJSON()),/24시간/);
 const button=label=>t.root.findAllByType('button').find(b=>words(b.props.children)===label);
 await act(async()=>button('내 계정에 연동하기').props.onClick());act(()=>button('연동하지 않을게요').props.onClick());
 assert.deepEqual(calls,['accept','decline']);
 act(()=>t.update(el(GuestClaimDialog,{claim:{...claim,busy:true}})));assert.equal(button('연동하는 중…').props.disabled,true);assert.equal(button('연동하지 않을게요').props.disabled,true);
 act(()=>t.update(el(GuestClaimDialog,{claim:null})));assert.equal(t.toJSON(),null);act(()=>t.unmount());
});

// 2026-11-23 user request (C 테스트): a visitor who signed up while still writing is asked to bring the draft; after linking the editor opens.
test('a draft without posts asks to bring it; linking opens the editor, a failed link does not; with posts the draft is mentioned',async()=>{
 const calls=[];let ok=true;const claim={posts:0,draftPhotos:2,busy:false,accept:async()=>{calls.push('accept');return ok;},decline:()=>calls.push('decline')};
 let t;act(()=>{t=create(el(GuestClaimDialog,{claim,onDraftLinked:()=>calls.push('open-editor')}));});
 const text=words(t.toJSON());assert.match(text,/작성하던 글과 사진 2장을/);assert.equal(t.toJSON().props.title,'체험 내용 가져오기');
 const button=label=>t.root.findAllByType('button').find(b=>words(b.props.children)===label);
 await act(async()=>button('가져와서 이어 쓰기').props.onClick());assert.deepEqual(calls,['accept','open-editor']);
 ok=false;await act(async()=>button('가져와서 이어 쓰기').props.onClick());assert.deepEqual(calls,['accept','open-editor','accept'],'no editor after a failed link');
 act(()=>button('가져오지 않을게요').props.onClick());assert.equal(calls.at(-1),'decline');
 act(()=>t.update(el(GuestClaimDialog,{claim:{...claim,posts:1}})));assert.match(words(t.toJSON()),/1개/);assert.match(words(t.toJSON()),/사진 2장도 함께 가져와/);
 act(()=>t.update(el(GuestClaimDialog,{claim:{posts:1,busy:false,accept:async()=>true,decline(){}}})));assert.doesNotMatch(words(t.toJSON()),/함께 가져와/,'no draft, no mention');
 act(()=>t.unmount());
});
