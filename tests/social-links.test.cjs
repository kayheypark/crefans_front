const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {socialHandle,socialUrl,socialLinkValid,SOCIAL_PREFIX}=loadTypeScript('lib/crefans/social-links.ts');
test('handle input is saved as the full canonical URL',()=>{
 assert.equal(socialUrl('instagram','crefans.official'),'https://instagram.com/crefans.official');
 assert.equal(socialUrl('youtube','@crefans'),'https://youtube.com/@crefans');
 assert.equal(socialUrl('facebook',' crefans/ '),'https://facebook.com/crefans');
 assert.equal(socialUrl('instagram',''),'');
 assert.equal(socialUrl('instagram','https://www.instagram.com/crefans/'),'https://instagram.com/crefans');
 assert.equal(socialUrl('youtube','https://m.youtube.com/@crefans'),'https://youtube.com/@crefans');
});
test('stored URLs show only the handle; other formats are kept as legacy full URLs',()=>{
 assert.equal(socialHandle('instagram','https://instagram.com/crefans.official'),'crefans.official');
 assert.equal(socialHandle('instagram','http://www.instagram.com/crefans/'),'crefans');
 assert.equal(socialHandle('youtube','https://youtube.com/channel/UC123'),null);
 assert.equal(socialUrl('youtube','https://youtube.com/channel/UC123'),'https://youtube.com/channel/UC123');
 assert.equal(socialHandle('facebook',undefined),'');
 for(const k of ['youtube','instagram','facebook'])assert.match(SOCIAL_PREFIX[k],/^https:\/\//);
});
test('validation rejects handles with spaces or other characters',()=>{
 assert.equal(socialLinkValid('instagram',socialUrl('instagram','crefans.official')),true);
 assert.equal(socialLinkValid('instagram',socialUrl('instagram','cre fans')),false);
 assert.equal(socialLinkValid('instagram',socialUrl('instagram','한글')),false);
 assert.equal(socialLinkValid('youtube','https://youtube.com/channel/UC123'),true);
 assert.equal(socialLinkValid('instagram',''),true);
});
