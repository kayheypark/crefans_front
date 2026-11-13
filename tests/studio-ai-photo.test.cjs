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
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'./AiPhotoMask':{AiPhotoMask:props=>el('div',{'data-mask-editor':true,...props}),buildAiMask:async(...args)=>{maskCalls.push(args);return paintedMask;}},'./ai-photo.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'@/components/ui/Primitives':{Dialog:({open,children})=>open?el('section',{role:'dialog'},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props})}});
const text=node=>typeof node==='string'?node:(node?.children||[]).map(text).join('');
const photo={id:'p1',type:'image',url:'/p1.png'};
const base={prompt:'벚꽃 아래 앉은 포즈',consent:true,kind:'pose',hasMask:false,remaining:3};

test('rules: limits and order of checks match the decision (10 a day, 1 per request)',()=>{
 assert.equal(rules.AI_PHOTO_DAILY_LIMIT,10);assert.equal(rules.AI_PHOTO_IMAGES_PER_REQUEST,1);
 assert.equal(rules.aiPhotoProblem(base),'');
 assert.match(rules.aiPhotoProblem({...base,remaining:0}),/모두 썼어요/);
 assert.match(rules.aiPhotoProblem({...base,kind:'outfit'}),/칠해/);
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

async function open(props={}){
 let r,added=[],calls=[];
 const onEdit=async input=>{calls.push(input);return {success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null};};
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota:{remaining:10,limit:10},room:9,onEdit,onAdd:x=>added.push(...x),...props}));});
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&(text(n).includes(name)||String(n.props['aria-label']||'').includes(name))).props.onClick();});
 return {r,added,calls,click};
}

test('dialog: without an uploaded photo it asks for one first',async()=>{
 const {r}=await open({images:[]});assert.match(text(r.toJSON()),/바꿀 사진을 먼저 올려 주세요/);assert.match(text(r.toJSON()),/사진 올리러 가기/);
});

test('dialog: consent is required, then a pose edit sends no mask and adds only the picked AI images',async()=>{
 const {r,added,calls,click}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/동의해 주세요/);
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 assert.doesNotMatch(text(r.toJSON()),/동의해 주세요/);
 await click('1장 만들기');
 assert.equal(calls.length,1);assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.equal(calls[0].consent,true);
 assert.equal(r.root.findAllByType('textarea').length,0,'the result screen replaces the editor');
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']===true&&String(n.props['aria-label']).startsWith('결과')).length,1);
 await click('게시물에 추가');
 assert.deepEqual(added.map(i=>[i.id,i.aiGenerated]),[['a1',true]]);
});

test('dialog: outfit needs painted area before calling the server',async()=>{
 const {r,calls,click}=await open();
 await act(async()=>{r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick();});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'교복 코스튬'}});});
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
});

test('legacy two-result response: viewer navigation and existing selections are preserved',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'},{id:'a2',type:'image',url:'/a2.png'}],remaining:9}})});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');
 await act(async()=>{r.root.findByProps({'aria-label':'결과 2 크게 보기','title':'크게 보기'}).props.onClick();});
 const viewer=()=>r.root.findAll(n=>n.props.role==='group'&&String(n.props['aria-label']).endsWith('크게 보기'));
 assert.equal(viewer().length,1);assert.match(text(viewer()[0]),/결과 2 \/ 2/);
 assert.equal(r.root.findAll(n=>n.type==='img'&&n.props.alt==='결과 2 (AI 생성 사진)').length,1);
 await act(async()=>{r.root.findByProps({'aria-label':'이전 결과'}).props.onClick();});assert.match(text(viewer()[0]),/결과 1 \/ 2/);
 await act(async()=>{viewer()[0].props.onKeyDown({key:'ArrowRight',preventDefault(){},stopPropagation(){}});});assert.match(text(viewer()[0]),/결과 2 \/ 2/);
 await click('이 사진 선택');assert.match(text(viewer()[0]),/선택됨/);
 await act(async()=>{viewer()[0].props.onKeyDown({key:'Escape',preventDefault(){},stopPropagation(){}});});
 assert.equal(viewer().length,0);assert.match(text(r.toJSON()),/게시물에 추가 \(2\)/,'both results are picked and the editor is still open');
});

