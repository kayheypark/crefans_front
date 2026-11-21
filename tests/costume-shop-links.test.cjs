const test=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const links=loadTypeScript('lib/crefans/costume-shop-links.ts'),{aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts'),{aiPhotoPresetText}=loadTypeScript('lib/crefans/ai-photo.ts');
// 2026-11-21: Coupang link only for general costumes that have a link; franchise costumes never get one.
test('shop link only for linked general costumes, with a plain commission notice',()=>{
 const sailor=aiPhotoCostumes.find(c=>c.id==='80974e'),rapi=aiPhotoCostumes.find(c=>c.id==='313a28');
 const saved=links.COSTUME_SHOP_LINKS['80974e'];assert.equal(saved,'https://link.coupang.com/a/iQzsLQwK6u');links.COSTUME_SHOP_LINKS['80974e']='https://link.coupang.com/a/test';links.COSTUME_SHOP_LINKS['313a28']='https://link.coupang.com/a/franchise';
 try{
  assert.deepEqual(links.costumeShopLink([aiPhotoPresetText(sailor.prompt)]),{name:'세일러 코스튬',url:'https://link.coupang.com/a/test'});
  assert.equal(links.costumeShopLink([aiPhotoPresetText(rapi.prompt)]),null,'franchise costume');
  assert.equal(links.costumeShopLink([]),null);
  assert.equal(links.COSTUME_SHOP_NOTICE,'이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.');assert.doesNotMatch(links.COSTUME_SHOP_NOTICE,/받을 수 있/);
 }finally{links.COSTUME_SHOP_LINKS['80974e']=saved;delete links.COSTUME_SHOP_LINKS['313a28'];}
});
