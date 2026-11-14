const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const rules=loadTypeScript('lib/crefans/ai-photo.ts');
const {mockAiPhotoEdit}=loadTypeScript('components/preview/studio/ai-photo-fixtures.ts');
const dialog=props=>el('section',null,props.children);
const paintedMask=new Blob(['painted-mask'],{type:'image/png'});
let maskCalls=[];
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'./AiPhotoMask':{AiPhotoMask:props=>el('div',{'data-mask-editor':true,...props}),buildAiMask:async(...args)=>{maskCalls.push(args);return paintedMask;}},'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'@/components/ui/Primitives':{Dialog:({open,children,title,onClose})=>open?el('section',{role:'dialog','aria-label':title,onClose},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props})}});
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
const photo={id:'p1',type:'image',url:'/p1.png'};
const base={prompt:'벚꽃 아래 앉은 포즈',consent:true,kind:'pose',hasMask:false,remaining:3};

test('rules: limits and order of checks match the decision (10 a day, 1 per request)',()=>{
 assert.equal(rules.AI_PHOTO_DAILY_LIMIT,10);assert.equal(rules.AI_PHOTO_IMAGES_PER_REQUEST,1);
 assert.equal(rules.aiPhotoProblem(base),'');
 assert.match(rules.aiPhotoProblem({...base,remaining:0}),/모두 썼어요/);
 assert.equal(rules.aiPhotoProblem({...base,kind:'outfit'}),'');
 assert.match(rules.aiPhotoProblem({...base,kind:'outfit',requireMask:true}),/칠해/);
 assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',hasMask:true}),'');
 assert.match(rules.aiPhotoProblem({...base,prompt:'  '}),/적어 주세요/);
 assert.match(rules.aiPhotoProblem({...base,prompt:'가'.repeat(2001)}),/2000자/);
 assert.match(rules.aiPhotoProblem({...base,prompt:'연락은 010-1234-5678'}),/개인정보/);
 assert.match(rules.aiPhotoProblem({...base,consent:false}),/동의/);
});

test('mock edit: one AI image per request, counts down and stops at the limit',async()=>{
 const seen=[];const edit=mockAiPhotoEdit({start:2,delay:0,onRemaining:v=>seen.push(v)});
 const input={source:photo,kind:'pose',prompt:'x',style:'photo',consent:true};
 const one=await edit(input);assert.equal(one.success,true);assert.equal(one.data.images.length,1);assert.ok(one.data.images.every(i=>i.aiGenerated&&i.type==='image'));assert.equal(one.data.remaining,1);
 await edit(input);const over=await edit(input);assert.equal(over.success,false);assert.equal(over.errorCode,'DAILY_LIMIT');assert.deepEqual(seen,[1,0]);
 assert.equal((await mockAiPhotoEdit({delay:0,mode:'blocked'})(input)).errorCode,'UNSAFE_INPUT');
});

async function open(props={},initialMode=false){
 let r,added=[],calls=[];
 const onEdit=async input=>{calls.push(input);return {success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null};};
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota:{remaining:10,limit:10},room:9,onEdit,onAdd:x=>added.push(...x),...props}));});
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&(text(n).includes(name)||String(n.props['aria-label']||'').includes(name))).props.onClick();});
 if(!initialMode&&props.images?.length!==0){await click('일반 모드');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());}
 return {r,added,calls,click};
}

test('dialog: without an uploaded photo it asks for one first',async()=>{
 const {r}=await open({images:[]});assert.match(text(r.toJSON()),/바꿀 사진을 먼저 올려 주세요/);assert.match(text(r.toJSON()),/사진 올리러 가기/);
});

test('dialog: no consent checkbox; explicit create confirms rights and sends one image request',async()=>{
 const {r,added,calls,click}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
 assert.equal(r.root.findAll(n=>n.props.role==='checkbox'||n.props.type==='checkbox').length,0);
 assert.equal(calls.length,0);assert.match(text(r.toJSON()),/만들기를 누르면 본인 또는 사용 허락을 받은 사진임을 확인합니다/);

 assert.doesNotMatch(text(r.toJSON()),/동의해 주세요/);
 await click('1장 만들기');
 assert.equal(calls.length,1);assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.equal(calls[0].consent,true);
 assert.equal(r.root.findAllByType('textarea').length,0,'the result screen replaces the editor');
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']===true&&String(n.props['aria-label']).startsWith('결과')).length,1);
 await click('사진 결정');
 assert.deepEqual(added.map(i=>[i.id,i.aiGenerated]),[['a1',true]]);
});

test('dialog: outfit needs painted area before calling the server',async()=>{
 const {r,calls,click}=await open();
 await act(async()=>{r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick();});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'교복 코스튬'}});});
 await click('옷 세부 지정');await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
});

test('legacy two-result response: viewer navigation and existing selections are preserved',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'},{id:'a2',type:'image',url:'/a2.png'}],remaining:9}})});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});

 await click('1장 만들기');
 await act(async()=>{r.root.findByProps({'aria-label':'결과 2 크게 보기','title':'크게 보기'}).props.onClick();});
 const viewer=()=>r.root.findAll(n=>n.props.role==='group'&&String(n.props['aria-label']).endsWith('크게 보기'));
 assert.equal(viewer().length,1);assert.match(text(viewer()[0]),/결과 2 \/ 2/);
 assert.equal(r.root.findAll(n=>n.type==='img'&&n.props.alt==='결과 2 (AI 생성 사진)').length,1);
 await act(async()=>{r.root.findByProps({'aria-label':'이전 결과'}).props.onClick();});assert.match(text(viewer()[0]),/결과 1 \/ 2/);
 await act(async()=>{viewer()[0].props.onKeyDown({key:'ArrowRight',preventDefault(){},stopPropagation(){}});});assert.match(text(viewer()[0]),/결과 2 \/ 2/);
 await click('이 사진 선택');assert.match(text(viewer()[0]),/선택됨/);
 await act(async()=>{viewer()[0].props.onKeyDown({key:'Escape',preventDefault(){},stopPropagation(){}});});
 assert.equal(viewer().length,0);assert.match(text(r.toJSON()),/사진 결정/,'both results are picked and the editor is still open');
});

test('progress: the waiting game retains real elapsed and usual time without a fake percentage',async()=>{
 for(const [typical,expect] of [[24,/보통 약 24초 걸려요/],[null,/걸리는 시간을 재는 중/]]){
  let finish;const onEdit=()=>new Promise(resolve=>{finish=resolve;});
  let r;await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota:{remaining:10,limit:10,typicalSeconds:typical},room:9,onEdit,onAdd(){}}));});
  await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());
  await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});

  await act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes('1장 만들기')).props.onClick();});
  assert.equal(r.root.findAll(n=>n.type==='button'&&text(n).includes('1장 만들기')).length,0);assert.equal(r.root.findAll(n=>n.type==='button'&&String(n.props['aria-label']).match(/^하트 [1-5] 모으기$/)).length,5);
  const all=text(r.toJSON());assert.match(all,expect);assert.match(all,/0초 지남/);assert.match(all,/잠시만 화면을 유지/);assert.doesNotMatch(all,/%/);
  await act(async()=>{finish({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null});});
  assert.doesNotMatch(text(r.toJSON()),/초 지남/);
 }
});


