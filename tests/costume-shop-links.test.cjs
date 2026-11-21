const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const links=loadTypeScript('lib/crefans/costume-shop-links.ts');
const {aiPhotoCostumeCategories,aiPhotoCostumes}=loadTypeScript('lib/crefans/ai-photo-costumes.ts');
const {aiPhotoPresetText}=loadTypeScript('lib/crefans/ai-photo.ts');

test('every catalog costume uses its thumbnail and an ordinary search or a registered general partner link',()=>{
 for(const costume of aiPhotoCostumes){
  const link=links.costumeShopLink([aiPhotoPresetText(costume.prompt)]);
  assert.equal(link.name,costume.name,costume.id);
  assert.equal(link.image,costume.image,costume.id);
  if(costume.id==='80974e'){
   assert.equal(link.affiliate,true);
   assert.equal(new URL(link.url).hostname,'link.coupang.com');
  }else{
   assert.equal(link.affiliate,false);
   const url=new URL(link.url);
   assert.equal(url.origin,'https://www.coupang.com');
   assert.equal(url.pathname,'/np/search');
   const label=aiPhotoCostumeCategories.find(category=>category.value===costume.category).label;
   assert.equal(url.searchParams.get('q'),[costume.category==='general'?null:label,costume.name,'코스프레 의상'].filter(Boolean).join(' '));
  }
 }
 assert.equal(links.costumeShopLink([]),null);
 assert.equal(links.costumeShopLink(['직접 입력한 의상']),null);
});

test('franchise costumes do not use a Partners link even if an entry is registered',()=>{
 const rapi=aiPhotoCostumes.find(c=>c.id==='313a28');
 links.COSTUME_SHOP_LINKS[rapi.id]='https://link.coupang.com/a/franchise';
 try{
  const link=links.costumeShopLink([aiPhotoPresetText(rapi.prompt)]);
  assert.equal(link.affiliate,false);
  assert.equal(new URL(link.url).hostname,'www.coupang.com');
  assert.equal(links.COSTUME_SHOP_NOTICE,'이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.');
 }finally{delete links.COSTUME_SHOP_LINKS[rapi.id];}
});
