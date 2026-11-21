// 2026-11-21 이탈 분석 수정안 1·2의 회귀 검사.
// 1) 생성 실패(NETWORK_ERROR 등) 뒤에도 서버 잔액을 다시 읽는다. 예전에는 한도 오류일 때만 다시 읽어, 서버에서 이미 차감된
//    잔액이 화면에 남고 다음 시도가 곧바로 한도 초과로 막혔다(01a1fb27).
// 2) 사진 결정 뒤 편집기 초기화도 처음 열 때와 같은 기본 생성 방식(표준, AI_PHOTO_DEFAULT_METHOD)을 쓴다.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const fail=errorCode=>({success:false,data:null,errorMessage:'요청을 처리하지 못했어요.',errorCode});
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');

test('guest trial: a NETWORK_ERROR generation re-reads the trial balance and shows the server value',async()=>{
 let remaining=1;const calls=[];let model,tree;
 const {useGuestTrialModel}=loadTypeScript('features/service/useGuestTrialModel.ts',{
  '@/lib/api/platform':{platformRequest:async path=>{calls.push(path);if(path==='/guest/session')return ok({active:true,consentVersion:'v',limit:3,postHours:24,remaining});if(path==='/guest/ai-photo/edit')return fail('NETWORK_ERROR');return ok({});}},
  '@/lib/analytics/posthog':{aiProps:()=>({}),captureEvent:()=>{},replaySessionId:async()=>null,setReplayInlineImages:()=>{},setReplayUnmasked:()=>{}},
  '@/lib/api/funnel':{rememberEntrySource:()=>undefined},'@/lib/api/share-report':{reportShare:()=>{}},
  '@/lib/design/image-optimize':{optimizeImage:async f=>f},'./useStudioModel':{aiPhotoEditBody:x=>x},
 });
 function Probe(){model=useGuestTrialModel(true);return null;}
 await act(async()=>{tree=create(el(Probe));});
 try{
  assert.equal(model.session.remaining,1);
  remaining=0;calls.length=0; // the server charged the request whose response never reached the browser
  let result;await act(async()=>{result=await model.aiEdit({source:{id:'s'},kind:'pose',style:'photo',prompt:'x',consent:true});});
  assert.equal(result.errorCode,'NETWORK_ERROR','the failure is still returned to the editor');
  assert.deepEqual(calls,['/guest/ai-photo/edit','/guest/session'],'one balance re-read after the failure');
  assert.equal(model.session.remaining,0,'the displayed balance follows the server');
 }finally{act(()=>tree.unmount());}
});

test('member studio: a NETWORK_ERROR generation re-reads the AI quota and shows the server value',async()=>{
 let remaining=10;const calls=[];let model,tree;
 const {useStudioModel}=loadTypeScript('features/service/useStudioModel.ts',{'next/navigation':{useSearchParams:()=>new URLSearchParams()},'@/lib/api/platform':{platformRequest:async path=>{
  calls.push(path);if(path==='/studio/ai-photo/quota')return ok({allowed:true,remaining,limit:10,typicalSeconds:null});if(path==='/studio/ai-photo/edit')return fail('NETWORK_ERROR');return ok({management:{}});
 }}});
 function Probe(){model=useStudioModel(true);return null;}
 await act(async()=>{tree=create(el(Probe));});
 try{
  assert.equal(model.management.aiPhotoQuota.remaining,10);
  remaining=9;calls.length=0;
  await act(async()=>{await model.management.actions.aiEditPhoto({source:{id:'s'},kind:'pose',style:'photo',prompt:'x',consent:true});});
  assert.equal(calls.filter(path=>path==='/studio/ai-photo/quota').length,1,'one quota re-read after the failure');
  assert.equal(model.management.aiPhotoQuota.remaining,9);
 }finally{act(()=>tree.unmount());}
});

test('deciding a photo resets the generation method to the standard default, like the first open',async()=>{
 const {AI_PHOTO_DEFAULT_METHOD}=loadTypeScript('lib/crefans/ai-photo.ts');
 assert.equal(AI_PHOTO_DEFAULT_METHOD.value,'standard');
 const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',{'data-mask-editor':true,...props}),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}});
 const added=[];let r;
 const onEdit=async()=>ok({images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:8});
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[{id:'p1',type:'image',url:'/p1.png'}],quota:{remaining:10,limit:10},room:9,onEdit,onAdd:x=>added.push(...x)}));});
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&(text(n).includes(name)||String(n.props['aria-label']||'').includes(name))).props.onClick();});
 const radio=value=>r.root.find(n=>n.type==='input'&&n.props.type==='radio'&&n.props.value===value);
 try{
  await click('여성');
  assert.equal(radio('standard').props.checked,true,'first open uses the default');
  await act(async()=>radio('precise').props.onChange());assert.equal(radio('precise').props.checked,true);
  await click('만들기');await click('이 사진으로 만들기');await click('사진 결정');
  assert.equal(added.length,1,'the result was added to the post');
  await click('여성'); // deciding clears the gender choice; the method cards show again once it is picked
  assert.equal(radio('standard').props.checked,true,'after deciding, the editor is back on the standard default');
  assert.equal(radio('fast').props.checked,false,'not the first list item (fast)');
 }finally{await act(async()=>r.unmount());}
});
