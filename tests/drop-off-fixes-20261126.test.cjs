// 2026-11-26 이탈 분석 수정안 A·B·E의 회귀 검사.
// A) 만들기가 서버 요청 전에 막히면(프롬프트 없음 등) 고정 사유 코드 하나만 ai_generation_blocked로 남긴다. 문구·프롬프트는 보내지 않는다.
// B) 체험 동의 직후 샘플 사진 업로드 중에는 AI 사진 편집 버튼이 disabled라 눌러도 반응이 없었다(dead click).
//    업로드 중 누르면 요청을 기억했다가 업로드가 끝나면 편집기를 연다. 업로드가 실패하면 열지 않는다.
// E) 체험 편집기의 뒤로가기(피드로) 클릭을 guest_editor_back으로 남긴다. 목적지는 그대로 피드다.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');

test('A: 만들기 over the length limit reports one ai_generation_blocked with a fixed reason and no text',async()=>{
 const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',props),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'./ai-photo.module.css':styles,'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}});
 const tracked=[];let edits=0,r;
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[{id:'p1',type:'image',url:'/p1.png'}],quota:{remaining:10,limit:10},room:9,onEdit:async()=>{edits++;return {success:false,data:null,errorMessage:'x',errorCode:'X'};},onAdd(){},onTrack:(step,props)=>tracked.push([step,props])}));});
 const click=async name=>act(async()=>{r.root.find(node=>node.type==='button'&&(text(node).includes(name)||String(node.props['aria-label']||'').includes(name))).props.onClick();});
 try{
  await click('여성');await click('일반 모드');
  // Over the 2000-character limit: stopped in the browser before any request.
  await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'가'.repeat(2001)}}));
  await click('만들기');
  const confirm=r.root.findAll(node=>node.type==='button'&&text(node).includes('이 사진으로 만들기'));
  if(confirm.length)await act(async()=>confirm[0].props.onClick());
  const blocked=tracked.filter(([step])=>step==='ai_generation_blocked');
  assert.equal(edits,0,'nothing was sent');
  assert.deepEqual(blocked,[['ai_generation_blocked',{mode:'general',reason:'too_long'}]]);
  assert.deepEqual(Object.keys(blocked[0][1]),['mode','reason'],'no prompt, text or ids');
 }finally{act(()=>r.unmount());}
});

test('A: the guest model forwards only the reason code to PostHog',()=>{
 const calls=[];
 const {useGuestTrialModel}=loadTypeScript('features/service/useGuestTrialModel.ts',{
  '@/lib/api/platform':{platformRequest:async()=>({success:true,data:{active:true,consentVersion:'v',limit:3,postHours:24,remaining:3},errorMessage:null,errorCode:null})},
  '@/lib/analytics/posthog':{aiProps:()=>({}),captureEvent:(name,props)=>calls.push([name,props]),replaySessionId:async()=>null,setReplayInlineImages:()=>{},setReplayUnmasked:()=>{}},
  '@/lib/api/funnel':{rememberEntrySource:()=>undefined},'@/lib/api/share-report':{reportShare:()=>{}},
  '@/lib/design/image-optimize':{optimizeImage:async f=>f},'./useStudioModel':{aiPhotoEditBody:()=>new FormData()},
 });
 let model,tree;function Probe(){model=useGuestTrialModel(true);return null;}
 act(()=>{tree=create(el(Probe));});
 try{
  calls.length=0;
  model.track('ai_generation_blocked',{mode:'cosplay',reason:'mask'});
  assert.deepEqual(calls,[['ai_generation_blocked',{actor:'guest',mode:'cosplay',reason:'mask'}]]);
  calls.length=0;model.backClick();
  assert.deepEqual(calls,[['guest_editor_back',{actor:'guest'}]],'E: back click is one event with the actor only');
 }finally{act(()=>tree.unmount());}
});