test('compact stages: edit settings preserves prompt, source, style, consent and remaining quota',async()=>{
 const {r,click,calls}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});

 await click('1장 만들기');assert.equal(r.root.findAllByType('textarea').length,0);
 await click('설정 수정');assert.equal(r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 9\/10/);
 await click('1장 만들기');assert.equal(calls.length,2);assert.deepEqual(calls[1],calls[0]);
});

test('compact stages: provider failure restores the editable form without losing the request',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:false,errorMessage:'생성에 실패했어요',errorCode:'PROVIDER_ERROR'})});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});

 await click('1장 만들기');
 const notice=r.root.findByProps({'aria-label':'AI 사진 편집 안내'});
 assert.match(text(notice),/생성에 실패했어요/);
 await click('확인');assert.equal(r.root.findAllByProps({'aria-label':'AI 사진 편집 안내'}).length,0);
 await click('1장 만들기');assert.equal(r.root.findAllByProps({'aria-label':'AI 사진 편집 안내'}).length,1);
 await act(async()=>r.root.findByProps({'aria-label':'AI 사진 편집 안내'}).props.onClose());
 assert.equal(r.root.findAllByProps({'aria-label':'AI 사진 편집'}).length,1);
 assert.equal(r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 10\/10/);
});

test('compact results: cannot add more photos than the remaining post capacity',async()=>{
 const {r,click,added}=await open({room:0});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});

 await click('1장 만들기');
 await click('사진 결정');assert.equal(added.length,0);assert.match(text(r.toJSON()),/사진은 0장만 더 넣을 수/);
});


test('regenerate failure keeps the previously selected photos available to add',async()=>{
 let count=0;const {r,click,added}=await open({onEdit:async()=>++count===1?{success:true,data:{images:[{id:'keep',type:'image',url:'/keep.png'}],remaining:9}}:{success:false,errorMessage:'다시 만들지 못했어요',errorCode:'PROVIDER_ERROR'}});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});

 await click('1장 만들기');await click('계속 보정');await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'부드러운 조명'}}));await click('1장 만들기');assert.match(text(r.toJSON()),/다시 만들지 못했어요/);
 await click('사진 결정');assert.deepEqual(added.map(i=>i.id),['keep']);
});

test('preset editor: browsing and toggling preserves custom-only input and never exposes accumulated instructions',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내가 작성한 추가 요청'}}));await click('다음 프리셋 페이지');
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());
 await click('환한 미소');assert.equal(field().props.value,'내가 작성한 추가 요청');assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(r.root.findAllByProps({'aria-label':'최종 프롬프트'}).length,0);assert.equal(r.root.findAllByType('textarea').length,1);
 await click('환한 미소');assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],false);assert.equal(field().props.value,'내가 작성한 추가 요청');assert.equal(calls.length,0);
});


test('preset selection and custom input are independent and both reach the provider',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 메이크업 추가 요청'}}));await click('코랄 립');await click('코랄 립');assert.equal(field().props.value,'내 메이크업 추가 요청');await click('코랄 립');
 await click('1장 만들기');assert.equal(calls[0].kind,'makeup');assert.equal(calls[0].prompt,'입술을 자연스러운 코랄 톤으로 바꿔줘.\n내 메이크업 추가 요청');assert.equal(calls[0].mask,undefined);
});


test('single-image flow: only generate stays in footer and all editor fields scroll in the body',async()=>{
 const {r,click}=await open();const footer=r.root.findByProps({className:'footer'}),body=r.root.findByProps({className:'body'});
 assert.equal(footer.findAllByType('button').length,1);assert.equal(text(footer),'1장 만들기남은 10회');assert.equal(footer.findAllByType('textarea').length,0);
 assert.equal(body.findAllByProps({className:'sourceSection'}).length,1);assert.equal(body.findAllByProps({className:'composer'}).length,1);assert.equal(body.findAllByProps({className:'quota'}).length,1);
 await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'밝게 웃어줘'}}));

 await click('1장 만들기');assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
 assert.equal(r.root.findAllByProps({className:'footer'}).length,0);assert.equal(r.root.findByProps({className:'body'}).findAllByProps({className:'resultActions'}).length,1);
});

test('cosplay wardrobe: selected outfits toggle independently and never overwrite custom text across tabs',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));await click('코스어 모드');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,6);
 await click('다음 의상 페이지');await click('비치 투피스');assert.equal(field().props.value,'내 추가 요청');assert.equal(r.root.findByProps({'aria-label':'비치 투피스'}).props['aria-pressed'],true);await click('비치 투피스');assert.equal(r.root.findByProps({'aria-label':'비치 투피스'}).props['aria-pressed'],false);
 await click('이전 의상 페이지');await click('고딕 오프숄더');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());assert.equal(field().props.value,'내 추가 요청');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick());assert.equal(r.root.findByProps({'aria-label':'고딕 오프숄더'}).props['aria-pressed'],true);await click('일반 모드');assert.equal(field().props.value,'내 추가 요청');assert.equal(calls.length,0);
});


test('cosplay wardrobe keeps the outfit mask gate and submits cosplay style only with a painted mask',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('사이버 슈트');

 await click('옷 세부 지정');await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 maskCalls=[];await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'outfit');assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(maskCalls.length,1);assert.equal(maskCalls[0][0],photo.url);assert.equal(calls[0].prompt,'의상 참조 사진 1의 코디를 적용해줘.');assert.deepEqual(calls[0].costumeIds,['b4bf5d']);assert.equal(calls[0].mode,'cosplay');
 await click('설정 수정');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());await click('환한 미소');await click('1장 만들기');assert.equal(calls[1].style,'cosplay');assert.equal(calls[1].kind,'combined');assert.deepEqual(calls[1].editKinds,['outfit','expression']);assert.equal(calls[1].mask,paintedMask);assert.deepEqual(calls[1].costumeIds,['b4bf5d']);
});

test('wardrobe is card-only with no view picker and preserves the draft and painted mask',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('아이돌 무대복');
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'배경 유지'}}));
 const strokes=[{size:.06,points:[{x:.5,y:.6}]}];await click('옷 세부 지정');await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange(strokes));
 assert.equal(r.root.findAll(n=>n.props.label==='보기 형식').length,0);assert.equal(r.root.findAllByProps({'aria-label':'의상 크게 보기'}).length,0);
 assert.equal(r.root.findByProps({'aria-label':'코스프레 의상'}).findAllByType('button').length,6);
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].mask,paintedMask);assert.equal(calls[0].style,'cosplay');assert.match(calls[0].prompt,/배경 유지/);
 await click('설정 수정');assert.equal(field().props.value,'배경 유지');assert.deepEqual(r.root.findByProps({'data-mask-editor':true}).props.strokes,strokes);
});

