const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{act,create}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const css=new Proxy({},{get:(_,key)=>String(key)}),el=React.createElement;
test('header waits for authentication and delays only its spinner, never flashing guest links',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const prior=global.window;global.window={matchMedia:()=>({matches:false})};
 const Shell=loadTypeScript('components/crefans/ServiceShell.tsx',{'next/link':({children,...props})=>el('a',props,children),'./Brand':{Brand:()=>null},'./HeaderAccountMenu':{HeaderAccountMenu:()=>el('button',{'data-account-menu':true},'계정 메뉴')},'./ServiceLinks':{ServiceLinks:()=>null},'./BusinessInfo':{BusinessInfo:()=>null},'./NavigationIcon':{NavigationIcon:()=>null,NavigationAvatar:()=>null},'./CommentComposer':{CommentDock:()=>null,CommentDockProvider:({children})=>children},'./loading-spinner.module.css':{__esModule:true,default:css}}).default;
 const model={signedIn:false,read:[],viewer:{name:'팬'},basePath:'/service',data:{notifications:[]},account:{route:{}},accountActions:{logout:async()=>({success:true,data:{message:''}})},messagesByCreator:{}};
 let tree;const render=loading=>el(Shell,{model,active:'notifications',authLoading:loading});
 const guest=()=>tree.root.findAllByType('a').filter(n=>/\/(login|signup)/.test(n.props.href||''));
 const spin=()=>tree.root.findAll(n=>typeof n.type==='string'&&n.props.role==='status'&&n.props['aria-live']==='polite');
 try{
  act(()=>{tree=create(render(true))});assert.equal(guest().length,0);assert.equal(spin().length,0);
  act(()=>t.mock.timers.tick(999));assert.equal(guest().length,0);assert.equal(spin().length,0);
  act(()=>t.mock.timers.tick(1));assert.equal(guest().length,0);assert.equal(spin().length,1);
  model.signedIn=true;act(()=>tree.update(render(false)));assert.equal(guest().length,0);assert.equal(spin().length,0);assert.equal(tree.root.findAllByProps({'data-account-menu':true}).length,1);
  model.signedIn=false;act(()=>tree.update(render(true)));assert.equal(guest().length,0);assert.equal(spin().length,0);
  act(()=>t.mock.timers.tick(300));act(()=>tree.update(render(false)));assert.equal(guest().length,2);act(()=>t.mock.timers.tick(2000));assert.equal(spin().length,0);
 }finally{if(tree)act(()=>tree.unmount());global.window=prior;}
});
