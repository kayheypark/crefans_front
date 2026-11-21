const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');global.IS_REACT_ACT_ENVIRONMENT=true;
const {AiPhotoDone,AI_PHOTO_DONE_MS,AI_PHOTO_TAP_LOCK_MS}=loadTypeScript('components/crefans/studio/AiPhotoDone.tsx',{'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})}});
// 2026-11-21 user request: a "사진이 완료됐어요" layer covers the screen briefly before the result, swallowing taps.
test('완료 layer shows, swallows taps and closes itself after its time',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let done=0,r;
 await act(async()=>{r=create(React.createElement(AiPhotoDone,{show:1,onDone:()=>done++}))});
 const layer=r.root.findByProps({'data-testid':'ai-photo-done'});
 assert.equal(layer.props.role,'status');assert.match(JSON.stringify(r.toJSON()),/생성이 완료됐어요/);
 let stopped=0;const ev={preventDefault(){stopped++},stopPropagation(){stopped++}};layer.props.onPointerDown(ev);layer.props.onClick(ev);assert.equal(stopped,4,'taps never reach the result below');
 await act(async()=>t.mock.timers.tick(AI_PHOTO_DONE_MS-1));assert.equal(done,0);await act(async()=>t.mock.timers.tick(1));assert.equal(done,1);
 assert.ok(AI_PHOTO_TAP_LOCK_MS>AI_PHOTO_DONE_MS,'taps stay locked a little after the layer');
 await act(async()=>r.update(React.createElement(AiPhotoDone,{show:0,onDone(){}})));assert.equal(r.toJSON(),null);
});
test('dialog: layer only after a made photo, taps locked meanwhile, a single result keeps its check',()=>{
 const src=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8');
 assert.match(src,/if\(madeOk\)\{tapLockUntil\.current=Date\.now\(\)\+AI_PHOTO_TAP_LOCK_MS;setDoneLayer\(Date\.now\(\)\);\}setBusy\(false\);/);
 assert.match(src,/function toggle\(id:string\)\{if\(Date\.now\(\)<tapLockUntil\.current\)return;setSelected\(previous=>previous\.includes\(id\)\?\(results\.length===1\?previous:/);
 assert.match(src,/<AiPhotoDone show=\{doneLayer\} onDone=\{\(\)=>setDoneLayer\(0\)\}\/>/);
});