test('progress: while making, the button and panel show elapsed seconds and the usual time (or that it is being measured)',async()=>{
 for(const [typical,expect] of [[24,/보통 약 24초 걸려요/],[null,/걸리는 시간을 재는 중/]]){
  let finish;const onEdit=()=>new Promise(resolve=>{finish=resolve;});
  let r;await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota:{remaining:10,limit:10,typicalSeconds:typical},room:9,onEdit,onAdd(){}}));});
  await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
  await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
  await act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes('1장 만들기')).props.onClick();});
  const all=text(r.toJSON());assert.match(all,expect);assert.match(all,/0초 지남/);assert.match(all,/만드는 중… 0초/);assert.match(all,/창을 닫지 말고/);
  await act(async()=>{finish({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null});});
  assert.doesNotMatch(text(r.toJSON()),/초 지남/);
 }
});


test('compact stages: edit settings preserves prompt, source, style, consent and remaining quota',async()=>{
 const {r,click,calls}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.equal(r.root.findAllByType('textarea').length,0);
 await click('설정 수정');assert.equal(r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 9\/10/);
 await click('1장 만들기');assert.equal(calls.length,2);assert.deepEqual(calls[1],calls[0]);
});

test('compact stages: provider failure restores the editable form without losing the request',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:false,errorMessage:'생성에 실패했어요',errorCode:'PROVIDER_ERROR'})});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.match(text(r.toJSON()),/생성에 실패했어요/);
 assert.equal(r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 10\/10/);
});

test('compact results: cannot add more photos than the remaining post capacity',async()=>{
 const {r,click,added}=await open({room:0});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');
 await click('게시물에 추가');assert.equal(added.length,0);assert.match(text(r.toJSON()),/사진은 0장만 더 넣을 수/);
});


test('regenerate failure keeps the previously selected photos available to add',async()=>{
 let count=0;const {r,click,added}=await open({onEdit:async()=>++count===1?{success:true,data:{images:[{id:'keep',type:'image',url:'/keep.png'}],remaining:9}}:{success:false,errorMessage:'다시 만들지 못했어요',errorCode:'PROVIDER_ERROR'}});
 await act(async()=>{r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');await click('다시 만들기');assert.match(text(r.toJSON()),/다시 만들지 못했어요/);
 await click('게시물에 추가');assert.deepEqual(added.map(i=>i.id),['keep']);
});

test('preset editor: browsing and toggling preserves custom-only input and never exposes accumulated instructions',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내가 작성한 추가 요청'}}));await click('다른 예시 보기');
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());
 await click('환한 미소');assert.equal(field().props.value,'내가 작성한 추가 요청');assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(r.root.findAllByProps({'aria-label':'최종 프롬프트'}).length,0);assert.equal(r.root.findAllByType('textarea').length,1);
 await click('환한 미소');assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],false);assert.equal(field().props.value,'내가 작성한 추가 요청');assert.equal(calls.length,0);
});


test('preset selection and custom input are independent and both reach the provider',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 메이크업 추가 요청'}}));await click('코랄 립');await click('코랄 립');assert.equal(field().props.value,'내 메이크업 추가 요청');await click('코랄 립');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].kind,'makeup');assert.equal(calls[0].prompt,'입술을 자연스러운 코랄 톤으로 바꿔줘.\n내 메이크업 추가 요청');assert.equal(calls[0].mask,undefined);
});


test('single-image flow: only generate stays in footer and all editor fields scroll in the body',async()=>{
 const {r,click}=await open();const footer=r.root.findByProps({className:'footer'}),body=r.root.findByProps({className:'body'});
 assert.equal(footer.findAllByType('button').length,1);assert.equal(text(footer),'1장 만들기');assert.equal(footer.findAllByType('textarea').length,0);
 assert.equal(body.findAllByProps({className:'sourceSection'}).length,1);assert.equal(body.findAllByProps({className:'composer'}).length,1);assert.equal(body.findAllByProps({className:'quota'}).length,1);
 await act(async()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}).props.onChange({target:{value:'밝게 웃어줘'}}));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
 assert.equal(r.root.findAllByProps({className:'footer'}).length,0);assert.equal(r.root.findByProps({className:'body'}).findAllByProps({className:'resultActions'}).length,1);
});

