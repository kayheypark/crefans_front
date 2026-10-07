const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {MediaUpload}=loadTypeScript('components/ui/MediaUpload.tsx',{'./media-upload.module.css':styles});
const {createLocalImageStore}=loadTypeScript('components/preview/studio/useLocalImages.ts');
const h=React.createElement;
const file=(type,size=1000)=>({type,size,name:`f.${type.split('/')[1]}`});

test('local media store accepts images and videos with separate limits and rejects other types',async t=>{
  const previous=global.URL;let created=0;
  global.URL={createObjectURL:()=>`blob:${++created}`,revokeObjectURL(){}};
  t.after(()=>{global.URL=previous;});
  const store=createLocalImageStore();
  const image=await store.uploadMedia(file('image/png')),video=await store.uploadMedia(file('video/mp4',50*1024*1024));
  assert.equal(image.success,true);assert.equal(image.data.type,'image');assert.equal(video.success,true);assert.equal(video.data.type,'video');
  assert.notEqual(image.data.id,video.data.id);assert.ok(store.owns(video.data.url));
  assert.equal((await store.uploadMedia(file('image/gif'))).errorCode,'INVALID_MEDIA_TYPE');
  assert.equal((await store.uploadMedia(file('image/png',6*1024*1024))).errorCode,'INVALID_MEDIA_SIZE');
  assert.equal((await store.uploadMedia(file('video/mp4',301*1024*1024))).errorCode,'INVALID_MEDIA_SIZE');
  assert.equal((await store.upload(file('video/mp4'))).errorCode,'INVALID_IMAGE_TYPE');
});

function mount(props){
  const calls={files:[],removed:[]};
  const base={label:'미디어',items:[],max:3,accept:'image/png,video/mp4',onFilesSelect:files=>calls.files.push(files),onRemove:id=>calls.removed.push(id),...props};
  let view;act(()=>{view=create(h(MediaUpload,base));});
  const buttons=()=>view.root.findAllByType('button');
  return {view,calls,dropzone:()=>buttons().find(item=>item.props['data-compact']!==undefined||item.children.length>1),buttons,update:next=>act(()=>view.update(h(MediaUpload,{...base,...next}))),unmount:()=>act(()=>view.unmount())};
}

test('media upload lists images and videos with badges, forwards multi-file selections, and blocks the zone at the limit',()=>{
  const items=[{id:'a',type:'image',url:'/a.png'},{id:'b',type:'video',url:'/b.mp4'}];
  const picker=mount({items});
  try{
    assert.equal(picker.view.root.findAllByType('li').length,2);
    assert.equal(picker.view.root.findAllByType('img').length,1);assert.equal(picker.view.root.findAllByType('video').length,1);
    assert.match(JSON.stringify(picker.view.toJSON()),/2\/3/);
    const input=picker.view.root.findByType('input');assert.equal(input.props.multiple,true);assert.equal(input.props.disabled,false);
    const selection={currentTarget:{files:[file('image/png'),file('video/mp4')],value:'x'}};
    act(()=>input.props.onChange(selection));
    assert.equal(picker.calls.files.length,1);assert.equal(picker.calls.files[0].length,2);assert.equal(selection.currentTarget.value,'');
    act(()=>picker.buttons().find(item=>item.props['aria-label']==='2번째 동영상 삭제').props.onClick());
    assert.deepEqual(picker.calls.removed,['b']);
    picker.update({items:[...items,{id:'c',type:'image',url:'/c.png'}]});
    assert.equal(picker.view.root.findByType('input').props.disabled,true);
    assert.match(JSON.stringify(picker.view.toJSON()),/최대 3개까지/);
    act(()=>picker.view.root.findByType('input').props.onChange({currentTarget:{files:[file('image/png')],value:'x'}}));
    assert.equal(picker.calls.files.length,2);
  }finally{picker.unmount();}
});

test('an empty media list shows only the full dropzone and no counter tiles',()=>{
  const picker=mount({});
  try{
    assert.equal(picker.view.root.findAllByType('li').length,0);assert.equal(picker.view.root.findAllByType('ul').length,0);
    assert.match(JSON.stringify(picker.view.toJSON()),/0\/3/);
  }finally{picker.unmount();}
});

