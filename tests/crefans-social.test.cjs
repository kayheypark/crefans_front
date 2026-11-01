const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const element=(type,props,children)=>React.createElement(type,props,children);
const ui={
  Action:({children,variant,...props})=>element('button',props,children),
  Avatar:({creator})=>element('img',{src:creator?.image,alt:creator?.name}),
  Empty:({title,description,action})=>element('section',{'data-empty':true},[element('h2',{key:'title'},title),element('p',{key:'description'},description),action&&element('div',{key:'action'},action)]),
  PageTitle:({children,action})=>element('header',null,[element('h1',{key:'title'},children),action&&element('div',{key:'action'},action)]),
};
const {FeedPage,PostDetailPage,PostCard,MessagesPage,NotificationsPage}=loadTypeScript('components/crefans/SocialPages.tsx',{
  './social.module.css':{__esModule:true,default:styles},'./chip-row.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./ServiceUI':ui,'./Icon':()=>element('svg'),
  'next/link':({children,...props})=>element('a',props,children),
  '@/components/ui/Primitives':{Chip:({selected,children,onClick})=>element('button',{type:'button','aria-pressed':selected,onClick},children),TextAreaField:loadTypeScript('components/ui/Field.tsx',{'./field.module.css':new Proxy({},{get:(_,key)=>String(key)})}).TextAreaField,Dialog:({open,children})=>open?element('dialog',null,children):null},
});
const ok={success:true,data:{message:'서버 확인'},errorMessage:null,errorCode:null};
const denied={success:false,data:null,errorMessage:'권한이 변경되었습니다.',errorCode:'ACCESS_DENIED'};
function model(overrides={}){
  return {
    basePath:'/actual-service',mode:'live',today:'2030-01-01',
    data:{creators:[],plans:[],posts:[],notifications:[],messages:{},categories:[],faqs:[],paymentHistory:[]},
    following:[],liked:[],saved:[],read:[],likeCounts:{},commentCounts:{},commentsByPost:{},messagesByCreator:{},blockedCreatorIds:[],conversationLabels:{},
    socialCopy:{reportDescription:'서버 정책 신고 안내',blockDescription:'서버 정책 차단 안내'},
    canAccess:()=>true,toggleLike(){},toggleSave(){},markRead(){},
    addComment:async()=>ok,sendMessage:async()=>ok,setConversationBlocked:async()=>ok,reportConversation:async()=>ok,
    ...overrides,
  };
}
const creator={id:'museum',name:'새로운 작가',handle:'other',image:'/different-avatar.png',position:'center',tags:[],bio:'다른 데이터',followers:'7'};
const post={id:'exhibition',creatorId:creator.id,title:'실제 API 제목',body:'PROTECTED_BODY_SENTINEL',image:'/private-photo-sentinel.jpg',position:'center',likes:45,comments:9,requiredRank:2,time:'어제'};
const data={creators:[creator],posts:[post],plans:[{id:'tier',name:'작가 멤버',rank:2,price:7000,benefits:[]}],notifications:[],messages:{},categories:[],faqs:[],paymentHistory:[]};
function mount(Component,props){let tree;act(()=>{tree=create(element(Component,props));});return tree;}
function close(tree){act(()=>tree.unmount());}

test('shared feed consumes alternate API data, exact aggregate counts and injected actions/base path',()=>{
  const calls=[];
  const tree=mount(FeedPage,{model:model({data,liked:[post.id],likeCounts:{[post.id]:45},toggleLike:id=>calls.push(id)})});
  assert.match(JSON.stringify(tree.toJSON()),/새로운 작가/);
  assert.ok(tree.root.findAllByType('a').some(node=>node.props.href==='/actual-service/post/exhibition'));
  const like=tree.root.findAllByType('button').find(node=>node.props['aria-label']==='좋아요 취소');
  assert.ok(like.children.includes('45'));
  assert.ok(!like.children.includes('46'));
  act(()=>like.props.onClick());
  assert.deepEqual(calls,['exhibition']);
  close(tree);
});

test('locked detail omits protected source, body, comments and form even when a review lock overrides access',()=>{
  const input=model({data,commentsByPost:{[post.id]:[{id:'comment',author:creator,body:'PROTECTED_COMMENT_SENTINEL',time:'어제'}]}});
  const tree=mount(PostDetailPage,{id:post.id,model:input,forceLocked:true});
  const serialized=JSON.stringify(tree.toJSON());
  assert.doesNotMatch(serialized,/private-photo-sentinel|PROTECTED_BODY_SENTINEL|PROTECTED_COMMENT_SENTINEL/);
  assert.equal(tree.root.findAllByType('textarea').length,0);
  assert.ok(tree.root.findAllByType('button').some(node=>node.props['aria-haspopup']==='dialog'));
  assert.equal(tree.root.findAllByType('a').some(node=>node.props.href==='/actual-service/membership/museum'),false,'the notice opens a layer rather than navigating');
  act(()=>tree.update(element(PostDetailPage,{id:post.id,model:input,forceLocked:false})));
  assert.match(JSON.stringify(tree.toJSON()),/private-photo-sentinel/);
  assert.match(JSON.stringify(tree.toJSON()),/PROTECTED_BODY_SENTINEL/);
  close(tree);
});

test('empty injected collections do not manufacture creators, conversations or posts',()=>{
  for(const Component of [FeedPage,MessagesPage,NotificationsPage,PostDetailPage]){
    const tree=mount(Component,{model:model(),id:'missing'});
    assert.equal(tree.root.findAllByType('img').length,0);
    assert.equal(tree.root.findAllByType('article').length,0);
    assert.doesNotMatch(JSON.stringify(tree.toJSON()),/하늘|haneul|lovely_fan/);
    close(tree);
  }
});

test('a failed injected comment action preserves the draft and renders the supplied error',async()=>{
  const submitted=[];
  const tree=mount(PostDetailPage,{id:post.id,model:model({data,addComment:async(id,body)=>{submitted.push({id,body});return denied;}})});
  act(()=>tree.root.findByType('textarea').props.onChange({target:{value:'  다시 시도할 댓글  '}}));
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(submitted,[{id:post.id,body:'다시 시도할 댓글'}]);
  assert.equal(tree.root.findByType('textarea').props.value,'  다시 시도할 댓글  ');
  assert.match(JSON.stringify(tree.toJSON()),/권한이 변경되었습니다/);
  assert.equal(tree.root.findAllByProps({className:'comment'}).length,0);
  close(tree);
});

test('a failed message action preserves its draft and does not fabricate a sent message',async()=>{
  const messages={[creator.id]:[{id:1,mine:false,body:'주입된 대화',time:'어제'}]};
  const tree=mount(MessagesPage,{model:model({data,messagesByCreator:messages,sendMessage:async()=>denied})});
  const input=()=>tree.root.findByProps({id:'message-draft'});
  act(()=>input().props.onChange({target:{value:'보내려던 메시지'}}));
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(input().props.value,'보내려던 메시지');
  assert.equal(tree.root.findAllByProps({className:'message'}).length,1);
  assert.match(JSON.stringify(tree.toJSON()),/권한이 변경되었습니다/);
  close(tree);
});

