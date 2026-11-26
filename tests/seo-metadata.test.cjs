const test=require('node:test'),assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const {serviceSeo}=loadTypeScript('lib/seo/service-metadata.ts');
const robots=loadTypeScript('app/robots.ts').default;
// Search/share metadata (2026-11-01): public pages indexed, private pages noindex, locked posts never leak text or media.
const creator={id:'c1',name:'하늘',handle:'haneul',bio:'코스프레 작가',image:'/api/v1/media/a/file',cover:'/api/v1/media/c/file',isCreator:true,searchable:true};
function api(routes){const real=globalThis.fetch;globalThis.fetch=async url=>{const path=new URL(url).pathname.replace('/api/v1','');const hit=routes[path];return new Response(JSON.stringify(hit?{success:true,data:hit}:{success:false,data:null}),{status:hit?200:404});};return()=>{globalThis.fetch=real;};}
const index=m=>m.robots?.index;

test('public screens are indexed with canonical and share image; private screens are not',async()=>{
 const feed=await serviceSeo('feed',undefined,'홈 · crefans');assert.equal(index(feed.metadata),true);assert.equal(feed.metadata.alternates.canonical,'/service/feed');assert.equal(feed.metadata.openGraph.images[0].url,'/og/crefans-og-simple-v1.png');assert.ok(feed.jsonLd.length);
 for(const screen of ['beans','me','settings','messages','checkout','member','signup']){const {metadata,jsonLd}=await serviceSeo(screen,undefined,'x');assert.equal(index(metadata),false,screen);assert.equal(jsonLd.length,0);}
});
test('creator preview uses the profile; search opt-out and missing profiles are noindex',async()=>{
 const restore=api({'/profiles/c1':creator,'/profiles/c2':{...creator,id:'c2',searchable:false}});try{
  const open=await serviceSeo('creator','c1','x');assert.equal(open.metadata.title,'하늘(@haneul) | 크레팬스(Crefans)');assert.equal(open.metadata.openGraph.images[0].url,creator.cover);assert.equal(index(open.metadata),true);assert.equal(open.jsonLd[0]['@type'],'ProfilePage');
  const hidden=await serviceSeo('creator','c2','x');assert.equal(index(hidden.metadata),false);assert.equal(hidden.jsonLd.length,0);
  const missing=await serviceSeo('creator','nope','크리에이터 프로필 · crefans');assert.equal(index(missing.metadata),false);assert.equal(missing.metadata.title,'크리에이터 프로필 · crefans');
 }finally{restore();}
});
test('only anonymously readable posts expose text and image; locked posts show the creator only',async()=>{
 const restore=api({'/posts/open':{post:{id:'open',title:'첫 촬영 현장 비하인드',body:'<p>즐거운 촬영</p>',image:'/api/v1/media/p/file',canAccess:true,searchIndexable:true},creator},'/posts/locked':{post:{id:'locked',title:'멤버 전용 비하인드',body:'비밀 본문',image:'/api/v1/media/secret/file',canAccess:false},creator}});try{
  const open=await serviceSeo('post','open','x');assert.equal(open.metadata.description,'즐거운 촬영');assert.equal(open.metadata.openGraph.images[0].url,'/api/v1/media/p/file');assert.equal(index(open.metadata),true);
  const locked=await serviceSeo('post','locked','x'),text=JSON.stringify(locked);
  assert.doesNotMatch(text,/비밀 본문|멤버 전용 비하인드|secret/);assert.equal(locked.metadata.openGraph.images[0].url,creator.cover);assert.equal(index(locked.metadata),false);
 }finally{restore();}
});
test('API failure keeps generic metadata without de-indexing; robots never blocks public screens or media',async()=>{
 const real=globalThis.fetch;globalThis.fetch=async()=>{throw new Error('down');};try{const r=await serviceSeo('creator','c1','크리에이터 프로필 · crefans');assert.equal(r.metadata.robots,undefined);}finally{globalThis.fetch=real;}
 const rules=robots().rules[0],blocked=path=>rules.disallow.some(prefix=>path.startsWith(prefix))&&!rules.allow.some(prefix=>path.startsWith(prefix)&&prefix.length>Math.max(...rules.disallow.filter(d=>path.startsWith(d)).map(d=>d.length)));
 for(const path of ['/service/feed','/service/explore','/service/creator/c1','/service/membership/c1','/service/post/p1','/service/events','/service/legal/terms','/api/v1/media/a/file','/og/crefans-og-simple-v1.png'])assert.equal(blocked(path),false,path);
 for(const path of ['/service/beans','/service/settings','/preview/feed','/api/v1/me'])assert.equal(blocked(path),true,path);
});

