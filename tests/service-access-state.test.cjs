const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const denied={success:false,data:null,errorMessage:'세션이 만료되었습니다.',errorCode:'UNAUTHORIZED'};
const bootstrap=()=>({signedIn:true,ownCreatorIds:[],viewer:{name:'구독자',handle:'fan',bio:'',image:''},data:{creators:[],posts:[{id:'paid',body:'비밀 본문',likes:0,comments:1,media:[]}],creatorPlans:{},plans:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{},stats:{},paymentMethods:[],tickets:[]}});
test('guest actions ask for login without writes; self-follow and expired-session failures stay out of page errors',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
 let value,signedIn=false,path='/service/me';const renders=[];let result={success:false,data:null,errorMessage:'자신을 팔로우할 수 없습니다.',errorCode:'SELF_FOLLOW'},finish;const writes=[];
 const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams(),usePathname:()=>path},'./useDirectoryModel':{useDirectoryModel:()=>({})},
  '@/lib/api/identity':{verifyIdentity:async()=>denied},'@/lib/api/billing':{startBillingRegistration:async()=>denied},
  '@/lib/api/platform':{platformRequest:async(path,body)=>{if(path==='/bootstrap')return ok({...bootstrap(),signedIn});if(path==='/common')return ok({});writes.push(path);return result===null?new Promise(resolve=>{finish=resolve;}):result;}}
 });
 function Probe(){value=useServiceModel();renders.push({path,loading:value.loading});return null;}let tree;await act(async()=>{tree=create(React.createElement(Probe));});t.after(()=>{try{act(()=>tree.unmount());}finally{global.document=previous;}});
 for(const action of ['toggleFollow','toggleLike','toggleSave']){await act(async()=>value.model[action]('own'));assert.equal(value.actionNotice.loginRequired,true);assert.equal(value.error,'');act(()=>value.dismissFeedback());assert.equal(value.actionNotice,null);}
 assert.deepEqual(writes,[]);
 signedIn=true;await act(async()=>value.refresh());await act(async()=>value.model.toggleFollow('own'));
 assert.deepEqual(value.actionNotice,{message:'자신을 팔로우할 수 없습니다.',loginRequired:false});assert.equal(value.error,'');assert.deepEqual(value.model.following,[]);
 act(()=>value.dismissFeedback());result=denied;await act(async()=>value.model.toggleSave('paid'));assert.equal(value.actionNotice.loginRequired,true);assert.deepEqual(value.model.saved,[]);
 act(()=>value.dismissFeedback());result=ok({});await act(async()=>value.model.toggleFollow('other'));assert.deepEqual(value.model.following,['other']);assert.equal(value.actionNotice,null);
 result=null;act(()=>value.model.toggleLike('paid'));await act(async()=>value.refresh());await act(async()=>finish(denied));assert.equal(value.actionNotice,null,'an old page response must not reopen an authentication dialog');assert.deepEqual(value.model.liked,[]);
 renders.length=0;path='/service/login';signedIn=false;await act(async()=>tree.update(React.createElement(Probe)));assert.equal(renders[0].loading,true,'the new login route must not render with the previous session before refresh starts');assert.equal(value.loading,false);assert.equal(value.model.signedIn,false);
});
test('feed category persists into paging, rejects stale pages and never falls back to unfiltered bootstrap on failure',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};t.after(()=>{global.document=previous;});
 let value,finishOldPage,pendingOldPage;const requests=[];
 const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams(),usePathname:()=>'/service/feed'},'./useDirectoryModel':{useDirectoryModel:()=>({})},
  '@/lib/api/identity':{verifyIdentity:async()=>denied},'@/lib/api/billing':{startBillingRegistration:async()=>denied},
  '@/lib/api/platform':{platformRequest:async path=>{requests.push(path);if(path==='/bootstrap')return ok({...bootstrap(),signedIn:false});if(path==='/common')return ok({});const query=new URL(path,'https://example.invalid').searchParams,category=query.get('category')||'전체';if(category==='실패')return denied;if(query.has('cursor')&&category==='전체')return new Promise(resolve=>{finishOldPage=resolve;});return ok({posts:[{id:category+(query.has('cursor')?'-next':''),likes:0,comments:0}],creators:[],nextCursor:query.has('cursor')?null:'cursor'});}}
 });
 function Probe(){value=useServiceModel();return null;}let tree;await act(async()=>{tree=create(React.createElement(Probe));});t.after(()=>act(()=>tree.unmount()));
 act(()=>{pendingOldPage=value.model.feedPaging.loadMore();});
 await act(async()=>value.model.feedCategory.select('아트'));
 assert.deepEqual(value.model.data.posts.map(p=>p.id),['아트']);
 await act(async()=>{finishOldPage(ok({posts:[{id:'stale'}],creators:[],nextCursor:'old'}));await pendingOldPage;});
 assert.deepEqual(value.model.data.posts.map(p=>p.id),['아트']);
 await act(async()=>value.model.feedPaging.loadMore());
 assert.deepEqual(value.model.data.posts.map(p=>p.id),['아트','아트-next']);assert.equal(value.model.feedPaging.hasMore,false);
 assert.ok(requests.some(path=>{const q=new URL(path,'https://example.invalid').searchParams;return q.get('category')==='아트'&&q.get('cursor')==='cursor';}));
 await act(async()=>value.model.feedCategory.select('실패'));assert.deepEqual(value.model.data.posts,[]);assert.equal(value.error,denied.errorMessage);
 await act(async()=>value.model.feedCategory.select('전체'));assert.deepEqual(value.model.data.posts.map(p=>p.id),['전체']);
});
test('refresh clears paid bodies and comments immediately, ignores older comment responses and stays empty on failure',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};t.after(()=>{global.document=previous;});
 let boot=()=>Promise.resolve(ok(bootstrap())),commentResponse=()=>Promise.resolve(ok({comments:[{id:'comment',body:'비밀 댓글'}],nextOffset:null})),value;
 const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams(),usePathname:()=>'/service/me'},
  './useDirectoryModel':{useDirectoryModel:()=>({})},
  '@/lib/api/identity':{verifyIdentity:async()=>denied},'@/lib/api/billing':{startBillingRegistration:async()=>denied},
  '@/lib/api/platform':{platformRequest:path=>path==='/bootstrap'?boot():path==='/common'?Promise.resolve(ok({paymentMethods:[],auth:{}})):commentResponse()}
 });
 function Probe(){value=useServiceModel();return null;}
 let tree;await act(async()=>{tree=create(React.createElement(Probe));});t.after(()=>act(()=>tree.unmount()));
 assert.equal(value.model.data.posts[0].body,'비밀 본문');
 await act(async()=>{await value.model.loadComments('paid');});assert.equal(value.model.commentsByPost.paid[0].body,'비밀 댓글');
 let finishComment,finishBootstrap;commentResponse=()=>new Promise(resolve=>{finishComment=resolve;});boot=()=>new Promise(resolve=>{finishBootstrap=resolve;});
 let pendingComment,pendingRefresh;act(()=>{pendingComment=value.model.loadComments('paid');pendingRefresh=value.refresh();});
 assert.deepEqual(value.model.data.posts,[]);assert.deepEqual(value.model.commentsByPost,{});assert.equal(value.model.signedIn,false);assert.equal(value.common,null);assert.equal(value.loading,true);
 await act(async()=>{finishComment(ok({comments:[{id:'late',body:'지난 계정의 비밀'}],nextOffset:null}));await pendingComment;});assert.deepEqual(value.model.commentsByPost,{});
 await act(async()=>{finishBootstrap(denied);await pendingRefresh;});assert.deepEqual(value.model.data.posts,[]);assert.equal(value.error,denied.errorMessage);
 boot=()=>Promise.resolve(ok({...bootstrap(),signedIn:false,data:{...bootstrap().data,posts:[{id:'paid',body:'',media:[],likes:0,comments:1,canAccess:false}]}}));
 await act(async()=>{await value.refresh();});assert.equal(value.model.data.posts[0].body,'');assert.deepEqual(value.model.commentsByPost,{});
});
test('feed pages and post details keep each returned creator’s latest membership offers, including an empty list',async()=>{
 let value,path='/service/feed',updatedPlans=[{id:'club',name:'여행 클럽',rank:2,price:15000,benefits:['촬영 기록']}];
 const profile=()=>({id:'artist',name:'작가',plans:updatedPlans});
 const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams(),usePathname:()=>path},'./useDirectoryModel':{useDirectoryModel:()=>({})},
  '@/lib/api/identity':{verifyIdentity:async()=>denied},'@/lib/api/billing':{startBillingRegistration:async()=>denied},
  '@/lib/api/platform':{platformRequest:async endpoint=>endpoint==='/bootstrap'?ok({...bootstrap(),signedIn:false,data:{...bootstrap().data,creatorPlans:{artist:[{id:'old',name:'지난 정보'}],other:[{id:'other'}]}}}):endpoint==='/common'?ok({}):endpoint==='/posts/paid'?ok({post:{id:'paid',creatorId:'artist'},creator:profile()}):ok({posts:[],creators:[profile()],nextCursor:endpoint.includes('cursor')?null:'next'})}
 });
 function Probe(){value=useServiceModel();return null;}let tree;await act(async()=>{tree=create(React.createElement(Probe));});
 try{
  assert.deepEqual(value.model.data.creatorPlans.artist,updatedPlans);assert.equal(value.model.data.creatorPlans.other[0].id,'other');
  updatedPlans=[{id:'new',name:'새 멤버십',rank:3,price:20000,benefits:[]}];await act(async()=>value.model.feedPaging.loadMore());assert.deepEqual(value.model.data.creatorPlans.artist,updatedPlans);
  path='/service/post/paid';updatedPlans=[];await act(async()=>tree.update(React.createElement(Probe)));assert.deepEqual(value.model.data.creatorPlans.artist,[],'no bootstrap fallback when current profile has no plans');
 }finally{act(()=>tree.unmount());}
});
test('live comment edit/delete call PUT/DELETE on the comment, refresh the list, and lower the count only after a delete succeeds; report and tag lookups use their routes',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};t.after(()=>{global.document=previous;});
 const calls=[];let fail=false,value;
 const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams(),usePathname:()=>'/service/me'},'./useDirectoryModel':{useDirectoryModel:()=>({})},
  '@/lib/api/identity':{verifyIdentity:async()=>denied},'@/lib/api/billing':{startBillingRegistration:async()=>denied},
  '@/lib/api/platform':{platformRequest:async(path,body,method)=>{if(path==='/bootstrap')return ok(bootstrap());if(path==='/common')return ok({});calls.push([method||(body?'POST':'GET'),path,body]);if(path.endsWith('/mention-candidates'))return fail?denied:ok([{name:'하늘',image:''}]);if(method||body)return fail?denied:ok({message:'완료'});return ok({comments:[],nextOffset:null});}}
 });
 function Probe(){value=useServiceModel();return null;}let tree;await act(async()=>{tree=create(React.createElement(Probe));});
 await act(async()=>{await value.model.addComment('paid','답글','c1');});
 assert.deepEqual(calls.splice(0),[['POST','/posts/paid/comments',{body:'답글',parentId:'c1'}],['GET','/posts/paid/comments-page',undefined]]);
 await act(async()=>{await value.model.editComment('paid','c 1','고친 댓글');});
 assert.deepEqual(calls.splice(0),[['PUT','/posts/paid/comments/c%201',{body:'고친 댓글'}],['GET','/posts/paid/comments-page',undefined]]);
 fail=true;await act(async()=>{await value.model.deleteComment('paid','c1');});
 assert.deepEqual(calls.splice(0).map(c=>c[0]),['DELETE']);assert.equal(value.model.data.posts[0].comments,2,'a failed delete keeps the count (1 + the reply)');
 fail=false;await act(async()=>{await value.model.deleteComment('paid','c1');});
 assert.deepEqual(calls.splice(0).map(c=>c.slice(0,2)),[['DELETE','/posts/paid/comments/c1'],['GET','/posts/paid/comments-page']]);assert.equal(value.model.data.posts[0].comments,1);
 let reported;await act(async()=>{reported=await value.model.reportComment('c1','SPAM');});assert.equal(reported.success,true);
 assert.deepEqual(calls.splice(0),[['POST','/reports',{id:'c1',kind:'COMMENT',reason:'SPAM'}]]);
 assert.deepEqual(await value.model.mentionCandidates('paid 1'),[{name:'하늘',image:''}]);assert.deepEqual(calls.splice(0),[['GET','/posts/paid%201/mention-candidates',undefined]]);
 fail=true;assert.deepEqual(await value.model.mentionCandidates('paid'),[],'a failed lookup offers nobody instead of throwing');fail=false;
 act(()=>tree.unmount());
});