const {moveItem,slotFor,indexAt}=loadTypeScript('components/ui/media-order.ts');
test('reorder helpers move items, slide the in-between slots, and resolve the tile under the pointer',()=>{
  assert.deepEqual(moveItem(['a','b','c','d'],0,2),['b','c','a','d']);
  assert.deepEqual(moveItem(['a','b','c','d'],3,1),['a','d','b','c']);
  assert.deepEqual(moveItem(['a','b'],1,1),['a','b']);assert.deepEqual(moveItem(['a','b'],5,0),['a','b']);
  assert.deepEqual([0,1,2,3,4].map(index=>slotFor(index,1,3)),[0,1,1,2,4]);
  assert.deepEqual([0,1,2,3,4].map(index=>slotFor(index,3,1)),[0,2,3,3,4]);
  assert.deepEqual([0,1,2].map(index=>slotFor(index,1,1)),[0,1,2]);
  const boxes=[{left:0,top:0,width:100,height:100},{left:110,top:0,width:100,height:100},{left:0,top:110,width:100,height:100}];
  assert.equal(indexAt(boxes,150,50,0),1);assert.equal(indexAt(boxes,50,150,0),2);assert.equal(indexAt(boxes,500,500,1),1);
});

test('dragging a tile past the threshold slides neighbours, commits on release, and keyboard arrows reorder too',()=>{
  const items=[{id:'a',type:'image',url:'/a.png'},{id:'b',type:'image',url:'/b.png'},{id:'c',type:'video',url:'/c.mp4'}];
  const moves=[];
  const boxes=[{left:0,top:0,width:100,height:100},{left:110,top:0,width:100,height:100},{left:220,top:0,width:100,height:100}];
  const tiles=boxes.map(box=>({getBoundingClientRect:()=>box,focus(){},dataset:{},style:{},offsetWidth:100}));
  let view;act(()=>{view=create(h(MediaUpload,{label:'미디어',items,max:10,accept:'image/png',onFilesSelect(){},onRemove(){},onReorder:(from,to)=>moves.push([from,to])}),{createNodeMock:element=>element.type==='ul'?{children:tiles}:null});});
  try{
    const tile=index=>view.root.findAllByType('li')[index];
    const pointerEvent=(x,y)=>({pointerId:1,button:0,clientX:x,clientY:y,target:{closest:()=>null},currentTarget:{setPointerCapture(){}},preventDefault(){}});
    assert.equal(tile(0).props.tabIndex,0);
    act(()=>tile(0).props.onPointerDown(pointerEvent(50,50)));
    act(()=>tile(0).props.onPointerMove(pointerEvent(53,50)));
    assert.equal(tile(1).props.style,undefined);
    act(()=>tile(0).props.onPointerMove(pointerEvent(260,50)));
    assert.equal(tile(0).props['data-dragging'],true);
    assert.match(tile(0).props.style.transform,/translate\(210px,0px\)/);
    assert.match(tile(1).props.style.transform,/translate\(-110px,0px\)/);
    assert.match(tile(2).props.style.transform,/translate\(-110px,0px\)/);
    act(()=>tile(0).props.onPointerUp());
    assert.deepEqual(moves,[[0,2]]);
    assert.equal(tile(0).props['data-dragging'],undefined);assert.equal(tile(1).props.style,undefined);
    act(()=>tile(1).props.onPointerDown(pointerEvent(150,50)));
    act(()=>tile(1).props.onPointerMove(pointerEvent(152,51)));
    act(()=>tile(1).props.onPointerUp());
    assert.equal(moves.length,1);
    act(()=>tile(2).props.onKeyDown({key:'ArrowLeft',preventDefault(){}}));
    assert.deepEqual(moves.at(-1),[2,1]);
    act(()=>tile(0).props.onKeyDown({key:'ArrowLeft',preventDefault(){}}));
    assert.equal(moves.length,2);
  }finally{act(()=>view.unmount());}
});
