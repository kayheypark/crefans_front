// 2026-11-23 사용자 승인 시안: Seedream 이 입력 사진을 거절하면(PROVIDER_INPUT_BLOCKED / INPUT_BLOCKED_LIMIT) 전용 안내를 보여 준다.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',{'data-mask-editor':true,...props}),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}});

const BODY='사실 이 사진은 이미지 서버 정책에 걸려 사용할 수 없어요. 다른 사진으로 시도해 주시겠어요?';
const HEADING='이 원본 사진은 이미 인형 같아서코스프레 할 이유가 없어 보이는데요?';
const NOTE='이번 시도로 기회는 차감되지 않았어요.';
async function failWith(errorCode,{noHearts=false,images=[{id:'p1',type:'image',url:'/p1.png'}],message=BODY}={}){
 let edits=0,r;
 const onEdit=async()=>{edits++;return{success:false,data:null,errorMessage:message,errorCode};};
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images,quota:{remaining:5,limit:10},room:9,onEdit,onAdd(){},noHearts}));});
 const click=async(name,root=r.root)=>act(async()=>{root.find(n=>n.type==='button'&&(text(n).includes(name)||String(n.props['aria-label']||'').includes(name))).props.onClick();});
 await click('여성');await click('만들기');await click('이 사진으로 만들기');
 const notice=()=>r.root.findAll(n=>n.props?.role==='dialog'&&n.props['aria-label']==='AI 사진 편집 안내')[0];
 const dialog=title=>r.root.findAll(n=>n.props?.role==='dialog'&&n.props['aria-label']===title)[0];
 const buttons=root=>root.findAll(n=>n.type==='button').map(text);
 return {r,edits:()=>edits,notice,dialog,click,buttons};
}

test('PROVIDER_INPUT_BLOCKED shows the dedicated notice: art, heading, server body, two buttons, not-deducted note',async()=>{
 const {r,edits,notice,buttons}=await failWith('PROVIDER_INPUT_BLOCKED');
 try{
  const n=notice();assert.ok(n,'notice open');
  assert.equal(text(n.find(x=>x.type==='h3')),HEADING);
  assert.equal(text(n.find(x=>x.props.role==='alert')),BODY);
  assert.deepEqual(buttons(n),['다른 사진 고르기','닫기']);
  assert.equal(text(n.find(x=>x.type==='small')),NOTE);
  assert.ok(n.findAll(x=>String(x.props.src||'').includes('/brand/ai-photo/input-blocked-v1.webp')).length>=1,'illustration');
  assert.equal(edits(),1,'no automatic retry');
 }finally{await act(async()=>r.unmount());}
});

test('다른 사진 고르기 with one photo opens the upload path; with several photos opens the photo picker',async()=>{
 {const {r,notice,dialog,click}=await failWith('PROVIDER_INPUT_BLOCKED');
  try{await click('다른 사진 고르기',notice().find(()=>true));assert.equal(notice(),undefined,'notice closed');assert.ok(dialog('다른 사진으로 바꿀까요?'),'upload path offered');}
  finally{await act(async()=>r.unmount());}}
 {const {r,notice,dialog,click}=await failWith('PROVIDER_INPUT_BLOCKED',{noHearts:true,images:[{id:'p1',type:'image',url:'/p1.png'},{id:'p2',type:'image',url:'/p2.png'}]});
  try{await click('다른 사진 고르기',notice().find(()=>true));assert.equal(notice(),undefined);assert.ok(dialog('바꿀 사진을 골라 주세요'),'guest with two photos picks another one');}
  finally{await act(async()=>r.unmount());}}
});

test('닫기 closes the dedicated notice',async()=>{
 const {r,notice,click}=await failWith('PROVIDER_INPUT_BLOCKED');
 try{await act(async()=>{notice().findAll(n=>n.type==='button'&&text(n)==='닫기').at(-1).props.onClick();});assert.equal(notice(),undefined);}
 finally{await act(async()=>r.unmount());}
});

test('INPUT_BLOCKED_LIMIT (try counted) keeps the dedicated layout without the not-deducted note',async()=>{
 const message='사실 이 사진은 이미지 서버 정책에 걸려 사용할 수 없어요. 오늘 돌려드릴 수 있는 횟수(5회)를 넘어서 이번 시도는 차감됐어요. 다른 사진으로 시도해 주시겠어요?';
 const {r,notice}=await failWith('INPUT_BLOCKED_LIMIT',{noHearts:true,message});
 try{const n=notice();assert.equal(text(n.find(x=>x.type==='h3')),HEADING);assert.equal(text(n.find(x=>x.props.role==='alert')),message);assert.equal(n.findAll(x=>x.type==='small').length,0);assert.doesNotMatch(text(n),/차감되지 않았어요/);}
 finally{await act(async()=>r.unmount());}
});

test('control: other errors keep the plain notice (no heading, no 다른 사진 고르기)',async()=>{
 for(const code of ['PROVIDER_ERROR','PROVIDER_OUTPUT_BLOCKED','PROVIDER_INPUT_ERROR']){
  const {r,notice,buttons}=await failWith(code,{message:'사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'});
  try{const n=notice();assert.equal(n.findAll(x=>x.type==='h3').length,0,code);assert.ok(!buttons(n).includes('다른 사진 고르기'),code);assert.doesNotMatch(text(n),/차감되지 않았어요\.$/);
   assert.deepEqual(buttons(n),code==='PROVIDER_OUTPUT_BLOCKED'?['아니요','네']:['확인'],code);}
  finally{await act(async()=>r.unmount());}
 }
});