test('comment rows show 수정됨, an italic deleted placeholder, and 수정·삭제 only on the viewer\'s own rows outside read-only views',async()=>{
  const calls=[];const open={...post,requiredRank:0};
  const list=[{id:'mine',author:creator,body:'내 댓글',time:'어제',own:true,edited:true},{id:'gone',deleted:true,author:{name:'',image:''},body:'',time:'어제',replyCount:1},{id:'other',author:creator,body:'남의 댓글',time:'어제'}];
  const input=model({data:{...data,posts:[open]},commentsByPost:{[open.id]:list},commentCounts:{[open.id]:3},loadReplies:async()=>({...ok,data:[]}),editComment:async(...args)=>{calls.push(['edit',...args]);return ok;},deleteComment:async(...args)=>{calls.push(['delete',...args]);return ok;}});
  const rows=tree=>tree.root.findAllByProps({className:'comment'});
  const tree=mount(PostDetailPage,{id:open.id,model:input});
  assert.equal(rows(tree).length,3);
  assert.equal(rows(tree)[0].findAllByProps({className:'editedMark'}).length,1);
  assert.equal(rows(tree)[1].props['data-deleted'],'true');
  assert.equal(rows(tree)[1].findByProps({className:'deletedComment'}).props.children,'삭제된 댓글입니다.');
  assert.equal(rows(tree).map(row=>row.findAllByProps({className:'commentOwnActions'}).length).join(),'1,0,0');
  const own=()=>rows(tree)[0].findByProps({className:'commentOwnActions'}).findAllByType('button');
  act(()=>own()[0].props.onClick());
  const field=tree.root.findByProps({'aria-label':'댓글 수정'});
  act(()=>field.props.onChange({target:{value:'  고친 댓글 '}}));
  await act(async()=>tree.root.findByProps({className:'commentEdit'}).props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls.shift(),['edit',open.id,'mine','고친 댓글']);
  assert.equal(tree.root.findAllByProps({'aria-label':'댓글 수정'}).length,0,'edit form closes after saving');
  act(()=>own()[1].props.onClick());
  const confirm=tree.root.findAllByType('button').find(button=>button.props.children==='삭제'&&button.props.variant===undefined&&!button.parent?.props?.className?.includes?.('commentOwnActions'));
  assert.ok(confirm,'delete asks for confirmation first');assert.equal(calls.length,0);
  await act(async()=>confirm.props.onClick());
  assert.deepEqual(calls.shift(),['delete',open.id,'mine']);
  close(tree);
  const readOnly=mount(PostDetailPage,{id:open.id,model:input,readOnly:true});
  assert.equal(readOnly.root.findAllByProps({className:'commentOwnActions'}).length,0,'read-only previews never offer 수정·삭제');
  close(readOnly);
});
test('답글 달기 opens an input under a live top-level comment, posts with parentId and shows the reloaded replies',async()=>{
  const sent=[];const open={...post,requiredRank:0};let replies=[];
  const list=[{id:'top',author:creator,body:'원댓글',time:'어제',replyCount:0},{id:'gone',deleted:true,author:{name:'',image:''},body:'',time:'어제',replyCount:1}];
  const input=model({data:{...data,posts:[open]},commentsByPost:{[open.id]:list},commentCounts:{[open.id]:2},addComment:async(...args)=>{sent.push(args);replies=[{id:'r-new',author:creator,body:args[1],time:'방금',own:true}];return ok;},loadReplies:async()=>({...ok,data:replies})});
  const tree=mount(PostDetailPage,{id:open.id,model:input});
  const replyButtons=()=>tree.root.findAllByProps({className:'commentReplyAction'});
  assert.equal(replyButtons().length,1,'only the live top-level comment offers 답글 달기 (not the deleted placeholder)');
  act(()=>replyButtons()[0].props.onClick());
  const field=tree.root.findByProps({'aria-label':'답글 쓰기'});
  assert.equal(field.props.placeholder,'새로운 작가님에게 답글');
  act(()=>field.props.onChange({target:{value:'  답글 내용 '}}));
  await act(async()=>tree.root.findByProps({className:'commentEdit replyForm'}).props.onSubmit({preventDefault(){}}));
  assert.deepEqual(sent,[[open.id,'답글 내용','top']]);
  assert.equal(tree.root.findAllByProps({'aria-label':'답글 쓰기'}).length,0,'the input closes after posting');
  assert.deepEqual(tree.root.findAllByProps({className:'replies'})[0].findAllByType('p').map(node=>node.props.children).filter(Boolean),['답글 내용']);
  close(tree);
  const readOnly=mount(PostDetailPage,{id:open.id,model:input,readOnly:true});
  assert.equal(readOnly.root.findAllByProps({className:'commentReplyAction'}).length,0,'read-only previews cannot reply');
  close(readOnly);
});
test('mock replies land under their parent, bump replyCount and reject a deleted parent',async()=>{
  let state;const me={name:'검수자',image:'/viewer.png'};
  function Probe(){state=useMockSocial({data,viewer:me,canAccess:()=>true,today:'2030-01-01',initialComments:{[post.id]:[{id:'top',author:creator,body:'원댓글',time:'어제',replyCount:0},{id:'gone',deleted:true,author:{name:'',image:''},body:'',time:'어제',replyCount:1}]},initialReplies:{gone:[{id:'g1',author:creator,body:'남은 답글',time:'방금'}]},replyDelay:0});return null;}
  const tree=mount(Probe);const start=state.commentCounts[post.id];let result;
  await act(async()=>{result=await state.addComment(post.id,'내 답글','top');});
  assert.equal(result.success,true);
  await act(async()=>{result=await state.loadReplies(post.id,'top');});
  assert.deepEqual(result.data.map(r=>[r.body,r.own]),[['내 답글',true]]);
  assert.equal(state.commentsByPost[post.id].length,2,'a reply is not a new top-level comment');
  assert.equal(state.commentsByPost[post.id][0].replyCount,1);assert.equal(state.commentCounts[post.id],start+1);
  await act(async()=>{result=await state.addComment(post.id,'삭제된 곳','gone');});
  assert.equal(result.errorCode,'INVALID_PARENT');
  close(tree);
});
const {useMockSocial}=loadTypeScript('components/preview/service/useMockSocial.ts');
test('mock adapter edits and deletes only the viewer\'s own comments, keeping a deleted parent as a placeholder while replies remain',async()=>{
  let state;const me={name:'검수자',image:'/viewer.png'};
  function Probe(){state=useMockSocial({data,viewer:me,canAccess:()=>true,today:'2030-01-01',initialComments:{[post.id]:[{id:'mine',author:me,body:'내 댓글',time:'어제',replyCount:2,own:true},{id:'other',author:creator,body:'남의 댓글',time:'어제'}]},initialReplies:{mine:[{id:'r1',author:me,body:'내 답글',time:'방금',own:true},{id:'r2',author:creator,body:'답글',time:'방금'}]},replyDelay:0});return null;}
  const tree=mount(Probe);const count=()=>state.commentCounts[post.id];const start=count();let result;
  await act(async()=>{result=await state.editComment(post.id,'other','바꿈');});
  assert.equal(result.errorCode,'NOT_COMMENT_AUTHOR');
  await act(async()=>{result=await state.deleteComment(post.id,'other');});
  assert.equal(result.errorCode,'NOT_COMMENT_AUTHOR');assert.equal(state.commentsByPost[post.id].length,2);
  await act(async()=>{result=await state.editComment(post.id,'mine','  고친 댓글  ');});
  assert.equal(result.success,true);
  assert.deepEqual(state.commentsByPost[post.id].map(c=>[c.body,!!c.edited]),[['고친 댓글',true],['남의 댓글',false]]);
  await act(async()=>{result=await state.editComment(post.id,'r1','고친 답글');});
  await act(async()=>{result=await state.loadReplies(post.id,'mine');});
  assert.deepEqual(result.data.map(r=>[r.body,!!r.edited]),[['고친 답글',true],['답글',false]]);
  await act(async()=>{result=await state.deleteComment(post.id,'mine');});
  const placeholder=state.commentsByPost[post.id][0];
  assert.equal(placeholder.deleted,true);assert.equal(placeholder.body,'');assert.equal(placeholder.own,false);assert.equal(count(),start-1);
  await act(async()=>{result=await state.editComment(post.id,'mine','부활');});
  assert.equal(result.errorCode,'COMMENT_NOT_FOUND');
  await act(async()=>{result=await state.deleteComment(post.id,'r1');});
  await act(async()=>{result=await state.loadReplies(post.id,'mine');});
  assert.deepEqual(result.data.map(r=>r.id),['r2']);assert.equal(state.commentsByPost[post.id][0].replyCount,1);assert.equal(count(),start-2);
  close(tree);
});
test('mock adapter denies unauthorized comments and blocked or whitespace messages without mutating data',async()=>{
  let state;
  function Probe(){state=useMockSocial({data,viewer:{name:'검수자',image:'/viewer.png'},canAccess:()=>false,today:'2030-01-01',initialComments:{[post.id]:[{id:'c1',author:creator,body:'댓글',time:'어제',replyCount:1}]},initialReplies:{c1:[{id:'c1-r1',author:creator,body:'답글',time:'방금',fromCreator:true}]},replyDelay:0});return null;}
  const tree=mount(Probe);
  let result;
  await act(async()=>{result=await state.addComment(post.id,'권한 없음');});
  assert.equal(result.success,false);
  assert.equal(state.commentsByPost[post.id].length,1);
  await act(async()=>{result=await state.loadReplies(post.id,'c1');});
  assert.equal(result.success,true);assert.equal(result.data.length,1);assert.equal(result.data[0].fromCreator,true);
  await act(async()=>{result=await state.loadReplies(post.id,'missing');});
  assert.equal(result.errorCode,'COMMENT_NOT_FOUND');
  await act(async()=>{result=await state.sendMessage(creator.id,'   ');});
  assert.equal(result.success,false);
  assert.deepEqual(state.messagesByCreator,{});
  await act(async()=>{await state.setConversationBlocked(creator.id,true);});
  await act(async()=>{result=await state.sendMessage(creator.id,'차단 상태');});
  assert.equal(result.errorCode,'CREATOR_BLOCKED');
  assert.deepEqual(state.messagesByCreator,{});
  close(tree);
});

