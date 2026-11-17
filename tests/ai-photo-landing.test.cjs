// 2026-11-16 user request: AI photo editing landing at /service/landing-ai-image-generation, built from the service catalog.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const page=loadTypeScript('components/service/AiPhotoLanding.tsx',{'./ai-photo-landing.module.css':{__esModule:true,default:styles},'@/components/crefans/studio/ai-photo.module.css':{__esModule:true,default:styles},'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'@/components/crefans/Brand':{Brand:()=>React.createElement('span',null,'crefans')}});
const text=node=>JSON.stringify(node.toJSON());
test('hero results come from real presets, the preset browser reuses the editor cards, and the removed sections stay gone',async()=>{
 const fs=require('fs'),sharp=require('sharp');
 // 2026-11-17 user request: hero results made with real presets (Modernia + 지뢰계 + 의자, 코스프레 베이스 + 거울샷, …).
 assert.deepEqual(page.landingLooks.map(item=>item.id),['modernia','gothic','maid','mage','idol']);
 const first=page.landingLooks[0];assert.equal(first.label,'모더니아 코스튬');assert.deepEqual(first.cards.map(card=>card.title),['모더니아 코스튬','지뢰계 메이크업','의자에 앉기']);
 assert.deepEqual(page.landingLooks[1].cards.slice(1).map(card=>card.title),['코스프레 베이스','거울샷']);
 for(const look of page.landingLooks){const meta=await sharp(fs.readFileSync('public'+look.image)).metadata();assert.equal(meta.width,720);assert.equal(meta.height,900);for(const card of look.cards)assert.ok(fs.existsSync('public'+card.image),card.image);}
 assert.ok(!page.landingKinds.some(item=>item.value==='body'));
 let tree;act(()=>{tree=create(React.createElement(page.default));});
 try{
  const links=tree.root.findAllByType('a').map(a=>a.props.href);assert.ok(links.filter(href=>href==='/service/try').length>=3);
  assert.match(text(tree),/가상 인물 · AI 생성 이미지/);assert.doesNotMatch(text(tree),/세 단계면 끝나요|이용 방법|하루 10회 무료/);
  assert.match(text(tree),/지뢰계 메이크업/);
  const radio=tree.root.findAll(node=>node.props.role==='radio').find(node=>node.findByType('span').props.children==='판타지 마법사');act(()=>radio.props.onClick());
  assert.ok(tree.root.findAll(node=>node.type==='img'&&/판타지 마법사 결과/.test(node.props.alt||'')).length===1,'choosing a look swaps the result image');
  assert.match(text(tree),/양팔 벌려 서기/);assert.doesNotMatch(text(tree),/지뢰계 메이크업/);
  // The browser opens on the wardrobe like the editor's cosplay mode, then other tabs page through the real catalog.
  assert.ok(tree.root.findAll(node=>node.type==='button'&&node.props['aria-label']==='리본 메이드').length===1);
  const tab=tree.root.findAll(node=>node.props.role==='tab').find(node=>node.findAllByType('span').some(span=>span.props.children==='포즈'));act(()=>tab.props.onClick());
  const card=()=>tree.root.find(node=>node.type==='button'&&node.props['aria-label']==='벽에 기대 쉬기');
  assert.equal(card().props['aria-pressed'],false);act(()=>card().props.onClick());assert.equal(card().props['aria-pressed'],true);act(()=>card().props.onClick());assert.equal(card().props['aria-pressed'],false);
  // 2026-11-17: enters at 100% (all original), eases to 20% (more of the result), hints appear after the intro and stay until the line moves.
  assert.ok(tree.root.findAll(node=>node.props.style?.clipPath==='inset(0 0 0 100%)').length===1,'enters from the far right');assert.doesNotMatch(text(tree),/밀거나 눌러서/);
  await act(async()=>{await new Promise(r=>setTimeout(r,1650));});
  assert.ok(tree.root.findAll(node=>node.props.style?.clipPath==='inset(0 0 0 20%)').length===1,'settles at 20%');
  assert.match(text(tree),/밀거나 눌러서 비교해 보세요/);assert.equal(tree.root.findAll(node=>node.props['data-side']==='left'&&node.type==='span'&&String(node.props.className).includes('compareHint')).length,1);
  const range=tree.root.find(node=>node.type==='input'&&node.props.type==='range');act(()=>range.props.onChange({target:{value:'60'}}));
  assert.ok(tree.root.findAll(node=>node.props.style?.clipPath==='inset(0 0 0 60%)').length===1,'the compare slider moves the split');
  assert.doesNotMatch(text(tree),/밀거나 눌러서 비교해 보세요/);assert.equal(tree.root.findAll(node=>String(node.props.className||'').includes('compareHint')).length,0,'hints disappear after the first move');
 }finally{act(()=>tree.unmount());}
});

test('landing is discoverable: sitemap lists it, llms.txt describes it, the noindex trial stays out of the sitemap, page has JSON-LD',()=>{
 const fs=require('fs');const sitemap=fs.readFileSync('app/sitemap.ts','utf8'),llms=fs.readFileSync('public/llms.txt','utf8'),pageSrc=fs.readFileSync('app/service/landing-ai-image-generation/page.tsx','utf8');
 assert.match(sitemap,/'\/service\/landing-ai-image-generation'/);assert.doesNotMatch(sitemap,/'\/service\/try'/);
 assert.match(llms,/https:\/\/crefans\.com\/service\/landing-ai-image-generation/);assert.match(llms,/## AI 사진 편집/);
 assert.match(pageSrc,/application\/ld\+json/);assert.match(pageSrc,/'@type':'WebApplication'/);assert.match(pageSrc,/siteName:SITE_NAME/);assert.match(pageSrc,/og-modernia-v1\.jpg',width:1200,height:630/);
 const robots=fs.readFileSync('app/robots.ts','utf8');assert.doesNotMatch(robots,/'\/service\/landing/);
});
