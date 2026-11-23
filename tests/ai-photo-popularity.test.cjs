const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {aiPhotoSortByUsage,aiPhotoPresetUsage}=loadTypeScript('lib/crefans/ai-photo-popularity.ts');
const {aiPhotoCostumes,aiPhotoCostumeCategories}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
const {aiPhotoBackgrounds}=loadTypeScript('lib/crefans/ai-photo-backgrounds.ts');
const P=loadTypeScript('lib/crefans/ai-photo-presets.ts');
// 2026-11-23: each preset tab / costume franchise lists the most-used presets first (ai_preset_usage_daily snapshot).
const tab=(category)=>aiPhotoSortByUsage('outfit',aiPhotoCostumes.filter(c=>c.category===category),c=>c.id);
const titles=(kind,...args)=>P.aiPhotoPresetPage(kind,0,'original','',...args).examples.filter(e=>e!==P.AI_PHOTO_KEEP_ORIGINAL).map(e=>P.aiPhotoPresetTitle(kind,e));

test('costume tabs open with the most-used costumes (production data)',()=>{
 assert.deepEqual(tab('nikke').slice(0,2).map(c=>c.name),['누아르 바니','모더니아 코스튬']);
 assert.equal(tab('general')[0].name,'아이돌 무대복');
 assert.equal(tab('overwatch')[0].name,'D.Va 슈트');
 assert.deepEqual(aiPhotoCostumeCategories.map(c=>c.value).filter(v=>!aiPhotoCostumes.some(c=>c.category===v)),[],'every tab still has costumes');
});

test('preset tabs open with the most-used presets (production data)',()=>{
 assert.equal(titles('pose','sitting')[0],'다리 꼬아 앉기');
 assert.deepEqual(titles('makeup').slice(0,3),['코스프레 베이스','인형 메이크업','지뢰계 메이크업']);
 assert.deepEqual(titles('expression').slice(0,2),['무표정','잔잔한 미소']);
 assert.equal(titles('camera')[0],'하이 앵글');
 assert.equal(titles('lens')[0],'거울샷');
 assert.equal(titles('background',undefined,'indoor')[0],'촬영스튜디오(흰배경)');
 // '원본 유지' stays the first card of its tabs.
 assert.equal(P.aiPhotoPresetPage('pose',0,'original','','sitting').examples[0],P.AI_PHOTO_KEEP_ORIGINAL);
});

test('unused and tied presets keep the catalog order; filters, search and page totals are unchanged',()=>{
 const jujutsu=aiPhotoCostumes.filter(c=>c.category==='jujutsu');
 assert.ok(jujutsu.every(c=>!aiPhotoPresetUsage.outfit[c.id]),'jujutsu has no usage in the snapshot');
 assert.deepEqual(tab('jujutsu'),jujutsu);
 const nikke=aiPhotoCostumes.filter(c=>c.category==='nikke'),sorted=tab('nikke');
 assert.deepEqual(sorted.filter(c=>!aiPhotoPresetUsage.outfit[c.id]),nikke.filter(c=>!aiPhotoPresetUsage.outfit[c.id]));
 assert.deepEqual([...sorted].sort((a,b)=>a.id.localeCompare(b.id)),[...nikke].sort((a,b)=>a.id.localeCompare(b.id)),'same items');
 for(let i=1;i<sorted.length;i++)assert.ok((aiPhotoPresetUsage.outfit[sorted[i-1].id]||0)>=(aiPhotoPresetUsage.outfit[sorted[i].id]||0));
 // ties: 눈웃음·윙크·도도한 시선 (6 each) stay in catalog order.
 const expression=titles('expression');
 assert.ok(expression.indexOf('눈웃음')<expression.indexOf('윙크')&&expression.indexOf('윙크')<expression.indexOf('도도한 시선'));
 for(const posture of ['sitting','standing'])assert.ok(P.aiPhotoPresetPage('pose',0,'original','',posture).examples.slice(1).every(e=>P.aiPhotoPosePosture(e)===posture));
 assert.equal(P.aiPhotoPresetPage('pose',0).total,P.aiPhotoPresets.pose.length);
 assert.deepEqual(P.aiPhotoPresetPage('pose',0,'original','다리 꼬아').examples.map(e=>P.aiPhotoPresetTitle('pose',e)),['다리 꼬아 앉기']);
 // a selected preset still opens on the page that lists it.
 const loc=P.aiPhotoPresetLocation('pose',P.aiPhotoPresets.pose[0]);
 assert.ok(P.aiPhotoPresetPage('pose',loc.page,'original','',loc.posture).examples.includes(loc.example));
});

test('every usage key maps to a current preset, and the screens sort through the one helper',()=>{
 for(const [kind,keys] of Object.entries(aiPhotoPresetUsage))for(const key of Object.keys(keys)){
  const ok=kind==='outfit'?aiPhotoCostumes.some(c=>c.id===key):kind==='background'?aiPhotoBackgrounds.some(b=>b.id===key)||P.aiPhotoPresetTitles.background.includes(key):P.aiPhotoPresetTitles[kind].includes(key);
  assert.ok(ok,`${kind} ${key}`);
 }
 for(const file of ['components/crefans/studio/AiPhotoDialog.tsx','components/service/AiPhotoLanding.tsx'])assert.match(fs.readFileSync(file,'utf8'),/const costumes=aiPhotoSortByUsage\('outfit',aiPhotoCostumes\.filter\(/,file);
});

test('control: a list with no usage is left as is, and a popular item moves ahead',()=>{
 assert.deepEqual(aiPhotoSortByUsage('pose',['x','y','z'],v=>v),['x','y','z']);
 assert.deepEqual(aiPhotoSortByUsage('pose',['x','의자에 앉기','다리 꼬아 앉기'],v=>v),['다리 꼬아 앉기','의자에 앉기','x']);
 assert.notDeepEqual(tab('nikke'),aiPhotoCostumes.filter(c=>c.category==='nikke'),'nikke order did change');
});