test('feed card opens comments inline with paging and mentions instead of navigating to the detail page',async()=>{
  const {messyCommentThreads,toSocialComments,toSocialReplies}=loadTypeScript('components/preview/comment-fixtures.ts');
  const threads=messyCommentThreads(post.id,23),comments=toSocialComments(threads),replies=toSocialReplies(threads);
  const submitted=[],loaded=[];
  const input=model({data,commentsByPost:{[post.id]:comments},commentCounts:{[post.id]:23},addComment:async(id,body)=>{submitted.push({id,body});return ok;},loadReplies:async(id,commentId)=>{loaded.push(commentId);return {...ok,data:replies[commentId]||[]};}});
  let tree;act(()=>{tree=create(element(PostCard,{post,model:input}));});
  try{
    const toggle=()=>tree.root.findAllByType('button').find(button=>button.props['aria-controls']===`comments-${post.id}`);
    assert.equal(toggle().props['aria-expanded'],false);
    assert.equal(tree.root.findAllByType('a').some(link=>String(link.props.href).includes('#comments')),false);
    assert.equal(tree.root.findAllByProps({className:'comments'}).length,0);
    act(()=>toggle().props.onClick());
    assert.equal(toggle().props['aria-expanded'],true);
    assert.equal(tree.root.findAllByProps({className:'comments'}).length,1);
    assert.equal(tree.root.findAllByProps({className:'comment'}).filter(node=>node.parent?.props?.className!=='replies').length,10);
    const more=tree.root.findAllByType('button').find(button=>button.props.className==='moreComments');
    assert.match(JSON.stringify(tree.toJSON()),/13개 남음/);
    act(()=>more.props.onClick());
    assert.equal(tree.root.findAllByProps({className:'comment'}).filter(node=>node.parent?.props?.className!=='replies').length,20);
    assert.ok(tree.root.findAllByProps({className:'mentionLink'}).length>0);
    assert.equal(tree.root.findAllByProps({className:'replies'}).length,0,'replies are not shipped with the list');
    const creatorRows=tree.root.findAllByProps({className:'comment'}).filter(node=>node.props['data-creator']===true);
    assert.ok(creatorRows.length>0,'creator top-level comments are highlighted');
    assert.ok(creatorRows.every(node=>node.findAllByProps({className:'creatorBadge'}).length===1));
    assert.ok(tree.root.findAllByProps({className:'comment'}).filter(node=>!node.props['data-creator']).every(node=>node.findAllByProps({className:'creatorBadge'}).length===0));
    const withReplies=comments.find(comment=>comment.replyCount>0);
    const replyToggle=()=>tree.root.findAllByType('button').find(button=>button.props.className==='repliesToggle'&&button.props.children===`답글 ${withReplies.replyCount}개 보기`||button.props.className==='repliesToggle'&&button.props['aria-expanded']===true);
    assert.equal(replyToggle().props['aria-expanded'],false);
    await act(async()=>replyToggle().props.onClick());
    assert.deepEqual(loaded,[withReplies.id]);
    assert.equal(replyToggle().props.children,'답글 숨기기');
    assert.equal(tree.root.findAllByProps({className:'replies'}).length,1);
    assert.equal(tree.root.findAllByProps({className:'replies'})[0].props.children.length,withReplies.replyCount);
    await act(async()=>replyToggle().props.onClick());
    assert.deepEqual(loaded,[withReplies.id],'hiding and reopening does not refetch');
    assert.equal(tree.root.findAllByProps({className:'replies'}).length,0);
    act(()=>tree.root.findByType('textarea').props.onChange({target:{value:'인라인 댓글'}}));
    await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
    assert.deepEqual(submitted,[{id:post.id,body:'인라인 댓글'}]);
    act(()=>toggle().props.onClick());
    assert.equal(tree.root.findAllByProps({className:'comments'}).length,0);
  }finally{act(()=>tree.unmount());}
});

