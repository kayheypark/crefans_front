const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');global.IS_REACT_ACT_ENVIRONMENT=true;
const {AiPhotoWaiting}=loadTypeScript('components/crefans/studio/AiPhotoWaiting.tsx',{'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})}});
// 2026-11-15 사용자 변경: 3줄, 하트·별사탕·달 같은 속도(4.5초), 하트 5개마다 빨라짐, 하단 설명 문구 없음.
test('equal-speed pieces on three lanes, five-heart difficulty, miss penalties and immediate hard cap at thirty',async()=>{
 const old={interval:global.setInterval,clear:global.clearInterval,random:Math.random};let tick,cleared=0,score=0,r;
 global.setInterval=fn=>{tick=fn;return 1};global.clearInterval=()=>cleared++;Math.random=()=>0;
 try{await act(async()=>{r=create(React.createElement(AiPhotoWaiting,{elapsed:1,score:0,onCollect:delta=>{score+=delta}}))});const pieces=()=>r.root.findAll(n=>n.type==='button');const field=()=>r.root.findByProps({className:'heartPlayfield'});let stopped=0;const click=async piece=>act(async()=>piece.props.onClick({stopPropagation(){stopped++}}));
 assert.equal(pieces()[0].props.style.animationDuration,'4.5s');assert.equal(pieces()[1].props.style.animationDuration,'4.5s','a candy moves at the heart speed');assert.equal(pieces()[3].props.style.animationDuration,'4.5s','a moon moves at the heart speed');assert.deepEqual([...new Set(pieces().map(p=>p.props.style.top))],['8%','38%','68%'],'three lanes');assert.doesNotMatch(JSON.stringify(r.toJSON()),/하트 \+1 · 별사탕/,'no footer hint');await act(async()=>field().props.onClick());assert.equal(score,0);
 await click(pieces()[0]);assert.equal(score,1);await click(pieces()[0]);assert.equal(score,1);await act(async()=>field().props.onClick());assert.equal(score,0);
 await click(pieces()[2]);await click(pieces()[4]);await click(pieces()[1]);assert.equal(score,1);
 async function spawn(){await act(async()=>tick());return pieces().at(-1)}
 await click(await spawn());const fifth=await spawn();assert.equal(fifth.props.style.animationDuration,'4.5s');await click(fifth);const sixth=await spawn();assert.ok(parseFloat(sixth.props.style.animationDuration)<4.5);await click(sixth);
 for(let i=0;i<40&&score<30;i++)await click(await spawn());assert.equal(score,30);assert.equal(pieces().length,0);assert.ok(cleared>=1);assert.ok(r.root.findByProps({role:'status'}));await act(async()=>field().props.onClick());assert.equal(score,30);assert.ok(stopped>0);
 await act(async()=>r.unmount());
 }finally{global.setInterval=old.interval;global.clearInterval=old.clear;Math.random=old.random;}
});

// 2026-11-21 user request: empty-space taps show "−1" where the finger landed, and every penalty (empty space or a
// non-heart piece) flashes the red hit vignette; collecting a heart does not.
test('miss feedback: −1 at the tap point and a red hit vignette for each penalty, none for hearts',async()=>{
 const old={interval:global.setInterval,clear:global.clearInterval,random:Math.random};let score=0,r;
 global.setInterval=()=>1;global.clearInterval=()=>{};Math.random=()=>0;
 try{
  await act(async()=>{r=create(React.createElement(AiPhotoWaiting,{elapsed:1,score:2,onCollect:delta=>{score+=delta}}))});
  const field=()=>r.root.findByProps({className:'heartPlayfield'});
  const flashes=()=>r.root.find(n=>typeof n.props.flash==='number').props.flash;
  const vignette=()=>r.root.findAll(n=>n.props['data-testid']==='heart-hit-vignette');
  const marks=()=>r.root.findAll(n=>n.props['data-testid']==='heart-miss');
  const piece=kind=>r.root.findAll(n=>n.type==='button').find(p=>p.props['data-kind']===kind);
  assert.equal(flashes(),0);assert.equal(vignette().length,0,'no vignette before any penalty');
  await act(async()=>field().props.onClick({clientX:160,clientY:90,currentTarget:{getBoundingClientRect:()=>({left:100,top:50})}}));
  assert.equal(score,-1);assert.equal(flashes(),1);assert.equal(vignette().length,1);assert.equal(vignette()[0].props.popover,'manual');assert.equal(vignette()[0].props['aria-hidden'],'true');
  assert.equal(marks().length,1);assert.deepEqual(marks()[0].props.style,{left:60,top:40},'the mark sits where the tap landed');assert.equal(marks()[0].children.join(''),'−1');
  await act(async()=>piece('heart').props.onClick({stopPropagation(){}}));
  assert.equal(score,0);assert.equal(flashes(),1,'a heart does not flash');assert.equal(marks().length,1,'a heart adds no miss mark');
  await act(async()=>piece('candy').props.onClick({stopPropagation(){}}));
  assert.equal(score,-1);assert.equal(flashes(),2,'a candy penalty flashes again');assert.equal(marks().length,1,'pieces keep their own −1 burst');
  await act(async()=>field().props.onClick());
  assert.equal(flashes(),3);assert.equal(marks().length,2,'a click without coordinates still shows a mark');
  await act(async()=>r.unmount());
 }finally{global.setInterval=old.interval;global.clearInterval=old.clear;Math.random=old.random;}
});
