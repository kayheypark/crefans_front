const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {Dialog,Toast}=loadTypeScript('components/ui/Primitives.tsx',{
 './ui.module.css':styles,'./field.module.css':styles,'./select.module.css':styles,'./choice.module.css':styles,
});

function mount(Component,props,{reduced=false}={}){
 const previous={window:global.window,document:global.document};
 global.window={matchMedia:()=>({matches:reduced})};
 global.document={body:{style:{overflow:'auto'}}};
 const native={open:false,showCalls:0,closeCalls:0,showModal(){this.open=true;this.showCalls++;},close(){this.open=false;this.closeCalls++;},getBoundingClientRect:()=>({left:100,right:400,top:100,bottom:400})};
 let tree;
 act(()=>{tree=create(React.createElement(Component,props),{createNodeMock:element=>element.type==='dialog'?native:null});});
 return {tree,native,update(next){act(()=>tree.update(React.createElement(Component,next)));},dispose(){act(()=>tree.unmount());global.window=previous.window;global.document=previous.document;}};
}
async function wait(ms){await act(async()=>{await new Promise(resolve=>setTimeout(resolve,ms));});}

test('dialog keeps content and native modal open through exit, then restores scroll',async()=>{
 const props={open:true,title:'구독 확인',children:React.createElement('p',null,'선택한 멤버십'),onClose(){}};
 const view=mount(Dialog,props);
 try{
  assert.equal(view.native.open,true);assert.equal(view.native.showCalls,1);
  assert.equal(document.body.style.overflow,'hidden');
  view.update({...props,open:false,title:'',children:null});
  assert.equal(view.tree.root.findByType('dialog').props['data-state'],'closing');
  assert.equal(view.tree.root.findByType('h2').children[0],'구독 확인');
  assert.equal(view.tree.root.findByType('p').children[0],'선택한 멤버십');
  assert.equal(view.native.closeCalls,0);
  assert.equal(document.body.style.overflow,'hidden');
  await wait(145);
  assert.equal(view.native.open,false);assert.equal(view.native.closeCalls,1);
  assert.equal(document.body.style.overflow,'auto');
 }finally{view.dispose();}
});

test('reopening a dialog cancels the old exit timer and shows the latest children',async()=>{
 const props={open:true,title:'첫 화면',children:React.createElement('p',null,'처음 내용'),onClose(){}};
 const view=mount(Dialog,props);
 try{
  view.update({...props,open:false,children:null});
  await wait(45);
  view.update({...props,title:'다시 연 화면',children:React.createElement('p',null,'새 내용')});
  await wait(100);
  assert.equal(view.native.open,true);assert.equal(view.native.closeCalls,0);
  assert.equal(view.native.showCalls,1);
  assert.equal(view.tree.root.findByType('h2').children[0],'다시 연 화면');
  assert.equal(view.tree.root.findByType('p').children[0],'새 내용');
  assert.equal(document.body.style.overflow,'hidden');
 }finally{view.dispose();}
});

test('cancelling a nested file picker does not close the dialog or discard its form',()=>{
 for(const sheet of [false,true]){
  let requests=0;
  const props={open:true,sheet,title:'멤버십 만들기',children:React.createElement('form',null,React.createElement('input',{name:'membershipName',value:'작성 중인 멤버십',readOnly:true}),React.createElement('input',{type:'file'})),onClose(){requests++;}};
  const view=mount(Dialog,props);
  try{
   const fileInput={type:'file'},event={target:fileInput,currentTarget:view.native,prevented:false,preventDefault(){this.prevented=true;}};
   act(()=>view.tree.root.findByType('dialog').props.onCancel(event));
   assert.equal(requests,0);assert.equal(event.prevented,false);
   assert.equal(view.native.open,true);assert.equal(view.native.closeCalls,0);
   assert.equal(view.tree.root.findByType('dialog').props['data-state'],'open');
   assert.equal(view.tree.root.findAllByType('input').find(input=>input.props.name==='membershipName').props.value,'작성 중인 멤버십');
   assert.equal(document.body.style.overflow,'hidden');
  }finally{view.dispose();}
 }
});