test('mask icon tools: all brush sizes paint correctly, undo removes one stroke, clear removes all, disabled remains guarded',async()=>{
 const {AiPhotoMask}=loadTypeScript('components/crefans/studio/AiPhotoMask.tsx');let current=[],r;
 function Harness(){const [strokes,setStrokes]=React.useState([]);current=strokes;return el(AiPhotoMask,{src:photo.url,alt:'원본',strokes,onChange:setStrokes});}
 await act(async()=>{r=create(el(Harness));});
 const button=label=>r.root.find(n=>n.type==='button'&&n.props['aria-label']===label);
 const event={button:0,pointerId:1,clientX:50,clientY:60,currentTarget:{getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),setPointerCapture(){}}};
 for(const [label,size] of [['작게',.03],['보통',.06],['크게',.1]]){
  await act(async()=>button('붓 크기 '+label).props.onClick());assert.equal(button('붓 크기 '+label).props['aria-pressed'],true);
  await act(async()=>{r.root.findByType('canvas').props.onPointerDown(event);r.root.findByType('canvas').props.onPointerUp();});assert.equal(current.at(-1).size,size);
 }
 assert.equal(current.length,3);await act(async()=>button('되돌리기').props.onClick());assert.equal(current.length,2);
 await act(async()=>button('모두 지우기').props.onClick());assert.equal(current.length,0);assert.equal(button('되돌리기').props.disabled,true);assert.equal(button('모두 지우기').props.disabled,true);
 for(const label of ['붓 크기 작게','붓 크기 보통','붓 크기 크게','되돌리기','모두 지우기']){assert.equal(text(button(label)),'');assert.equal(button(label).props.title,label);assert.equal(button(label).findAllByType('svg').length,1);}
 await act(async()=>r.update(el(AiPhotoMask,{src:photo.url,alt:'원본',strokes:[],onChange(){},disabled:true})));assert.ok(r.root.findAllByType('button').every(b=>b.props.disabled));
});

test('costume categories: nine populated groups, existing eight general styles, and 32 unique short prompts',()=>{
 const {aiPhotoCostumes,aiPhotoCostumeCategories}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 assert.equal(aiPhotoCostumeCategories.length,9);assert.deepEqual(aiPhotoCostumeCategories.map(c=>aiPhotoCostumes.filter(x=>x.category===c.value).length),[8,4,4,4,4,4,4,4,4]);
 assert.deepEqual(aiPhotoCostumes.filter(c=>c.category==='general').map(c=>c.id),['773106','80974e','ffb58f','666147','b4bf5d','e614f6','190513','ab36e8']);
 assert.equal(new Set(aiPhotoCostumes.map(c=>c.prompt)).size,40);
 for(const c of aiPhotoCostumes){assert.ok(aiPhotoCostumeCategories.some(g=>g.value===c.category));assert.ok(c.prompt.length<=300);assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',prompt:c.prompt,hasMask:true}),'');}
});

test('category filters: all nine use cards without losing request or mask',async()=>{
 const {aiPhotoCostumes,aiPhotoCostumeCategories}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 const {r,click,calls}=await open();await click('코스어 모드');
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}),category=()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');
 const strokes=[{size:.03,points:[{x:.5,y:.6}]}];await click('옷 세부 지정');await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange(strokes));

 const chosen=[];let previous='내 의상 요청';await act(async()=>field().props.onChange({target:{value:previous}}));
 for(const group of aiPhotoCostumeCategories){
  await act(async()=>category().props.onChange(group.value));assert.equal(field().props.value,previous);assert.deepEqual(r.root.findByProps({'data-mask-editor':true}).props.strokes,strokes);
  const items=aiPhotoCostumes.filter(c=>c.category===group.value);
  const cards=r.root.findByProps({'aria-label':'코스프레 의상'}).findAll(n=>n.type==='button');assert.deepEqual(cards.map(c=>c.props['aria-label']),items.slice(0,6).map(c=>c.name));assert.equal(field().props.value,previous);
  await act(async()=>r.root.findByProps({'aria-label':items[0].name}).props.onClick());chosen.push(rules.aiPhotoPresetText(items[0].prompt));assert.equal(field().props.value,previous);
 }
 assert.equal(calls.length,0,'filtering/browsing/picking never generates');
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(calls[0].prompt,['의상 참조 사진 1의 코디를 적용해줘.',previous].join('\n'));assert.deepEqual(calls[0].costumeIds,[aiPhotoCostumes.find(c=>c.category==='jujutsu').id]);
 await click('설정 수정');assert.equal(category().props.value,'jujutsu');
 await act(async()=>category().props.onChange('nikke'));await click('누아르 바니');await click('누아르 바니');assert.equal(field().props.value,previous);
});

test('hidden prompt: selections toggle across five categories, custom text stays independent and only active requests are submitted',async()=>{
 const {aiPhotoPresetPage,aiPhotoPresetTitle}=loadTypeScript('lib/crefans/ai-photo-presets.ts');const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});const snippets=[];
 for(const [kind,label] of [['outfit','옷'],['makeup','메이크업'],['expression','표정'],['pose','포즈'],['background','배경']]){
  await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());const example=aiPhotoPresetPage(kind,0).examples[kind==='expression'?1:0],name=aiPhotoPresetTitle(kind,example);snippets.push(example);await click(name);assert.equal(field().props.value,'');assert.equal(r.root.findByProps({'aria-label':name}).props['aria-pressed'],true);await click(name);assert.equal(r.root.findByProps({'aria-label':name}).props['aria-pressed'],false);await click(name);
 }
 assert.equal(r.root.findAllByProps({'aria-label':'최종 프롬프트'}).length,0);assert.equal(r.root.findAllByType('textarea').length,1);for(const snippet of snippets)assert.ok(!JSON.stringify(r.toJSON()).includes(snippet),'accumulated preset text is not rendered');assert.equal(calls.length,0);
 await click('옷 세부 지정');await act(async()=>field().props.onChange({target:{value:'내가 추가로 원하는 모습'}}));await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'combined');assert.deepEqual(calls[0].editKinds,['outfit','makeup','expression','pose','background']);assert.equal(calls[0].prompt,[...snippets,'내가 추가로 원하는 모습'].join('\n'));assert.equal(calls[0].mask,paintedMask);
});


test('generated image editing: uses generated source, resets final request and mask, preserves earlier results on failure',async()=>{
 const sent=[];let count=0;
 const {r,click,added}=await open({onEdit:async input=>{sent.push(input);count++;return count<3?{success:true,data:{images:[{id:'made-'+count,type:'image',url:'/made-'+count+'.png'}],remaining:10-count}}:{success:false,errorMessage:'편집 실패',errorCode:'PROVIDER_ERROR'};}});
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'앉은 포즈로 바꿔줘'}}));await click('1장 만들기');
 await click('계속 보정');assert.equal(field().props.value,'');assert.equal(r.root.findAllByType('textarea').length,1);assert.match(text(r.toJSON()),/편집할 이미지/);
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='배경').props.onClick());await act(async()=>field().props.onChange({target:{value:'흰 스튜디오 배경'}}));await click('1장 만들기');
 assert.equal(sent[0].source.id,'p1');assert.equal(sent[1].source.id,'made-1');assert.equal(sent[1].kind,'background');assert.equal(sent[1].mask,undefined);assert.equal(sent[1].prompt,'흰 스튜디오 배경');
 await click('계속 보정');await act(async()=>field().props.onChange({target:{value:'다시 웃는 포즈'}}));await click('1장 만들기');assert.equal(sent[2].source.id,'made-2');assert.match(text(r.toJSON()),/편집 실패/);
 await click('사진 결정');assert.equal(added[0].id,'made-2');assert.equal(photo.id,'p1');
});