// 2026-11-26: members' and AI-trial guests' public posts are indexed too, when the server allows it and the post has a photo and text.
const guest={id:'guest:abc',name:'체험 사용자',isCreator:false,isGuest:true,searchable:false};
const indexablePost=(id,extra={})=>({post:{id,title:'벚꽃 아래 교복 코스프레',body:'AI 사진 편집으로 만든 봄 분위기 사진이에요',image:'/api/v1/media/g1/file',media:[{type:'image',url:'/api/v1/media/g1/file'},{type:'image',url:'/api/v1/media/g2/file'},{type:'image',url:'/api/v1/media/s/file',sensitivePhoto:true}],category:'코스프레',time:'2026-11-25T09:00:00.000Z',canAccess:true,searchIndexable:true,...extra},creator:guest});
test('guest and member posts follow the server flag plus a photo and text floor; the page carries a readable post',async()=>{
 const restore=api({'/posts/g':indexablePost('g'),'/posts/short':indexablePost('short',{title:'야호',body:'♡'}),'/posts/off':indexablePost('off',{searchIndexable:false}),'/posts/old':indexablePost('old',{searchIndexable:undefined}),'/posts/nophoto':indexablePost('nophoto',{image:'',media:[]}),'/posts/closed':indexablePost('closed',{canAccess:false})});try{
  const g=await serviceSeo('post','g','x');assert.equal(index(g.metadata),true);
  assert.equal(g.jsonLd[0].author.url,undefined,'guest profiles are not indexed, so no author link');assert.deepEqual(g.jsonLd[0].image,['https://crefans.com/api/v1/media/g1/file','https://crefans.com/api/v1/media/g2/file']);
  assert.deepEqual(g.post,{title:'벚꽃 아래 교복 코스프레',body:'AI 사진 편집으로 만든 봄 분위기 사진이에요',author:'체험 사용자',time:'2026-11-25T09:00:00.000Z',category:'코스프레',images:['/api/v1/media/g1/file','/api/v1/media/g2/file']});
  for(const id of ['short','off','old','nophoto'])assert.equal(index((await serviceSeo('post',id,'x')).metadata),false,id);
  const closed=await serviceSeo('post','closed','x');assert.equal(index(closed.metadata),false);assert.equal(closed.post,undefined,'locked posts never render their content');
 }finally{restore();}
});
test('sitemap lists indexable posts across feed pages with their safe photos',async()=>{
 const pages={'':{posts:[indexablePost('g').post,indexablePost('short',{title:'야호',body:'♡'}).post],nextCursor:'n1'},n1:{posts:[indexablePost('off',{searchIndexable:false}).post,indexablePost('m2').post,indexablePost('g').post],nextCursor:null}};
 const real=globalThis.fetch;globalThis.fetch=async url=>{const u=new URL(url);const data=u.pathname==='/api/v1/posts'?pages[u.searchParams.get('cursor')||'']:u.pathname==='/api/v1/creators'?{creators:[],nextCursor:null}:null;return new Response(JSON.stringify(data?{success:true,data}:{success:false}),{status:data?200:404});};
 try{
  const sitemap=loadTypeScript('app/sitemap.ts').default,rows=(await sitemap()).filter(r=>r.url.includes('/service/post/'));
  assert.deepEqual(rows.map(r=>r.url),['https://crefans.com/service/post/g','https://crefans.com/service/post/m2']);
  assert.deepEqual(rows[0].images,['https://crefans.com/api/v1/media/g1/file','https://crefans.com/api/v1/media/g2/file']);assert.equal(rows[0].lastModified.toISOString(),'2026-11-25T09:00:00.000Z');
 }finally{globalThis.fetch=real;}
});
test('the server HTML shows the open post until the app loads',()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {PostSeoFallback}=loadTypeScript('components/service/PostSeoFallback.tsx');
 let tree;act(()=>{tree=create(React.createElement(PostSeoFallback,{post:{title:'벚꽃 코스프레',body:'봄 사진',author:'체험 사용자',time:'2026-11-25T09:00:00.000Z',category:'코스프레',images:['/a','/b']}}));});
 assert.equal(tree.root.findByType('h1').children.join(''),'벚꽃 코스프레');assert.deepEqual(tree.root.findByType('time').children,['2026. 11. 25.']);assert.deepEqual(tree.root.findAllByType('img').map(i=>[i.props.src,i.props.alt]),[['/a','벚꽃 코스프레'],['/b','벚꽃 코스프레 사진 2']]);
 const fs=require('node:fs'),router=fs.readFileSync('components/service/ServiceRouter.tsx','utf8'),page=fs.readFileSync('app/service/[...screen]/page.tsx','utf8');
 assert.match(router,/function content\(\)\{if\(loading\)return fallback\?\?\(slow\?<LoadingSpinner\/>:null\);/);
 assert.match(page,/fallback=\{post\?<PostSeoFallback post=\{post\}\/>:undefined\}/);
});
