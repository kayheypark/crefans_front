const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const denied={success:false,data:null,errorMessage:'세션이 만료되었습니다.',errorCode:'UNAUTHORIZED'};
const bootstrap=()=>({signedIn:true,ownCreatorIds:[],viewer:{name:'구독자',handle:'fan',bio:'',image:''},data:{creators:[],posts:[{id:'paid',body:'비밀 본문',likes:0,comments:1,media:[]}],creatorPlans:{},plans:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{},stats:{},paymentMethods:[],tickets:[]}});
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
