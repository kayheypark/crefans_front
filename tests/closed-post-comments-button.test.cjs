// 2026-11-24 user request: on AI trial posts (comments closed) the comment button was greyed out although an official comment was
// there. Every viewer must be able to open the list; only the input stays closed.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('the comment button opens the list even when comments are closed',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../components/crefans/SocialPages.tsx'),'utf8');
 assert.doesNotMatch(src,/onComments=\{inline&&post\.commentsEnabled!==false/,'no longer gated on commentsEnabled');
 assert.match(src,/onComments=\{inline\?\(\)=>setCommentsOpen\(open=>!open\):undefined\}/);
});