test('category logos: all nine options provide local images and do not alter category labels or prompts',async()=>{
 const fs=require('fs');const {r,click}=await open();await click('코스어 모드');const picker=r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');assert.equal(picker.props.options.length,9);
 for(const option of picker.props.options){assert.ok(option.image.startsWith('/brand/ai-photo/'));assert.ok(fs.existsSync(require('path').join(__dirname,'../public',option.image)));}
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');const sample=aiPhotoCostumes.find(c=>c.category==='nikke');assert.ok(!rules.aiPhotoPresetText(sample.prompt).includes('배경은 그대로 유지'));assert.ok(sample.prompt.includes(sample.wig));assert.ok(sample.prompt.includes(sample.accessories));
});


test('gender is composed internally without appearing in or changing the custom input',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'부드러운 조명'}}));await click('남성');await click('여성');assert.equal(field().props.value,'부드러운 조명');await click('남성');await click('1장 만들기');assert.equal(calls[0].targetGender,'male');assert.equal(calls[0].prompt,'생성 인물을 성인 남성으로 바꿔줘.\n부드러운 조명');
});


test('body controls select only one adjustment and keep custom input',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='신체 보정').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}),range=label=>r.root.find(n=>n.type==='input'&&n.props['aria-label']===label);await act(async()=>field().props.onChange({target:{value:'자연스럽게'}}));
 assert.equal(r.root.findAllByProps({'aria-label':'프리셋 검색'}).length,0);assert.equal(r.root.findAllByProps({'aria-label':'프리셋 페이지'}).length,0);assert.equal(range('가슴 크기').props.step,'any');
 await act(async()=>range('가슴 크기').props.onChange({target:{value:'-2'}}));await act(async()=>range('힙 크기').props.onChange({target:{value:'-1'}}));await act(async()=>range('키 비율').props.onChange({target:{value:'2'}}));await act(async()=>range('키 비율').props.onChange({target:{value:'0'}}));assert.equal(field().props.value,'자연스럽게');
 await click('1장 만들기');assert.equal(calls[0].kind,'body');assert.equal(calls[0].prompt,'자연스럽게');assert.ok(calls[0].prompt.endsWith('자연스럽게'));
});


test('every preset has a distinct decodable image including Comic World, 30 poses and Canon lens model prompts',async()=>{
 const fs=require('fs'),path=require('path'),sharp=require('sharp');const {aiPhotoPresets,aiPhotoPresetImage,aiPhotoComicWorldPreset,aiPhotoPresetTitle,aiPhotoPresetTitles}=loadTypeScript('lib/crefans/ai-photo-presets.ts');const images=[];
 assert.equal(aiPhotoPresets.pose.length,30);assert.equal(aiPhotoPresets.lens.length,6);assert.equal(aiPhotoPresets.background[0],aiPhotoComicWorldPreset);
 for(const [kind,values] of Object.entries(aiPhotoPresets)){assert.equal(aiPhotoPresetTitles[kind].length,values.length);assert.equal(new Set(aiPhotoPresetTitles[kind]).size,values.length);for(const example of values){assert.ok(aiPhotoPresetTitle(kind,example));assert.ok(aiPhotoPresetTitle(kind,example).length<=20);const image=aiPhotoPresetImage(kind,example);assert.match(image,/\.webp$/);images.push(image);const meta=await sharp(fs.readFileSync(path.join(__dirname,'../public',image))).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);}
 }
 const genderPaths=[];for(const gender of ['female','male'])for(const example of aiPhotoPresets.expression){const image=aiPhotoPresetImage('expression',example,gender);genderPaths.push(image);const meta=await sharp(fs.readFileSync(path.join(__dirname,'../public',image))).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);}assert.equal(new Set(genderPaths).size,16);
 assert.equal(images.length,104);assert.equal(new Set(images).size,104);for(const value of aiPhotoPresets.lens)assert.match(value,/Canon RF.*촬영한? 느낌|Canon RF.*촬영 느낌/);
});

test('gender-only request on outfit tab does not require clothing painting or send an outfit edit',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('남성');await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].targetGender,'male');assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.match(text(r.toJSON()),/남성으로 변경/);
});


test('switching categories preserves costume, mask and makeup in a combined request',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await click('코스어 모드');await click('사이버 슈트');await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));
 await click('옷 세부 지정');await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());assert.equal(r.root.findAllByProps({'data-mask-editor':true}).length,1);await click('코랄 립');
 assert.equal(r.root.findAllByProps({'data-mask-editor':true}).length,1);assert.equal(r.root.findAll(n=>n.type==='button'&&n.props.role==='tab'&&n.props['aria-selected']).length,1);
 await click('1장 만들기');
 assert.equal(calls[0].kind,'combined');assert.equal(calls[0].style,'cosplay');assert.deepEqual(calls[0].costumeIds,['b4bf5d']);assert.equal(calls[0].mask,paintedMask);assert.deepEqual(calls[0].editKinds,['outfit','makeup']);assert.match(calls[0].prompt,/의상 참조/);assert.ok(calls[0].prompt.endsWith('내 추가 요청'));
});

test('combined length is bounded without truncating custom input or blocking deselection',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'가'.repeat(2000)}}));await click('쪼그려 앉기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],false);assert.equal(field().props.value.length,2000);assert.match(text(r.toJSON()),/너무 길어요/);
 await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));await click('쪼그려 앉기');await act(async()=>field().props.onChange({target:{value:'가'.repeat(2000)}}));assert.match(text(r.toJSON()),/합쳐서 2000자/);await click('쪼그려 앉기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],false);assert.equal(field().props.value.length,2000);assert.equal(calls.length,0);
});


test('expression diagrams stay gender-neutral while generation gender, selection and custom input remain intact',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'자연스러운 조명'}}));await click('환한 미소');
 const previews=()=>r.root.findAll(n=>n.type==='img'&&String(n.props.src).startsWith('/brand/ai-photo/expression-mascot/expression-')).map(n=>n.props.src);
 await click('여성');assert.deepEqual(previews(),[1,2,3,4,5,6].map(i=>`/brand/ai-photo/expression-mascot/expression-${String(i).padStart(2,'0')}-v1.webp`));assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(field().props.value,'자연스러운 조명');
 await click('남성');assert.deepEqual(previews(),[1,2,3,4,5,6].map(i=>`/brand/ai-photo/expression-mascot/expression-${String(i).padStart(2,'0')}-v1.webp`));assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(calls.length,0);
 await click('1장 만들기');assert.equal(calls[0].source.id,'p1');assert.equal(calls[0].kind,'expression');assert.equal(calls[0].targetGender,'male');assert.match(calls[0].prompt,/치아가 살짝 보이게/);assert.match(calls[0].prompt,/성인 남성/);assert.doesNotMatch(calls[0].prompt,/성인 여성/);assert.ok(calls[0].prompt.endsWith('자연스러운 조명'));
});


