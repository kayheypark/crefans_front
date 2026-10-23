const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {BenefitsField}=loadTypeScript('components/ui/BenefitsField.tsx',{'./benefits-field.module.css':styles,'./field.module.css':styles,'./ui.module.css':styles,'./select.module.css':styles});
function mount(props){let tree;act(()=>{tree=create(React.createElement(BenefitsField,props));});return tree;}
const action=(tree,label)=>tree.root.findAllByType('button').find(button=>button.props['aria-label']===label);

test('benefit entries display injected values and delegate edit, add, and removal without mutating the array',()=>{
 const value=Object.freeze(['기존 혜택','두 번째 혜택']),calls=[];
 const tree=mount({label:'혜택',value,onChange:next=>calls.push(next)});
 try{
  assert.deepEqual(tree.root.findAllByType('input').map(input=>input.props.value),value);
  act(()=>tree.root.findAllByType('input')[0].props.onChange({target:{value:'수정한 혜택'}}));
  assert.deepEqual(calls.pop(),['수정한 혜택','두 번째 혜택']);
  act(()=>action(tree,'혜택 2 삭제').props.onClick());assert.deepEqual(calls.pop(),['기존 혜택']);
  act(()=>action(tree,'혜택 추가').props.onClick());assert.deepEqual(calls.pop(),['기존 혜택','두 번째 혜택','']);
  assert.deepEqual(tree.root.findAllByType('input').map(input=>input.props.value),value);
  assert.equal(tree.root.findAllByType('button').every(button=>button.props.type==='button'),true);
 }finally{act(()=>tree.unmount());}
});

test('empty and error states do not inject examples, and every input has a distinct accessible label',()=>{
 const tree=mount({label:'제공 혜택',value:[],onChange(){},error:'혜택을 입력해주세요.'});
 try{
  assert.equal(tree.root.findAllByType('input').length,0);assert.equal(tree.root.findByProps({role:'alert'}).children[0],'혜택을 입력해주세요.');
  assert.ok(tree.root.findByType('fieldset').props['aria-describedby']);
  act(()=>tree.update(React.createElement(BenefitsField,{label:'제공 혜택',value:['A','B'],onChange(){}})));
  const inputs=tree.root.findAllByType('input'),labels=tree.root.findAllByType('label');
  assert.notEqual(inputs[0].props.id,inputs[1].props.id);
  assert.deepEqual(labels.map(label=>[label.props.htmlFor,label.children[0]]),[[inputs[0].props.id,'제공 혜택 1'],[inputs[1].props.id,'제공 혜택 2']]);
 }finally{act(()=>tree.unmount());}
});

test('disabled and read-only benefit fields retain data and suppress all mutation callbacks',()=>{
 for(const state of [{disabled:true},{readOnly:true}]){
  const calls=[],tree=mount({label:'혜택',value:['보존할 혜택'],onChange:next=>calls.push(next),...state});
  try{
   assert.equal(tree.root.findAllByType('button').every(button=>button.props.disabled),true);
   assert.equal(tree.root.findByType('input').props[state.disabled?'disabled':'readOnly'],true);
   act(()=>{action(tree,'혜택 추가').props.onClick();action(tree,'혜택 1 삭제').props.onClick();tree.root.findByType('input').props.onChange({target:{value:'변경'}});});
   assert.deepEqual(calls,[]);
  }finally{act(()=>tree.unmount());}
 }
});
