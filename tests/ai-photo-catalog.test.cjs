const fs=require('node:fs'),test=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {aiPhotoCatalog}=loadTypeScript('lib/crefans/ai-photo-catalog.ts');
const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
// 2026-11-21: the console preset screen shows every preset with its image, label, prompt and (costumes) Coupang link.
test('catalog lists every costume with image, prompt and Partners link, and every preset kind',()=>{
 const {groups}=aiPhotoCatalog(),byKey=Object.fromEntries(groups.map(g=>[g.key,g]));
 assert.deepEqual(groups.map(g=>g.key).sort(),['costume','outfit','pose','makeup','contacts','skin','expression','camera','lens','background'].sort());
 assert.deepEqual(byKey.skin.items.map(item=>item.title),['물광','오일','흰색페인트','검정페인트','은색페인트']);
 assert.equal(byKey.costume.items.length,aiPhotoCostumes.length);
 for(const g of groups)for(const it of g.items){assert.ok(Number.isFinite(Date.parse(it.addedAt)),`${g.key} ${it.id} addedAt`);assert.ok(it.title,`${g.key} ${it.id} title`);assert.ok(it.prompt,`${g.key} ${it.id} prompt`);assert.match(it.image,/^\/brand\/ai-photo\/.+\.(webp|png)$/,`${g.key} ${it.id}`);assert.ok(fs.existsSync('public'+it.image),`missing ${it.image}`);
  if(g.categories.length)assert.ok(g.categories.some(c=>c.value===it.category),`${g.key} ${it.id} category ${it.category}`);}
 assert.ok(byKey.costume.items.every(it=>it.id==='c09d74'?it.shopUrl===null:/^https:\/\/link\.coupang\.com\/a\/\w{10}$/.test(it.shopUrl)));
 assert.equal(new Set(groups.flatMap(g=>g.items.map(it=>g.key+it.id))).size,groups.reduce((n,g)=>n+g.items.length,0),'ids unique');
});
