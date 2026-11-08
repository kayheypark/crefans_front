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
const {AiPhotoDialog}=loadTypeScript('components/crefans/studio/AiPhotoDialog.tsx',{'@/components/ui/Primitives':{Dialog:({open,children})=>open?el('section',{role:'dialog'},children):null,TextAreaField:({label,...props})=>el('textarea',{'aria-label':label,...props})}});
const text=node=>typeof node==='string'?node:(node?.children||[]).map(text).join('');
const photo={id:'p1',type:'image',url:'/p1.png'};
const base={prompt:'벚꽃 아래 앉은 포즈',consent:true,kind:'pose',hasMask:false,remaining:3};

test('rules: limits and order of checks match the decision (10 a day, 2 per request)',()=>{
 assert.equal(rules.AI_PHOTO_DAILY_LIMIT,10);assert.equal(rules.AI_PHOTO_IMAGES_PER_REQUEST,2);
 assert.equal(rules.aiPhotoProblem(base),'');
 assert.match(rules.aiPhotoProblem({...base,remaining:0}),/모두 썼어요/);
 assert.match(rules.aiPhotoProblem({...base,kind:'outfit'}),/칠해/);
 assert.equal(rules.aiPhotoProblem({...base,kind:'outfit',hasMask:true}),'');
 assert.match(rules.aiPhotoProblem({...base,prompt:'  '}),/적어 주세요/);
 assert.match(rules.aiPhotoProblem({...base,prompt:'가'.repeat(301)}),/300자/);
 assert.match(rules.aiPhotoProblem({...base,prompt:'연락은 010-1234-5678'}),/개인정보/);
 assert.match(rules.aiPhotoProblem({...base,consent:false}),/동의/);
});

test('mock edit: two AI images per request, counts down and stops at the limit',async()=>{
 const seen=[];const edit=mockAiPhotoEdit({start:2,delay:0,onRemaining:v=>seen.push(v)});
 const input={source:photo,kind:'pose',prompt:'x',style:'photo',consent:true};
 const one=await edit(input);assert.equal(one.success,true);assert.equal(one.data.images.length,2);assert.ok(one.data.images.every(i=>i.aiGenerated&&i.type==='image'));assert.equal(one.data.remaining,1);
 await edit(input);const over=await edit(input);assert.equal(over.success,false);assert.equal(over.errorCode,'DAILY_LIMIT');assert.deepEqual(seen,[1,0]);
 assert.equal((await mockAiPhotoEdit({delay:0,mode:'blocked'})(input)).errorCode,'UNSAFE_INPUT');
});

async function open(props={}){
 let r,added=[],calls=[];
 const onEdit=async input=>{calls.push(input);return {success:true,data:{images:[{id:'a1',type:'image',url:'/a1.png'},{id:'a2',type:'image',url:'/a2.png'}],remaining:9},errorMessage:null,errorCode:null};};
 await act(async()=>{r=create(el(AiPhotoDialog,{open:true,onClose(){},images:[photo],quota:{remaining:10,limit:10},room:9,onEdit,onAdd:x=>added.push(...x),...props}));});
 const click=async name=>act(async()=>{r.root.find(n=>n.type==='button'&&text(n).includes(name)).props.onClick();});
 return {r,added,calls,click};
}

test('dialog: without an uploaded photo it asks for one first',async()=>{
 const {r}=await open({images:[]});assert.match(text(r.toJSON()),/먼저 바꿀 사진을 올려/);
});

test('dialog: consent is required, then a pose edit sends no mask and adds only the picked AI images',async()=>{
 const {r,added,calls,click}=await open();
 await act(async()=>{r.root.findByProps({'aria-label':'원하는 모습'}).props.onChange({target:{value:'벚꽃 아래 앉은 포즈'}});});
 await click('2장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/동의해 주세요/);
 await act(async()=>{r.root.find(n=>typeof n.type==='function'&&n.props.label&&n.props.onChange&&n.props.checked===false).props.onChange(true);});
 assert.doesNotMatch(text(r.toJSON()),/동의해 주세요/);
 await click('2장 만들기');
 assert.equal(calls.length,1);assert.equal(calls[0].kind,'pose');assert.equal(calls[0].mask,undefined);assert.equal(calls[0].consent,true);
 assert.match(text(r.toJSON()),/오늘 남은 횟수 9\/10/);
 assert.equal(r.root.findAll(n=>n.type==='button'&&n.props['aria-pressed']===true&&String(n.props['aria-label']).startsWith('결과')).length,1);
 await click('게시물에 추가');
 assert.deepEqual(added.map(i=>[i.id,i.aiGenerated]),[['a1',true]]);
});

test('dialog: outfit needs painted area before calling the server',async()=>{
 const {r,calls,click}=await open();
 await act(async()=>{r.root.find(n=>n.type==='button'&&n.props.role==='tab'&&text(n)==='옷').props.onClick();});
 await act(async()=>{r.root.findByProps({'aria-label':'원하는 모습'}).props.onChange({target:{value:'교복 코스튬'}});});
 await click('2장 만들기');assert.equal(calls.length,0);assert.match(text(r.toJSON()),/옷 부분을 사진 위에 칠해/);
});
