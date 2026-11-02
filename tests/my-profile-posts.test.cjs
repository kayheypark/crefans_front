const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const failed={success:false,data:null,errorMessage:'게시물을 불러오지 못했어요.',errorCode:'UNAVAILABLE'};
const post=(id,creatorId='owner',extra={})=>({id,creatorId,title:id,body:'게시물 내용',image:'',requiredRank:0,likes:0,comments:0,...extra});
const bootstrap=()=>({signedIn:true,ownCreatorIds:['owner'],viewer:{name:'내 이름',handle:'owner',bio:'소개'},data:{creators:[],posts:[post('bootstrap-other','other')],creatorPlans:{},plans:[],notifications:[],paymentHistory:[],messages:{},faqs:[],categories:[],followers:[]},following:[],liked:['liked-other'],saved:['saved-other'],subscriptions:[],read:[],messagesByCreator:{},account:{stats:{posts:2,followers:0},preferences:{},blockedCreatorIds:[],paymentMethods:[],tickets:[],route:{profileTab:null}},accountActions:{},basePath:'/service',canAccess:()=>true});
function probe(api,location){let value;const {useServiceModel}=loadTypeScript('features/service/useServiceModel.ts',{
 'next/navigation':{usePathname:()=>location.path,useSearchParams:()=>new URLSearchParams(location.query)},'./useDirectoryModel':{useDirectoryModel:()=>({})},
 '@/lib/api/identity':{verifyIdentity:async()=>failed},'@/lib/api/billing':{startBillingRegistration:async()=>failed},'@/lib/api/platform':{platformRequest:api}
});function Probe(){value=useServiceModel();return null;}return {Probe,get value(){return value;}};}

test('my profile loads the owner’s paginated posts, merges the author, deduplicates, and keeps the owner filter',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
 const requests=[];let fail=false;
 const p=probe(async path=>{requests.push(path);if(path==='/bootstrap')return ok(bootstrap());if(path==='/common')return ok({});if(fail)return failed;const query=new URL(path,'https://example.test').searchParams;assert.equal(query.get('creatorId'),'owner');return ok({posts:query.has('cursor')?[post('first'),post('second')]:[post('first')],creators:[{id:'owner',name:'내 활동명',plans:[]}],nextCursor:query.has('cursor')?null:'next page'});},{path:'/service/me'});
 let tree;await act(async()=>{tree=create(React.createElement(p.Probe));});t.after(()=>{act(()=>tree.unmount());global.document=previous;});
 assert.deepEqual(p.value.model.data.posts.map(p=>p.id),['first']);assert.equal(p.value.model.data.creators[0].id,'owner');assert.equal(p.value.model.feedPaging.hasMore,true);
 await act(async()=>p.value.model.feedPaging.loadMore());assert.deepEqual(p.value.model.data.posts.map(p=>p.id),['first','second']);assert.equal(p.value.model.feedPaging.hasMore,false);
 assert.ok(requests.includes('/posts?cursor=next%20page&creatorId=owner'));
 fail=true;await act(async()=>p.value.refresh());assert.deepEqual(p.value.model.data.posts,[]);assert.equal(p.value.error,failed.errorMessage);
});

