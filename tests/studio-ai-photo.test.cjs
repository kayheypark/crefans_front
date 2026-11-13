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
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
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
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'교복 코스튬'}});});
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
});

test('legacy two-result response: viewer navigation and existing selections are preserved',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'},{id:'a2',type:'image',url:'/a2.png'}],remaining:9}})});
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
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
  await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
  await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
  await act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes('1장 만들기')).props.onClick();});
  const all=text(r.toJSON());assert.match(all,expect);assert.match(all,/0초 지남/);assert.match(all,/만드는 중… 0초/);assert.match(all,/창을 닫지 말고/);
  await act(async()=>{finish({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null});});
  assert.doesNotMatch(text(r.toJSON()),/초 지남/);
 }
});


test('compact stages: edit settings preserves prompt, source, style, consent and remaining quota',async()=>{
 const {r,click,calls}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.equal(r.root.findAllByType('textarea').length,0);
 await click('설정 수정');assert.equal(r.root.findByProps({'aria-label':'최종 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 9\/10/);
 await click('1장 만들기');assert.equal(calls.length,2);assert.deepEqual(calls[1],calls[0]);
});

test('compact stages: provider failure restores the editable form without losing the request',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:false,errorMessage:'생성에 실패했어요',errorCode:'PROVIDER_ERROR'})});
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.match(text(r.toJSON()),/생성에 실패했어요/);
 assert.equal(r.root.findByProps({'aria-label':'최종 프롬프트'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 10\/10/);
});

test('compact results: cannot add more photos than the remaining post capacity',async()=>{
 const {r,click,added}=await open({room:0});
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');
 await click('게시물에 추가');assert.equal(added.length,0);assert.match(text(r.toJSON()),/사진은 0장만 더 넣을 수/);
});


test('regenerate failure keeps the previously selected photos available to add',async()=>{
 let count=0;const {r,click,added}=await open({onEdit:async()=>++count===1?{success:true,data:{images:[{id:'keep',type:'image',url:'/keep.png'}],remaining:9}}:{success:false,errorMessage:'다시 만들지 못했어요',errorCode:'PROVIDER_ERROR'}});
 await act(async()=>{r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');await click('다시 만들기');assert.match(text(r.toJSON()),/다시 만들지 못했어요/);
 await click('게시물에 추가');assert.deepEqual(added.map(i=>i.id),['keep']);
});

test('preset editor: sixty natural-language suggestions cycle without calling AI or replacing a draft',async()=>{
 const {aiPhotoPresets,aiPhotoPresetPage}=loadTypeScript('lib/crefans/ai-photo-presets.ts');
 assert.equal(Object.keys(aiPhotoPresets).length,8);
 for(const kind of Object.keys(aiPhotoPresets)){
  const pages=aiPhotoPresetPage(kind,0).pages;const all=Array.from({length:pages},(_,page)=>aiPhotoPresetPage(kind,page).examples).flat();assert.equal(all.length,aiPhotoPresets[kind].length);assert.equal(new Set(all).size,all.length);assert.deepEqual(aiPhotoPresetPage(kind,pages).examples,aiPhotoPresetPage(kind,0).examples);
  for(const prompt of all)assert.equal(rules.aiPhotoProblem({...base,kind,prompt,hasMask:true}),'',prompt);
 }
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 const tab=async label=>act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props.role==='tab').length,8);
 await act(async()=>field().props.onChange({target:{value:'내가 작성한 포즈 요청'}}));
 const first=r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']!==undefined).map(text);
 await click('다른 예시 보기');assert.notDeepEqual(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']!==undefined).map(text),first);assert.equal(field().props.value,'내가 작성한 포즈 요청');
 await tab('표정');assert.equal(field().props.value,'내가 작성한 포즈 요청');await click('치아가 살짝 보이게');const combined='내가 작성한 포즈 요청\n'+aiPhotoPresets.expression[0];assert.equal(field().props.value,combined);
 await tab('포즈');assert.equal(field().props.value,combined);await tab('표정');assert.equal(field().props.value,combined);assert.equal(calls.length,0);
});

test('preset editor: applying an example can be undone, manual edits clear selection, and makeup submits its own kind',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());
 await act(async()=>field().props.onChange({target:{value:'내 메이크업 문구'}}));
 await click('입술을 자연스러운 코랄');await click('예시 적용 취소');assert.equal(field().props.value,'내 메이크업 문구');
 await click('입술을 자연스러운 코랄');await act(async()=>field().props.onChange({target:{value:'입술을 은은한 로즈 톤으로'}}));
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props.className==='preset'&&n.props['aria-pressed']).length,0);
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'makeup');assert.equal(calls[0].prompt,'입술을 은은한 로즈 톤으로');assert.equal(calls[0].mask,undefined);
});

