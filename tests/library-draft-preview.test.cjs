const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');

test('an extracted photo opens full screen before saving and the draft survives closing',async()=>{
 const {AiPhotoLibrary}=loadTypeScript('components/crefans/studio/AiPhotoLibrary.tsx',{
  '@/components/ui/Primitives':{Dialog:({open,children,...props})=>open?React.createElement('dialog',props,children):null,Field:'field'},
  '@/components/ui/MediaUpload':{MediaUpload:'upload'},'./AiPhotoVideoFrame':{AiPhotoVideoFrame:'frame-picker'},
  '@/components/ui/SelectField':{SelectField:'select-field'},'../ServiceUI':{Action:'button'},
 });
 const model={list:async()=>({success:true,data:{items:[],hasMore:false}})};
 let view;
 try{
  await act(async()=>{view=create(React.createElement(AiPhotoLibrary,{open:true,manage:true,model,onClose(){}}));});
  const one=type=>view.root.findByType(type);
  await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('업로드')).props.onClick());
  await act(async()=>view.root.findByProps({'aria-label':'동영상에서 사진 추출'}).props.onClick());
  await act(async()=>one('upload').props.onFilesSelect([new File(['video'],'scene.mp4',{type:'video/mp4'})]));
  await act(async()=>one('frame-picker').props.onSelect(new File(['frame'],'scene.jpg',{type:'image/jpeg'})));
  const url=one('upload').props.items[0].url;
  await act(async()=>one('field').props.onChange({target:{value:'선택한 장면'}}));
  await act(async()=>one('upload').props.onPreview(0));
  const viewer=view.root.findAllByType('dialog').find(d=>d.props.title==='선택한 장면');
  assert.equal(viewer.props.fullscreenOnMobile,true);
  assert.equal(viewer.findByType('img').props.src,url);
  await act(async()=>viewer.props.onClose());
  assert.equal(one('field').props.value,'선택한 장면');
  assert.equal(one('upload').props.items[0].url,url);
 }finally{await act(async()=>view?.unmount());}
});