test('cosplay wardrobe: selected outfits toggle independently and never overwrite custom text across tabs',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));await click('코스어 모드');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,8);
 await click('비치 투피스');assert.equal(field().props.value,'내 추가 요청');assert.equal(r.root.findByProps({'aria-label':'비치 투피스'}).props['aria-pressed'],true);await click('비치 투피스');assert.equal(r.root.findByProps({'aria-label':'비치 투피스'}).props['aria-pressed'],false);
 await click('고딕 오프숄더');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());assert.equal(field().props.value,'내 추가 요청');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick());assert.equal(r.root.findByProps({'aria-label':'고딕 오프숄더'}).props['aria-pressed'],true);await click('일반 모드');assert.equal(field().props.value,'내 추가 요청');assert.equal(calls.length,0);
});


test('cosplay wardrobe keeps the outfit mask gate and submits cosplay style only with a painted mask',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('사이버 슈트');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 maskCalls=[];await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'outfit');assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(maskCalls.length,1);assert.equal(maskCalls[0][0],photo.url);assert.match(calls[0].prompt,/크롭톱/);
 await click('설정 수정');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());await click('환한 미소');await click('1장 만들기');assert.equal(calls[1].style,'cosplay');assert.equal(calls[1].kind,'combined');assert.deepEqual(calls[1].editKinds,['outfit','expression']);assert.equal(calls[1].mask,paintedMask);
});

test('wardrobe views: all five forms keep drafts, mask and consent and submit the same one-image request',async()=>{
 const {costumeViews}=loadTypeScript('components/crefans/studio/AiPhotoWardrobe.tsx');assert.equal(costumeViews.length,5);
 const {r,click,calls}=await open();await click('코스어 모드');await click('아이돌 무대복');
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 const draft=field().props.value+' 배경도 그대로 유지해줘.';
 await act(async()=>field().props.onChange({target:{value:draft}}));
 const strokes=[{size:.06,points:[{x:.5,y:.6}]}];
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange(strokes));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 for(const [i,view] of costumeViews.entries()){
  await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange(view.value));
  assert.equal(r.root.findAllByProps({'data-costume-view':view.value}).length,1);
  const picker=r.root.findByProps({className:'wardrobeHeading'}).find(n=>typeof n.type==='function'&&n.props.label==='보기 형식');assert.equal(picker.props.hideLabel,true);
  assert.equal(field().props.value,draft);assert.equal(r.root.findAllByType('textarea').length,1);
  assert.deepEqual(r.root.findByProps({'data-mask-editor':true}).props.strokes,strokes);
  assert.equal(calls.length,i,'switching views never generates');
  const controls=r.root.findByProps({className:'controls'}),composer=controls.findByProps({className:'composer'}),wardrobe=controls.findByProps({className:'wardrobe'});
  assert.equal(controls.children.indexOf(composer)<controls.children.indexOf(wardrobe),view.value==='composer');
  assert.equal(r.root.findByProps({className:'footer'}).findAllByType('button').length,1);
  await click('1장 만들기');assert.equal(calls.length,i+1);assert.equal(calls[i].prompt,rules.aiPhotoPresetText(loadTypeScript('lib/crefans/ai-photo-costumes.ts').aiPhotoCostumes.find(c=>c.id==='idol').prompt)+'\n'+draft.trim());assert.equal(calls[i].mask,paintedMask);assert.equal(calls[i].style,'cosplay');
  assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
  await click('설정 수정');assert.equal(r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.value,view.value);
 }
});

test('wardrobe carousel: browsing preserves input and apply/thumbnail both deselect an active costume',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange('carousel'));const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'내 의상 요청'}}));
 await act(async()=>r.root.findByProps({'aria-label':'이전 의상'}).props.onClick());assert.match(text(r.root.findByProps({className:'showcaseCaption'})),/비치 투피스8 \/ 8/);await act(async()=>r.root.findByProps({'aria-label':'다음 의상'}).props.onClick());
 await click('이 의상 선택');assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],true);await click('선택 해제');assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],false);await click('비치 투피스');await click('비치 투피스');assert.equal(field().props.value,'내 의상 요청');assert.equal(calls.length,0);
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