test('single-image flow: only generate stays in footer and all editor fields scroll in the body',async()=>{
 const {r,click}=await open();const footer=r.root.findByProps({className:'footer'}),body=r.root.findByProps({className:'body'});
 assert.equal(footer.findAllByType('button').length,1);assert.equal(text(footer),'1장 만들기');assert.equal(footer.findAllByType('textarea').length,0);
 assert.equal(body.findAllByProps({className:'sourceSection'}).length,1);assert.equal(body.findAllByProps({className:'composer'}).length,1);assert.equal(body.findAllByProps({className:'quota'}).length,1);
 await act(async()=>r.root.findByProps({'aria-label':'최종 프롬프트'}).props.onChange({target:{value:'밝게 웃어줘'}}));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
 assert.equal(r.root.findAllByProps({className:'footer'}).length,0);assert.equal(r.root.findByProps({className:'body'}).findAllByProps({className:'resultActions'}).length,1);
});

test('cosplay wardrobe: opens eight outfits without generation, applies and undoes prompts, and keeps the final prompt across tabs',async()=>{
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');assert.equal(aiPhotoCostumes.length,32);assert.equal(aiPhotoCostumes.filter(c=>c.category==='general').length,8);assert.equal(new Set(aiPhotoCostumes.map(x=>x.id)).size,32);
 for(const c of aiPhotoCostumes)assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',prompt:c.prompt,hasMask:true}),'');
 assert.ok(aiPhotoCostumes.some(c=>c.id==='beach'));assert.ok(aiPhotoCostumes.some(c=>c.detail.includes('크롭')));
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 포즈 초안'}}));await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,8);assert.equal(calls.length,0);
 await click('비치 투피스');assert.equal(field().props.value,'내 포즈 초안\n'+aiPhotoCostumes.find(c=>c.id==='beach').prompt);assert.equal(calls.length,0);
 await click('예시 적용 취소');assert.equal(field().props.value,'내 포즈 초안');await click('고딕 오프숄더');
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());assert.equal(field().props.value,'내 포즈 초안\n'+aiPhotoCostumes.find(c=>c.id==='gothic').prompt);
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick());assert.equal(field().props.value,'내 포즈 초안\n'+aiPhotoCostumes.find(c=>c.id==='gothic').prompt);
 await click('옷 직접 편집');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,0);assert.equal(field().props.value,'내 포즈 초안\n'+aiPhotoCostumes.find(c=>c.id==='gothic').prompt);
 assert.equal(r.root.findAllByProps({'aria-label':'사진 느낌'}).length,0);assert.equal(calls.length,0);await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,8);await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,0);
});

test('cosplay wardrobe keeps the outfit mask gate and submits cosplay style only with a painted mask',async()=>{
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');await click('사이버 슈트');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 maskCalls=[];await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'outfit');assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(maskCalls.length,1);assert.equal(maskCalls[0][0],photo.url);assert.match(calls[0].prompt,/크롭톱/);
 await click('설정 수정');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());await click('치아가 살짝 보이게');await click('1장 만들기');assert.equal(calls[1].style,'cosplay');assert.equal(calls[1].kind,'combined');assert.deepEqual(calls[1].editKinds,['outfit','expression']);assert.equal(calls[1].mask,paintedMask);
});

test('wardrobe views: all five forms keep drafts, mask and consent and submit the same one-image request',async()=>{
 const {costumeViews}=loadTypeScript('components/crefans/studio/AiPhotoWardrobe.tsx');assert.equal(costumeViews.length,5);
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');await click('아이돌 무대복');
 const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
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
  await click('1장 만들기');assert.equal(calls.length,i+1);assert.equal(calls[i].prompt,draft);assert.equal(calls[i].mask,paintedMask);assert.equal(calls[i].style,'cosplay');
  assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
  await click('설정 수정');assert.equal(r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.value,view.value);
 }
});

