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
  assert.ok(tree.root.findAllByType('a').some(node=>node.props.href==='/actual-service/membership/museum'));
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

const {useMockSocial}=loadTypeScript('components/preview/service/useMockSocial.ts');
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
    assert.ok(tree.root.findAllByProps({className:'mention'}).length>0);
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
  const input=model({data,ownCreatorIds:[creator.id],reportPost:async id=>{reports.push(id);return ok;}});
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
    await act(async()=>tree.root.findAllByType('button').find(button=>button.children.includes('신고하기')).props.onClick());
    assert.deepEqual(reports,[post.id]);assert.match(JSON.stringify(tree.toJSON()),/서버 확인/);
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

test('clicking a feed image opens the post overlay with the media stage and a white detail panel; arrows, Escape and backdrop work',async()=>{
  const gallery={...post,media:[{type:'image',url:'/one.png'},{type:'video',url:'/two.mp4'},{type:'image',url:'/three.png'}],body:'OVERLAY_BODY_SENTINEL'};
  const input=model({data:{...data,posts:[gallery]},commentsByPost:{[post.id]:[]},loadReplies:async()=>ok});
  let tree;act(()=>{tree=create(element(PostCard,{post:gallery,model:input}));});
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
    assert.match(JSON.stringify(dialog()[0].children.map(child=>child.props?.className)),/panel/);
    assert.match(JSON.stringify(tree.toJSON()),/OVERLAY_BODY_SENTINEL/);
    const nav=label=>dialog()[0].findAllByType('button').find(button=>button.props['aria-label']===label);
    assert.equal(nav('다음 미디어'),undefined,'no next arrow on the last media (ends clamp, no wrap)');
    act(()=>nav('이전 미디어').props.onClick());
    assert.equal(current(),1);assert.equal(dialog()[0].findAllByType('video').filter(video=>video.props.controls).length,1,'only the current video exposes controls');
    act(()=>nav('이전 미디어').props.onClick());
    assert.equal(current(),0);assert.equal(nav('이전 미디어'),undefined,'no previous arrow on the first media');
    assert.equal(dialog()[0].props['data-state'],'open','enter animation state');
    act(()=>nav('닫기').props.onClick());
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

test('the feed ends with a small "모두 확인했습니다" note, but an empty feed shows only the empty state',()=>{
  let tree;act(()=>{tree=create(element(FeedPage,{model:model({data})}));});
  assert.match(JSON.stringify(tree.toJSON()),/모두 확인했습니다/);
  act(()=>tree.update(element(FeedPage,{model:model({data:{...data,posts:[]}})})));
  assert.doesNotMatch(JSON.stringify(tree.toJSON()),/모두 확인했습니다/);
  act(()=>tree.unmount());
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