test('costume categories: seven populated groups, existing eight general styles, and 24 unique short prompts',()=>{
 const {aiPhotoCostumes,aiPhotoCostumeCategories}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 assert.equal(aiPhotoCostumeCategories.length,7);assert.deepEqual(aiPhotoCostumeCategories.map(c=>aiPhotoCostumes.filter(x=>x.category===c.value).length),[8,4,4,4,4,4,4]);
 assert.deepEqual(aiPhotoCostumes.filter(c=>c.category==='general').map(c=>c.id),['maid','sailor','gothic','mage','cyber','idol','cheer','beach']);
 assert.equal(new Set(aiPhotoCostumes.map(c=>c.prompt)).size,32);
 for(const c of aiPhotoCostumes){assert.ok(aiPhotoCostumeCategories.some(g=>g.value===c.category));assert.ok(c.prompt.length<=300);assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',prompt:c.prompt,hasMask:true}),'');}
});

test('category filters: all seven work in five views without losing request/mask/consent; carousel stays inside the group',async()=>{
 const {aiPhotoCostumes,aiPhotoCostumeCategories}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
 const {costumeViews}=loadTypeScript('components/crefans/studio/AiPhotoWardrobe.tsx');
 const {r,click,calls}=await open();await click('코스어 모드');
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}),category=()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');
 const strokes=[{size:.03,points:[{x:.5,y:.6}]}];await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange(strokes));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 const chosen=[];let previous='내 의상 요청';await act(async()=>field().props.onChange({target:{value:previous}}));
 for(const group of aiPhotoCostumeCategories){
  await act(async()=>category().props.onChange(group.value));assert.equal(field().props.value,previous);assert.deepEqual(r.root.findByProps({'data-mask-editor':true}).props.strokes,strokes);
  const items=aiPhotoCostumes.filter(c=>c.category===group.value);
  for(const view of costumeViews){
   await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange(view.value));
   const cards=r.root.findByProps({'aria-label':'코스프레 의상'}).findAll(n=>n.type==='button');assert.deepEqual(cards.map(c=>c.props['aria-label']),items.map(c=>c.name));assert.equal(field().props.value,previous);
  }
  await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange('carousel'));
  await act(async()=>r.root.findByProps({'aria-label':'이전 의상'}).props.onClick());assert.match(text(r.root.findByProps({className:'showcaseCaption'})),new RegExp(items.at(-1).name));assert.equal(field().props.value,previous);
  await act(async()=>r.root.findByProps({'aria-label':items[0].name}).props.onClick());chosen.push(rules.aiPhotoPresetText(items[0].prompt));assert.equal(field().props.value,previous);
 }
 assert.equal(calls.length,0,'filtering/browsing/picking never generates');
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(calls[0].prompt,[...chosen,previous].join('\n'));
 await click('설정 수정');assert.equal(category().props.value,'jujutsu');
 await act(async()=>category().props.onChange('nikke'));await click('누아르 바니');await click('누아르 바니');assert.equal(field().props.value,previous);
});

test('hidden prompt: selections toggle across five categories, custom text stays independent and only active requests are submitted',async()=>{
 const {aiPhotoPresetPage,aiPhotoPresetTitle}=loadTypeScript('lib/crefans/ai-photo-presets.ts');const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});const snippets=[];
 for(const [kind,label] of [['outfit','옷'],['makeup','메이크업'],['expression','표정'],['pose','포즈'],['background','배경']]){
  await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());const example=aiPhotoPresetPage(kind,0).examples[kind==='expression'?1:0],name=aiPhotoPresetTitle(kind,example);snippets.push(example);await click(name);assert.equal(field().props.value,'');assert.equal(r.root.findByProps({'aria-label':name}).props['aria-pressed'],true);await click(name);assert.equal(r.root.findByProps({'aria-label':name}).props['aria-pressed'],false);await click(name);
 }
 assert.equal(r.root.findAllByProps({'aria-label':'최종 프롬프트'}).length,0);assert.equal(r.root.findAllByType('textarea').length,1);for(const snippet of snippets)assert.ok(!JSON.stringify(r.toJSON()).includes(snippet),'accumulated preset text is not rendered');assert.equal(calls.length,0);
 await act(async()=>field().props.onChange({target:{value:'내가 추가로 원하는 모습'}}));await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));await click('1장 만들기');assert.equal(calls[0].kind,'combined');assert.deepEqual(calls[0].editKinds,['outfit','makeup','expression','pose','background']);assert.equal(calls[0].prompt,[...snippets,'내가 추가로 원하는 모습'].join('\n'));assert.equal(calls[0].mask,paintedMask);
});


