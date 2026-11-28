const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement,text=node=>typeof node==='string'?node:(node?.children||[]).map(text).join('');
const {AiPhotoSaveToLibrary}=loadTypeScript('components/crefans/studio/AiPhotoSaveToLibrary.tsx',{
 '@/components/ui/Primitives':{Dialog:({children,onClose,title})=>el('section',{'aria-label':title,onClose},children),Field:({label,...props})=>el('input',{'aria-label':label,...props})},
 '@/components/ui/SelectField':{SelectField:props=>el('select',props)},
});
const media={id:'generated-photo',type:'image',url:'/result.png',aiGenerated:true};
async function mount(save){let r,saved=0,closed=0,uploaded=0;await act(async()=>{r=create(el(AiPhotoSaveToLibrary,{media,model:{save,upload:async()=>{uploaded++;throw Error('must not upload');}},onSaved:()=>saved++,onClose:()=>closed++}));});return {r,get saved(){return saved},get closed(){return closed},get uploaded(){return uploaded}};}
const submit=state=>state.r.root.findByType('form').props.onSubmit({preventDefault(){}});
test('stores the generated media directly with chosen name/category; reports success only after response',async()=>{
 let release,calls=[];const state=await mount(input=>{calls.push(input);return new Promise(resolve=>release=resolve)});
 await act(async()=>{state.r.root.findByType('input').props.onChange({target:{value:'  벚꽃 사진  '}});state.r.root.findByType('select').props.onChange('background')});
 await act(async()=>{submit(state);submit(state)});assert.equal(calls.length,1);assert.equal(state.saved,0);assert.equal(state.r.root.findByType('form').props['aria-busy'],true);
 await act(async()=>state.r.root.findByType('section').props.onClose());assert.equal(state.closed,0,'cannot close while saving');
 assert.deepEqual(calls[0],{id:'generated-photo',title:'벚꽃 사진',category:'background'});
 await act(async()=>release({success:true,data:{...media,title:'벚꽃 사진',category:'background'}}));assert.equal(state.saved,1);assert.equal(state.uploaded,0);
 await act(async()=>state.r.unmount());
});
test('failed save retains values and permits retry; no false success',async()=>{
 let attempts=0;const state=await mount(async()=>++attempts===1?{success:false,errorMessage:'저장 실패'}:{success:true,data:media});
 await act(async()=>state.r.root.findByType('input').props.onChange({target:{value:'내 사진'}}));
 await act(async()=>submit(state));assert.equal(state.saved,0);assert.equal(state.r.root.findByType('input').props.value,'내 사진');assert.equal(text(state.r.root.findByProps({role:'alert'})),'저장 실패');
 await act(async()=>submit(state));assert.equal(state.saved,1);assert.equal(attempts,2);await act(async()=>state.r.unmount());
});
test('empty name, cancel and thrown transport error do not report a save',async()=>{
 let calls=0;const state=await mount(async()=>{calls++;throw Error('network')});
 await act(async()=>state.r.root.findByType('input').props.onChange({target:{value:'  '}}));await act(async()=>submit(state));assert.equal(calls,0);
 await act(async()=>state.r.root.findByType('input').props.onChange({target:{value:'사진'}}));await act(async()=>submit(state));assert.equal(state.saved,0);assert.match(text(state.r.root.findByProps({role:'alert'})),/연결/);
 await act(async()=>state.r.root.findByType('section').props.onClose());assert.equal(state.closed,1);assert.equal(calls,1);await act(async()=>state.r.unmount());
});
test('preview library saves generated photos and preserves their AI mark without upload',async()=>{
 // The test loader loads modules separately, so inject the same generated-photo registry into the library fixture.
 const source=loadTypeScript('components/preview/studio/ai-photo-fixtures.ts');
 const result=await source.mockAiPhotoEdit({delay:0})({consent:true,kind:'pose',source:media});
 const {createMockPhotoLibrary}=loadTypeScript('components/preview/studio/photo-library-fixtures.ts',{'./ai-photo-fixtures':source});
 const library=createMockPhotoLibrary(),photo=result.data.images[0];
 const response=await library.save({id:photo.id,title:'완성 사진',category:'pose'});assert.equal(response.success,true);assert.equal(response.data.aiGenerated,true);
 const list=await library.list({q:'완성',category:'pose',page:0});assert.equal(list.data.items[0].id,photo.id);
});
