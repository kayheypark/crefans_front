const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement;
let receivedInbox;
const {CreatorMessagesPage,CreatorCommentsPage}=loadTypeScript('components/crefans/studio/CommunityPages.tsx',{
 './select.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},
 './community.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'./pagination.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'./social.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),
 '../SocialPages':{MessagesPage:({model})=>{receivedInbox=model;return el('div');}},
 '../ServiceUI':{Action:({children,variant,...props})=>el('button',props,children),Avatar:({creator})=>el('img',{src:creator.image,alt:creator.name}),Empty:({title})=>el('p',{'data-empty':true},title),Notice:({children})=>el('p',null,children),PageTitle:({children})=>el('h1',null,children)},
 '@/components/ui/Primitives':{TextAreaField:loadTypeScript('components/ui/Field.tsx',{'./field.module.css':new Proxy({},{get:(_,key)=>String(key)})}).TextAreaField,Dialog:({open,children})=>open?el('dialog',null,children):null},
 'next/link':({children,...props})=>el('a',props,children),
});
const {useMockCommunity}=loadTypeScript('components/preview/studio/useMockCommunity.ts');
const fan={id:'api-fan',name:'서버 팬',image:'/fan-api.png'};
const comment={id:'api-comment',postId:'api-post',author:fan,body:'주입된 댓글',time:'어제',hidden:false,replies:[]};
const ok={success:true,data:{message:'처리 완료'},errorMessage:null,errorCode:null};
function model(overrides={}){return {inbox:{data:{creators:[]}},posts:[{id:'api-post',title:'API 게시물'}],comments:[],visibilityGuidance:'전달된 상태 안내',replyToComment:async()=>ok,setCommentHidden:async()=>ok,...overrides};}
function mount(Component,props){let tree;act(()=>{tree=create(el(Component,props));});return tree;}
const close=tree=>act(()=>tree.unmount());

test('studio inbox reuses the shared message component and maps fan detail navigation',()=>{
 const inbox={data:{creators:[fan]},messagesByCreator:{'api-fan':[]},contactRoleLabel:'팬'};
 const tree=mount(CreatorMessagesPage,{model:model({inbox}),basePath:'/creator-space'});
 assert.equal(receivedInbox.messagesByCreator,inbox.messagesByCreator);
 assert.equal(receivedInbox.contactRoleLabel,'팬');
 assert.equal(receivedInbox.contactHref('api-fan'),'/creator-space/subscribers?member=api-fan');
 close(tree);
});

test('failed creator reply keeps the draft and displays API error without a fabricated reply',async()=>{
 const tree=mount(CreatorCommentsPage,{model:model({comments:[comment],replyToComment:async()=>({success:false,data:null,errorMessage:'댓글 권한이 없습니다.',errorCode:'DENIED'})}),basePath:'/studio'});
 act(()=>tree.root.findAllByType('button').find(button=>button.children.join('').trim()==='답글').props.onClick());
 act(()=>tree.root.findByType('textarea').props.onChange({target:{value:'다시 보낼 답글'}}));
 await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(tree.root.findByType('textarea').props.value,'다시 보낼 답글');
 assert.equal(tree.root.findAllByProps({className:'reply'}).length,0);
 assert.match(JSON.stringify(tree.toJSON()),/댓글 권한이 없습니다/);
 close(tree);
});

test('empty community data renders no invented author, conversation or comment',()=>{
 const tree=mount(CreatorCommentsPage,{model:model({posts:[],comments:[]}),basePath:'/studio'});
 assert.equal(tree.root.findAllByType('img').length,0);assert.equal(tree.root.findAllByType('article').length,0);close(tree);
 let state;function Probe(){state=useMockCommunity({posts:[],fans:[]});return null;}const hook=mount(Probe);
 assert.deepEqual(state.comments,[]);assert.deepEqual(state.inbox.messagesByCreator,{});close(hook);
});

test('mock moderation and replies validate target/content and keep visibility independent from stored body',async()=>{
 let state;function Probe(){state=useMockCommunity({posts:[{id:'post-a',title:'게시물'}],fans:[fan]});return null;}const tree=mount(Probe);const id=state.comments[0].id,body=state.comments[0].body;let result;
 await act(async()=>{result=await state.replyToComment(id,'   ');});assert.equal(result.success,false);assert.equal(state.comments[0].replies.length,0);
 await act(async()=>{result=await state.setCommentHidden('missing',true);});assert.equal(result.success,false);
 await act(async()=>{await state.setCommentHidden(id,true);});assert.equal(state.comments[0].hidden,true);assert.equal(state.comments[0].body,body);
 await act(async()=>{await state.setCommentHidden(id,false);await state.replyToComment(id,'감사합니다.');});assert.equal(state.comments[0].hidden,false);assert.equal(state.comments[0].replies[0].body,'감사합니다.');close(tree);
});

test('studio comment list pages ten threads at a time and shows mentions and fan replies',()=>{
 const {messyCommentThreads,toCommunityComments}=loadTypeScript('components/preview/comment-fixtures.ts');
 const comments=toCommunityComments('api-post',messyCommentThreads('api-post',23));
 const tree=mount(CreatorCommentsPage,{model:model({comments}),basePath:'/studio'});
 try{
  assert.equal(tree.root.findAllByType('article').length,10);
  const nav=tree.root.findByProps({'aria-label':'댓글 목록 페이지'});
  act(()=>nav.findAllByType('button').find(button=>button.props['aria-label']==='3페이지').props.onClick());
  assert.equal(tree.root.findAllByType('article').length,3);
  const text=JSON.stringify(tree.toJSON());
  assert.match(text,/@/);
 }finally{close(tree);}
});