test('generated image editing: uses generated source, resets final request and mask, preserves earlier results on failure',async()=>{
 const sent=[];let count=0;
 const {r,click,added}=await open({onEdit:async input=>{sent.push(input);count++;return count<3?{success:true,data:{images:[{id:'made-'+count,type:'image',url:'/made-'+count+'.png'}],remaining:10-count}}:{success:false,errorMessage:'편집 실패',errorCode:'PROVIDER_ERROR'};}});
 const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'앉은 포즈로 바꿔줘'}}));await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');
 await act(async()=>r.root.findByProps({'aria-label':'결과 1 이미지 편집'}).props.onClick());assert.equal(field().props.value,'');assert.equal(r.root.findAllByType('textarea').length,1);assert.match(text(r.toJSON()),/편집할 이미지/);
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='배경').props.onClick());await act(async()=>field().props.onChange({target:{value:'흰 스튜디오 배경'}}));await click('1장 만들기');
 assert.equal(sent[0].source.id,'p1');assert.equal(sent[1].source.id,'made-1');assert.equal(sent[1].kind,'background');assert.equal(sent[1].mask,undefined);assert.equal(sent[1].prompt,'흰 스튜디오 배경');
 await act(async()=>r.root.findByProps({'aria-label':'결과 1 이미지 편집'}).props.onClick());await act(async()=>field().props.onChange({target:{value:'다시 웃는 포즈'}}));await click('1장 만들기');assert.equal(sent[2].source.id,'made-2');assert.match(text(r.toJSON()),/편집 실패/);
 await click('게시물에 추가');assert.equal(added[0].id,'made-2');assert.equal(photo.id,'p1');
});

test('category logos: all seven options provide local images and do not alter category labels or prompts',async()=>{
 const fs=require('fs');const {r,click}=await open();await click('코스어 모드');const picker=r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');assert.equal(picker.props.options.length,7);
 for(const option of picker.props.options){assert.ok(option.image.startsWith('/brand/ai-photo/'));assert.ok(fs.existsSync(require('path').join(__dirname,'../public',option.image)));}
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');const sample=aiPhotoCostumes.find(c=>c.category==='nikke');assert.ok(!rules.aiPhotoPresetText(sample.prompt).includes('배경은 그대로 유지'));assert.ok(sample.prompt.includes(sample.wig));assert.ok(sample.prompt.includes(sample.accessories));
});


test('gender is composed internally without appearing in or changing the custom input',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'부드러운 조명'}}));await click('남성');await click('여성');assert.equal(field().props.value,'부드러운 조명');await click('원본 유지');assert.equal(field().props.value,'부드러운 조명');await click('남성');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].targetGender,'male');assert.equal(calls[0].prompt,'생성 인물을 성인 남성으로 바꿔줘.\n부드러운 조명');
});


test('body controls and photo presets share selection state, toggle off only the chosen axis and keep custom input',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='신체 보정').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'}),range=label=>r.root.find(n=>n.type==='input'&&n.props['aria-label']===label);await act(async()=>field().props.onChange({target:{value:'자연스럽게'}}));
 await click('가슴 조금 작게');assert.equal(range('가슴 크기').props.value,-1);await click('가슴 조금 크게');assert.equal(range('가슴 크기').props.value,1);assert.equal(r.root.findByProps({'aria-label':'가슴 조금 작게'}).props['aria-pressed'],false);await click('가슴 조금 크게');assert.equal(range('가슴 크기').props.value,0);
 await act(async()=>range('가슴 크기').props.onChange({target:{value:'-2'}}));await act(async()=>range('힙 크기').props.onChange({target:{value:'-1'}}));await act(async()=>range('키 비율').props.onChange({target:{value:'2'}}));await act(async()=>range('키 비율').props.onChange({target:{value:'0'}}));assert.equal(field().props.value,'자연스럽게');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].kind,'body');assert.match(calls[0].prompt,/가슴 크기를 좀 더 작게/);assert.match(calls[0].prompt,/힙 크기를 조금 작게/);assert.doesNotMatch(calls[0].prompt,/키 비율/);assert.ok(calls[0].prompt.endsWith('자연스럽게'));
});


