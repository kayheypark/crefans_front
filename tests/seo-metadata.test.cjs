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
  const open=await serviceSeo('creator','c1','x');assert.equal(open.metadata.title,'하늘(@haneul) | 크레팬스');assert.equal(open.metadata.openGraph.images[0].url,creator.cover);assert.equal(index(open.metadata),true);assert.equal(open.jsonLd[0]['@type'],'ProfilePage');
  const hidden=await serviceSeo('creator','c2','x');assert.equal(index(hidden.metadata),false);assert.equal(hidden.jsonLd.length,0);
  const missing=await serviceSeo('creator','nope','크리에이터 프로필 · crefans');assert.equal(index(missing.metadata),false);assert.equal(missing.metadata.title,'크리에이터 프로필 · crefans');
 }finally{restore();}
});
test('only anonymously readable posts expose text and image; locked posts show the creator only',async()=>{
 const restore=api({'/posts/open':{post:{id:'open',title:'첫 촬영',body:'<p>즐거운 촬영</p>',image:'/api/v1/media/p/file',canAccess:true},creator},'/posts/locked':{post:{id:'locked',title:'멤버 전용 비하인드',body:'비밀 본문',image:'/api/v1/media/secret/file',canAccess:false},creator}});try{
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
