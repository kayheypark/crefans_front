// 2026-11-23 user decision (/ask-me "문구 + 자동 전환"): the AI landing says "셀카 한 장이면 돼요 · 의상 없어도 OK" above the fold
// (matching the Instagram ad), and in the signed-out trial a photo the visitor uploads becomes the AI edit target instead of the sample.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});

test('landing hero shows the selfie / no-costume line right under the title, before the lead and the CTA',()=>{
 const page=loadTypeScript('components/service/AiPhotoLanding.tsx',{'./ai-photo-landing.module.css':{__esModule:true,default:styles},'@/components/crefans/studio/ai-photo.module.css':{__esModule:true,default:styles},'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'@/components/crefans/Brand':{Brand:()=>React.createElement('span',null,'crefans')},'@/components/ui/Primitives':{Dialog:({open,children})=>open?React.createElement('section',null,children):null},'@/components/ui/DialogActions':{DialogActions:({children})=>React.createElement('div',null,children)},'@/features/service/useFunnelStep':{useFunnelStep:()=>{}},'@/lib/crefans/ai-photo-handoff':{saveAiPhotoHandoff:()=>{}}});
 let tree;act(()=>{tree=create(React.createElement(page.default));});
 try{
  const hero=tree.root.find(n=>n.type==='section'&&n.props['aria-labelledby']==='ai-photo-title');
  const copy=hero.find(n=>n.props.className==='heroCopy');
  const kids=copy.children.filter(n=>typeof n!=='string');
  const note=kids.findIndex(n=>n.type==='p'&&n.props.className==='selfieNote');
  assert.ok(note>=0,'selfie note is in the hero copy');
  assert.equal(kids[note].props.children,'셀카 한 장이면 돼요 · 의상 없어도 OK');
  assert.equal(kids[note-1].type,'h1','right under the title');
  assert.ok(kids.findIndex(n=>n.props.className==='actions')>note,'before the CTA buttons');
 }finally{act(()=>tree.unmount());}
 const css=require('fs').readFileSync('components/service/ai-photo-landing.module.css','utf8');assert.match(css,/\.selfieNote\{/);
});

const {ContentEditorPage}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',{
 './social.module.css':styles,'./chip-row.module.css':styles,'./content-post-preview.module.css':styles,'./phone-frame.module.css':styles,
 './management.module.css':styles,'./ai-photo.module.css':{__esModule:true,default:styles},'./benefits-field.module.css':styles,'./data-table.module.css':styles,'./pagination.module.css':styles,'./media-upload.module.css':styles,'./toggle.module.css':styles,'./dialog-actions.module.css':styles,'./text-link.module.css':styles,'./optional-image.module.css':styles,'./image-upload.module.css':styles,'./service.module.css':styles,'./ui.module.css':styles,'./avatar.module.css':styles,'./select.module.css':styles,'./field.module.css':styles,
 'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),
 'next/navigation':{useRouter:()=>({push:()=>{}})},
 '@/components/ui/Primitives':{
  ...loadTypeScript('components/ui/Primitives.tsx',{'./ui.module.css':styles,'./field.module.css':styles,'./select.module.css':styles,'./choice.module.css':styles}),
  Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null,
 },
});
function fixtureModel(){
 const {useMockManagement}=loadTypeScript('components/preview/studio/useMockManagement.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams('')},
  './management-fixtures':{managementNow:'2026-11-23T09:00:00.000Z',managementContents:[],managementMemberships:[],managementSubscribers:[]},
 });
 let current,tree;function Probe(){current=useMockManagement();return null;}
 act(()=>{tree=create(React.createElement(Probe));});
 return {model:current,close:()=>act(()=>tree.unmount())};
}
// Opens the editor, lets it add the sample (guest) or nothing (member), uploads 'mine.jpg', opens AI 사진 편집, returns the edited photo's url and the uploaded file names.
async function editTargetAfterUpload({guest,existing=[]}){
 const store=new Map(),prevStorage=global.localStorage,prevFetch=global.fetch;
 global.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
 global.fetch=async()=>({ok:true,blob:async()=>new Blob(['x'],{type:'image/webp'})});
 const probe=fixtureModel(),names=[];let n=0;
 const content=existing.length?{id:'c1',title:'t',body:'b',media:existing,commentsEnabled:true,accessPlanId:null,status:'draft',scheduledAt:null,updatedAt:'2026-11-23T09:00:00.000Z'}:undefined;
 const model={...probe.model,contents:content?[content]:[],actions:{...probe.model.actions,aiEditPhoto:async()=>({success:true,data:{images:[]}}),
  uploadContentMedia:async file=>{n+=1;names.push(file.name);const id=file.name==='mine.jpg'?'mine':`up${n}`;return {success:true,data:{id,type:'image',url:`/api/v1/media/${id}/file`}};}}};
 let tree;
 try{
  await act(async()=>{tree=create(React.createElement(ContentEditorPage,{model,basePath:guest?'/service/try':'/studio',id:content?.id,...(guest?{guest}:{})}));});
  await act(async()=>{await new Promise(r=>setTimeout(r,20));});
  const picker=tree.root.find(node=>typeof node.props.onFilesSelect==='function');
  await act(async()=>picker.props.onFilesSelect([new File(['me'],'mine.jpg',{type:'image/jpeg'})]));
  await act(async()=>{await new Promise(r=>setTimeout(r,20));});
  await act(async()=>tree.root.find(node=>node.type==='button'&&node.props['aria-label']==='AI 사진 편집').props.onClick());
  const editor=tree.root.find(node=>node.type==='section'&&node.props['data-dialog']==='AI 사진 편집');
  const female=editor.findAll(node=>node.type==='button'&&node.children.includes('여성'));if(female.length)await act(async()=>female[0].props.onClick());
  const previews=tree.root.find(node=>node.type==='section'&&node.props['data-dialog']==='AI 사진 편집').findAll(node=>node.type==='img'&&node.props.alt==='원본 사진');
  assert.equal(previews.length,1);
  return {target:previews[0].props.src,uploaded:names};
 }finally{if(tree)await act(async()=>tree.unmount());probe.close();global.localStorage=prevStorage;global.fetch=prevFetch;}
}

test('guest trial: after the sample is added, the photo the visitor uploads becomes the edit target',async()=>{
 const guest={authorId:'guest-a',backHref:'/service/feed',doneHref:'/service/try/done',notice:'notice',samplePhoto:{url:'/sample.webp',name:'sample.webp'},caption:async()=>({success:true,data:{title:'',body:'',source:'template'}})};
 assert.deepEqual(await editTargetAfterUpload({guest}),{target:'/api/v1/media/mine/file',uploaded:['sample.webp','mine.jpg']});
 // Same without the caption step (the editor's other layout).
 const {caption,...plain}=guest;void caption;
 assert.deepEqual(await editTargetAfterUpload({guest:plain}),{target:'/api/v1/media/mine/file',uploaded:['sample.webp','mine.jpg']});
});

test('member editor is unchanged: uploading another photo keeps the first photo as the edit target',async()=>{
 assert.deepEqual(await editTargetAfterUpload({guest:undefined,existing:[{id:'old',type:'image',url:'/api/v1/media/old/file'}]}),{target:'/api/v1/media/old/file',uploaded:['mine.jpg']});
});