test('every preset has a distinct decodable photo including Comic World, 24 poses and Canon lens model prompts',async()=>{
 const fs=require('fs'),path=require('path'),sharp=require('sharp');const {aiPhotoPresets,aiPhotoPresetImage,aiPhotoComicWorldPreset,aiPhotoPresetTitle,aiPhotoPresetTitles}=loadTypeScript('lib/crefans/ai-photo-presets.ts');const images=[];
 assert.equal(aiPhotoPresets.pose.length,24);assert.equal(aiPhotoPresets.lens.length,6);assert.equal(aiPhotoPresets.background[0],aiPhotoComicWorldPreset);
 for(const [kind,values] of Object.entries(aiPhotoPresets)){assert.equal(aiPhotoPresetTitles[kind].length,values.length);assert.equal(new Set(aiPhotoPresetTitles[kind]).size,values.length);for(const example of values){assert.ok(aiPhotoPresetTitle(kind,example));assert.ok(aiPhotoPresetTitle(kind,example).length<=20);const image=aiPhotoPresetImage(kind,example);images.push(image);const meta=await sharp(fs.readFileSync(path.join(__dirname,'../public',image))).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);}
 }
 const genderPaths=[];for(const gender of ['female','male'])for(const example of aiPhotoPresets.expression){const image=aiPhotoPresetImage('expression',example,gender);genderPaths.push(image);const meta=await sharp(fs.readFileSync(path.join(__dirname,'../public',image))).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);}assert.equal(new Set(genderPaths).size,26);
 assert.equal(images.length,92);assert.equal(new Set(images).size,92);for(const value of aiPhotoPresets.lens)assert.match(value,/Canon RF.*촬영한? 느낌|Canon RF.*촬영 느낌/);
});

test('gender-only request on outfit tab does not require clothing painting or send an outfit edit',async()=>{
 const {r,click,calls}=await open();await click('코스어 모드');await click('남성');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].targetGender,'male');assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.match(text(r.toJSON()),/남성으로 변경/);
});


test('deselecting the last clothing preset removes only that request and its mask requirement',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));await click('쪼그려 앉기');await click('코스어 모드');await click('사이버 슈트');await click('사이버 슈트');assert.equal(r.root.findByProps({'aria-label':'사이버 슈트'}).props['aria-pressed'],false);assert.equal(field().props.value,'내 추가 요청');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.match(calls[0].prompt,/쪼그려/);assert.doesNotMatch(calls[0].prompt,/사이버|크롭톱/);assert.ok(calls[0].prompt.endsWith('내 추가 요청'));
});

test('combined length is bounded without truncating custom input or blocking deselection',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'가'.repeat(2000)}}));await click('쪼그려 앉기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],false);assert.equal(field().props.value.length,2000);assert.match(text(r.toJSON()),/너무 길어요/);
 await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));await click('쪼그려 앉기');await act(async()=>field().props.onChange({target:{value:'가'.repeat(2000)}}));assert.match(text(r.toJSON()),/합쳐서 2000자/);await click('쪼그려 앉기');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],false);assert.equal(field().props.value.length,2000);assert.equal(calls.length,0);
});


test('expression previews follow selected gender while the chosen expression, custom input and source remain unchanged',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'자연스러운 조명'}}));await click('환한 미소');
 const previews=()=>r.root.findAll(n=>n.type==='img'&&String(n.props.src).startsWith('/brand/ai-photo/presets/expression-')).map(n=>n.props.src);
 await click('여성');assert.deepEqual(previews(),['expression-neutral-female','expression-01','expression-02-female'].map(id=>`/brand/ai-photo/presets/${id}-v1.webp`));assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(field().props.value,'자연스러운 조명');
 await click('남성');assert.deepEqual(previews(),['expression-neutral-male','expression-01-male','expression-02'].map(id=>`/brand/ai-photo/presets/${id}-v1.webp`));assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);assert.equal(calls.length,0);
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].source.id,'p1');assert.equal(calls[0].kind,'expression');assert.equal(calls[0].targetGender,'male');assert.match(calls[0].prompt,/치아가 살짝 보이게/);assert.match(calls[0].prompt,/성인 남성/);assert.doesNotMatch(calls[0].prompt,/성인 여성/);assert.ok(calls[0].prompt.endsWith('자연스러운 조명'));
});