test('wardrobe carousel: browsing does not replace a draft, wraps around, and applies only when picked',async()=>{
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange('carousel'));
 const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'내 의상 요청'}}));
 await act(async()=>r.root.findByProps({'aria-label':'이전 의상'}).props.onClick());assert.match(text(r.root.findByProps({className:'showcaseCaption'})),/비치 투피스8 \/ 8/);assert.equal(field().props.value,'내 의상 요청');
 await act(async()=>r.root.findByProps({'aria-label':'다음 의상'}).props.onClick());assert.match(text(r.root.findByProps({className:'showcaseCaption'})),/리본 메이드1 \/ 8/);
 await click('이 의상 선택');assert.match(field().props.value,/메이드/);assert.equal(calls.length,0);
 await act(async()=>r.root.findByProps({'aria-label':'비치 투피스'}).props.onClick());assert.match(field().props.value,/수영복/);assert.equal(r.root.findByProps({'aria-label':'비치 투피스'}).props['aria-current'],'true');
 await click('예시 적용 취소');assert.match(field().props.value,/메이드/);assert.equal(calls.length,0);
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
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');
 const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'}),category=()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');
 const strokes=[{size:.03,points:[{x:.5,y:.6}]}];await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange(strokes));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 let previous='내 의상 요청';await act(async()=>field().props.onChange({target:{value:previous}}));
 for(const group of aiPhotoCostumeCategories){
  await act(async()=>category().props.onChange(group.value));assert.equal(field().props.value,previous);assert.deepEqual(r.root.findByProps({'data-mask-editor':true}).props.strokes,strokes);
  const items=aiPhotoCostumes.filter(c=>c.category===group.value);
  for(const view of costumeViews){
   await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange(view.value));
   const cards=r.root.findByProps({'aria-label':'코스프레 의상'}).findAll(n=>n.type==='button');assert.deepEqual(cards.map(c=>c.props['aria-label']),items.map(c=>c.name));assert.equal(field().props.value,previous);
  }
  await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label==='보기 형식').props.onChange('carousel'));
  await act(async()=>r.root.findByProps({'aria-label':'이전 의상'}).props.onClick());assert.match(text(r.root.findByProps({className:'showcaseCaption'})),new RegExp(items.at(-1).name));assert.equal(field().props.value,previous);
  await act(async()=>r.root.findByProps({'aria-label':items[0].name}).props.onClick());assert.equal(field().props.value,rules.appendAiPhotoPrompt(previous,items[0].prompt));previous=field().props.value;
 }
 assert.equal(calls.length,0,'filtering/browsing/picking never generates');
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(calls[0].prompt,previous);
 await click('설정 수정');assert.equal(category().props.value,'jujutsu');
 await act(async()=>category().props.onChange('nikke'));await click('누아르 바니');await click('예시 적용 취소');assert.equal(field().props.value,previous);
});

test('final prompt: five category suggestions accumulate once, undo restores text/scopes, and one combined masked request is sent',async()=>{
 const {aiPhotoPresetPage}=loadTypeScript('lib/crefans/ai-photo-presets.ts');
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 const snippets=[];
 for(const [kind,label] of [['outfit','옷'],['makeup','메이크업'],['expression','표정'],['pose','포즈'],['background','배경']]){
  await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());
  const example=aiPhotoPresetPage(kind,0).examples[0];snippets.push(example);await click(example);assert.equal(field().props.value,snippets.join('\n'));await click(example);assert.equal(field().props.value,snippets.join('\n'));
 }
 await click('예시 적용 취소');assert.equal(field().props.value,snippets.slice(0,-1).join('\n'));await click(snippets.at(-1));assert.equal(calls.length,0);
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));await click('1장 만들기');
 assert.equal(calls.length,1);assert.equal(calls[0].kind,'combined');assert.deepEqual(calls[0].editKinds,['outfit','makeup','expression','pose','background']);assert.equal(calls[0].prompt,snippets.join('\n'));assert.equal(calls[0].mask,paintedMask);
 assert.equal(rules.selectedAiPhotoPresetIndex('B\nA',['A','B']),0);
});

test('generated image editing: uses generated source, resets final request and mask, preserves earlier results on failure',async()=>{
 const sent=[];let count=0;
 const {r,click,added}=await open({onEdit:async input=>{sent.push(input);count++;return count<3?{success:true,data:{images:[{id:'made-'+count,type:'image',url:'/made-'+count+'.png'}],remaining:10-count}}:{success:false,errorMessage:'편집 실패',errorCode:'PROVIDER_ERROR'};}});
 const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 await act(async()=>field().props.onChange({target:{value:'앉은 포즈로 바꿔줘'}}));await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');
 await act(async()=>r.root.findByProps({'aria-label':'결과 1 이미지 편집'}).props.onClick());assert.equal(field().props.value,'');assert.equal(r.root.findAllByType('textarea').length,1);assert.match(text(r.toJSON()),/편집할 이미지/);
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='배경').props.onClick());await act(async()=>field().props.onChange({target:{value:'흰 스튜디오 배경'}}));await click('1장 만들기');
 assert.equal(sent[0].source.id,'p1');assert.equal(sent[1].source.id,'made-1');assert.equal(sent[1].kind,'background');assert.equal(sent[1].mask,undefined);assert.equal(sent[1].prompt,'흰 스튜디오 배경');
 await act(async()=>r.root.findByProps({'aria-label':'결과 1 이미지 편집'}).props.onClick());await act(async()=>field().props.onChange({target:{value:'다시 웃는 포즈'}}));await click('1장 만들기');assert.equal(sent[2].source.id,'made-2');assert.match(text(r.toJSON()),/편집 실패/);
 await click('게시물에 추가');assert.equal(added[0].id,'made-2');assert.equal(photo.id,'p1');
});

