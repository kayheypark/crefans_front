// 2026-11-16 user request: AI photo editing landing at /service/landing-ai-image-generation, built from the service catalog.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const handedOff=[];
const page=loadTypeScript('components/service/AiPhotoLanding.tsx',{'@/lib/crefans/preset-access':{guestPresetAccess:async()=>true},'@/components/crefans/SignupOfferDialog':{SignupOfferDialog:()=>null},'./ai-photo-landing.module.css':{__esModule:true,default:styles},'@/components/crefans/studio/ai-photo.module.css':{__esModule:true,default:styles},'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'@/components/crefans/Brand':{Brand:()=>React.createElement('span',null,'crefans')},'@/components/ui/Primitives':{Dialog:({open,title,onClose,children})=>open?React.createElement('section',{'data-dialog':title,onClose},children):null},'@/components/ui/DialogActions':{DialogActions:({children})=>React.createElement('div',null,children)},'@/features/service/useFunnelStep':{useFunnelStep:()=>{}},'@/lib/crefans/ai-photo-handoff':{readAiPhotoHandoff:()=>[],saveAiPhotoHandoff:presets=>{handedOff.push(presets);}}});
const text=node=>JSON.stringify(node.toJSON());
test('hero results come from real presets, the preset browser reuses the editor cards, and the removed sections stay gone',async()=>{
 const fs=require('fs'),sharp=require('sharp');
 // 2026-11-17 user request: hero results made with real presets (Modernia + 지뢰계 + 의자, 코스프레 베이스 + 거울샷, …).
 assert.deepEqual(page.landingLooks.map(item=>item.id),['modernia','gothic','maid','idol','mage']);
 const first=page.landingLooks[0];assert.equal(first.label,'모더니아 코스튬');assert.deepEqual(first.cards.map(card=>card.title),['모더니아 코스튬','지뢰계 메이크업','의자에 앉기']);
 assert.deepEqual(page.landingLooks[1].cards.slice(1).map(card=>card.title),['코스프레 베이스','거울샷']);
 for(const look of page.landingLooks){const meta=await sharp(fs.readFileSync('public'+look.image)).metadata();assert.equal(meta.width,720);assert.equal(meta.height,900);const thumb=await sharp(fs.readFileSync('public'+look.thumb)).metadata();assert.deepEqual([thumb.width,thumb.height],[168,210]);for(const card of look.cards)assert.ok(fs.existsSync('public'+card.image),card.image);}
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
  const card=()=>tree.root.find(node=>node.type==='button'&&node.props['aria-label']==='소품 어깨에 메기');
  assert.equal(card().props['aria-pressed'],false);await act(async()=>card().props.onClick());assert.equal(card().props['aria-pressed'],true);await act(async()=>card().props.onClick());assert.equal(card().props['aria-pressed'],false);
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

test('Mitsuri Haori is searchable and selectable on the AI photo landing page',async()=>{
 let tree;
 await act(async()=>{tree=create(React.createElement(page.default));});
 try{
  const search=tree.root.findByProps({'aria-label':'프리셋 검색'});
  await act(async()=>search.props.onChange({target:{value:'미츠리 하오리'}}));
  const card=()=>tree.root.find(n=>n.type==='button'&&n.props['aria-label']==='미츠리 하오리');
  assert.equal(card().props['aria-pressed'],false);
  await act(async()=>card().props.onClick());assert.equal(card().props['aria-pressed'],true);
 }finally{await act(async()=>tree.unmount());}
});

test('landing is discoverable: sitemap lists it, llms.txt describes it, the noindex trial stays out of the sitemap, page has JSON-LD',()=>{
 const fs=require('fs');const sitemap=fs.readFileSync('app/sitemap.ts','utf8'),llms=fs.readFileSync('public/llms.txt','utf8'),pageSrc=fs.readFileSync('app/service/landing-ai-image-generation/page.tsx','utf8');
 assert.match(sitemap,/'\/service\/landing-ai-image-generation'/);assert.doesNotMatch(sitemap,/'\/service\/try'/);
 assert.match(llms,/https:\/\/crefans\.com\/service\/landing-ai-image-generation/);assert.match(llms,/## AI 사진 편집/);
 assert.match(pageSrc,/application\/ld\+json/);assert.match(pageSrc,/'@type':'WebApplication'/);assert.match(pageSrc,/siteName:SITE_NAME/);assert.match(pageSrc,/og-idol-mirror-v1\.jpg',width:1200,height:630/);
 const robots=fs.readFileSync('app/robots.ts','utf8');assert.doesNotMatch(robots,/'\/service\/landing/);
});
// 2026-11-19 user request: exact speech-bubble wording over the costume select on the landing and in the editor; idol is the 4th look.
test('costume select bubble says exactly "니케, 체인소맨, 원신, 블루아카이브, 귀칼, 주술회전, 오버워치" on the landing and in the editor',()=>{
 const fs=require('fs');assert.match(fs.readFileSync('lib/crefans/ai-photo-costumes.ts','utf8'),/export const AI_PHOTO_COSTUME_HINT='니케, 체인소맨, 원신, 블루아카이브, 귀칼, 주술회전, 오버워치';/);
 for(const f of ['components/service/AiPhotoLanding.tsx','components/crefans/studio/AiPhotoDialog.tsx'])assert.match(fs.readFileSync(f,'utf8'),/<p className=\{[es]\.costumeHint\}>\{AI_PHOTO_COSTUME_HINT\}<\/p>\s*<div className=\{[es]\.costumeCategoryBar\}>/,f);
 const css=fs.readFileSync('components/crefans/studio/ai-photo.module.css','utf8');assert.match(css,/\.costumeHint\{[^}]*animation:/);assert.match(css,/prefers-reduced-motion:reduce\)\{\.costumeHint\{animation:none\}/);
});

// 2026-11-19 user request: picking any preset on the landing asks right away whether to try it.
test('picking a preset opens the try-it dialog; unpicking does not; the dialog link carries the picks',async()=>{
 let tree;await act(async()=>{tree=create(React.createElement(page.default));});
 try{
  const dialog=()=>tree.root.findAll(n=>n.type==='section'&&n.props['data-dialog']);
  assert.equal(dialog().length,0);
  const costume=()=>tree.root.find(n=>n.type==='button'&&n.props['aria-label']==='모더니아 코스튬');
  await act(async()=>costume().props.onClick());
  assert.equal(dialog().length,1);assert.equal(dialog()[0].props['data-dialog'],'이 코스튬으로 만들어볼까요?');assert.equal(dialog()[0].findByType('strong').props.children,'모더니아 코스튬');
  const more=dialog()[0].findAll(n=>n.type==='button').find(n=>n.props.children==='더 골라볼게요');await act(async()=>more.props.onClick());
  assert.equal(dialog().length,0,'closes');
  await act(async()=>costume().props.onClick());assert.equal(costume().props['aria-pressed'],false);assert.equal(dialog().length,0,'unpicking does not ask');
  const tab=tree.root.findAll(n=>n.props.role==='tab').find(n=>n.findAllByType('span').some(span=>span.props.children==='포즈'));await act(async()=>tab.props.onClick());
  const pose=tree.root.find(n=>n.type==='button'&&n.props['aria-label']==='소품 어깨에 메기');await act(async()=>pose.props.onClick());
  assert.equal(dialog()[0].props['data-dialog'],'이 프리셋으로 만들어볼까요?');
  const go=dialog()[0].findAll(n=>n.type==='a').find(n=>n.props.children==='0원으로 만들기');assert.equal(go.props.href,'/service/try');
  handedOff.length=0;go.props.onClick();assert.match(JSON.stringify(handedOff),/"kind":"pose"/,'the picked pose is handed to the trial editor');
 }finally{await act(async()=>tree.unmount());}
});
// 2026-11-19 user request: each preset under the hero result opens a detail dialog.
test('hero preset cards open a detail dialog with the catalog details and a try-this-combination link',async()=>{
 let tree;await act(async()=>{tree=create(React.createElement(page.default));});
 try{
  const dialog=()=>tree.root.findAll(n=>n.type==='section'&&n.props['data-dialog']);
  const card=tree.root.find(n=>n.type==='button'&&n.props['aria-label']==='모더니아 코스튬 자세히 보기');await act(async()=>card.props.onClick());
  assert.equal(dialog().length,1);assert.equal(dialog()[0].props['data-dialog'],'모더니아 코스튬');
  const lines=dialog()[0].findAllByType('li').map(n=>n.props.children);assert.ok(lines.some(line=>/^가발 /.test(line))&&lines.some(line=>/^신발 /.test(line)),'costume parts are listed');
  handedOff.length=0;dialog()[0].findAll(n=>n.type==='a').find(n=>n.props.children==='이 조합으로 0원 체험').props.onClick();
  assert.deepEqual(handedOff[0].map(item=>item.kind),['outfit','makeup','pose'],'the whole look is handed to the trial editor');
  await act(async()=>dialog()[0].findAll(n=>n.type==='button').find(n=>n.props.children==='닫기').props.onClick());assert.equal(dialog().length,0);
  const pose=tree.root.find(n=>n.type==='button'&&n.props['aria-label']==='의자에 앉기 자세히 보기');await act(async()=>pose.props.onClick());
  assert.equal(dialog()[0].props['data-dialog'],'의자에 앉기');assert.equal(dialog()[0].findAllByType('li').length,1,'other presets show their request text');
 }finally{await act(async()=>tree.unmount());}
});

// 2026-11-20 user request: the landing targets the search phrase '무료 AI 코스프레 생성'.
test("the landing targets '무료 AI 코스프레 생성' in title, description, keywords, H1, structured data, sitemap and llms.txt",async()=>{
 const fs=require('fs'),src=fs.readFileSync('app/service/landing-ai-image-generation/page.tsx','utf8'),phrase='무료 AI 코스프레 생성';
 assert.match(src,/const TITLE='무료 AI 코스프레 생성 · /);assert.match(src,/const DESCRIPTION='무료 AI 코스프레 생성: /);assert.match(src,/keywords:\['무료 AI 코스프레 생성',/);
 assert.match(src,/title:'무료 AI 코스프레 생성 \| 크레팬스'/);assert.match(src,/name:'크레팬스 무료 AI 코스프레 생성'/);
 let tree;await act(async()=>{tree=create(React.createElement(page.default));});
 try{const h1=tree.root.findByType('h1');assert.equal(h1.findByType('span').props.children,phrase);}finally{await act(async()=>tree.unmount());}
 assert.match(fs.readFileSync('app/sitemap.ts','utf8'),/landing-ai-image-generation'\),changeFrequency:'weekly',priority:0\.9,lastModified:new Date\('2026-11-20/);
 assert.ok(fs.readFileSync('public/llms.txt','utf8').includes(phrase));
});

test('landing contact lens and makeup categories show the shared NEW badges',()=>{
 let tree;act(()=>{tree=create(React.createElement(page.default));});
 try{
  const newTabs=tree.root.findAll(node=>node.type==='button'&&node.props.role==='tab'&&node.findAllByType('span').some(span=>span.props.children==='NEW'));
  assert.deepEqual(newTabs.map(tab=>tab.findAllByType('span').at(-1).props.children).sort(),['렌즈','메이크업']);
 }finally{act(()=>tree.unmount());}
});
