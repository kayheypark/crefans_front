// 2026-11-23 user decision (replaces 11-18 "guest AI results without a watermark"): the signed-out editor shows a checked
// '워터마크 넣기' box with a '해제는 회원 전용' badge. Clearing it is refused: the box stays checked and a signup offer opens.
// Guest requests always send watermark=true; the member editor and member requests are unchanged.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
const mocks={'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',props),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title})=>open?el('section',{role:'dialog','aria-label':title},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}};
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',mocks);

async function render(noHearts){
 let r;const edits=[];
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[{id:'p1',type:'image',url:'/p1.png'}],quota:{remaining:5,limit:10},room:9,onEdit:async input=>{edits.push(input);return{success:false,data:null,errorMessage:'x',errorCode:'X'};},onAdd(){},noHearts}));});
 // The footer (method choice, 만들기) appears once a gender is chosen, as in the real flow.
 await act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes('여성')).props.onClick();});
 const boxes=()=>r.root.findAll(n=>n.type==='input'&&n.props.type==='checkbox'&&text(n.parent).includes('워터마크 넣기'));
 const offer=()=>r.root.findAll(n=>n.props?.role==='dialog'&&n.props['aria-label']==='워터마크 해제');
 return{r,boxes,offer,edits};
}

test('guest editor: the watermark box is shown checked, with the members-only badge, and no offer is open yet',async()=>{
 const {r,boxes,offer}=await render(true);
 try{
  assert.equal(boxes().length,1);assert.equal(boxes()[0].props.checked,true,'checked by default');
  assert.match(text(r.toJSON()),/해제는 회원 전용/);
  assert.equal(offer().length,0);
 }finally{await act(async()=>r.unmount());}
});

test('guest editor: trying to clear the box keeps it checked and opens the signup offer; keep-going closes it',async()=>{
 const {r,boxes,offer}=await render(true);
 try{
  await act(async()=>{boxes()[0].props.onChange({target:{checked:false}});});
  assert.equal(boxes()[0].props.checked,true,'still checked after the attempt');
  assert.equal(offer().length,1,'signup offer opened');
  const body=text(offer()[0]);
  for(const line of['워터마크 없는 사진은','회원만 만들 수 있어요','매일 10장','가입해도 지금 만든 사진과 쓰던 글은 그대로 이어져요.'])assert.ok(body.includes(line),line);
  const signup=offer()[0].findAll(n=>n.type==='a'&&text(n)==='회원가입하고 워터마크 빼기');
  assert.equal(signup.length,1);assert.match(String(signup[0].props.href),/signup/);
  await act(async()=>{offer()[0].find(n=>n.type==='button'&&text(n)==='워터마크 넣은 채로 계속하기').props.onClick();});
  assert.equal(offer().length,0,'closed');assert.equal(boxes()[0].props.checked,true);
 }finally{await act(async()=>r.unmount());}
});

test('member editor: no watermark box, badge or offer (control for the guest checks above)',async()=>{
 const {r,boxes}=await render(false);
 try{
  assert.equal(boxes().length,0);
  assert.doesNotMatch(text(r.toJSON()),/해제는 회원 전용|워터마크 넣기/);
 }finally{await act(async()=>r.unmount());}
});

test('requests: a guest body always carries watermark=true; a member body has no watermark field',async()=>{
 const studio=loadTypeScript('features/service/useStudioModel.ts',{'next/navigation':{useSearchParams:()=>new URLSearchParams()},'@/lib/api/platform':{platformRequest:async()=>({success:true,data:{}})}});
 const sent=[];
 const guest=loadTypeScript('features/service/useGuestTrialModel.ts',{
  '@/lib/api/platform':{platformRequest:async(path,body)=>{sent.push([path,body]);return{success:true,data:path==='/guest/session'?{active:true,consentVersion:'v',limit:3,postHours:24,remaining:3}:{images:[],remaining:2}};}},
  '@/lib/analytics/posthog':{aiProps:()=>({}),captureEvent:()=>{},replaySessionId:async()=>null,setReplayInlineImages:()=>{},setReplayUnmasked:()=>{}},
  '@/lib/api/funnel':{rememberEntrySource:()=>undefined},'@/lib/api/share-report':{reportShare:()=>{}},'@/lib/analytics/x-pixel':{xEvent:()=>{}},
  '@/lib/design/image-optimize':{optimizeImage:async f=>f},'./useStudioModel':{aiPhotoEditBody:studio.aiPhotoEditBody},
 });
 const input={source:{id:'s'},kind:'pose',style:'photo',prompt:'x',consent:true};
 assert.equal(studio.aiPhotoEditBody(input).get('watermark'),null,'member body unchanged');
 assert.deepEqual(guest.guestAiPhotoEditBody(input).getAll('watermark'),['true']);
 let model,tree;function Probe(){model=guest.useGuestTrialModel(true);return null;}
 await act(async()=>{tree=create(el(Probe));});
 try{
  await act(async()=>{await model.aiEdit(input);});
  const [,body]=sent.find(([path])=>path==='/guest/ai-photo/edit');
  assert.equal(body.get('watermark'),'true');assert.equal(body.get('sourceId'),'s');
 }finally{act(()=>tree.unmount());}
});