test('neutral defaults on expression entry; alternatives replace it, other categories retain previous choices',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'자연스러운 조명'}}));await click('쪼그려 앉기');
 const tab=label=>act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());await tab('표정');const buttons=()=>r.root.findByProps({className:'photoPresetGrid'}).findAllByType('button');assert.equal(buttons()[0].props['aria-label'],'무표정');assert.equal(buttons()[0].props['aria-pressed'],true);assert.equal(field().props.value,'자연스러운 조명');
 await click('환한 미소');assert.equal(buttons()[0].props['aria-pressed'],false);assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);await click('환한 미소');assert.ok(buttons().every(b=>b.props['aria-pressed']===false));await tab('포즈');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],true);await tab('표정');assert.equal(buttons()[0].props['aria-pressed'],true);await click('여성');assert.equal(buttons()[0].props['aria-pressed'],true);
 await click('1장 만들기');assert.equal(calls[0].kind,'combined');assert.deepEqual(calls[0].editKinds,['pose','expression']);assert.match(calls[0].prompt,/쪼그려/);assert.match(calls[0].prompt,/무표정/);assert.doesNotMatch(calls[0].prompt,/치아가 살짝/);assert.ok(calls[0].prompt.endsWith('자연스러운 조명'));await click('사진 결정');assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],false,'new draft starts in cosplay without an automatic costume selection');
});

// 2026-11-13: storable reset tickets — shown with count and expiry, spending one refills today's count; off while nothing was used.
test('reset ticket: button refills the count, is off when unused, hidden without tickets',async()=>{
 const find=(r,label)=>r.root.findAll(n=>n.type==='button'&&text(n).includes(label));
 let calls=0;const onUseTicket=async()=>{calls++;return {success:true,data:{remaining:10,limit:10,resetTickets:{count:1,nextExpiresAt:'2026-12-13T00:00:00.000Z'},message:'리셋권 1장을 사용했어요. 오늘 10회를 다시 만들 수 있어요.'},errorMessage:null,errorCode:null};};
 const render=async quota=>{let r;await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota,room:9,onEdit:async()=>({success:false}),onAdd(){},onUseTicket}));});return r;};
 let r=await render({remaining:0,limit:10,resetTickets:{count:2,nextExpiresAt:'2026-12-13T00:00:00.000Z'}});
 assert.match(text(r.toJSON()),/리셋권 2장/);const [button]=find(r,'1장 써서');assert.equal(button.props.disabled,false);
 await act(async()=>{await button.props.onClick();});
 assert.equal(calls,1);assert.match(text(r.toJSON()),/오늘 남은 횟수 10\/10/);assert.match(text(r.toJSON()),/리셋권 1장을 사용했어요/);
 r=await render({remaining:10,limit:10,resetTickets:{count:2,nextExpiresAt:null}});assert.equal(find(r,'1장 써서')[0].props.disabled,true,'nothing used today');
 r=await render({remaining:0,limit:10,resetTickets:{count:0,nextExpiresAt:null}});assert.equal(find(r,'1장 써서').length,0,'no tickets, no button');
});

test('complete cosplay look: catalog hair and accessories reach the request after leaving the wardrobe',async()=>{
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 assert.equal(aiPhotoCostumes.length,40);
 for(const item of aiPhotoCostumes){assert.match(item.wig,/가발/);assert.ok(item.accessories);assert.ok(item.footwear);assert.match(item.image,/-v2\.webp$/);for(const part of [item.wig,item.headwear,item.accessories,item.footwear])assert.ok(item.prompt.includes(part),item.id+':'+part);}
 const {r,calls,click}=await open();await click('코스어 모드');await click('리본 메이드');
 assert.doesNotMatch(text(r.toJSON()),/옷을 바꿀 영역을 칠해 주세요/);await click('일반 모드');
 await click('옷 세부 지정');await act(async()=>{r.root.find(n=>n.props['data-mask-editor']).props.onChange([{size:.1,points:[{x:.5,y:.5}]}]);});

 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mode,'general');assert.equal(calls[0].prompt,'의상 참조 사진 1의 코디를 적용해줘.');assert.deepEqual(calls[0].costumeIds,['773106']);assert.ok(calls[0].mask);
});


test('explicit mode switch preserves draft, selections and mask while showing the active mode',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 assert.equal(r.root.findByProps({'aria-pressed':true,children:'일반 모드'}).type,'button');await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));
 await click('코스어 모드');assert.equal(r.root.find(n=>n.type==='button'&&n.props['aria-pressed']===true&&text(n)==='코스어 모드').type,'button');await click('리본 메이드');
 await click('옷 세부 지정');await act(async()=>r.root.find(n=>n.props['data-mask-editor']).props.onChange([{size:.06,points:[{x:.5,y:.4}]}]));
 await click('일반 모드');assert.equal(field().props.value,'내 추가 요청');assert.equal(r.root.findAllByProps({className:'costumeGrid'}).length,0);
 await click('코스어 모드');assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],true);assert.equal(r.root.find(n=>n.props['data-mask-editor']).props.strokes.length,1);assert.equal(field().props.value,'내 추가 요청');assert.equal(calls.length,0);
});


test('costume references replace only catalog descriptions, preserve order and disappear on deselection',()=>{
 const {aiPhotoCostumes,aiPhotoCostumeRequest}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 const items=aiPhotoCostumes.slice(0,2).map(c=>({kind:'outfit',prompt:rules.aiPhotoPresetText(c.prompt)}));
 const expression={kind:'expression',prompt:'무표정'},customOutfit={kind:'outfit',prompt:'흰 면 셔츠'};
 const result=aiPhotoCostumeRequest([items[1],expression,items[0],customOutfit]);
 assert.deepEqual(result.costumeIds,[aiPhotoCostumes[1].id,aiPhotoCostumes[0].id]);
 assert.deepEqual(result.presets,[{kind:'outfit',prompt:'의상 참조 사진 1의 코디를 적용해줘.'},expression,{kind:'outfit',prompt:'의상 참조 사진 2의 코디를 적용해줘.'},customOutfit]);
 assert.deepEqual(aiPhotoCostumeRequest([expression]).costumeIds,[]);
});


test('same category replaces or toggles only its preset; other categories and mask persist',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('리본 메이드');await click('사이버 슈트');
 assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],false);assert.equal(r.root.findByProps({'aria-label':'사이버 슈트'}).props['aria-pressed'],true);
 await click('옷 세부 지정');await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));await click('1장 만들기');assert.deepEqual(calls[0].costumeIds,['b4bf5d']);assert.equal(calls[0].mode,'cosplay');assert.equal(calls[0].kind,'outfit');
 await click('설정 수정');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());await click('코랄 립');await click('생기 있는 볼');assert.equal(r.root.findByProps({'aria-label':'코랄 립'}).props['aria-pressed'],false);await click('생기 있는 볼');assert.equal(r.root.findByProps({'aria-label':'생기 있는 볼'}).props['aria-pressed'],false);
 await click('코스어 모드');assert.equal(r.root.findByProps({'aria-label':'사이버 슈트'}).props['aria-pressed'],true);assert.equal(r.root.findByProps({'data-mask-editor':true}).props.strokes.length,1);
});

