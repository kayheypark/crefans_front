const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const h=React.createElement;
const {FollowButton}=loadTypeScript('components/crefans/FollowButton.tsx',{
  './Icon':()=>h('svg'),
  './ServiceUI':{Action:({variant,children,...props})=>h('button',{'data-variant':variant,...props},children)},
  '@/components/ui/Primitives':{Dialog:({open,title,children})=>open?h('section',{role:'dialog','aria-label':title},children):null},
  '@/components/ui/DialogActions':{DialogActions:({children})=>h('div',null,children)},
});
const button=(tree,label)=>tree.root.findAllByType('button').find(node=>[].concat(node.props.children).some(child=>child===label));

test('following immediately when not yet following, with the secondary look',()=>{
  const calls=[];
  let tree;act(()=>tree=create(h(FollowButton,{following:false,name:'하늘',onToggle:()=>calls.push('toggle')})));
  const toggle=button(tree,'팔로우');
  assert.equal(toggle.props['aria-pressed'],false);assert.equal(toggle.props['data-variant'],'secondary');
  act(()=>toggle.props.onClick());
  assert.deepEqual(calls,['toggle']);
  assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);
});

test('unfollowing asks for confirmation first and only toggles on confirm',()=>{
  const calls=[];
  let tree;act(()=>tree=create(h(FollowButton,{following:true,name:'하늘',onToggle:()=>calls.push('toggle')})));
  const toggle=button(tree,'팔로우 하는중');
  assert.equal(toggle.props['aria-pressed'],true);assert.equal(toggle.props['data-variant'],'primary');
  act(()=>toggle.props.onClick());
  assert.deepEqual(calls,[],'nothing changes until confirmed');
  assert.equal(tree.root.findByProps({role:'dialog'}).props['aria-label'],'팔로우를 해제할까요?');
  act(()=>button(tree,'취소').props.onClick());
  assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);assert.deepEqual(calls,[]);
  act(()=>button(tree,'팔로우 하는중').props.onClick());
  act(()=>button(tree,'팔로우 해제').props.onClick());
  assert.deepEqual(calls,['toggle']);
  assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);
});
