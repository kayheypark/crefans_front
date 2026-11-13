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
 assert.match(rules.aiPhotoProblem({...base,prompt:'가'.repeat(301)}),/300자/);
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
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes(name)).props.onClick();});
 return {r,added,calls,click};
}

test('dialog: without an uploaded photo it asks for one first',async()=>{
 const {r}=await open({images:[]});assert.match(text(r.toJSON()),/바꿀 사진을 먼저 올려 주세요/);assert.match(text(r.toJSON()),/사진 올리러 가기/);
});

test('dialog: consent is required, then a pose edit sends no mask and adds only the picked AI images',async()=>{
 const {r,added,calls,click}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
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
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'교복 코스튬'}});});
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
});

test('legacy two-result response: viewer navigation and existing selections are preserved',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'},{id:'a2',type:'image',url:'/a2.png'}],remaining:9}})});
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
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
  await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
  await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
  await act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes('1장 만들기')).props.onClick();});
  const all=text(r.toJSON());assert.match(all,expect);assert.match(all,/0초 지남/);assert.match(all,/만드는 중… 0초/);assert.match(all,/창을 닫지 말고/);
  await act(async()=>{finish({success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'}],remaining:9},errorMessage:null,errorCode:null});});
  assert.doesNotMatch(text(r.toJSON()),/초 지남/);
 }
});


test('compact stages: edit settings preserves prompt, source, style, consent and remaining quota',async()=>{
 const {r,click,calls}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.equal(r.root.findAllByType('textarea').length,0);
 await click('설정 수정');assert.equal(r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 9\/10/);
 await click('1장 만들기');assert.equal(calls.length,2);assert.deepEqual(calls[1],calls[0]);
});

test('compact stages: provider failure restores the editable form without losing the request',async()=>{
 const {r,click}=await open({onEdit:async()=>({success:false,errorMessage:'생성에 실패했어요',errorCode:'PROVIDER_ERROR'})});
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');assert.match(text(r.toJSON()),/생성에 실패했어요/);
 assert.equal(r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.value,'따뜻한 스튜디오 배경');
 assert.match(text(r.toJSON()),/오늘 남은 횟수 10\/10/);
});

test('compact results: cannot add more photos than the remaining post capacity',async()=>{
 const {r,click,added}=await open({room:0});
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');
 await click('게시물에 추가');assert.equal(added.length,0);assert.match(text(r.toJSON()),/사진은 0장만 더 넣을 수/);
});


test('regenerate failure keeps the previously selected photos available to add',async()=>{
 let count=0;const {r,click,added}=await open({onEdit:async()=>++count===1?{success:true,data:{images:[{id:'keep',type:'image',url:'/keep.png'}],remaining:9}}:{success:false,errorMessage:'다시 만들지 못했어요',errorCode:'PROVIDER_ERROR'}});
 await act(async()=>{r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'따뜻한 스튜디오 배경'}});});
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 await click('1장 만들기');await click('다시 만들기');assert.match(text(r.toJSON()),/다시 만들지 못했어요/);
 await click('게시물에 추가');assert.deepEqual(added.map(i=>i.id),['keep']);
});

test('preset editor: sixty natural-language suggestions cycle without calling AI or replacing a draft',async()=>{
 const {aiPhotoPresets,aiPhotoPresetPage}=loadTypeScript('lib/crefans/ai-photo-presets.ts');
 assert.equal(Object.keys(aiPhotoPresets).length,5);
 for(const kind of Object.keys(aiPhotoPresets)){
  const all=Array.from({length:4},(_,page)=>aiPhotoPresetPage(kind,page).examples).flat();assert.equal(all.length,12);assert.equal(new Set(all).size,12);assert.deepEqual(aiPhotoPresetPage(kind,4).examples,aiPhotoPresetPage(kind,0).examples);
  for(const prompt of all)assert.equal(rules.aiPhotoProblem({...base,kind,prompt,hasMask:true}),'',prompt);
 }
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'직접 입력 · 수정'});
 const tab=async label=>act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)===label).props.onClick());
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props.role==='tab').length,5);
 await act(async()=>field().props.onChange({target:{value:'내가 작성한 포즈 요청'}}));
 const first=r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']!==undefined).map(text);
 await click('다른 예시 보기');assert.notDeepEqual(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']!==undefined).map(text),first);assert.equal(field().props.value,'내가 작성한 포즈 요청');
 await tab('표정');assert.equal(field().props.value,'');await click('치아가 살짝 보이게');assert.equal(field().props.value,aiPhotoPresets.expression[0]);
 await tab('포즈');assert.equal(field().props.value,'내가 작성한 포즈 요청');await tab('표정');assert.equal(field().props.value,aiPhotoPresets.expression[0]);assert.equal(calls.length,0);
});

