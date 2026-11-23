// 2026-11-23 user report/decision: desktop costume grid shows the pager and all three rows together; copyright-blocked costumes carry a "성공률 낮음" tag.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const styles=new Proxy({},{get:(_,key)=>String(key)});
const mocks={'./ai-photo.module.css':{__esModule:true,default:styles},'next/image':{__esModule:true,default:props=>React.createElement('img',{src:props.src,alt:props.alt})}};
const catalog=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
const {AiPhotoWardrobe}=loadTypeScript('components/crefans/studio/AiPhotoWardrobe.tsx',mocks);
const css=fs.readFileSync(path.join(__dirname,'../components/crefans/studio/ai-photo.module.css'),'utf8');
const targets=['4298dc','b516a6','752866','9e6184','6ee320','313a28','105dc8'];

function taggedNames(items){
 let tree;act(()=>{tree=create(React.createElement(AiPhotoWardrobe,{items,selectedPrompts:[],disabled:false,onPick:()=>{}}));});
 const cards=tree.root.findAll(node=>node.type==='button'&&node.props.className==='costumeCard');
 const tagged=cards.filter(card=>card.findAll(node=>node.props.className==='costumeLowSuccess').length>0);
 for(const card of tagged){const tag=card.find(node=>node.props.className==='costumeLowSuccess');assert.equal(tag.props.children,'성공률 낮음');assert.equal(card.props['aria-describedby'],tag.props.id);assert.equal(card.props.disabled,false);}
 const names=tagged.map(card=>card.props['aria-label']);
 act(()=>tree.unmount());
 return names;
}
// Every target is tagged and nothing else is.
function assertTagsOnlyOnTargets(items,expectedIds){
 const byId=new Map(items.map(item=>[item.id,item.name]));
 for(let start=0;start<items.length;start+=9){
  const page=items.slice(start,start+9);
  assert.deepEqual(taggedNames(page).sort(),page.filter(item=>expectedIds.includes(item.id)).map(item=>byId.get(item.id)).sort());
 }
}
// The desktop rule: inside min-width:768px, the editor body is a size container and costume images take a third of it.
function assertDesktopGridRule(source){
 const blocks=[...source.matchAll(/@media\s*\(([^)]*)\)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)].map(match=>({query:match[1].replace(/\s/g,''),body:match[2]}));
 const desktop=blocks.filter(block=>block.query==='min-width:768px'&&/\.wardrobeLayout \.costumeImage\{[^}]*height:clamp\(72px,calc\(\(100cqh - 40px\)\/3\),var\(--ai-photo-preset-height\)\)/.test(block.body));
 assert.equal(desktop.length,1,'desktop costume height rule');
 assert.match(desktop[0].body,/\.body:has\(\.wardrobeLayout\)\{container-type:size\}/);
 for(const block of blocks.filter(block=>/max-width/.test(block.query)))assert.doesNotMatch(block.body,/costumeImage|container-type/,'mobile blocks stay untouched');
 assert.match(source,/\.costumeLowSuccess\{[^}]*position:absolute[^}]*background:#c2410c[^}]*\}/);
}

test('low success list is the decided seven catalog costumes and the tag appears on exactly those cards',()=>{
 assert.deepEqual([...catalog.AI_PHOTO_LOW_SUCCESS_COSTUME_IDS].sort(),[...targets].sort());
 const all=catalog.aiPhotoCostumes;
 for(const id of targets)assert.ok(all.some(item=>item.id===id),`catalog has ${id}`);
 assert.deepEqual(all.filter(catalog.aiPhotoCostumeLowSuccess).map(item=>item.id).sort(),[...targets].sort());
 assertTagsOnlyOnTargets(all,targets);
});

