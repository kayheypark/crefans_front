const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
// 2026-11-19: every share press is reported (labels only) without blocking or failing the share.
function load(fetchImpl){const code=ts.transpileModule(fs.readFileSync('lib/api/share-report.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,module={exports:{}};new Function('module','exports','fetch',code)(module,module.exports,fetchImpl);return module.exports;}
test('reportShare posts only the labels, keepalive, and swallows network errors',async()=>{
 const calls=[];const {reportShare}=load(async(url,o)=>{calls.push({url,o});throw Error('offline');});
 assert.doesNotThrow(()=>reportShare({where:'post',method:'kakao',outcome:'done',postId:'abc-1'}));await new Promise(r=>setImmediate(r));
 assert.equal(calls[0].url,'/api/v1/telemetry/share');assert.deepEqual(JSON.parse(calls[0].o.body),{where:'post',method:'kakao',outcome:'done',postId:'abc-1'});assert.equal(calls[0].o.keepalive,true);
 const {reportShare:broken}=load(()=>{throw Error('sync');});assert.doesNotThrow(()=>broken({where:'ai_result',method:'native',outcome:'done'}));
});
test('both share places report done, cancelled and failed',()=>{
 const ai=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8'),post=fs.readFileSync('features/post-share/usePostShare.ts','utf8');
 assert.match(ai,/method='native';await navigator\.share\([^)]*\);reportShare\(\{where:'ai_result',method,outcome:'done'\}\)/);
 assert.match(ai,/revokeObjectURL\(url\),60000\);reportShare\(\{where:'ai_result',method,outcome:'done'\}\)/,'download fallback is reported too');
 assert.match(ai,/reportShare\(\{where:'ai_result',method,outcome:aborted\?'cancelled':'failed'\}\)/);
 assert.match(post,/reportShare\(\{where:'post',method:kind,outcome:'done',postId\}\)/);assert.match(post,/outcome:kind==='more'&&aborted\?'cancelled':'failed'/);
});