test('neutral is the first default only on first expression visit; alternatives replace it and explicit deselection survives navigation',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});await act(async()=>field().props.onChange({target:{value:'자연스러운 조명'}}));await click('쪼그려 앉기');
 const tab=label=>act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());await tab('표정');const buttons=()=>r.root.findByProps({className:'photoPresetGrid'}).findAllByType('button');assert.equal(buttons()[0].props['aria-label'],'무표정');assert.equal(buttons()[0].props['aria-pressed'],true);assert.equal(field().props.value,'자연스러운 조명');
 await click('환한 미소');assert.equal(buttons()[0].props['aria-pressed'],false);assert.equal(r.root.findByProps({'aria-label':'환한 미소'}).props['aria-pressed'],true);await click('환한 미소');assert.ok(buttons().every(b=>b.props['aria-pressed']===false));await tab('포즈');assert.equal(r.root.findByProps({'aria-label':'쪼그려 앉기'}).props['aria-pressed'],true);await tab('표정');assert.ok(buttons().every(b=>b.props['aria-pressed']===false));await click('무표정');await click('여성');assert.equal(buttons()[0].props['aria-pressed'],true);
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].kind,'combined');assert.match(calls[0].prompt,/무표정/);assert.doesNotMatch(calls[0].prompt,/치아가 살짝/);assert.match(calls[0].prompt,/쪼그려/);assert.ok(calls[0].prompt.endsWith('자연스러운 조명'));await click('게시물에 추가');assert.equal(r.root.findByProps({'aria-label':'무표정'}).props['aria-pressed'],true,'new draft on expression tab starts neutral');
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
 assert.equal(aiPhotoCostumes.length,32);
 for(const item of aiPhotoCostumes){assert.match(item.wig,/가발/);assert.ok(item.accessories);assert.ok(item.footwear);assert.match(item.image,/-v2\.webp$/);for(const part of [item.wig,item.headwear,item.accessories,item.footwear])assert.ok(item.prompt.includes(part),item.id+':'+part);}
 const {r,calls,click}=await open();await click('코스어 모드');await click('리본 메이드');
 assert.match(text(r.toJSON()),/가발·머리장식·소품·신발도 함께 적용/);await click('일반 모드');
 await act(async()=>{r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='배경').props.onClick();});
 await act(async()=>{r.root.find(n=>n.props['data-mask-editor']).props.onChange([{size:.1,points:[{x:.5,y:.5}]}]);});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].style,'cosplay');assert.match(calls[0].prompt,/검정 턱선 단발 가발/);assert.match(calls[0].prompt,/트레이/);assert.match(calls[0].prompt,/메리제인 구두/);assert.ok(calls[0].mask);
});


test('explicit mode switch preserves draft, selections and mask while showing the active mode',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'커스텀 프롬프트'});
 assert.equal(r.root.findByProps({'aria-pressed':true,children:'일반 모드'}).type,'button');await act(async()=>field().props.onChange({target:{value:'내 추가 요청'}}));
 await click('코스어 모드');assert.equal(r.root.findByProps({'aria-pressed':true,children:'코스어 모드'}).type,'button');await click('리본 메이드');
 await act(async()=>r.root.find(n=>n.props['data-mask-editor']).props.onChange([{size:.06,points:[{x:.5,y:.4}]}]));
 await click('일반 모드');assert.equal(field().props.value,'내 추가 요청');assert.equal(r.root.findAllByProps({className:'costumeGrid'}).length,0);
 await click('코스어 모드');assert.equal(r.root.findByProps({'aria-label':'리본 메이드'}).props['aria-pressed'],true);assert.equal(r.root.find(n=>n.props['data-mask-editor']).props.strokes.length,1);assert.equal(field().props.value,'내 추가 요청');assert.equal(calls.length,0);
});