// Shared harness for the guest trial editor (same mocks as content-post-preview.test.cjs).
const {Field,TextAreaField}=loadTypeScript('components/ui/Field.tsx',{'./field.module.css':styles});
const ui={Action:({variant,...props})=>el('button',props),ActionLink:({variant,...props})=>el('a',props),Avatar:()=>null,Empty:({title})=>el('h2',null,title),PageTitle:({children,back,action})=>el('header',null,back,el('h1',null,children),action),Notice:({children})=>el('p',null,children)};
let aiProps=null;
const mocks={
 './social.module.css':styles,'./chip-row.module.css':styles,'./content-post-preview.module.css':styles,'./phone-frame.module.css':styles,'./management.module.css':styles,'./back-button.module.css':styles,
 './Icon':()=>null,'../Icon':()=>null,'./ServiceUI':ui,'../ServiceUI':ui,'next/link':({href,children,...props})=>el('a',{href,...props},children),'@/components/ui/TextLink':{TextLink:({children,...props})=>el('a',props,children)},
 '@/components/ui/SelectField':{SelectField:()=>null},'@/components/ui/BenefitsField':{},'@/components/ui/ImageUpload':{},'@/components/ui/Toggle':{Toggle:()=>null},'@/components/ui/MediaUpload':{MediaUpload:({items})=>el('div',{'data-count':items.length})},
 '@/components/ui/DataTable':{},'@/components/ui/Pagination':{Pagination:()=>null},'@/components/ui/DialogActions':{DialogActions:({children})=>el('footer',null,children)},
 '@/components/ui/Primitives':{Field,TextAreaField,Dialog:({open,children})=>open?el('section',null,children):null},
 './AiPhotoDialog':{AiPhotoDialog:props=>{aiProps=props;return null;}},
};
const {BackButton}=loadTypeScript('components/crefans/BackButton.tsx',mocks);
const {ContentEditorPage}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',{...mocks,'./BackButton':{BackButton},'../BackButton':{BackButton},'@/components/crefans/BackButton':{BackButton},'next/navigation':{useRouter:()=>({push(){}})}});
const sample={id:'sample-1',type:'image',url:'/api/v1/media/sample-1/file'};

async function trialEditor(upload,extra={}){
 const previousFetch=global.fetch;global.fetch=async()=>new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/webp'}});
 aiProps=null;let quotaReads=0,view;
 const management={now:'2026-11-26T00:00:00.000Z',contents:[],memberships:[],subscribers:[],aiPhotoQuota:{remaining:3,limit:3},actions:{saveContent:async()=>({success:false}),uploadContentMedia:upload,discardContentMedia(){},aiEditPhoto:async()=>({success:false}),refreshAiPhotoQuota:async()=>{quotaReads++;}}};
 await act(async()=>{view=create(el(ContentEditorPage,{model:management,basePath:'/service/try',guest:{authorId:'g-test',backHref:'/service/feed',doneHref:'/service/try/done',notice:'안내',samplePhoto:{url:'/sample.webp',name:'sample.webp'},...extra}}));});
 const aiButton=()=>view.root.findByProps({'aria-label':'AI 사진 편집'});
 return {view,aiButton,quotaReads:()=>quotaReads,done(){global.fetch=previousFetch;act(()=>view.unmount());}};
}
function deferred(){let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};}

test('B: tapping AI 사진 편집 while the sample photo uploads opens the editor once the upload finishes',async()=>{
 const pending=deferred();const t=await trialEditor(()=>pending.promise);
 try{
  assert.equal(aiProps.open,false);
  assert.notEqual(t.aiButton().props.disabled,true,'the button reacts during the upload');
  assert.match(text(t.aiButton()),/사진 준비 중이에요/);
  act(()=>t.aiButton().props.onClick());
  assert.equal(aiProps.open,false,'not opened before the photo is ready');
  assert.match(text(t.aiButton()),/사진 준비가 끝나면 바로 열려요/);
  await act(async()=>{pending.resolve({success:true,data:sample});await pending.promise;});
  assert.equal(aiProps.open,true,'opened after the upload');
  assert.deepEqual(aiProps.images.map(item=>item.id),['sample-1'],'on the uploaded sample');
  assert.equal(t.quotaReads(),1,'the remaining count is read once on open');
 }finally{t.done();}
});

test('B: a tap during an upload that then fails does not open the editor',async()=>{
 const pending=deferred();const t=await trialEditor(()=>pending.promise);
 try{
  act(()=>t.aiButton().props.onClick());
  await act(async()=>{pending.resolve({success:false,data:null,errorMessage:'업로드 실패',errorCode:'X'});await pending.promise;});
  assert.equal(aiProps.open,false,'the kept tap is dropped');
  assert.match(text(t.aiButton()),/메이크업/,'the button is back to normal');
  act(()=>t.aiButton().props.onClick());
  assert.equal(aiProps.open,true,'a new tap after the failure opens as before');
 }finally{t.done();}
});

test('E: the trial editor back link still goes to the feed and reports the click',async()=>{
 let backs=0;const t=await trialEditor(async()=>({success:true,data:sample}),{onBack:()=>{backs++;}});
 try{
  const back=t.view.root.find(node=>node.type==='a'&&node.props['aria-label']==='피드로 돌아가기');
  assert.equal(back.props.href,'/service/feed');
  act(()=>back.props.onClick());
  assert.equal(backs,1);
 }finally{t.done();}
});

test('E: GuestTrialPage wires the model back click to the editor',()=>{
 const src=require('fs').readFileSync('components/service/GuestTrialPage.tsx','utf8');
 assert.match(src,/backHref:feedPath,onBack:guest\.backClick/);
});