test('preset editor: applying an example can be undone, manual edits clear selection, and makeup submits its own kind',async()=>{
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'직접 입력 · 수정'});
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='메이크업').props.onClick());
 await act(async()=>field().props.onChange({target:{value:'내 메이크업 문구'}}));
 await click('입술을 자연스러운 코랄');await click('예시 적용 취소');assert.equal(field().props.value,'내 메이크업 문구');
 await click('입술을 자연스러운 코랄');await act(async()=>field().props.onChange({target:{value:'입술을 은은한 로즈 톤으로'}}));
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']!==undefined&&n.props['aria-pressed']).length,0);
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'makeup');assert.equal(calls[0].prompt,'입술을 은은한 로즈 톤으로');assert.equal(calls[0].mask,undefined);
});

test('single-image flow: only generate stays in footer and all editor fields scroll in the body',async()=>{
 const {r,click}=await open();const footer=r.root.findByProps({className:'footer'}),body=r.root.findByProps({className:'body'});
 assert.equal(footer.findAllByType('button').length,1);assert.equal(text(footer),'1장 만들기');assert.equal(footer.findAllByType('textarea').length,0);
 assert.equal(body.findAllByProps({className:'sourceSection'}).length,1);assert.equal(body.findAllByProps({className:'composer'}).length,1);assert.equal(body.findAllByProps({className:'quota'}).length,1);
 await act(async()=>r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'밝게 웃어줘'}}));
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(r.root.findAllByProps({'aria-label':'결과 1'}).length,1);assert.equal(r.root.findAllByProps({'aria-label':'결과 2'}).length,0);
 assert.equal(r.root.findAllByProps({className:'footer'}).length,0);assert.equal(r.root.findByProps({className:'body'}).findAllByProps({className:'resultActions'}).length,1);
});

test('cosplay wardrobe: opens eight outfits without generation, applies and undoes prompts, and keeps category drafts',async()=>{
 const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');assert.equal(aiPhotoCostumes.length,8);assert.equal(new Set(aiPhotoCostumes.map(x=>x.id)).size,8);
 for(const c of aiPhotoCostumes)assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',prompt:c.prompt,hasMask:true}),'');
 assert.ok(aiPhotoCostumes.some(c=>c.id==='beach'));assert.ok(aiPhotoCostumes.some(c=>c.detail.includes('크롭')));
 const {r,click,calls}=await open();const field=()=>r.root.findByProps({'aria-label':'직접 입력 · 수정'});
 await act(async()=>field().props.onChange({target:{value:'내 포즈 초안'}}));await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,8);assert.equal(calls.length,0);
 await click('비치 투피스');assert.equal(field().props.value,aiPhotoCostumes.find(c=>c.id==='beach').prompt);assert.equal(calls.length,0);
 await click('예시 적용 취소');assert.equal(field().props.value,'');await click('고딕 오프숄더');
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='포즈').props.onClick());assert.equal(field().props.value,'내 포즈 초안');
 await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick());assert.equal(field().props.value,aiPhotoCostumes.find(c=>c.id==='gothic').prompt);
 await click('옷 직접 편집');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,0);assert.equal(field().props.value,aiPhotoCostumes.find(c=>c.id==='gothic').prompt);
 assert.equal(r.root.findAllByProps({'aria-label':'사진 느낌'}).length,0);assert.equal(calls.length,0);await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,8);await click('나를 코스어로 만들기');assert.equal(r.root.findAllByProps({className:'costumeCard'}).length,0);
});

test('cosplay wardrobe keeps the outfit mask gate and submits cosplay style only with a painted mask',async()=>{
 const {r,click,calls}=await open();await click('나를 코스어로 만들기');await click('사이버 슈트');
 await act(async()=>r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true));
 await click('1장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
 await act(async()=>r.root.findByProps({'data-mask-editor':true}).props.onChange([{size:.06,points:[{x:.5,y:.6}]}]));
 maskCalls=[];await click('1장 만들기');assert.equal(calls.length,1);assert.equal(calls[0].kind,'outfit');assert.equal(calls[0].style,'cosplay');assert.equal(calls[0].mask,paintedMask);assert.equal(maskCalls.length,1);assert.equal(maskCalls[0][0],photo.url);assert.match(calls[0].prompt,/크롭톱/);
 await click('설정 수정');await act(async()=>r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='표정').props.onClick());await act(async()=>r.root.findByProps({'aria-label':'직접 입력 · 수정'}).props.onChange({target:{value:'밝게 웃어줘'}}));await click('1장 만들기');assert.equal(calls[1].style,'photo');assert.equal(calls[1].mask,undefined);
});