test('native Escape requests controlled closing instead of bypassing the animation',()=>{
 let requests=0;
 const props={open:true,title:'확인',children:'내용',onClose(){requests++;}};
 const view=mount(Dialog,props);
 try{
  const event={target:view.native,currentTarget:view.native,prevented:false,preventDefault(){this.prevented=true;}};
  act(()=>view.tree.root.findByType('dialog').props.onCancel(event));
  assert.equal(event.prevented,true);assert.equal(requests,1);
  assert.equal(view.native.open,true);assert.equal(view.native.closeCalls,0);
  view.update({...props,open:false,children:null});
  act(()=>view.tree.root.findByType('dialog').props.onCancel(event));
  act(()=>view.tree.root.findByType('dialog').props.onClose());
  assert.equal(requests,1);
  const click={prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
  act(()=>view.tree.root.findByType('dialog').props.onClickCapture(click));
  assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 }finally{view.dispose();}
});

test('toast retains its previous message while leaving and removes the surface afterwards',async()=>{
 const props={message:'설정이 저장되었습니다.',onClose(){}};
 const view=mount(Toast,props);
 try{
  view.update({...props,message:''});
  const toast=view.tree.root.findByProps({className:'toast'});
  assert.equal(toast.props['data-state'],'closing');
  assert.equal(toast.findByType('span').children[0],props.message);
  assert.equal(toast.findByType('button').props.disabled,true);
  await wait(145);
  assert.equal(view.tree.root.findAllByProps({className:'toast'}).length,0);
  assert.equal(view.tree.root.findByProps({role:'status'}).children.length,0);
 }finally{view.dispose();}
});

test('a new toast survives the previous message exit timer',async()=>{
 const props={message:'처음 알림',onClose(){}};
 const view=mount(Toast,props);
 try{
  view.update({...props,message:''});
  await wait(45);
  view.update({...props,message:'새 알림'});
  await wait(100);
  const toast=view.tree.root.findByProps({className:'toast'});
  assert.equal(toast.props['data-state'],'open');
  assert.equal(toast.findByType('span').children[0],'새 알림');
  assert.equal(toast.findByType('button').props.disabled,false);
 }finally{view.dispose();}
});

test('toast countdown keeps its deadline across callback changes and calls the latest handler',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 let previousCalls=0,latestCalls=0;
 const view=mount(Toast,{message:'저장했습니다.',onClose(){previousCalls++;}});
 try{
  const progress=view.tree.root.findByProps({className:'toastProgress'});
  const duration=parseFloat(progress.props.style.animationDuration);
  assert.equal(duration,4000);
  assert.equal(progress.props['aria-hidden'],'true');
  act(()=>t.mock.timers.tick(duration/2));
  view.update({message:'저장했습니다.',onClose(){latestCalls++;}});
  act(()=>t.mock.timers.tick(duration/2-1));
  assert.equal(latestCalls,0);
  act(()=>t.mock.timers.tick(1));
  assert.equal(previousCalls,0);assert.equal(latestCalls,1);
 }finally{view.dispose();}
});

test('replacing a toast restarts its full countdown and closing cancels the deadline',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 let calls=0;
 const props={message:'첫 알림',onClose(){calls++;}};
 const view=mount(Toast,props);
 try{
  const duration=parseFloat(view.tree.root.findByProps({className:'toastProgress'}).props.style.animationDuration);
  act(()=>t.mock.timers.tick(duration/2));
  view.update({...props,message:'새 알림'});
  act(()=>t.mock.timers.tick(duration/2));
  assert.equal(calls,0);
  act(()=>t.mock.timers.tick(duration/2));
  assert.equal(calls,1);
  view.update({...props,message:''});
  assert.equal(view.tree.root.findAllByProps({className:'toastProgress'}).length,0);
  view.update(props);
  act(()=>t.mock.timers.tick(duration/2));
  view.update({...props,message:''});
  act(()=>t.mock.timers.tick(duration));
  assert.equal(calls,1);
 }finally{view.dispose();}
});

test('reduced motion closes dialog and toast immediately without exit retention',()=>{
 const props={open:true,title:'확인',children:'내용',onClose(){}};
 const dialog=mount(Dialog,props,{reduced:true});
 try{
  dialog.update({...props,open:false,children:null});
  assert.equal(dialog.native.open,false);assert.equal(dialog.native.closeCalls,1);
  assert.equal(document.body.style.overflow,'auto');
 }finally{dialog.dispose();}
 const toast=mount(Toast,{message:'알림',onClose(){}},{reduced:true});
 try{
  toast.update({message:'',onClose(){}});
  assert.equal(toast.tree.root.findAllByProps({className:'toast'}).length,0);
 }finally{toast.dispose();}
});

test('unmounting an open dialog restores the previous body scrolling state',()=>{
 const view=mount(Dialog,{open:true,title:'확인',children:'내용',onClose(){}});
 try{
  assert.equal(document.body.style.overflow,'hidden');
  act(()=>view.tree.unmount());
  assert.equal(document.body.style.overflow,'auto');
 }finally{view.dispose();}
});