test('post ··· menu offers 신고·공유 and 수정 only for own posts, reports through the model, and stays inert in readOnly previews',async()=>{
  const reports=[];
  const input=model({data,ownCreatorIds:[creator.id],reportPost:async (id,reason)=>{reports.push([id,reason]);return ok;}});
  let tree;act(()=>{tree=create(element(PostCard,{post,model:input}));});
  try{
    const trigger=()=>tree.root.findAllByType('button').find(button=>button.props['aria-haspopup']==='menu');
    assert.equal(trigger().props['aria-expanded'],false);assert.equal(tree.root.findAllByProps({role:'menu'}).length,0);
    act(()=>trigger().props.onClick());
    const menu=tree.root.findByProps({role:'menu'});
    assert.deepEqual(menu.findAll(node=>node.props.role==='menuitem'&&typeof node.type==='string').map(item=>item.children.join('')),['신고','공유','수정']);
    assert.equal(menu.findAllByType('a')[0].props.href,'/actual-service/studio/content/exhibition/edit');
    act(()=>menu.findAll(node=>node.props.role==='menuitem'&&typeof node.type==='string')[0].props.onClick());
    assert.equal(tree.root.findAllByProps({role:'menu'}).length,0);
    const submit=()=>tree.root.findAllByType('button').find(button=>button.children.includes('신고하기'));
    assert.equal(submit().props.disabled,true,'a reason must be chosen first');
    assert.deepEqual(tree.root.findAll(node=>node.type==='input'&&node.props.type==='radio').length,6);
    act(()=>tree.root.findAll(node=>node.type==='input'&&node.props.type==='radio')[4].props.onChange({target:{checked:true}}));
    await act(async()=>submit().props.onClick());
    assert.deepEqual(reports,[[post.id,'PRIVACY']]);assert.match(JSON.stringify(tree.toJSON()),/서버 확인/);
  }finally{act(()=>tree.unmount());}
  let other;act(()=>{other=create(element(PostCard,{post,model:model({data})}));});
  try{
    act(()=>other.root.findAllByType('button').find(button=>button.props['aria-haspopup']==='menu').props.onClick());
    assert.deepEqual(other.root.findByProps({role:'menu'}).findAll(node=>node.props.role==='menuitem'&&typeof node.type==='string').map(item=>item.children.join('')),['신고','공유']);
  }finally{act(()=>other.unmount());}
  const preview=mount(PostDetailPage,{id:post.id,model:model({data}),readOnly:true});
  try{assert.equal(preview.root.findAllByType('button').find(button=>button.props['aria-haspopup']==='menu').props.disabled,true);}finally{close(preview);}
});

test('posts with comments closed by the creator hide the comment toggle and show a closed notice instead of the form',()=>{
  const closedPost={...post,id:'closed',commentsEnabled:false};
  const input=model({data:{...data,posts:[closedPost]},commentsByPost:{closed:[{id:'c',author:creator,body:'HIDDEN_COMMENT',time:'어제'}]}});
  const card=mount(PostCard,{post:closedPost,model:input});
  try{
    assert.equal(card.root.findAllByType('button').some(button=>button.props['aria-controls']==='comments-closed'),false);
    assert.match(JSON.stringify(card.toJSON()),/댓글 닫힘/);
  }finally{close(card);}
  const detail=mount(PostDetailPage,{id:'closed',model:input});
  try{
    assert.match(JSON.stringify(detail.toJSON()),/댓글을 닫아두었어요/);
    assert.doesNotMatch(JSON.stringify(detail.toJSON()),/HIDDEN_COMMENT/);
    assert.equal(detail.root.findAllByType('textarea').length,0);
  }finally{close(detail);}
});

for(const surface of ['feed','detail'])test(`clicking a ${surface} image opens the post overlay with the media stage and a white detail panel; arrows, Escape and backdrop work`,async()=>{
  const gallery={...post,media:[{type:'image',url:'/one.png'},{type:'video',url:'/two.mp4'},{type:'image',url:'/three.png'}],body:'OVERLAY_BODY_SENTINEL'};
  const input=model({data:{...data,posts:[gallery]},commentsByPost:{[post.id]:[]},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(surface==='feed'?element(PostCard,{post:gallery,model:input}):element(PostDetailPage,{id:gallery.id,model:input}));});
  try{
    const dialog=()=>tree.root.findAllByProps({role:'dialog'});
    assert.equal(dialog().length,0);
    const zoom=tree.root.findAllByType('button').filter(button=>String(button.props['aria-label']).includes('크게 보기'));
    assert.equal(zoom.length,2,'only images get a zoom button; the video keeps its controls');
    act(()=>zoom[1].props.onClick());
    assert.equal(dialog().length,1);assert.equal(dialog()[0].props['aria-modal'],'true');
    const current=()=>Number(dialog()[0].findByProps({className:'stageTrack'}).props['data-index']);
    assert.equal(current(),2,'opens at the clicked media');
    assert.match(dialog()[0].findByProps({className:'stageTrack'}).props.style.transform,/-200%/,'the track is translated to the current slide');
    assert.equal(dialog()[0].findByType('aside').props.className,'panel');
    assert.match(JSON.stringify(tree.toJSON()),/OVERLAY_BODY_SENTINEL/);
    const nav=label=>dialog()[0].findAllByType('button').find(button=>button.props['aria-label']===label);
    assert.equal(nav('다음 미디어'),undefined,'no next arrow on the last media (ends clamp, no wrap)');
    act(()=>nav('이전 미디어').props.onClick());
    assert.equal(current(),1);assert.equal(dialog()[0].findAllByType('video').filter(video=>video.props.controls).length,1,'only the current video exposes controls');
    act(()=>nav('이전 미디어').props.onClick());
    assert.equal(current(),0);assert.equal(nav('이전 미디어'),undefined,'no previous arrow on the first media');
    assert.equal(dialog()[0].props['data-state'],'open','enter animation state');
    act(()=>nav('닫기').props.onClick({stopPropagation(){}}));
    assert.equal(dialog().length,1);assert.equal(dialog()[0].props['data-state'],'closing','stays mounted through the exit animation');
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,160));});
    assert.equal(dialog().length,0);
    act(()=>zoom[0].props.onClick());
    assert.equal(dialog()[0].props['data-state'],'open','reopening restarts the enter state');
    act(()=>dialog()[0].props.onClick({}));
    assert.equal(dialog()[0].props['data-state'],'closing','clicking the dark backdrop closes');
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,160));});
    assert.equal(dialog().length,0);
  }finally{act(()=>tree.unmount());}
});

test('the overlay is not offered for locked posts or read-only previews',()=>{
  const lockedModel=model({data,canAccess:()=>false,commentsByPost:{},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(element(PostCard,{post,model:lockedModel}));});
  assert.equal(tree.root.findAllByType('button').filter(button=>String(button.props['aria-label']).includes('크게 보기')).length,0);
  act(()=>tree.unmount());
  act(()=>{tree=create(element(PostDetailPage,{id:post.id,model:model({data,commentsByPost:{},loadReplies:async()=>ok}),readOnly:true}));});
  assert.equal(tree.root.findAllByType('button').filter(button=>String(button.props['aria-label']).includes('크게 보기')).length,0);
  act(()=>tree.unmount());
});