test('create availability: exhausted quota stays clickable and explains without sending, ticket restores generation',async()=>{
 const {r,click,calls}=await open({quota:{remaining:0,limit:10,resetTickets:{count:1,nextExpiresAt:null}},onUseTicket:async()=>({success:true,data:{remaining:10,limit:10,resetTickets:{count:0,nextExpiresAt:null},message:'횟수 복원'}})});
 const createButton=()=>r.root.find(n=>n.type==='button'&&n.props['aria-label']==='1장 만들기');
 assert.equal(createButton().props.disabled,false);
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.root.findByProps({'aria-label':'AI 사진 편집 안내'})),/리셋권/);
 await click('확인');await click('1장 써서');
 await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'밝게 웃어줘'}}));
 await click('1장 만들기');assert.equal(calls.length,1);
});


test('preset paging: six cards, circular single-page gestures, preserved selection and no accidental click',async()=>{
 const {r,click,calls}=await open();await click('의자에 앉기');
 const grid=()=>r.root.findByProps({className:'photoPresetGrid'}),labels=()=>grid().findAllByType('button').map(n=>n.props['aria-label']);
 const initial=labels();assert.equal(initial.length,6);
 const pager=()=>r.root.find(n=>n.type==='div'&&n.props['aria-label']==='프리셋 페이지');
 const event=(x,y=0)=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y,currentTarget:{clientWidth:360,setPointerCapture(){}}});
 async function drag(x,y=0,cancel=false){await act(async()=>pager().props.onPointerDown(event(200)));await act(async()=>pager().props.onPointerMove(event(200+x,y)));await act(async()=>cancel?pager().props.onPointerCancel():pager().props.onPointerUp(event(200+x,y)));}
 await drag(-180);assert.notDeepEqual(labels(),initial);let suppressed=false;pager().props.onClickCapture({detail:1,preventDefault(){suppressed=true;},stopPropagation(){}});assert.equal(suppressed,true);assert.equal(calls.length,0);
 await drag(180);assert.deepEqual(labels(),initial);assert.equal(r.root.findByProps({'aria-label':'의자에 앉기'}).props['aria-pressed'],true);
 await drag(-20);assert.deepEqual(labels(),initial);await drag(20,120);assert.deepEqual(labels(),initial);await drag(-180,0,true);assert.deepEqual(labels(),initial);
 await click('이전 프리셋 페이지');assert.notDeepEqual(labels(),initial);await click('다음 프리셋 페이지');assert.deepEqual(labels(),initial);
});


test('default editor opens in cosplay with outfit tab and no automatic request',async()=>{
 const {r,calls}=await open({},true);
 assert.equal(r.root.find(n=>n.type==='button'&&text(n)==='코스어 모드').props['aria-pressed'],true);
 assert.equal(r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props['aria-selected'],true);
 assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],false);
 assert.equal(calls.length,0);
});


test('default cosplay wardrobe swipes six-card pages without changing selected costume',async()=>{
 const {r,click,calls}=await open({},true);await click('리본 메이드');
 const cards=()=>r.root.findByProps({'aria-label':'코스프레 의상'}).findAllByType('button');assert.equal(cards().length,6);
 const pager=()=>r.root.find(n=>n.type==='div'&&n.props['aria-label']==='프리셋 페이지');
 const e=x=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:0,currentTarget:{clientWidth:360,setPointerCapture(){}}});
 await act(async()=>pager().props.onPointerDown(e(250)));await act(async()=>pager().props.onPointerMove(e(80)));await act(async()=>pager().props.onPointerUp(e(80)));
 assert.equal(cards().length,2);assert.equal(cards()[1].props['aria-label'],'비치 투피스');assert.equal(calls.length,0);
 await click('다음 의상 페이지');assert.equal(cards().length,6);assert.equal(cards()[0].props['aria-pressed'],true);
 await click('이전 의상 페이지');assert.equal(cards().length,2);
});

 test('makeup shows only authored previews for the selected gender and clears a hidden selection',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());
 const previews=()=>r.root.findAll(n=>n.type==='img'&&String(n.props.src).includes('/presets/makeup-')).map(n=>n.props.src);
 await click('코랄 립');await click('남성');assert.deepEqual(previews(),[2,4,6,8,10,12].map(id=>`/brand/ai-photo/presets/makeup-${String(id).padStart(2,'0')}-v1.webp`));
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-label']==='코랄 립').length,0);
 await click('여성');assert.deepEqual(previews(),[1,3,5,7,9,11].map(id=>`/brand/ai-photo/presets/makeup-${String(id).padStart(2,'0')}-v1.webp`));assert.equal(r.root.findByProps({'aria-label':'코랄 립'}).props['aria-pressed'],false);
 await click('남성');assert.equal(previews().length,6);assert.equal(calls.length,0);
 });

test('male body: four flat icons and ranges without photos, single selection and gender reset',async()=>{
 const {r,click,calls}=await open();await click('남성');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='신체 보정').props.onClick());
 const sliders=()=>r.root.findAll(n=>n.type==='input'&&n.props.type==='range'),range=label=>sliders().find(n=>n.props['aria-label']===label);
 const labels=['상체 근육','하체 근육','어깨 너비','키 비율'];assert.deepEqual(sliders().map(n=>n.props['aria-label']),labels);
 assert.equal(r.root.findAll(n=>n.type==='img'&&String(n.props.src).includes('/presets/body-')).length,0);assert.equal(r.root.findAllByProps({'aria-label':'프리셋 검색'}).length,0);
 await act(async()=>range('상체 근육').props.onChange({target:{value:'-2'}}));await act(async()=>range('하체 근육').props.onChange({target:{value:'2'}}));assert.equal(range('상체 근육').props.value,0);
 await act(async()=>range('어깨 너비').props.onChange({target:{value:'-1'}}));assert.equal(range('하체 근육').props.value,0);await act(async()=>range('어깨 너비').props.onChange({target:{value:'0'}}));
 await act(async()=>range('상체 근육').props.onChange({target:{value:'1'}}));await click('여성');assert.deepEqual(sliders().map(n=>n.props['aria-label']),['가슴 크기','힙 크기','키 비율']);await click('남성');assert.ok(sliders().every(n=>n.props.value===0));
 assert.equal(calls.length,0);await act(async()=>range('하체 근육').props.onChange({target:{value:'-2'}}));await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'body');assert.match(calls[0].prompt,/허벅지·종아리의 하체 근육 볼륨을 좀 더 슬림하게/);assert.match(calls[0].prompt,/옷과 포즈는 유지/);assert.doesNotMatch(calls[0].prompt,/가슴 크기|힙 크기/);
});
test('male body prompts and generated assets cover four categories and five levels',async()=>{
 const sharp=require('sharp'),fs=require('node:fs');
 for(const [key,negative,positive] of [['upper','상체 근육 볼륨을 조금 슬림하게','상체 근육 볼륨을 좀 더 탄탄하게'],['lower','하체 근육 볼륨을 조금 슬림하게','하체 근육 볼륨을 좀 더 탄탄하게'],['shoulder','어깨 너비를 조금 좁게','어깨 너비를 좀 더 넓게'],['height','키 비율을 조금 작아','키 비율을 좀 더 커']]){
 assert.ok(rules.aiPhotoBodyPrompt(key,-1).includes(negative));assert.ok(rules.aiPhotoBodyPrompt(key,2).includes(positive));assert.equal(rules.aiPhotoBodyPrompt(key,0),'');assert.notEqual(rules.aiPhotoBodyPrompt(key,-2),rules.aiPhotoBodyPrompt(key,-1));assert.notEqual(rules.aiPhotoBodyPrompt(key,1),rules.aiPhotoBodyPrompt(key,2));
 const meta=await sharp(fs.readFileSync(`public/brand/ai-photo/presets/body-male-${key}-v1.webp`)).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);
 }
});

