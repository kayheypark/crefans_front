// 2026-11-19 user request: short AI result share link (/s). 2026-11-20 user decision: the share reward is paid at the first share
// (share sheet finished or link copied), so links carry no code and visits pay nothing.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});

test('/s and old /s/<code> links redirect (302, noindex) to the landing with share tags and no code',async()=>{
 const nextServer={NextResponse:class{constructor(body,init){this.status=init.status;this.headers=new Map(Object.entries(init.headers));}}};
 const route=loadTypeScript('app/s/[[...code]]/route.ts',{'next/server':nextServer});
 const r=await route.GET();assert.equal(r.status,302);assert.equal(r.headers.get('X-Robots-Tag'),'noindex');
 assert.equal(r.headers.get('location'),'/service/landing-ai-image-generation?utm_source=crefans_share&utm_medium=share&utm_campaign=ai_photo&utm_content=result');
 assert.equal(fs.existsSync('lib/api/ai-result-share.ts'),false,'no share token or visit report code is left');
 assert.doesNotMatch(fs.readFileSync('features/service/useFunnelStep.ts','utf8'),/ShareVisit/);
});

test('the share sheet calls no API, offers the plain /s link and reports a copy as done',async()=>{
 const {AiResultShare}=loadTypeScript('components/crefans/studio/AiResultShare.tsx',{'./ai-photo.module.css':{__esModule:true,default:styles},'@/components/ui/Primitives':{Dialog:({children})=>React.createElement('section',null,children)}});
 assert.doesNotMatch(fs.readFileSync('components/crefans/studio/AiResultShare.tsx','utf8'),/lib\/api/,'presentation does not import API modules');
 const reports=[],copied=[];
 global.window={location:{origin:'https://crefans.com'}};Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:async text=>{copied.push(text);}}},configurable:true});
 let tree;
 try{
  await act(async()=>{tree=create(React.createElement(AiResultShare,{item:{id:'m1',url:'/m1.png'},eligible:true,prepare:async()=>({name:'a.png'}),onReport:r=>reports.push(r),onClose(){}}));});
  const text=JSON.stringify(tree.toJSON());assert.match(text,/링크를 복사하면 이용권 3장을 바로 받을 수 있어요/);assert.doesNotMatch(text,/첫 방문이 확인되면/);
  await act(async()=>tree.root.findAll(n=>n.type==='button'&&n.props.children==='링크 복사')[0].props.onClick());
  assert.deepEqual(copied,['https://crefans.com/s']);assert.deepEqual(reports,[{where:'ai_result',method:'copy',outcome:'done'}]);
 }finally{if(tree)await act(async()=>tree.unmount());delete global.window;delete global.navigator;}
});

test('the guest model pays the share reward through share-done and refreshes the session',async()=>{
 const sent=[];let state=null;
 const mocks={react:{useState:init=>[init,next=>{state=next;}],useCallback:fn=>fn,useEffect:()=>{}},
  '@/lib/api/platform':{platformRequest:async(path,body)=>{sent.push([path,body]);return path==='/guest/ai-photo/share-done'?{success:true,data:{granted:true}}:{success:true,data:{active:true,shareRewardClaimed:true}};}},
  '@/lib/design/image-upload':{imageUploadMaxBytes:1,imageUploadMaxLabel:'1B'},'@/lib/design/image-optimize':{optimizeImage:async f=>f},
  './useStudioModel':{aiPhotoEditBody:x=>x},'@/lib/analytics/posthog':{aiProps:()=>({}),captureEvent(){},setReplayUnmasked(){}},'@/lib/api/share-report':{reportShare(){}}};
 const guest=loadTypeScript('features/service/useGuestTrialModel.ts',mocks).useGuestTrialModel(false);
 assert.equal(await guest.shareDone('m1'),true);
 assert.deepEqual(sent,[['/guest/ai-photo/share-done',{mediaId:'m1'}],['/guest/session',undefined]]);assert.equal(state.shareRewardClaimed,true);
});

test('result link mode shares the selected result URL and never falls back to the landing on failure',async()=>{
 const {AiResultShare}=loadTypeScript('components/crefans/studio/AiResultShare.tsx',{'./ai-photo.module.css':{__esModule:true,default:styles},'@/components/ui/Primitives':{Dialog:({children})=>React.createElement('section',null,children)}});
 const url='https://example.test/r/'+'a'.repeat(32),copied=[],reports=[];
 Object.defineProperty(global,'navigator',{value:{clipboard:{writeText:async text=>copied.push(text)}},configurable:true});
 const props={item:{id:'result',url:'/private'},eligible:false,prepare:()=>{throw Error('link sharing must not fetch a file');},onReport:r=>reports.push(r),onClose(){}};
 let tree;
 try{
  await act(async()=>{tree=create(React.createElement(AiResultShare,{...props,createLink:async()=>url}));});
  const share=()=>tree.root.findAllByType('button').find(b=>b.props.children==='결과 링크 공유');
  await act(async()=>share().props.onClick());
  assert.deepEqual(copied,[url]);assert.equal(reports[0].method,'copy');
  const shared=[];navigator.share=async payload=>shared.push(payload);
  await act(async()=>share().props.onClick());assert.deepEqual(shared,[{url}]);
  await act(async()=>tree.unmount());
  await act(async()=>{tree=create(React.createElement(AiResultShare,{...props,createLink:async()=>{throw Error('공유할 수 없는 결과예요.');}}));});
  assert.equal(share().props.disabled,true);assert.match(JSON.stringify(tree.toJSON()),/공유할 수 없는 결과/);
 }finally{if(tree)await act(async()=>tree.unmount());delete global.navigator;}
});