test('detail gallery closes when the post changes, access is lost or preview becomes read-only',()=>{
  const input=model({data,loadReplies:async()=>ok});
  for(const changed of [
    {id:'missing',model:input},
    {id:post.id,model:model({data,canAccess:()=>false})},
    {id:post.id,model:model({data:{...data,posts:[{...post,canAccess:false}]}})},
    {id:post.id,model:input,forceLocked:true},
    {id:post.id,model:input,readOnly:true},
  ]){
    const tree=mount(PostDetailPage,{id:post.id,model:input});
    try{
      act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
      assert.equal(tree.root.findAllByProps({role:'dialog'}).length,1);
      act(()=>tree.update(element(PostDetailPage,changed)));
      assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);
      assert.equal(tree.root.findAllByType('button').filter(button=>String(button.props['aria-label']).includes('크게 보기')).length,0);
      act(()=>tree.update(element(PostDetailPage,{id:post.id,model:input})));
      assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0,'restored access does not reopen a stale viewer');
    }finally{close(tree);}
  }
});

test('the feed ends with a small "모두 확인했습니다" note, but an empty feed shows only the empty state',()=>{
  let tree;act(()=>{tree=create(element(FeedPage,{model:model({data})}));});
  assert.match(JSON.stringify(tree.toJSON()),/모두 확인했습니다/);
  act(()=>tree.update(element(FeedPage,{model:model({data:{...data,posts:[]}})})));
  assert.doesNotMatch(JSON.stringify(tree.toJSON()),/모두 확인했습니다/);
  act(()=>tree.unmount());
});

test('feed category chips filter complete preview data, preserve order and reset an empty category',()=>{
  const other={...creator,id:'other',tags:['여행']},source={...data,categories:['전체','아트','여행','음악'],creators:[{...creator,tags:['아트']},other],posts:[post,{...post,id:'trip',creatorId:other.id,title:'여행 게시물'}]};
  const tree=mount(FeedPage,{model:model({data:source,mode:'mock'})});
  const chips=()=>tree.root.findByProps({'aria-label':'관심 카테고리'}).findAllByType('button');
  const choose=label=>act(()=>chips().find(button=>button.children.includes(label)).props.onClick());
  assert.equal(chips().filter(button=>button.children.includes('전체')).length,1);
  assert.equal(tree.root.findByProps({'aria-label':'크리에이터 검색'}).props.href,'/actual-service/explore');
  assert.equal(tree.root.findAllByType('input').length,0);
  choose('여행');assert.deepEqual(tree.root.findAllByType(PostCard).map(node=>node.props.post.id),['trip']);
  assert.deepEqual(tree.root.findByType(PostCard).props.context.map(p=>p.id),['trip']);
  choose('음악');assert.equal(tree.root.findAllByType(PostCard).length,0);assert.match(JSON.stringify(tree.toJSON()),/이 카테고리의 게시물이 없어요/);
  act(()=>tree.root.findAllByType('button').find(button=>button.children.includes('전체 피드 보기')).props.onClick());
  assert.deepEqual(tree.root.findAllByType(PostCard).map(node=>node.props.post.id),['exhibition','trip']);close(tree);
});

test('live feed delegates category selection and pagination to the supplied model',()=>{
  const calls=[],tree=mount(FeedPage,{model:model({data:{...data,categories:['아트']},feedCategory:{value:'아트',select:value=>calls.push(value)},feedPaging:{hasMore:true,loading:false,loadMore:async()=>{calls.push('next');}}})});
  assert.equal(tree.root.findAllByType(PostCard).length,1,'Server page is authoritative, not re-filtered by partial creator metadata');
  act(()=>tree.root.findAllByType('button').find(button=>button.children.includes('전체')).props.onClick());
  act(()=>tree.root.findAllByType('button').find(button=>button.children.includes('더 보기')).props.onClick());
  assert.deepEqual(calls,['전체','next']);close(tree);
});

test('card gallery: mouse drag scrolls the track, snaps to the nearest slide on release and does not open the overlay; arrows step slides',()=>{
  const gallery={...post,position:'center top',media:[{type:'image',url:'/one.png'},{type:'image',url:'/two.png'},{type:'image',url:'/three.png'}]};
  const input=model({data:{...data,posts:[gallery]},commentsByPost:{[post.id]:[]},loadReplies:async()=>ok});
  const scrolls=[];const node={scrollLeft:0,clientWidth:300,style:{},scrollTo({left}){scrolls.push(left);node.scrollLeft=left;}};
  let tree;act(()=>{tree=create(element(PostCard,{post:gallery,model:input}),{createNodeMock:el=>el.props.className==='galleryTrack'?node:null});});
  try{
    const track=()=>tree.root.findByProps({className:'galleryTrack'});
    assert.deepEqual(track().findAllByType('img').map(img=>img.props.style.objectPosition),['center top','center top','center top'],'multi-image cards preserve the supplied crop position');
    const dialogs=()=>tree.root.findAllByProps({role:'dialog'});
    act(()=>track().props.onPointerDown({pointerType:'mouse',button:0,clientX:200}));
    act(()=>track().props.onPointerMove({clientX:197}));
    assert.equal(node.scrollLeft,0,'tiny moves are not drags');
    act(()=>track().props.onPointerMove({clientX:20}));
    assert.equal(node.scrollLeft,180);assert.equal(track().props['data-dragging'],true);assert.equal(node.style.scrollSnapType,'none','snapping is paused synchronously while dragging');
    act(()=>track().props.onPointerUp());
    assert.deepEqual(scrolls,[300],'released past halfway → snaps to slide 2');
    assert.equal(node.style.scrollSnapType,'','snapping is restored on release');
    assert.equal(track().props['data-dragging'],undefined);
    let prevented=0;
    act(()=>track().props.onClickCapture({preventDefault(){prevented++;},stopPropagation(){}}));
    assert.equal(prevented,1,'the click that ends a drag is swallowed so the overlay stays closed');
    assert.equal(dialogs().length,0);
    const nav=label=>tree.root.findAllByType('button').find(button=>button.props['aria-label']===label);
    assert.ok(nav('이전 미디어')&&nav('다음 미디어'),'both arrows once in the middle');
    act(()=>nav('다음 미디어').props.onClick());
    assert.deepEqual(scrolls,[300,600]);assert.equal(nav('다음 미디어'),undefined,'no next arrow on the last slide');
    act(()=>nav('이전 미디어').props.onClick());act(()=>nav('이전 미디어').props.onClick());
    assert.equal(nav('이전 미디어'),undefined,'no previous arrow on the first slide');
    act(()=>track().props.onPointerDown({pointerType:'touch',button:0,clientX:200}));
    act(()=>track().props.onPointerMove({clientX:20}));
    assert.equal(node.scrollLeft,0,'touch is left to native scrolling');
  }finally{act(()=>tree.unmount());}
});