test('profile collections, fan and guest never fetch a creator feed; late owner pages cannot replace a collection',async t=>{
 const previous=global.document;global.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};
 let current=bootstrap(),finish,pending;const location={path:'/service/me',query:''},requests=[];
 const p=probe(async path=>{requests.push(path);if(path.startsWith('/bootstrap'))return ok({...current,data:{...current.data}});if(path==='/common')return ok({});if(path.includes('cursor='))return new Promise(resolve=>{finish=resolve;});return ok({posts:[post('own')],creators:[],nextCursor:'next'});},location);
 let tree;await act(async()=>{tree=create(React.createElement(p.Probe));});t.after(()=>{act(()=>tree.unmount());global.document=previous;});
 assert.deepEqual(p.value.model.data.posts.map(p=>p.id),['own']);act(()=>{pending=p.value.model.feedPaging.loadMore();});
 for(const tab of ['saved','liked']){requests.length=0;location.query=`tab=${tab}`;current.data.posts=[post(`${tab}-other`,'other')];await act(async()=>tree.update(React.createElement(p.Probe)));assert.ok(requests.includes(`/bootstrap?collection=${tab}`));assert.ok(!requests.some(path=>path.startsWith('/posts')));assert.deepEqual(p.value.model.data.posts.map(p=>p.id),[`${tab}-other`]);}
 await act(async()=>{finish(ok({posts:[post('stale')],creators:[],nextCursor:'old'}));await pending;});assert.deepEqual(p.value.model.data.posts.map(p=>p.id),['liked-other']);assert.equal(p.value.model.feedPaging.hasMore,false);
 for(const signedIn of [true,false]){requests.length=0;current={...current,signedIn,ownCreatorIds:[]};location.query='';await act(async()=>p.value.refresh());assert.ok(!requests.some(path=>path.startsWith('/posts')));}
});

const {MyProfilePage}=loadTypeScript('components/crefans/AccountPages.tsx',{
 'next/link':({children,href,...props})=>React.createElement('a',{href,...props},children),
 './SocialPages':{PostCard:({post,context})=>React.createElement('article',{'data-post':post.id,'data-context':context.map(p=>p.id).join(',')},post.title),FeedEnd:()=>React.createElement('p',null,'마지막 게시물')},
 './ProfileHeader':{ProfileHeader:()=>null},'./ProfilePhotoDialog':{ProfilePhotoDialog:()=>null},'./BeanPages':{BeanWalletLink:()=>null},
});
const flat=node=>typeof node==='string'?node:(node.children||[]).map(flat).join('');
const click=(tree,label)=>act(()=>tree.root.findAllByType('button').find(n=>flat(n)===label).props.onClick());
test('my profile renders only owned feed/media, loads more in both tabs and switches collections without hook errors',async()=>{
 let more=0;const data=bootstrap();data.data.posts=[post('text'),post('photo','owner',{image:'/photo.jpg'}),post('video','owner',{media:[{type:'video',url:'/video.mp4'}]}),post('other','other',{image:'/other.jpg'})];data.saved=['other'];data.feedPaging={hasMore:true,loading:false,loadMore:async()=>{more++;}};
 let tree;act(()=>{tree=create(React.createElement(MyProfilePage,{model:data}));});
 try{
  assert.deepEqual(tree.root.findAllByType('article').map(n=>n.props['data-post']),['text','photo','video']);assert.equal(tree.root.findByProps({'data-post':'photo'}).props['data-context'],'text,photo,video');
  click(tree,'더 보기');assert.equal(more,1);click(tree,'미디어2');assert.deepEqual(tree.root.findAllByType('a').map(n=>n.props.href).filter(h=>h.includes('/post/')),['/service/post/photo','/service/post/video']);assert.equal(tree.root.findByType('video').props.src,'/video.mp4#t=0.001');click(tree,'더 보기');assert.equal(more,2);
  click(tree,'소개');assert.equal(tree.root.findAllByType('article').length,0);assert.match(JSON.stringify(tree.toJSON()),/소개/);
  act(()=>tree.update(React.createElement(MyProfilePage,{model:{...data,account:{...data.account,route:{profileTab:'saved'}}}})));assert.ok(tree.root.findAllByType('a').some(n=>n.props.href==='/service/post/other'));
  act(()=>tree.update(React.createElement(MyProfilePage,{model:data})));click(tree,'피드3');assert.equal(tree.root.findAllByType('article').length,3);
  act(()=>tree.update(React.createElement(MyProfilePage,{model:{...data,ownCreatorIds:[],feedPaging:undefined}})));assert.equal(tree.root.findAllByType('article').length,0);assert.match(JSON.stringify(tree.toJSON()),/아직 게시물이 없어요/);
 }finally{act(()=>tree.unmount());}
});
