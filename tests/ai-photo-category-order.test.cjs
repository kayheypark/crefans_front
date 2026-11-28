const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {loadTypeScript}=require('./load-typescript.cjs');
const expected=['outfit','makeup','contacts','skin','expression','pose','body','camera','lens','background'];
test('top-level category order stays fixed regardless of which kind has NEW presets',()=>{
 for(const fresh of ['pose','background','none']){
  const rules=loadTypeScript('lib/crefans/ai-photo.ts',{'./ai-photo-new':{aiPhotoGroupIsNew:kind=>kind===fresh}});
  assert.deepEqual(rules.aiPhotoKinds.map(item=>item.value),expected);
  assert.equal(rules.aiPhotoKindIsNew('pose'),fresh==='pose');
 }
 const landing=fs.readFileSync('components/service/AiPhotoLanding.tsx','utf8');
 const editor=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8');
 assert.match(landing,/\{landingKinds\.map\(item=>/);
 assert.match(editor,/const editorKinds=AI_PHOTO_BODY_OPEN\?aiPhotoKinds:aiPhotoKinds\.filter/);
});