test('cards show dots only (no n/total counter); the overlay paginates with dots and steps through the injected post list, skipping locked posts',()=>{
  const a={...post,id:'a',title:'A',body:'BODY_A',media:[{type:'image',url:'/a1.png'},{type:'image',url:'/a2.png'}]};
  const locked={...post,id:'locked',title:'L',body:'BODY_LOCKED',image:'/l.png',requiredRank:5};
  const b={...post,id:'b',title:'B',body:'BODY_B',image:'/b.png'};
  const textOnly={...post,id:'t',title:'T',body:'BODY_T',image:''};
  const list=[a,locked,b,textOnly];
  const input=model({data:{...data,posts:list},canAccess:(creator,rank)=>rank<5,commentsByPost:{},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(element(PostCard,{post:a,model:input,context:list}));});
  try{
    assert.doesNotMatch(JSON.stringify(tree.toJSON()),/"1\/2"|1\/2/,'no current/total counter on the card');
    assert.equal(tree.root.findAllByProps({className:'galleryDots'}).length,1);
    act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
    const dialog=()=>tree.root.findByProps({role:'dialog'});
    assert.equal(dialog().findAllByProps({className:'galleryDots stageDots'}).length,1,'overlay uses dots, not a counter');
    assert.doesNotMatch(JSON.stringify(dialog().children.map(child=>child.children.length)),/"\d\/\d"/);
    const nav=label=>dialog().findAllByType('button').find(button=>[].concat(button.props.children).includes(label));
    assert.equal(nav('이전 게시물').props.disabled,true,'first viewable post has no previous');
    assert.equal(nav('다음 게시물').props.disabled,false);
    act(()=>nav('다음 게시물').props.onClick());
    const shown=()=>JSON.stringify(tree.toJSON());
    assert.match(shown(),/BODY_B/);assert.doesNotMatch(shown(),/BODY_LOCKED/,'locked neighbour is skipped');
    assert.equal(nav('다음 게시물').props.disabled,true,'text-only post is not a viewer target');
    act(()=>nav('이전 게시물').props.onClick());
    assert.match(shown(),/BODY_A/);
  }finally{act(()=>tree.unmount());}
});

test('without an injected context the overlay shows no post navigation',()=>{
  const input=model({data,commentsByPost:{},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(element(PostCard,{post,model:input}));});
  act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
  assert.equal(tree.root.findAllByType('button').some(button=>[].concat(button.props.children).includes('다음 게시물')),false);
  act(()=>tree.unmount());
});

test('overlay stage swipes between media with touch or mouse, ignoring short or vertical gestures',()=>{
  const gallery={...post,media:[{type:'image',url:'/one.png'},{type:'image',url:'/two.png'},{type:'image',url:'/three.png'}]};
  const input=model({data:{...data,posts:[gallery]},commentsByPost:{},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(element(PostCard,{post:gallery,model:input}));});
  try{
    act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
    const dialog=()=>tree.root.findByProps({role:'dialog'});
    const stage=()=>dialog().children[0];
    const track=()=>dialog().findByProps({className:'stageTrack'});
    const current=()=>Number(track().props['data-index']);
    assert.equal(current(),0);
    act(()=>stage().props.onPointerDown({pointerType:'touch',clientX:300,clientY:200,target:{tagName:'IMG'}}));
    act(()=>stage().props.onPointerMove({clientX:220,clientY:205}));
    assert.match(track().props.style.transform,/-80px/,'the track follows the finger while dragging');assert.equal(track().props['data-dragging'],true,'no transition mid-drag');
    act(()=>stage().props.onPointerUp({clientX:180,clientY:210}));
    assert.equal(current(),1,'swipe left → next media');assert.match(track().props.style.transform,/-100% \+ 0px/,'released: snaps with the transition');assert.equal(track().props['data-dragging'],undefined);
    act(()=>stage().props.onPointerDown({pointerType:'mouse',clientX:100,clientY:200,target:{tagName:'IMG'}}));
    act(()=>stage().props.onPointerMove({clientX:260,clientY:205}));
    act(()=>stage().props.onPointerUp({clientX:260,clientY:205}));
    assert.equal(current(),0,'drag right → previous media');
    act(()=>stage().props.onPointerDown({pointerType:'mouse',clientX:200,clientY:200,target:{tagName:'IMG'}}));
    act(()=>stage().props.onPointerMove({clientX:290,clientY:200}));
    assert.match(track().props.style.transform,/\+ 30px/,'dragging past the first slide resists (1/3)');
    act(()=>stage().props.onPointerUp({clientX:290,clientY:200}));
    assert.equal(current(),0,'no wrap at the start');
    act(()=>stage().props.onPointerDown({pointerType:'touch',clientX:100,clientY:100,target:{tagName:'IMG'}}));
    act(()=>stage().props.onPointerMove({clientX:120,clientY:110}));
    act(()=>stage().props.onPointerUp({clientX:120,clientY:110}));
    assert.equal(current(),0,'short gesture ignored');
    act(()=>stage().props.onPointerDown({pointerType:'touch',clientX:100,clientY:100,target:{tagName:'IMG'}}));
    act(()=>stage().props.onPointerMove({clientX:160,clientY:300}));
    act(()=>stage().props.onPointerUp({clientX:160,clientY:300}));
    assert.equal(current(),0,'mostly vertical gesture ignored');
    act(()=>stage().props.onPointerDown({pointerType:'touch',clientX:300,clientY:100,target:{tagName:'VIDEO'}}));
    act(()=>stage().props.onPointerMove({clientX:100,clientY:100}));
    act(()=>stage().props.onPointerUp({clientX:100,clientY:100}));
    assert.equal(current(),0,'gestures starting on a video are left to its controls');
  }finally{act(()=>tree.unmount());}
});

test('mobile detail panel follows the pointer and snaps to all three heights; cancellation and unrelated pointers cannot move it',()=>{
  const viewport={clientWidth:390,clientHeight:800},captured=new Set();
  const handleNode={setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture:id=>captured.delete(id)};
  let tree;act(()=>{tree=create(element(PostCard,{post,model:model({data})}),{createNodeMock:node=>node.props.role==='dialog'?viewport:null});});
  try{
    act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
    const dialog=()=>tree.root.findByProps({role:'dialog'}),handle=()=>tree.root.findByProps({className:'panelHandle'});
    const event=(y,extra={})=>({pointerId:1,isPrimary:true,button:0,clientX:180,clientY:y,currentTarget:handleNode,...extra});
    const drag=(from,to)=>{act(()=>handle().props.onPointerDown(event(from)));act(()=>handle().props.onPointerMove(event(to)));act(()=>handle().props.onPointerUp(event(to)));};
    assert.equal(dialog().props['data-panel-snap'],1,'mobile gallery opens at media peek');
    drag(200,900);assert.equal(dialog().props['data-panel-snap'],0);
    act(()=>handle().props.onPointerDown(event(470)));
    act(()=>handle().props.onPointerMove(event(200)));
    assert.ok(parseFloat(dialog().props.style['--post-media-height'])<30,'panel follows the vertical drag');
    assert.equal(dialog().props['data-panel-dragging'],true);
    act(()=>handle().props.onPointerUp(event(200)));
    assert.equal(dialog().props['data-panel-snap'],1);assert.equal(captured.size,0);
    act(()=>handle().props.onClick({detail:1}));
    assert.equal(dialog().props['data-panel-snap'],1,'release click must not advance another step');
    drag(200,10);assert.equal(dialog().props['data-panel-snap'],2);
    drag(30,900);assert.equal(dialog().props['data-panel-snap'],0,'drag beyond the bottom clamps to default');
    act(()=>handle().props.onPointerDown(event(470)));
    act(()=>handle().props.onPointerMove(event(20,{pointerId:2})));
    assert.equal(dialog().props['data-panel-dragging'],undefined,'other pointer ignored');
    act(()=>handle().props.onPointerMove(event(20)));
    act(()=>handle().props.onPointerCancel());
    assert.equal(dialog().props['data-panel-snap'],0);assert.equal(dialog().props['data-panel-dragging'],undefined,'cancel restores last snap');
    act(()=>handle().props.onPointerDown(event(470)));
    act(()=>handle().props.onPointerMove(event(460,{clientX:300})));
    act(()=>handle().props.onPointerUp(event(460,{clientX:300})));
    assert.equal(dialog().props['data-panel-snap'],0,'horizontal movement is not a panel drag');
    viewport.clientWidth=1280;drag(470,20);assert.equal(dialog().props['data-panel-snap'],0,'desktop cannot resize the panel');
  }finally{act(()=>tree.unmount());}
});

