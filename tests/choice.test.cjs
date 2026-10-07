const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {Checkbox,Radio}=loadTypeScript('components/ui/Choice.tsx',{'./choice.module.css':styles});
const h=React.createElement;

test('checkbox wraps a native input in its label, reports booleans, and forwards native attributes',()=>{
  const changes=[];
  let tree;act(()=>{tree=create(h(Checkbox,{label:'이용약관 동의',description:'필수',checked:false,onChange:value=>changes.push(value),name:'terms',value:'yes'}));});
  const label=tree.root.findByType('label'),input=tree.root.findByType('input');
  assert.equal(label.props.className,'choice');
  assert.equal(input.props.type,'checkbox');assert.equal(input.props.checked,false);assert.equal(input.props.name,'terms');assert.equal(input.props.value,'yes');
  assert.match(JSON.stringify(tree.toJSON()),/이용약관 동의/);assert.match(JSON.stringify(tree.toJSON()),/필수/);
  act(()=>input.props.onChange({target:{checked:true}}));
  assert.deepEqual(changes,[true]);
  assert.equal(label.props['data-disabled'],undefined);
});

test('disabled choices mark the label and keep the native disabled attribute for assistive tech',()=>{
  let tree;act(()=>{tree=create(h(Checkbox,{label:'비활성',checked:true,onChange:()=>{},disabled:true}));});
  assert.equal(tree.root.findByType('label').props['data-disabled'],true);
  assert.equal(tree.root.findByType('input').props.disabled,true);
});

test('radio renders a native radio sharing a group name and reflects the selected option',()=>{
  const picks=[];
  let tree;act(()=>{tree=create(h('div',null,[
    h(Radio,{key:'a',name:'scope',value:'public',label:'전체 공개',checked:true,onChange:()=>picks.push('public')}),
    h(Radio,{key:'b',name:'scope',value:'members',label:'멤버십 전용',checked:false,onChange:()=>picks.push('members')}),
  ]));});
  const inputs=tree.root.findAllByType('input');
  assert.deepEqual(inputs.map(input=>[input.props.type,input.props.name,input.props.checked]),[['radio','scope',true],['radio','scope',false]]);
  act(()=>inputs[1].props.onChange({target:{checked:true}}));
  assert.deepEqual(picks,['members']);
});
