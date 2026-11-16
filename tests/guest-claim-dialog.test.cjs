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