test('control: the tag check fails if a non-target is expected or a target is left out',()=>{
 const all=catalog.aiPhotoCostumes,page=all.filter(item=>targets.includes(item.id)||item.id==='773106').slice(0,9);
 assert.ok(page.some(item=>item.id==='773106'));
 assert.throws(()=>assertTagsOnlyOnTargets(page,[...targets,'773106']),assert.AssertionError);
 assert.throws(()=>assertTagsOnlyOnTargets(page,targets.slice(1)),assert.AssertionError);
});

test('desktop media query sizes costume cards from the editor body; mobile rules unchanged',()=>{
 assertDesktopGridRule(css);
});

test('control: the CSS check fails without the desktop rule or when the rule moves to a mobile query',()=>{
 const rule=css.match(/@media\(min-width:768px\)\{\.body:has\(\.wardrobeLayout\)[^\n]*/)[0];
 assert.throws(()=>assertDesktopGridRule(css.replace(rule,'')),assert.AssertionError);
 assert.throws(()=>assertDesktopGridRule(css.replace(rule,rule.replace('min-width:768px','max-width:767px'))),assert.AssertionError);
});

// 2026-11-23 user decision: the server recounts the tag daily; the card uses its list when it answers, the built-in seven otherwise.
async function taggedIdsWith(ids){
 const api={requestLowSuccessCostumeIds:()=>Promise.resolve(ids)};
 const {AiPhotoWardrobe:Wardrobe}=loadTypeScript('components/crefans/studio/AiPhotoWardrobe.tsx',{...mocks,'@/lib/api/ai-costume-low-success':api});
 const page=catalog.aiPhotoCostumes.filter(item=>targets.includes(item.id)||item.id==='773106').slice(0,9),byName=new Map(page.map(item=>[item.name,item.id]));
 let tree;await act(async()=>{tree=create(React.createElement(Wardrobe,{items:page,selectedPrompts:[],disabled:false,onPick:()=>{}}));});
 const tagged=tree.root.findAll(node=>node.type==='button'&&node.props.className==='costumeCard'&&node.findAll(child=>child.props.className==='costumeLowSuccess').length>0).map(card=>byName.get(card.props['aria-label']));
 act(()=>tree.unmount());
 return {tagged:tagged.sort(),page:page.map(item=>item.id)};
}
test('server list replaces the built-in tags; no server list keeps the built-in seven',async()=>{
 const fromServer=await taggedIdsWith(['773106','b516a6']);
 assert.ok(fromServer.page.includes('773106'));
 assert.deepEqual(fromServer.tagged,['773106','b516a6']);
 const fallback=await taggedIdsWith(null);
 assert.deepEqual(fallback.tagged,fallback.page.filter(id=>targets.includes(id)).sort());
 assert.deepEqual(await taggedIdsWith([]).then(r=>r.tagged),[],'an empty server list means nothing is tagged');
});
test('API client: ids from a success envelope, null for errors, bad shapes and network failures; one request per load',async()=>{
 const original=globalThis.fetch;const calls=[];
 const load=response=>{globalThis.fetch=async(url,options)=>{calls.push([url,options]);if(response instanceof Error)throw response;return{json:async()=>response};};return loadTypeScript('lib/api/ai-costume-low-success.ts').requestLowSuccessCostumeIds;};
 try{
  const request=load({success:true,data:{ids:['773106'],computedAt:'2099-01-01T00:00:00.000Z'}});
  assert.deepEqual(await request(),['773106']);assert.deepEqual(await request(),['773106']);assert.equal(calls.length,1);
  assert.equal(calls[0][0],'/api/v1/ai-photo/low-success-costumes');assert.equal(calls[0][1].credentials,'omit');
  assert.equal(await load({success:true,data:{ids:null,computedAt:null}})(),null,'not computed yet');
  assert.equal(await load({success:false,data:null,errorCode:'INTERNAL_ERROR'})(),null);
  assert.equal(await load({success:true,data:{ids:['773106',7]}})(),null);
  assert.equal(await load(new TypeError('offline'))(),null);
 }finally{globalThis.fetch=original;}
});