test('panel handle supports tap and keyboard alternatives, including boundaries',()=>{
  const tree=mount(PostCard,{post,model:model({data})});
  try{
    act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
    const handle=()=>tree.root.findByProps({className:'panelHandle'}),dialog=()=>tree.root.findByProps({role:'dialog'});
    assert.equal(dialog().props['data-panel-snap'],1,'opens at media peek');
    for(const snap of [2,0,1]){act(()=>handle().props.onClick({detail:0}));assert.equal(dialog().props['data-panel-snap'],snap);}
    for(const [key,snap] of [['ArrowUp',2],['ArrowUp',2],['ArrowDown',1],['Home',0],['ArrowDown',0],['End',2]]){
      act(()=>handle().props.onKeyDown({key,preventDefault(){}}));assert.equal(dialog().props['data-panel-snap'],snap);
    }
    assert.match(handle().props['aria-label'],/상세 전체 보기/);
  }finally{close(tree);}
});

test('mobile media expansion restores visible gallery panel heights without resetting the selected media or remounting video',()=>{
  const mixed={...post,media:[{type:'image',url:'/photo.jpg'},{type:'video',url:'/clip.mp4'}]};
  const tree=mount(PostCard,{post:mixed,model:model({data})});
  try{
    act(()=>tree.root.findAllByType('button').find(button=>String(button.props['aria-label']).includes('크게 보기')).props.onClick());
    const dialog=()=>tree.root.findByProps({role:'dialog'}),handle=()=>tree.root.findByProps({className:'panelHandle'});
    const toggle=()=>dialog().findByProps({className:'mediaExpand'}),track=()=>dialog().findByProps({className:'stageTrack'});
    act(()=>dialog().findByProps({'aria-label':'다음 미디어'}).props.onClick());
    const video=dialog().findByType('video');
    let stopped=0;
    act(()=>handle().props.onKeyDown({key:'Home',preventDefault(){}}));
    for(const [snap,height] of [[0,'56%'],[1,'22%']]){
      assert.equal(dialog().props['data-panel-snap'],snap);
      act(()=>toggle().props.onClick({stopPropagation(){stopped++;}}));
      assert.equal(dialog().props['data-media-expanded'],true);
      assert.equal(dialog().props.style['--post-media-height'],'100%');
      assert.equal(toggle().props['aria-label'],'미디어 축소');
      assert.equal(toggle().props['aria-expanded'],false);
      assert.equal(track().props['data-index'],1);
      assert.equal(dialog().findByType('video'),video,'video must stay mounted');
      act(()=>toggle().props.onClick({stopPropagation(){stopped++;}}));
      assert.equal(dialog().props['data-media-expanded'],undefined);
      assert.equal(dialog().props['data-panel-snap'],snap);
      assert.ok(Math.abs(parseFloat(dialog().props.style['--post-media-height'])-parseFloat(height))<.001);
      assert.equal(toggle().props['aria-label'],'미디어 확대');
      assert.equal(toggle().props['aria-expanded'],true);
      act(()=>handle().props.onClick({detail:0}));
    }
    assert.equal(stopped,4,'toggle clicks must not close the overlay');
  }finally{close(tree);}
});


test('feed, detail and read-only preview share supplied views without manufacturing missing counts',()=>{
 const counted={...post,views:24831},input=model({data:{...data,posts:[counted]}});
 for(const [Component,props]of [[FeedPage,{model:input}],[PostDetailPage,{id:post.id,model:input}],[PostDetailPage,{id:post.id,model:input,readOnly:true}]]){
  const tree=mount(Component,props);const count=tree.root.findByProps({'data-post-views':24831});assert.equal(count.props['aria-label'],'조회수 24,831회');close(tree);
 }
 const missing=mount(PostCard,{post,model:model({data})});assert.equal(missing.root.findAll(item=>item.props['data-post-views']!==undefined).length,0);close(missing);
});

test('mobile gallery image tap toggles full media mode and restores the panel; desktop remains unchanged',()=>{
 for(const media of [undefined,[{type:'image',url:'/one.png'},{type:'image',url:'/two.png'}]]){
  const viewport={clientWidth:390,clientHeight:800},gallery={...post,media};let tree;
  act(()=>{tree=create(element(PostCard,{post:gallery,model:model({data})}),{createNodeMock:node=>node.props.role==='dialog'?viewport:null});});
  try{
   act(()=>tree.root.findAllByType('button').find(b=>String(b.props['aria-label']).includes('크게 보기')).props.onClick());
   const dialog=()=>tree.root.findByProps({role:'dialog'}),stage=()=>dialog().findByProps({className:'stage'});
   const tap=()=>{const e={pointerId:1,isPrimary:true,button:0,clientX:150,clientY:150,target:{tagName:'IMG'}};act(()=>stage().props.onPointerDown(e));act(()=>stage().props.onPointerUp(e));act(()=>stage().props.onClick({...e,stopPropagation(){}}));};
   assert.equal(dialog().props['data-panel-snap'],1,'mobile gallery opens at media peek');
   for(const width of [390,767]){viewport.clientWidth=width;tap();assert.equal(dialog().props['data-media-expanded'],true);assert.equal(dialog().props.style['--post-media-height'],'100%');tap();assert.equal(dialog().props['data-media-expanded'],undefined);assert.equal(dialog().props['data-panel-snap'],1);assert(Math.abs(parseFloat(dialog().props.style['--post-media-height'])-22)<.001);}
   for(const width of [768,1280]){viewport.clientWidth=width;tap();assert.equal(dialog().props['data-media-expanded'],undefined,'desktop image click must not hide its side panel');}
  }finally{close(tree);}
 }
});

