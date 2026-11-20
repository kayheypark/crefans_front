const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
// 2026-11-20 user request: the background tab offers '내 사진' — the user's own uploaded photo is sent as backgroundMediaId.
test('own background: tab button, upload tile, one background at a time, sent as backgroundMediaId',()=>{
 const dialog=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8'),model=fs.readFileSync('features/service/useStudioModel.ts','utf8');
 assert.match(dialog,/onClick=\{\(\)=>setOwnBackgroundTab\(true\)\}>내 사진<\/button>/);
 assert.match(dialog,/aria-label="배경으로 쓸 사진 고르기"/);
 assert.match(dialog,/if\(kind==='background'\)setOwnBackground\(null\);/,'a background preset replaces the own photo');
 assert.match(dialog,/const rest=selectedPresets\.filter\(preset=>preset\.kind!=='background'\)/,'the own photo replaces a background preset');
 assert.match(dialog,/\.\.\.\(ownBackgroundId\?\{backgroundMediaId:ownBackgroundId\}:\{\}\)/);
 assert.match(model,/if\(input\.backgroundMediaId\)body\.append\('backgroundMediaId',input\.backgroundMediaId\);/);
 assert.equal((fs.readFileSync('components/crefans/studio/ManagementPages.tsx','utf8').match(/onUploadBackground=\{model\.actions\.uploadContentMedia\}/g)||[]).length,2);
});
