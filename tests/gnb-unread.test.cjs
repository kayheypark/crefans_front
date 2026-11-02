const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {UnreadBadge}=loadTypeScript('components/ui/UnreadBadge.tsx');
test('unread badge hides zero and caps only its visible count above99',()=>{
 for(const[count,text]of [[0,null],[1,'1'],[9,'9'],[99,'99'],[100,'99+'],[150,'99+']]){
  let tree;act(()=>{tree=create(React.createElement(UnreadBadge,{count}));});
  const node=tree.toJSON();if(text===null)assert.equal(node,null);else{assert.equal(node.children.join(''),text);assert.equal(node.props['aria-hidden'],'true');}act(()=>tree.unmount());
 }
});
test('navigation counts incoming unread messages across conversations and unread notifications; updates after read and logout',()=>{
 const previous=global.window;global.window={matchMedia:()=>({matches:false})};
 const Shell=loadTypeScript('components/crefans/ServiceShell.tsx',{'next/link':({children,...props})=>React.createElement('a',props,children),'./Brand':{Brand:()=>null},'./ServiceLinks':{ServiceLinks:()=>null},'./HeaderAccountMenu':{HeaderAccountMenu:()=>null},'./NavigationIcon':{NavigationIcon:()=>null,NavigationAvatar:()=>null},'./CommentComposer':{CommentDock:()=>null,CommentDockProvider:({children})=>children}}).default;
 let tree;const model={signedIn:true,read:['read'],viewer:{name:'팬'},basePath:'/preview',data:{notifications:[{id:'read'},{id:'new'}]},account:{route:{}},accountActions:{logout:async()=>({success:true,data:{message:''}})},messagesByCreator:{a:[{mine:false,unread:true},{mine:true,unread:true},{mine:false,unread:false}],b:[{mine:false,unread:true}]}};
 const render=()=>React.createElement(Shell,{model,active:'feed'},null);
 const links=path=>tree.root.findAllByType('a').filter(x=>x.props.href===`/preview/${path}`);
 try{
  act(()=>{tree=create(render());});assert.equal(links('messages').length,2);for(const n of links('messages'))assert.equal(n.props['aria-label'],'메시지, 읽지 않은 2개');for(const n of links('notifications'))assert.equal(n.props['aria-label'],'알림, 읽지 않은 1개');
  model.messagesByCreator={a:Array.from({length:125},()=>({mine:false,unread:true}))};act(()=>tree.update(render()));for(const n of links('messages')){assert.equal(n.props['aria-label'],'메시지, 읽지 않은 125개');assert.equal(n.findByProps({'aria-hidden':'true'}).children.join(''),'99+');}
  model.read=['read','new'];model.messagesByCreator={a:[{mine:false,unread:false}]};act(()=>tree.update(render()));for(const n of [...links('messages'),...links('notifications')])assert.equal(n.findAllByProps({'aria-hidden':'true'}).length,0);
  model.signedIn=false;model.read=[];model.messagesByCreator={a:[{mine:false,unread:true}]};act(()=>tree.update(render()));for(const n of [...links('messages'),...links('notifications')])assert.equal(n.findAllByProps({'aria-hidden':'true'}).length,0);
 }finally{if(tree)act(()=>tree.unmount());global.window=previous;}
});
