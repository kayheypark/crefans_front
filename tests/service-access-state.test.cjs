const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const denied={success:false,data:null,errorMessage:'세션이 만료되었습니다.',errorCode:'UNAUTHORIZED'};
const bootstrap=()=>({signedIn:true,ownCreatorIds:[],viewer:{name:'구독자',handle:'fan',bio:'',image:''},data:{creators:[],posts:[{id:'paid',body:'비밀 본문',likes:0,comments:1,media:[]}],creatorPlans:{},plans:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},following:[],liked:[],saved:[],subscriptions:[],read:[],messagesByCreator:{},account:{blockedCreatorIds:[],preferences:{},stats:{},paymentMethods:[],tickets:[]}});
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
