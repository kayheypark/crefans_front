const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');

test('a slow seek displays feedback over the old frame until the new frame is drawable',t=>{
 const {AiPhotoVideoFrame}=loadTypeScript('components/crefans/studio/AiPhotoVideoFrame.tsx',{
  '@/lib/design/image-optimize':{fitWithin:()=>({width:20,height:20})},
  './LibraryVideoStatus':{LibraryVideoStatus:({label})=>label},
  '../ServiceUI':{Action:'button'},
  './photo-library.module.css':{__esModule:true,default:{}},
 });
 const video={currentTime:0,duration:7,videoWidth:20,videoHeight:20,readyState:2,play:async()=>{},pause(){}};
 const canvas={getContext:()=>({drawImage(){}})};
 const previous=global.window;
 global.window={setTimeout,clearTimeout};
 let view;
 t.after(()=>{act(()=>view?.unmount());global.window=previous;});
 act(()=>{view=create(React.createElement(AiPhotoVideoFrame,{src:'blob:video',name:'sample',onSelect(){}}),{
  createNodeMock:node=>node.type==='video'?video:canvas,
 });});
 const props=()=>view.root.findByType('video').props;
 const screen=()=>JSON.stringify(view.toJSON());
 assert.match(screen(),/동영상 준비 중/);
 act(()=>{props().onLoadedMetadata({currentTarget:video});props().onSeeked({currentTarget:video});});
 act(()=>view.root.findByType('input').props.onChange({currentTarget:{valueAsNumber:3}}));
 assert.match(screen(),/장면 불러오는 중/);
 assert.equal(view.root.findByType('button').props.disabled,true);
 act(()=>props().onSeeked({currentTarget:video}));
 assert.doesNotMatch(screen(),/장면 불러오는 중/);
 assert.equal(view.root.findByType('button').props.disabled,false);
});
