const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const mocks={
 'next/link':({children,...props})=>React.createElement('a',props,children),
 'next/navigation':{useRouter:()=>({push(){}})},
 './ProfileHeader':{ProfileHeader:()=>null},'./ProfilePhotoDialog':{ProfilePhotoDialog:()=>null},
 './BeanPages':{BeanWalletLink:()=>null,TipButton:()=>null},'./FollowButton':{FollowButton:()=>null},
 './SocialPages':{PostCard:()=>null,FeedEnd:()=>null},
};
const {MyProfilePage}=loadTypeScript('components/crefans/AccountPages.tsx',mocks);
const {CreatorProfilePage}=loadTypeScript('components/crefans/CreatorPages.tsx',mocks);
const {PostMediaTile}=loadTypeScript('components/crefans/PostMediaTile.tsx',mocks);
const post=(id,extra={})=>({id,creatorId:'owner',title:id,body:'',image:'',position:'center',requiredRank:0,...extra});
const photo={type:'image',url:'/photo.jpg'},video={type:'video',url:'/video.mp4'};
function model(posts){return {viewer:{},following:[],saved:[],liked:[],subscriptions:[],ownCreatorIds:['owner'],basePath:'/service',canAccess:()=>true,accountActions:{},account:{route:{},preferences:{},stats:{}},data:{posts,creators:[{id:'owner',name:'작가',tags:[]}],plans:[],creatorPlans:{}}};}
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
function click(tree,label){act(()=>tree.root.findAllByType('button').find(n=>text(n)===label).props.onClick());}
for(const [name,Page] of [['my',MyProfilePage],['creator',CreatorProfilePage]]){
 test(`${name} media tab excludes text-only posts, shows first media thumbnail and separate counts`,()=>{
  const value=model([post('text'),post('explicit-empty',{image:'/stale.jpg',media:[]}),post('photo',{media:[photo,photo]}),post('video',{media:[video]}),post('mixed',{image:photo.url,media:[video,photo,video]}),post('legacy',{image:'/legacy.jpg'})]);
  let more=0;value.feedPaging={hasMore:true,loading:false,loadMore:()=>{more++;}};
  let tree;act(()=>{tree=create(React.createElement(Page,{model:value,id:'owner'}));});
  try{
   click(tree,'미디어4');const links=tree.root.findAllByType('a').filter(n=>n.props.href.includes('/post/'));
   assert.deepEqual(links.map(n=>n.props.href),['photo','video','mixed','legacy'].map(id=>`/service/post/${id}`));
   assert.equal(links[0].findByType('img').props.src,photo.url);
   assert.equal(links[2].findByType('video').props.src,'/video.mp4#t=0.001');
   assert.match(links[2].props['aria-label'],/사진 1장, 동영상 2개/);
   assert.equal(links[2].findByProps({'aria-label':'사진 1장, 동영상 2개'}).findAllByType('svg').length,2);
   assert.equal(links[1].findByType('video').props.controls,false);assert.equal(links[1].findByType('video').props.muted,true);
   click(tree,'더 보기');assert.equal(more,1);
   act(()=>tree.update(React.createElement(Page,{model:{...value,data:{...value.data,posts:[post('text')]}},id:'owner'})));
   assert.equal(tree.root.findAllByType('a').filter(n=>n.props.href.includes('/post/')).length,0);click(tree,'더 보기');assert.equal(more,2);
  }finally{act(()=>tree.unmount());}
 });
}
test('media tiles never request locked or processing media, preserve counts and recover from a replaced failed thumbnail',()=>{
 const value=model([]);let tree;
 const render=p=>act(()=>{const el=React.createElement(PostMediaTile,{post:p,model:value});tree?tree.update(el):tree=create(el);});
 try{
  render(post('locked',{canAccess:false,requiredRank:1,media:[video,photo]}));assert.equal(tree.root.findAllByType('video').length,0);assert.equal(tree.root.findAllByType('img').length,0);assert.match(tree.root.findByType('a').props['aria-label'],/사진 1장, 동영상 1개/);
  render(post('processing',{media:[{...video,processing:true}]}));assert.equal(tree.root.findAllByType('video').length,0);assert.equal(tree.root.findAllByProps({'data-video-processing':'thumbnail'}).length,1);
  render(post('error',{media:[photo]}));act(()=>tree.root.findByType('img').props.onError());assert.match(JSON.stringify(tree.toJSON()),/미리보기 없음/);
  render(post('replacement',{media:[{...photo,url:'/new.jpg'}]}));assert.equal(tree.root.findByType('img').props.src,'/new.jpg');
  render(post('empty',{image:'/stale.jpg',media:[]}));assert.equal(tree.toJSON(),null);
 }finally{act(()=>tree.unmount());}
});
