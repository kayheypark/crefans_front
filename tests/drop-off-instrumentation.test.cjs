// 2026-11-20 이탈 분석 수정안 C·E(계측): 결과 화면의 닫기·원본으로·계속 보정과 랜딩 CTA 위치를 PostHog 이벤트로 남긴다.
// 보내는 속성은 actor·mode(결과 화면)와 고정된 CTA 위치 이름(랜딩)뿐이다. 문구·URL·ID·사진은 보내지 않는다.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const styles=new Proxy({},{get:(_,key)=>String(key)});
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');

const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'./ShopPage':{ShopPage:()=>el('div',null,'상점')},'./AiPhotoMask':{AiPhotoMask:props=>el('div',props),buildAiMask:async()=>new Blob(['m'],{type:'image/png'})},'./ai-photo.module.css':{__esModule:true,default:styles},'@/components/ui/Primitives':{Chip:({children,...props})=>el('button',props,children),Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props}),Field:({label,...props})=>el('input',{'aria-label':label,label,...props})}});

async function openEditor(){
 let r,n=0;const tracked=[],closed=[];
 const onEdit=async()=>({success:true,data:{images:[{id:`a${++n}`,type:'image',url:`/a${n}.png`}],remaining:9},errorMessage:null,errorCode:null});
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose:()=>closed.push(1),images:[{id:'p1',type:'image',url:'/p1.png'}],quota:{remaining:10,limit:10},room:9,onEdit,onAdd(){},onTrack:(step,props)=>tracked.push([step,props])}));});
 const click=async name=>act(async()=>{r.root.find(node=>node.type==='button'&&(text(node).includes(name)||String(node.props['aria-label']||'').includes(name))).props.onClick();});
 await click('여성');await click('일반 모드');
 await act(async()=>r.root.find(node=>node.type==='button'&&node.props.role==='tab'&&text(node)==='포즈').props.onClick());
 const generate=async()=>{await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'밝은 조명'}}));await click('만들기');};
 const closeDialog=async()=>act(async()=>r.root.find(node=>node.type==='section'&&node.props['aria-label']==='AI 사진 편집').props.onClose());
 const steps=()=>tracked.filter(([step])=>step!=='ai_editor_opened');
 return {r,click,generate,closeDialog,steps,closed};
}

test('result screen: 계속 보정, 원본으로 and closing each report their own step with the mode only',async()=>{
 const {r,click,generate,closeDialog,steps,closed}=await openEditor();
 // Closing from the edit stage (no result yet) is not a result-screen exit.
 await closeDialog();assert.deepEqual(steps(),[]);assert.equal(closed.length,1);
 await generate();assert.ok(r.root.findAllByProps({className:'resultActions'}).length>0,'result screen is shown');
 await click('계속 보정');assert.deepEqual(steps(),[['ai_result_continue',{mode:'general'}]]);
 await generate();await click('원본으로');assert.deepEqual(steps().at(-1),['ai_result_original',{mode:'general'}]);
 await generate();await closeDialog();assert.deepEqual(steps().at(-1),['ai_result_closed',{mode:'general'}]);assert.equal(closed.length,2,'closing still closes');
 for(const [,props] of steps())assert.deepEqual(Object.keys(props),['mode'],'no ids, text or photos');
});

test('the new steps are part of the funnel step type and the analytics event list',()=>{
 const fs=require('fs');
 assert.match(fs.readFileSync('types/crefans-studio-management.ts','utf8'),/AiPhotoFunnelStep=[^;]*'ai_result_closed'\|'ai_result_original'\|'ai_result_continue'/);
 const lib=fs.readFileSync('lib/analytics/posthog.ts','utf8');
 assert.match(lib,/AnalyticsEvent=[^;]*'ai_result_closed'\|'ai_result_original'\|'ai_result_continue'\|'landing_cta_clicked'/);
});

test('landing: every fixed CTA reports its place before going to the trial',async()=>{
 const places=[];
 const page=loadTypeScript('components/service/AiPhotoLanding.tsx',{'./ai-photo-landing.module.css':{__esModule:true,default:styles},'@/components/crefans/studio/ai-photo.module.css':{__esModule:true,default:styles},'next/link':({href,children,...props})=>el('a',{href,...props},children),'@/components/crefans/Brand':{Brand:()=>el('span',null,'crefans')},'@/components/ui/Primitives':{Dialog:({open,title,children})=>open?el('section',{'data-dialog':title},children):null},'@/components/ui/DialogActions':{DialogActions:({children})=>el('div',null,children)},'@/features/service/useFunnelStep':{useFunnelStep:()=>{}},'@/features/service/useLandingCta':{trackLandingCta:place=>places.push(place)},'@/lib/crefans/ai-photo-handoff':{saveAiPhotoHandoff(){}}});
 let tree;await act(async()=>{tree=create(el(page.default));});
 try{
  const links=()=>tree.root.findAll(node=>node.type==='a'&&node.props.href==='/service/try');
  const go=async label=>{const link=links().find(node=>[].concat(node.props.children).join('')===label);assert.ok(link,label);await act(async()=>link.props.onClick());};
  await go('0원 체험');await go('로그인 없이 0원 체험');await go('이 프리셋으로 0원 체험');
  assert.deepEqual(places,['header','hero','preset']);
  // The last of the two '로그인 없이 0원 체험' links is the closing section.
  await act(async()=>links().filter(node=>node.props.children==='로그인 없이 0원 체험').at(-1).props.onClick());assert.equal(places.at(-1),'final');
  const card=tree.root.find(node=>node.type==='button'&&node.props['aria-label']==='모더니아 코스튬 자세히 보기');await act(async()=>card.props.onClick());
  await go('이 조합으로 0원 체험');assert.equal(places.at(-1),'look_detail');
  const tab=tree.root.findAll(node=>node.props.role==='tab').find(node=>node.findAllByType('span').some(span=>span.props.children==='포즈'));await act(async()=>tab.props.onClick());
  await act(async()=>tree.root.find(node=>node.type==='button'&&node.props['aria-label']==='벽에 기대 쉬기').props.onClick());
  await go('0원으로 만들기');assert.equal(places.at(-1),'preset_dialog');
 }finally{await act(async()=>tree.unmount());}
});

test('trackLandingCta sends only the place to PostHog',()=>{
 const calls=[];const {trackLandingCta}=loadTypeScript('features/service/useLandingCta.ts',{'@/lib/analytics/posthog':{captureEvent:(name,props)=>calls.push([name,props])}});
 trackLandingCta('hero');assert.deepEqual(calls,[['landing_cta_clicked',{place:'hero'}]]);
});
