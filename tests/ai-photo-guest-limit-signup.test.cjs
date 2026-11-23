// 2026-11-23 이탈 분석 수정안 1의 회귀 검사.
// 비회원 체험에서 같은 네트워크 한도(GUEST_IP_LIMIT)나 하루 전체 체험 마감(GUEST_DAILY_CLOSED)에 걸리면 서버 문구는
// "회원가입하면 계속 이용할 수 있어요"인데, 화면에는 '확인' 버튼만 있어 가입으로 갈 길이 없었다(01a20312).
// 이제 체험 이용권 소진(GUEST_AI_LIMIT)과 같이 오류 안내에 회원가입 링크를 함께 보여 주고, 생성 요청을 다시 보내지 않는다.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',{'data-mask-editor':true,...props}),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}});

async function failWith(errorCode,{noHearts=true}={}){
 const message='이 네트워크에서는 오늘 체험 횟수를 모두 썼어요. 회원가입하면 계속 이용할 수 있어요.';
 let edits=0,r;
 const onEdit=async()=>{edits++;return{success:false,data:null,errorMessage:message,errorCode};};
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[{id:'p1',type:'image',url:'/p1.png'}],quota:{remaining:5,limit:10},room:9,onEdit,onAdd(){},noHearts}));});
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&(text(n).includes(name)||String(n.props['aria-label']||'').includes(name))).props.onClick();});
 await click('여성');await click('만들기');await click('이 사진으로 만들기');
 const notice=r.root.find(n=>n.props?.role==='dialog'&&n.props['aria-label']==='AI 사진 편집 안내');
 const signup=notice.findAll(n=>n.type==='a'&&text(n)==='회원가입');
 return {r,edits,notice,signup};
}

for(const code of['GUEST_IP_LIMIT','GUEST_DAILY_CLOSED'])test(`guest trial: ${code} shows the server message with a signup link and sends no further request`,async()=>{
 const {r,edits,notice,signup}=await failWith(code);
 try{
  assert.match(text(notice),/회원가입하면 계속 이용/,'the server message is shown');
  assert.equal(signup.length,1,'a signup link is offered next to the message');
  assert.match(String(signup[0].props.href),/signup/);
  assert.equal(notice.findAll(n=>n.type==='button'&&text(n)==='확인').length,0,'not the plain confirm-only notice');
  assert.equal(notice.findAll(n=>n.type==='button'&&text(n)==='네').length,0,'no retry offer for a limit');
  assert.equal(edits,1,'no extra generation request was sent');
 }finally{await act(async()=>r.unmount());}
});

test('member editor: GUEST_IP_LIMIT never appears there, and a member error keeps the plain notice without signup',async()=>{
 const {r,signup,notice}=await failWith('GUEST_IP_LIMIT',{noHearts:false});
 try{
  assert.equal(signup.length,0,'members are not asked to sign up');
  assert.equal(notice.findAll(n=>n.type==='button'&&text(n)==='확인').length,1);
 }finally{await act(async()=>r.unmount());}
});