test('mobile gallery image tap ignores drag-release, cancelled, multitouch and video gestures',()=>{
 const gallery={...post,media:[{type:'image',url:'/one.png'},{type:'image',url:'/two.png'},{type:'video',url:'/clip.mp4'}]},viewport={clientWidth:390,clientHeight:800};let tree;
 act(()=>{tree=create(element(PostCard,{post:gallery,model:model({data})}),{createNodeMock:node=>node.props.role==='dialog'?viewport:null});});
 try{
  act(()=>tree.root.findAllByType('button').find(b=>String(b.props['aria-label']).includes('크게 보기')).props.onClick());
  const dialog=()=>tree.root.findByProps({role:'dialog'}),stage=()=>dialog().findByProps({className:'stage'}),track=()=>dialog().findByProps({className:'stageTrack'});
  const e=(x=200,y=200,extra={})=>({pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,target:{tagName:'IMG'},stopPropagation(){},...extra});
  const release=(event)=>{act(()=>stage().props.onPointerUp(event));act(()=>stage().props.onClick(event));};
  for(const [dx,dy] of [[-100,0],[8,0],[0,60]]){act(()=>stage().props.onPointerDown(e()));act(()=>stage().props.onPointerMove(e(200+dx,200+dy)));release(e(200+dx,200+dy));assert.equal(dialog().props['data-media-expanded'],undefined);}
  assert.equal(track().props['data-index'],1,'swipe still advances to next image');
  act(()=>stage().props.onPointerDown(e()));act(()=>stage().props.onPointerCancel());release(e());assert.equal(dialog().props['data-media-expanded'],undefined);
  act(()=>stage().props.onPointerDown(e()));act(()=>stage().props.onPointerDown(e(210,210,{pointerId:2,isPrimary:false})));release(e());assert.equal(dialog().props['data-media-expanded'],undefined);
  act(()=>stage().props.onPointerDown(e()));act(()=>stage().props.onPointerMove(e(202,201)));release(e(202,201));assert.equal(dialog().props['data-media-expanded'],true,'small finger jitter still counts as tap');assert.equal(track().props['data-index'],1);
  act(()=>dialog().findByProps({className:'mediaExpand'}).props.onClick({stopPropagation(){}}));
  act(()=>dialog().findByProps({'aria-label':'다음 미디어'}).props.onClick());const video=dialog().findByType('video');const v=e(200,200,{target:{tagName:'VIDEO'}});act(()=>stage().props.onPointerDown(v));release(v);assert.equal(dialog().props['data-media-expanded'],undefined);assert.equal(dialog().findByType('video'),video);
 }finally{close(tree);}
});

test('posting a preview comment preserves the current viewer commemorative badge without granting verification',async()=>{
 const {previewViewer}=loadTypeScript('components/preview/founding-members.ts');
 let state;
 function Probe(){state=useMockSocial({data,viewer:previewViewer,canAccess:()=>true,today:'2030-01-01'});return null;}
 const tree=mount(Probe);
 await act(async()=>{const result=await state.addComment(post.id,'베타 참여 댓글');assert.equal(result.success,true);});
 const author=state.commentsByPost[post.id][0].author;
 assert.equal(author.name,previewViewer.name);
 assert.equal(author.isFoundingMember,true);
 assert.equal(author.isVerified,undefined);
 close(tree);
});
test('mobile footer with operator details follows a non-empty home feed',()=>{
  const tree=mount(FeedPage,{model:model({data,mode:'mock'})});
  assert.ok(tree.root.findAllByType(PostCard).length>0);
  assert.equal(tree.root.findAllByProps({'aria-label':'사업자 정보'}).length,1);
  assert.equal(tree.root.findAllByProps({'aria-label':'서비스 안내'}).length,1);
  close(tree);
});

test('a membership post header shows the monthly KRW price after its access label and never a bean conversion',()=>{
  const heading=input=>{let tree;act(()=>{tree=create(element(PostCard,{post:input.post,model:model({data:{...data,...input.data}})}));});try{return tree.root.findByProps({className:'postHeading'}).findByType('small').children.join('');}finally{act(()=>tree.unmount());}};
  assert.match(heading({post}),/멤버십 전용 · 월 ₩7,000$/);
  const plans=[{id:'a',name:'A',rank:2,price:9900,benefits:[]},{id:'b',name:'B',rank:3,price:19900,benefits:[]},{id:'c',name:'C',rank:2,price:5000,benefits:[],available:false}];
  assert.match(heading({post,data:{plans}}),/월 ₩9,900부터$/,'cheapest on-sale plan, retired plans ignored');
  assert.match(heading({post:{...post,requiredPlanId:'b'},data:{plans}}),/월 ₩19,900$/);
  assert.doesNotMatch(heading({post:{...post,requiredRank:0}}),/월 ₩/);assert.doesNotMatch(heading({post,data:{plans}}),/콩/);
});

test('my messages show one check with 전송됨, two checks with 읽음 once read; theirs show no receipt (2026-11-01)',()=>{
  const messages={[creator.id]:[{id:1,mine:false,body:'상대 메시지',time:'2026-09-12T00:30:00Z'},{id:2,mine:true,body:'읽은 메시지',time:'2026-09-12T00:31:00Z',read:true},{id:3,mine:true,body:'보낸 메시지',time:'2026-09-12T00:32:00Z',read:false}]};
  const tree=mount(MessagesPage,{model:model({data,messagesByCreator:messages})});
  const bubbles=tree.root.findAllByProps({className:'message'});
  const receipt=bubble=>bubble.findAll(n=>n.props?.className==='receipt');
  assert.equal(receipt(bubbles[0]).length,0);
  const read=receipt(bubbles[1])[0],sent=receipt(bubbles[2])[0];
  const words=node=>node.children.map(c=>typeof c==='string'?c:words(c)).join('');
  assert.match(words(read),/읽음/);assert.equal(read.props['data-read'],true);assert.equal(read.findAllByType('path').length,2);
  assert.match(words(sent),/전송됨/);assert.equal(sent.props['data-read'],undefined);assert.equal(sent.findAllByType('path').length,1);
  close(tree);
});

// /ux-spinner 2026-11-01: a pending "더 보기" keeps its label (disabled) for 1s; only then the small spinner appears, never instant '불러오는 중…'.
test('feed load-more: label unchanged and no loading text for 1s, then an inline spinner',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const tree=mount(FeedPage,{model:model({data,feedPaging:{hasMore:true,loading:true,loadMore:async()=>{}}})});
  const flat=n=>n==null?[]:Array.isArray(n)?n.flatMap(flat):typeof n==='string'?[]:[n,...flat(n.children)];
  const words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(''):(n.children||[]).map(words).join('');
  const state=()=>{const b=flat(tree.toJSON()).find(n=>n.type==='button'&&words(n).includes('더 보기'));return{label:!!b,disabled:!!b?.props.disabled,spinner:flat(b?.children).filter(n=>n.props?.role==='status').length,instantText:words(tree.toJSON()).includes('불러오는 중…')};};
  try{
    const rows={'0ms':state()};act(()=>t.mock.timers.tick(500));rows['500ms']=state();act(()=>t.mock.timers.tick(499));rows['999ms']=state();act(()=>t.mock.timers.tick(1));rows['1000ms']=state();t.diagnostic('load-more '+JSON.stringify(rows));
    for(const k of ['0ms','500ms','999ms'])assert.deepEqual(rows[k],{label:true,disabled:true,spinner:0,instantText:false},k);
    assert.deepEqual(rows['1000ms'],{label:true,disabled:true,spinner:1,instantText:false});
  }finally{close(tree);}
});