test('category logos: all seven options provide local images and do not alter category labels or prompts',async()=>{
 const fs=require('fs');const {r,click}=await open();await click('나를 코스어로 만들기');const picker=r.root.find(n=>typeof n.type==='function'&&n.props.label==='의상 카테고리');assert.equal(picker.props.options.length,7);
 for(const option of picker.props.options){assert.ok(option.image.startsWith('/brand/ai-photo/'));assert.ok(fs.existsSync(require('path').join(__dirname,'../public',option.image)));}
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');const sample=aiPhotoCostumes.find(c=>c.category==='nikke');assert.ok(!rules.aiPhotoPresetText(sample.prompt).includes('배경은 그대로 유지'));assert.ok(sample.prompt.includes('배경은 그대로 유지'));
});


test('gender choice changes actual generation request, replaces prior gender text and can be removed',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});
 await click('남성');assert.match(field().props.value,/성인 남성/);await click('여성');assert.match(field().props.value,/성인 여성/);assert.doesNotMatch(field().props.value,/성인 남성/);assert.equal(calls.length,0);
 await click('원본 유지');assert.equal(field().props.value,'');await click('남성');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls[0].targetGender,'male');assert.match(calls[0].prompt,/성인 남성/);
});


test('body size controls accumulate independent chest, hip and height requests without duplicates or calling AI',async()=>{
 const {r,click,calls}=await open();await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='신체 보정').props.onClick());const field=()=>r.root.findByProps({'aria-label':'최종 프롬프트'});const range=label=>r.root.find(n=>n.type==='input'&&n.props['aria-label']===label);
 await act(async()=>range('가슴 크기').props.onChange({target:{value:'1'}}));await act(async()=>range('힙 크기').props.onChange({target:{value:'-1'}}));await act(async()=>range('키 비율').props.onChange({target:{value:'2'}}));assert.match(field().props.value,/가슴 크기를 조금 크게/);assert.match(field().props.value,/힙 크기를 조금 작게/);assert.match(field().props.value,/키 비율을 좀 더 커/);
 await act(async()=>range('가슴 크기').props.onChange({target:{value:'-2'}}));assert.doesNotMatch(field().props.value,/가슴 크기를 조금 크게/);assert.match(field().props.value,/가슴 크기를 좀 더 작게/);assert.match(field().props.value,/힙 크기/);
 await act(async()=>range('키 비율').props.onChange({target:{value:'0'}}));assert.doesNotMatch(field().props.value,/키 비율/);assert.equal(calls.length,0);
});


test('every preset has a distinct decodable photo including Comic World, 24 poses and Canon lens model prompts',async()=>{
 const fs=require('fs'),path=require('path'),sharp=require('sharp');const {aiPhotoPresets,aiPhotoPresetImage,aiPhotoComicWorldPreset}=loadTypeScript('lib/crefans/ai-photo-presets.ts');const images=[];
 assert.equal(aiPhotoPresets.pose.length,24);assert.equal(aiPhotoPresets.lens.length,6);assert.equal(aiPhotoPresets.background[0],aiPhotoComicWorldPreset);
 for(const [kind,values] of Object.entries(aiPhotoPresets))for(const example of values){const image=aiPhotoPresetImage(kind,example);images.push(image);const meta=await sharp(fs.readFileSync(path.join(__dirname,'../public',image))).metadata();assert.equal(meta.width,384);assert.equal(meta.height,384);}
 assert.equal(images.length,91);assert.equal(new Set(images).size,91);for(const value of aiPhotoPresets.lens)assert.match(value,/Canon RF.*촬영한? 느낌|Canon RF.*촬영 느낌/);
});

test('gender-only request on outfit tab does not require clothing painting or send an outfit edit',async()=>{
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');await click('남성');await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].targetGender,'male');assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.match(text(r.toJSON()),/남성으로 변경/);
});
