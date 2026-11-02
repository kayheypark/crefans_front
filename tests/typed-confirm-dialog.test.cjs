const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const base=loadTypeScript('components/ui/Primitives.tsx');
const {TypedConfirmDialog}=loadTypeScript('components/ui/TypedConfirmDialog.tsx',{'@/components/ui/Primitives':{...base,Dialog:({children,onClose})=>React.createElement('section',{'data-dialog':true,onClose},children)}});
const btn=(tree,text)=>tree.root.findAllByType('button').find(n=>n.children.includes(text));
function setup(extra={}){let tree;const props={title:'삭제 확인',phrase:'별빛 멤버십',actionLabel:'삭제하기',onCancel(){},onConfirm(){},...extra};act(()=>{tree=create(React.createElement(TypedConfirmDialog,props));});return {tree,props,type:value=>act(()=>tree.root.findByType('input').props.onChange({target:{value}})),close:()=>act(()=>tree.unmount())};}
test('exact phrase only; cancellation and changed target reset the confirmation',async()=>{
 const calls=[],p=setup({onConfirm:typed=>calls.push(typed)});
 try{
  for(const text of ['', '별빛', '별빛멤버십','별빛 멤버십 ']){p.type(text);assert.equal(btn(p.tree,'삭제하기').props.disabled,true);await act(async()=>btn(p.tree,'삭제하기').props.onClick());}
  assert.deepEqual(calls,[]);p.type('별빛 멤버십');assert.equal(btn(p.tree,'삭제하기').props.disabled,false);
  await act(async()=>btn(p.tree,'삭제하기').props.onClick());assert.deepEqual(calls,['별빛 멤버십']);
  act(()=>p.tree.update(React.createElement(TypedConfirmDialog,{...p.props,phrase:'다른 멤버십'})));assert.equal(p.tree.root.findByType('input').props.value,'');assert.equal(btn(p.tree,'삭제하기').props.disabled,true);
 }finally{p.close();}
});
test('double clicks and close paths are blocked until the request finishes; error keeps typed input',async()=>{
 let release,cancelled=0,calls=0;const p=setup({onCancel:()=>cancelled++,onConfirm:()=>{calls++;return new Promise(resolve=>release=resolve);}});
 try{
  p.type(p.props.phrase);let pending;act(()=>{const click=btn(p.tree,'삭제하기').props.onClick;pending=click();void click();});
  assert.equal(calls,1);assert.equal(p.tree.root.findByType('input').props.disabled,true);assert.equal(btn(p.tree,'취소').props.disabled,true);
  act(()=>p.tree.root.findByProps({'data-dialog':true}).props.onClose());assert.equal(cancelled,0);
  await act(async()=>{release();await pending;});
  act(()=>p.tree.update(React.createElement(TypedConfirmDialog,{...p.props,error:'삭제 실패'})));assert.equal(p.tree.root.findByType('input').props.value,p.props.phrase);assert.equal(p.tree.root.findByProps({role:'alert'}).children[0],'삭제 실패');assert.equal(btn(p.tree,'삭제하기').props.disabled,false);
 }finally{p.close();}
});
