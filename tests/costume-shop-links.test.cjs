const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const links=loadTypeScript('lib/crefans/costume-shop-links.ts');
const {aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
const {aiPhotoPresetText}=loadTypeScript('lib/crefans/ai-photo.ts');

// 2026-11-21 user decision: every catalog costume, franchise ones included, opens its own Coupang Partners link.
test('every catalog costume opens its own Partners link with the commission notice',()=>{
 const seen=new Set();
 for(const costume of aiPhotoCostumes){
  const link=links.costumeShopLink([aiPhotoPresetText(costume.prompt)]);
  assert.equal(link.name,costume.name,costume.id);
  assert.equal(link.image,costume.image,costume.id);
  assert.equal(link.affiliate,true,costume.id);
  assert.match(link.url,/^https:\/\/link\.coupang\.com\/a\/\w{10}$/,costume.id);
  assert.ok(!seen.has(link.url),`duplicate link ${costume.id}`);seen.add(link.url);
 }
 assert.equal(Object.keys(links.COSTUME_SHOP_LINKS).length,aiPhotoCostumes.length,'no link for a costume that is not in the catalog');
 assert.equal(links.costumeShopLink([]),null);
 assert.equal(links.costumeShopLink(['직접 입력한 의상']),null);
 assert.equal(links.COSTUME_SHOP_NOTICE,'이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.');
});

test('a costume without a link falls back to a Coupang search with spaces as %20',()=>{
 const rapi=aiPhotoCostumes.find(c=>c.id==='313a28'),saved=links.COSTUME_SHOP_LINKS[rapi.id];
 delete links.COSTUME_SHOP_LINKS[rapi.id];
 try{
  const link=links.costumeShopLink([aiPhotoPresetText(rapi.prompt)]);
  assert.equal(link.affiliate,false);
  assert.equal(link.url,'https://www.coupang.com/np/search?q='+['니케','라피 전술복','코스프레 의상'].join(' ').split(' ').map(encodeURIComponent).join('%20'));
  assert.ok(!link.url.includes('+'));
 }finally{links.COSTUME_SHOP_LINKS[rapi.id]=saved;}
});