test('gender picker exposes only female and male without implicitly changing the source gender',async()=>{
 const {r,calls}=await open();const buttons=r.root.findByProps({'aria-label':'생성 인물 성별'}).findAllByType('button');assert.deepEqual(buttons.map(text),['여성','남성']);assert.ok(buttons.every(n=>n.props['aria-pressed']===false));assert.equal(calls.length,0);
});

test('result actions: only continue editing and confirm appear in the action row',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'밝은 조명'}}));await click('1장 만들기');
 const buttons=r.root.findByProps({className:'resultActions'}).findAllByType('button');assert.deepEqual(buttons.map(text),['계속 보정','사진 결정']);assert.doesNotMatch(text(r.toJSON()),/다시 만들기|이미지 편집|게시물에 추가/);await click('계속 보정');assert.equal(calls.length,1);assert.equal(r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.value,'');
});

test('preset pager claims a horizontal touch drag so iOS Safari does not turn it into a scroll, and leaves vertical scroll and pinch alone',async()=>{
 const {AiPresetPager}=loadTypeScript('components/crefans/studio/AiPresetPager.tsx');
 const listeners={};const node={addEventListener:(type,fn,options)=>{listeners[type]={fn,options};},removeEventListener(){}};
 const touch=(x,y)=>({clientX:x,clientY:y});
 const fire=(type,points)=>{let prevented=false;listeners[type].fn({touches:points,cancelable:true,preventDefault(){prevented=true;}});return prevented;};
 let r;await act(async()=>{r=create(el(AiPresetPager,{onStep(){},disabled:false},el('div')),{createNodeMock:()=>node});});
 assert.equal(listeners.touchmove.options.passive,false);
 fire('touchstart',[touch(200,100)]);assert.equal(fire('touchmove',[touch(198,100)]),false,'below slop');assert.equal(fire('touchmove',[touch(170,106)]),true,'diagonal-but-horizontal drag');assert.equal(fire('touchmove',[touch(150,130)]),true,'stays claimed');
 fire('touchstart',[touch(200,100)]);assert.equal(fire('touchmove',[touch(204,130)]),false,'vertical scroll');assert.equal(fire('touchmove',[touch(260,132)]),false,'axis stays vertical');
 fire('touchstart',[touch(200,100),touch(260,100)]);assert.equal(fire('touchmove',[touch(150,100),touch(300,100)]),false,'pinch');
 await act(async()=>r.update(el(AiPresetPager,{onStep(){},disabled:true},el('div'))));
 fire('touchstart',[touch(200,100)]);assert.equal(fire('touchmove',[touch(150,100)]),false,'disabled single page');
});

test('preset search filters before pagination, respects gender and handles no matches',()=>{
 const {aiPhotoPresetPage,aiPhotoPresetMatches,aiPhotoPresetTitle}=loadTypeScript('lib/crefans/ai-photo-presets.ts');
 assert.ok(aiPhotoPresetMatches('RF 85','Canon RF85mm'));
 const squatting=aiPhotoPresetPage('pose',3,'original','쪼그려');assert.equal(squatting.total,1);assert.equal(squatting.index,0);assert.equal(aiPhotoPresetTitle('pose',squatting.examples[0]),'쪼그려 앉기');
 const empty=aiPhotoPresetPage('pose',9,'original','존재하지않는검색어');assert.deepEqual(empty,{examples:[],index:0,pages:1,total:0});
 assert.equal(aiPhotoPresetPage('makeup',0,'male','코랄 립').total,0);
 assert.equal(aiPhotoPresetPage('makeup',0,'female','코랄 립').total,1);
 assert.equal(aiPhotoPresetPage('pose',0,'original','  ').total,30);
});

test('search keeps selected poses, resets pages, clears on tabs and finds costumes across categories',async()=>{
 const {r,click,calls}=await open();
 const search=async value=>act(async()=>r.root.findByProps({'aria-label':'프리셋 검색'}).props.onChange({target:{value}}));
 await click('쪼그려 앉기');await click('다음 프리셋 페이지');await search('쪼그려');
 assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],true);assert.equal(r.root.findByProps({'aria-label':'다음 프리셋 페이지'}).props.disabled,true);
 await search('없는검색결과');assert.match(text(r.toJSON()),/검색 결과가 없어요/);assert.doesNotMatch(text(r.toJSON()),/NaN/);
 await click('검색어 지우기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],true);
 await search('손');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());assert.equal(r.root.findByProps({'aria-label':'프리셋 검색'}).props.value,'');
 await click('코스어 모드');await search('원신');assert.match(text(r.toJSON()),/검색/);assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-label']==='라이덴 쇼군').length,1);
 await search('없는검색결과');assert.match(text(r.toJSON()),/검색 결과가 없어요/);assert.doesNotMatch(text(r.toJSON()),/NaN/);
 await click('검색어 지우기');assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-label']==='리본 메이드').length,1);assert.equal(calls.length,0);
});


