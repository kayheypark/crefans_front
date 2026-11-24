// 2026-11-23 user decision (replaces 11-18 "guest AI results without a watermark"): the signed-out editor shows a checked
// '워터마크 넣기' box (2026-11-23: the '해제는 회원 전용' badge was removed). Clearing it is refused: the box stays checked and a signup offer opens.
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
  assert.doesNotMatch(text(r.toJSON()),/해제는 회원 전용/,'badge removed');
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

// 2026-11-23 user request: on phones the editor title scrolls with the sheet; only the footer stays pinned.
test('mobile editor: sheet scrolls with the title, footer sticks to the bottom',()=>{
 const css=require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/crefans/studio/ai-photo.module.css'),'utf8');
 assert.match(css,/@media\(max-width:767px\)\{\.editor\[open\]\{display:block;overflow-y:auto;[^}]*\}\.editor>header\{position:static\}\.editor \.body\{overflow:visible;[^}]*\}\.editor \.footer\{position:sticky;bottom:0;z-index:(\d+)/);
 const footerZ=Number(css.match(/\.editor \.footer\{position:sticky;bottom:0;z-index:(\d+)/)[1]),swipeZ=Number(css.match(/\.swipeOverlay\{[^}]*z-index:(\d+)/)[1]),viewerZ=Number(css.match(/\.viewer\{[^}]*z-index:(\d+)/)[1]);
 assert.ok(footerZ>swipeZ&&footerZ<viewerZ,'footer above the swipe hint, below the photo viewer');
});

// 2026-11-23 user request: 워터마크 넣기 lives at the end of the scrolling body, not in the fixed footer above 만들기.
test('guest watermark box is in the body, not the fixed footer',()=>{
 const src=require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/crefans/studio/AiPhotoDialog.tsx'),'utf8');
 const footer=src.slice(src.indexOf("{stage==='edit'&&<div className={s.footer}"));
 assert.doesNotMatch(footer.slice(0,footer.indexOf('</div>}')),/GuestWatermarkOption/);
 assert.ok(src.indexOf('<GuestWatermarkOption')<src.indexOf("{stage==='edit'&&<div className={s.footer}"),'rendered before the footer, inside the body');
});

// 2026-11-23 user request: a slimmer pinned footer on phones.
test('mobile footer is compact: one-line method choices, hint only for screen readers, slimmer button and signup line',()=>{
 const css=require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/crefans/studio/ai-photo.module.css'),'utf8');
 const block=css.slice(css.lastIndexOf('@media(max-width:767px){.editor .footer{padding:8px'));
 assert.match(block,/\.editor \.methodChoices label>span\{display:flex;[^}]*min-height:36px;[^}]*\}/);
 assert.match(block,/\.editor \.methodHint\{position:absolute;width:1px;height:1px;overflow:hidden/);
 assert.match(block,/\.editor \.footer \.createWithQuota\{min-height:44px/);
 assert.match(block,/\.editor \.footer \.signupNudge\{min-height:30px/);
});

// 2026-11-23 user request: picking 느낌만 빠르게 / 표준 / 디테일 정밀하게 flashes its hint in the middle of the phone screen for ~1s.
test('picking a method shows its hint overlay, which stays about 2 seconds, then clears',async()=>{
 const {r}=await render(true);
 try{
  // CSS module classes are not resolved in this harness, so find the overlay by its role-less, aria-hidden hint text.
  const hints=['분위기만 빠르게 확인해요. 의상·포즈가 다르게 나올 수 있어요.','대부분 원하는 모습에 가깝게 나와요.','의상·얼굴을 가장 꼼꼼하게 맞춰요.'];
  const toast=()=>r.root.findAll(n=>n.type==='div'&&n.props['aria-hidden']==='true'&&hints.includes(text(n)));
  assert.equal(toast().length,0,'nothing before a pick');
  const radio=r.root.find(n=>n.type==='input'&&n.props.type==='radio'&&n.props.value==='precise');
  await act(async()=>{radio.props.onChange();radio.props.onClick();});
  assert.equal(toast().length,1);assert.equal(text(toast()[0]),'의상·얼굴을 가장 꼼꼼하게 맞춰요.');
  await act(async()=>new Promise(res=>setTimeout(res,1200)));
  assert.equal(toast().length,1,'still readable after 1.2s');
  await act(async()=>new Promise(res=>setTimeout(res,1100)));
  assert.equal(toast().length,0,'gone after ~2.2s');
  const css=require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/crefans/studio/ai-photo.module.css'),'utf8');
  assert.match(css,/\.methodToast\{position:fixed;inset:auto;left:50%;top:50%;[^}]*background:rgb\(0 0 0 \/ 82%\);color:#fff/);
 }finally{await act(async()=>r.unmount());}
});
