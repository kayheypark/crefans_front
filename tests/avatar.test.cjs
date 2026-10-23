const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {Avatar}=loadTypeScript('components/ui/Avatar.tsx',{'./avatar.module.css':styles});
const {Avatar:ServiceAvatar}=loadTypeScript('components/crefans/ServiceUI.tsx',{
  './service.module.css':styles,
  '@/components/ui/Avatar':{Avatar},
});
function mount(Component,props){let tree;act(()=>{tree=create(React.createElement(Component,props));});return tree;}
function update(tree,props){act(()=>tree.update(React.createElement(Avatar,props)));}
function close(tree){act(()=>tree.unmount());}

test('missing, null, empty and whitespace photo sources use the shared symbol instead of initials',()=>{
  for(const src of [undefined,null,'',' \t\n ']){
    const tree=mount(Avatar,{src,name:'최예림'});
    const fallback=tree.root.findByProps({'data-avatar':'fallback'});
    assert.equal(fallback.type,'span');
    assert.equal(fallback.props.role,'img');
    assert.match(fallback.props['aria-label'],/최예림/);
    assert.equal(tree.root.findAllByType('img').length,0);
    assert.equal(tree.root.findAllByType('svg').length,1);
    assert.ok(fallback.children.every(child=>typeof child!=='string'));
    close(tree);
  }
});

test('photo avatars retain the supplied image, accessible name and crop position',()=>{
  const tree=mount(Avatar,{src:'/portrait-a.png',name:'최예림',position:'25% 40%'});
  const wrapper=tree.root.findByProps({'data-avatar':'image'});
  assert.equal(wrapper.props.role,'img');
  assert.match(wrapper.props['aria-label'],/최예림/);
  assert.equal(tree.root.findByType('img').props.src,'/portrait-a.png');
  assert.equal(tree.root.findByType('img').props.style.objectPosition,'25% 40%');
  update(tree,{src:'/portrait-a.png',name:'변경된 이름',position:'70% 20%'});
  assert.match(tree.root.findByProps({'data-avatar':'image'}).props['aria-label'],/변경된 이름/);
  assert.equal(tree.root.findByType('img').props.style.objectPosition,'70% 20%');
  close(tree);
});

test('failed photos fall back until the source changes and a previously failed source can be retried',()=>{
  const tree=mount(Avatar,{src:'/portrait-a.png',name:'최예림'});
  act(()=>tree.root.findByType('img').props.onError());
  assert.equal(tree.root.findAllByType('img').length,0);
  assert.equal(tree.root.findByProps({'data-avatar':'fallback'}).findAllByType('svg').length,1);
  update(tree,{src:'/portrait-a.png',name:'변경된 이름'});
  assert.equal(tree.root.findAllByType('img').length,0);
  assert.match(tree.root.findByProps({'data-avatar':'fallback'}).props['aria-label'],/변경된 이름/);
  update(tree,{src:'/portrait-b.png',name:'최예림'});
  assert.equal(tree.root.findByType('img').props.src,'/portrait-b.png');
  update(tree,{src:'/portrait-a.png',name:'최예림'});
  assert.equal(tree.root.findByType('img').props.src,'/portrait-a.png');
  act(()=>tree.root.findByType('img').props.onError());
  update(tree,{src:null,name:'최예림'});
  assert.equal(tree.root.findAllByType('img').length,0);
  update(tree,{src:'/portrait-a.png',name:'최예림'});
  assert.equal(tree.root.findByType('img').props.src,'/portrait-a.png');
  close(tree);
});

test('the service creator adapter delegates image and fallback rendering to the shared Avatar',()=>{
  const creator={name:'최예림',image:'/portrait-a.png',position:'30% 60%'};
  const tree=mount(ServiceAvatar,{creator,size:54});
  assert.deepEqual(tree.root.findByType(Avatar).props,{name:creator.name,src:creator.image,position:creator.position,size:54});
  assert.equal(tree.root.findByType('img').props.src,creator.image);
  act(()=>tree.update(React.createElement(ServiceAvatar,{creator:{name:creator.name}})));
  assert.equal(tree.root.findByType(Avatar).props.name,creator.name);
  assert.equal(tree.root.findByType(Avatar).props.size,40);
  assert.equal(tree.root.findAllByType('img').length,0);
  assert.equal(tree.root.findByProps({'data-avatar':'fallback'}).findAllByType('svg').length,1);
  close(tree);
});
