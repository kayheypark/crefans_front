const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {ProfileHeader}=loadTypeScript('components/crefans/ProfileHeader.tsx',{
 './creator.module.css':styles,'./social.module.css':styles,
 './ServiceUI':{Avatar:({creator,size})=>React.createElement('img',{src:creator.image,alt:creator.name,width:size})},
 './Icon':()=>React.createElement('svg'),
});
const props={person:{name:'주입된 작가',image:'/avatar.jpg'},cover:'/cover.jpg',handle:'artist',bio:'',counts:[]};
function mount(input){let tree;act(()=>{tree=create(React.createElement(ProfileHeader,input));});return tree;}
const button=(tree,label)=>tree.root.findAllByType('button').find(node=>node.props['aria-label']===label);
test('profile avatar and cover reuse the media-only overlay with the original URL and no post detail/actions',async()=>{
 const tree=mount(props);
 try{
  for(const [label,url] of [['프로필 사진','/avatar.jpg'],['배경사진','/cover.jpg']]){
   act(()=>button(tree,`주입된 작가 ${label} 크게 보기`).props.onClick({currentTarget:{focus(){}}}));
   const dialog=tree.root.findByProps({role:'dialog'});
   assert.equal(dialog.props['data-media-only'],true);assert.equal(dialog.props['aria-label'],`주입된 작가 ${label}`);
   assert.equal(dialog.findByType('img').props.src,url);assert.equal(dialog.findAllByType('aside').length,0);
   assert.deepEqual(dialog.findAllByType('button').map(n=>n.props['aria-label']),['닫기']);
   act(()=>button(tree,'닫기').props.onClick({stopPropagation(){}}));
   await act(async()=>{await new Promise(r=>setTimeout(r,150));});
   assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);
  }
 }finally{act(()=>tree.unmount());}
});
test('missing/failed profile photos have no viewer entry; a replacement image becomes viewable',()=>{
 const tree=mount({...props,person:{name:'사진 없음'},cover:undefined});
 try{
  assert.equal(tree.root.findAllByType('button').length,0);
  act(()=>tree.update(React.createElement(ProfileHeader,props)));
  act(()=>button(tree,'주입된 작가 프로필 사진 크게 보기').props.onErrorCapture());
  assert.equal(button(tree,'주입된 작가 프로필 사진 크게 보기'),undefined);
  act(()=>button(tree,'주입된 작가 배경사진 크게 보기').findByType('img').props.onError());
  assert.equal(button(tree,'주입된 작가 배경사진 크게 보기'),undefined);
  act(()=>tree.update(React.createElement(ProfileHeader,{...props,person:{...props.person,image:'/replacement.jpg'},cover:'/replacement-cover.jpg'})));
  assert.ok(button(tree,'주입된 작가 프로필 사진 크게 보기'));assert.ok(button(tree,'주입된 작가 배경사진 크게 보기'));
 }finally{act(()=>tree.unmount());}
});