test('catalog request IDs are unique stable six-character hashes',()=>{const {aiPhotoCostumes,aiPhotoCostumeRequest}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');assert.equal(new Set(aiPhotoCostumes.map(c=>c.id)).size,40);for(const item of aiPhotoCostumes){assert.match(item.id,/^[a-f0-9]{6}$/);assert.deepEqual(aiPhotoCostumeRequest([{kind:'outfit',prompt:rules.aiPhotoPresetText(item.prompt)}]).costumeIds,[item.id]);}});

test('clothing detail switch defaults off, sends no guide, and ignores retained strokes when off',async()=>{
 const {r,click,calls}=await open({},true);
 assert.equal(r.root.findByProps({role:'switch'}).props['aria-checked'],false);
 assert.equal(r.root.findAllByProps({'data-mask-editor':true}).length,0);
 await click('리본 메이드');maskCalls=[];await click('1장 만들기');
 assert.equal(calls[0].mask,undefined);assert.equal(maskCalls.length,0);assert.deepEqual(calls[0].costumeIds,['773106']);
 await click('설정 수정');await click('옷 세부 지정');await click('1장 만들기');assert.equal(calls.length,1);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 await click('옷 세부 지정');maskCalls=[];await click('1장 만들기');assert.equal(calls.length,2);assert.equal(calls[1].mask,undefined);assert.equal(maskCalls.length,0);
});


test('expanded pose, expression and camera selections accumulate and toggle independently',async()=>{
 const {r,click,calls}=await open();
 const search=async value=>act(async()=>r.root.findByProps({'aria-label':'프리셋 검색'}).props.onChange({target:{value}}));
 const tab=async label=>act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());
 await tab('포즈');await search('의자 거꾸로');await click('의자 거꾸로 앉기');
 await tab('표정');await search('도도한');await click('도도한 시선');
 await tab('구도');await search('뒤쪽');await click('뒤쪽 45도');
 await tab('포즈');await search('의자 거꾸로');assert.equal(r.root.findByProps({'aria-label':'의자 거꾸로 앉기'}).props['aria-pressed'],true);
 await tab('표정');await search('도도한');await click('도도한 시선');await click('1장 만들기');
 assert.equal(calls.length,1);assert.deepEqual(calls[0].editKinds,['pose','camera']);assert.match(calls[0].prompt,/거꾸로 앉아/);assert.match(calls[0].prompt,/뒤쪽 45도/);assert.doesNotMatch(calls[0].prompt,/도도|무표정/);
});

test('pose posture splits all thirty cards into exclusive sitting and standing pages',()=>{
 const {aiPhotoPresets,aiPhotoPresetPage,aiPhotoPosePosture,aiPhotoPresetTitle}=loadTypeScript('lib/crefans/ai-photo-presets.ts');
 const seen=[];for(const [posture,total] of [['sitting',9],['standing',21]]){const first=aiPhotoPresetPage('pose',0,'original','',posture);assert.equal(first.total,total);for(let page=0;page<first.pages;page++){const result=aiPhotoPresetPage('pose',page,'original','',posture);assert.ok(result.examples.length<=6);for(const e of result.examples){assert.equal(aiPhotoPosePosture(e),posture);seen.push(e);}}assert.equal(aiPhotoPresetPage('pose',first.pages,'original','',posture).index,0);}
 assert.equal(new Set(seen).size,30);assert.deepEqual(new Set(seen),new Set(aiPhotoPresets.pose));
 assert.equal(aiPhotoPresetPage('pose',0,'original','다리 넓혀','sitting').total,0);assert.equal(aiPhotoPresetPage('pose',0,'original','다리 넓혀','standing').total,1);
 assert.equal(aiPhotoPresetTitle('pose',aiPhotoPresetPage('pose',0,'original','쪼그려','sitting').examples[0]),'쪼그려 앉기');
});

test('posture buttons reset browsing but retain selected pose and other categories until replacement',async()=>{
 const {r,click,calls}=await open();const posture=()=>r.root.findByProps({'aria-label':'포즈 자세'});const select=async label=>act(async()=>posture().find(n=>n.type==='button'&&text(n)===label).props.onClick());
 const search=async value=>act(async()=>r.root.findByProps({'aria-label':'프리셋 검색'}).props.onChange({target:{value}}));
 assert.equal(posture().find(n=>n.type==='button'&&text(n)==='앉기').props['aria-pressed'],true);
 await click('쪼그려 앉기');await click('다음 프리셋 페이지');await search('없는 검색');await select('서기');assert.equal(r.root.findByProps({'aria-label':'프리셋 검색'}).props.value,'');assert.equal(r.root.findAllByProps({'aria-label':'쪼그려 앉기'}).length,0);
 await select('앉기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],true);
 await select('서기');await search('다리 넓혀');await click('다리 넓혀 서기');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());assert.equal(r.root.findAllByProps({'aria-label':'포즈 자세'}).length,0);
 await click('1장 만들기');assert.deepEqual(calls[0].editKinds,['pose','expression']);assert.match(calls[0].prompt,/어깨너비보다/);assert.match(calls[0].prompt,/무표정/);assert.doesNotMatch(calls[0].prompt,/쪼그려/);
});


test('waiting hearts never change requests; failure and success remove game, retry starts at zero',async()=>{
 const sent=[];let finish;const {r,click}=await open({onEdit:input=>{sent.push(input);return new Promise(resolve=>{finish=resolve;});}});
 await click('쪼그려 앉기');await click('1장 만들기');const original=JSON.stringify(sent[0]);
 const score=()=>text(r.root.findByProps({'aria-label':'모은 하트'}));assert.equal(score(),'0');
 for(let i=0;i<7;i++)await click(`하트 ${i%5+1} 모으기`);
 assert.equal(score(),'7');assert.equal(sent.length,1);assert.equal(JSON.stringify(sent[0]),original);
 await act(async()=>finish({success:false,errorMessage:'생성 실패',errorCode:'PROVIDER_ERROR'}));
 assert.equal(r.root.findAllByProps({'aria-label':'모은 하트'}).length,0);assert.match(text(r.toJSON()),/생성 실패/);
 await click('확인');await click('1장 만들기');assert.equal(score(),'0');assert.equal(sent.length,2);assert.equal(JSON.stringify(sent[1]),original);
 await click('하트 1 모으기');assert.equal(score(),'1');await act(async()=>finish({success:true,data:{images:[{id:'done',type:'image',url:'/done.png'}],remaining:9}}));
 assert.equal(r.root.findAllByProps({'aria-label':'모은 하트'}).length,0);assert.match(text(r.toJSON()),/사진 결정/);assert.equal(sent.length,2);
});


test('body continuous range keeps intermediate values, snaps near anchors and keyboard escapes snaps',async()=>{
 for(const [input,expected] of [[.37,.37],[.95,1],[1.06,1],[1.2,1.2],[-.94,-1],[.05,0],[-1.95,-2],[1.95,2]])assert.equal(rules.aiPhotoBodySnap(input),expected);
 assert.notEqual(rules.aiPhotoBodyPrompt('height',.37),rules.aiPhotoBodyPrompt('height',.67));assert.match(rules.aiPhotoBodyPrompt('height',.37),/18.5/);
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='신체 보정').props.onClick());const range=()=>r.root.find(n=>n.type==='input'&&n.props['aria-label']==='키 비율');
 await act(async()=>range().props.onChange({target:{value:'.37'}}));assert.equal(range().props.value,.37);assert.match(range().props['aria-valuetext'],/18.5/);
 await act(async()=>range().props.onChange({target:{value:'.95'}}));assert.equal(range().props.value,1);
 let prevented=false;await act(async()=>range().props.onKeyDown({key:'ArrowRight',preventDefault(){prevented=true;}}));assert.ok(prevented);assert.equal(range().props.value,1.02);
 await act(async()=>range().props.onKeyDown({key:'Home',preventDefault(){}}));assert.equal(range().props.value,-2);
 await act(async()=>range().props.onChange({target:{value:'.37'}}));await click('1장 만들기');assert.match(calls[0].prompt,/18.5/);
});
