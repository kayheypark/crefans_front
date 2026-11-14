const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');global.IS_REACT_ACT_ENVIRONMENT=true;
const {AiPhotoWaiting}=loadTypeScript('components/crefans/studio/AiPhotoWaiting.tsx',{'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})}});
test('fast hazards, five-heart difficulty, miss penalties and immediate hard cap at thirty',async()=>{
 const old={interval:global.setInterval,clear:global.clearInterval,random:Math.random};let tick,cleared=0,score=0,r;
 global.setInterval=fn=>{tick=fn;return 1};global.clearInterval=()=>cleared++;Math.random=()=>0;
 try{await act(async()=>{r=create(React.createElement(AiPhotoWaiting,{elapsed:1,score:0,onCollect:delta=>{score+=delta}}))});const pieces=()=>r.root.findAll(n=>n.type==='button');const field=()=>r.root.findByProps({className:'heartPlayfield'});let stopped=0;const click=async piece=>act(async()=>piece.props.onClick({stopPropagation(){stopped++}}));
 assert.equal(pieces()[0].props.style.animationDuration,'5s');assert.equal(pieces()[1].props.style.animationDuration,'3.2s');await act(async()=>field().props.onClick());assert.equal(score,0);
 await click(pieces()[0]);assert.equal(score,1);await click(pieces()[0]);assert.equal(score,1);await act(async()=>field().props.onClick());assert.equal(score,0);
 await click(pieces()[2]);await click(pieces()[4]);await click(pieces()[1]);assert.equal(score,1);
 async function spawn(){await act(async()=>tick());return pieces().at(-1)}
 await click(await spawn());const fifth=await spawn();assert.equal(fifth.props.style.animationDuration,'5s');await click(fifth);const sixth=await spawn();assert.ok(parseFloat(sixth.props.style.animationDuration)<5);await click(sixth);
 for(let i=0;i<40&&score<30;i++)await click(await spawn());assert.equal(score,30);assert.equal(pieces().length,0);assert.ok(cleared>=1);assert.ok(r.root.findByProps({role:'status'}));await act(async()=>field().props.onClick());assert.equal(score,30);assert.ok(stopped>0);
 await act(async()=>r.unmount());
 }finally{global.setInterval=old.interval;global.clearInterval=old.clear;Math.random=old.random;}
});
