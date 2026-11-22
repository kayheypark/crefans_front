const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
// 2026-11-19: every share press is reported (labels only) without blocking or failing the share.
function load(fetchImpl){const code=ts.transpileModule(fs.readFileSync('lib/api/share-report.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,module={exports:{}};new Function('module','exports','fetch',code)(module,module.exports,fetchImpl);return module.exports;}
test('reportShare posts only the labels, keepalive, and swallows network errors',async()=>{
 const calls=[];const {reportShare}=load(async(url,o)=>{calls.push({url,o});throw Error('offline');});
 assert.doesNotThrow(()=>reportShare({where:'post',method:'kakao',outcome:'done',postId:'abc-1'}));await new Promise(r=>setImmediate(r));
 assert.equal(calls[0].url,'/api/v1/telemetry/share');assert.deepEqual(JSON.parse(calls[0].o.body),{where:'post',method:'kakao',outcome:'done',postId:'abc-1'});assert.equal(calls[0].o.keepalive,true);
 const {reportShare:broken}=load(()=>{throw Error('sync');});assert.doesNotThrow(()=>broken({where:'ai_result',method:'native',outcome:'done'}));
});
test('both share places report done, cancelled and failed; the AI editor gets it from the page model (no direct API import)',()=>{
 const ai=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8'),post=fs.readFileSync('features/post-share/usePostShare.ts','utf8'),pages=fs.readFileSync('components/crefans/studio/ManagementPages.tsx','utf8');
 assert.doesNotMatch(ai,/lib\/api|\bfetch\s*\(/,'display component stays off API clients (AGENTS.md, crefans-contract)');
 assert.match(ai,/method='native';await navigator\.share\([^)]*\);onShareReport\?\.\(\{where:'ai_result',method,outcome:'done'\}\)/);
 assert.match(ai,/revokeObjectURL\(url\),60000\);onShareReport\?\.\(\{where:'ai_result',method,outcome:'done'\}\)/,'download fallback is reported too');
 assert.match(ai,/onShareReport\?\.\(\{where:'ai_result',method,outcome:aborted\?'cancelled':'failed'\}\)/);
 assert.equal((pages.match(/onShareReport=\{model\.actions\.reportShare\} onTrack=\{model\.actions\.trackAiPhoto\}/g)||[]).length,2,'member and guest editors both wire it');
 assert.match(fs.readFileSync('features/service/useStudioModel.ts','utf8'),/management\.actions\.reportShare=reportShare;management\.actions\.trackAiPhoto=\(step,props\)=>captureEvent\(step,\{actor:'member',mode:props\.mode\}\)/);
 assert.match(fs.readFileSync('features/service/useGuestTrialModel.ts','utf8'),/captureEvent\(step,\{actor:'guest',mode:props\.mode\}\)/);
 assert.match(fs.readFileSync('components/service/GuestTrialPage.tsx','utf8'),/reportShare:guest\.share,trackAiPhoto:guest\.track/);
 assert.match(post,/reportShare\(\{where:'post',method:kind,outcome:'done',postId\}\)/);assert.match(post,/outcome:kind==='more'&&aborted\?'cancelled':'failed'/);
});
// 2026-11-19 이탈 분석: 생성 전후 퍼널 단계(편집창 열림·사진 결정·결과 공유 완료)를 PostHog로 남긴다(actor·mode만).
test('AI editor funnel steps: opened on each open, decided before adding, shared only on success',()=>{
 const ai=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8');
 assert.match(ai,/useEffect\(\(\)=>\{if\(open\)onTrack\?\.\('ai_editor_opened'/);
 assert.match(ai,/onTrack\?\.\('photo_decided',\{mode:[^}]*\}\);onAdd\(picked/);
 assert.equal((ai.match(/onTrack\?\.\('ai_result_shared'/g)||[]).length,2,'native share and download, never on cancel/fail');
 assert.match(fs.readFileSync('lib/analytics/posthog.ts','utf8'),/'ai_editor_opened'.*'photo_decided'\|'ai_result_share_clicked'\|'ai_result_shared'\|'costume_shop_clicked'/);
 // 2026-11-21: the share button press and the Coupang link click are captured too (PostHog funnel).
 assert.match(ai,/onTrack\?\.\('ai_result_share_clicked'/);assert.match(ai,/data-testid="costume-shop-link" onClick=\{\(\)=>\{onTrack\?\.\('costume_shop_clicked',\{mode:[^}]*kind:shopLink\.category\}\);/);
});

// 2026-11-22 user decision: the trial's Coupang costume link gets the share bubble component and pays 3 credits on click, once a day.
test('trial Coupang link: bubble only while the reward is open, click claims it and shows the reward dialog',()=>{
 const ai=fs.readFileSync('components/crefans/studio/AiPhotoDialog.tsx','utf8'),page=fs.readFileSync('components/service/GuestTrialPage.tsx','utf8'),model=fs.readFileSync('features/service/useGuestTrialModel.ts','utf8');
 assert.match(ai,/\{shopReward&&<div className=\{s\.shopRewardBubble\}><span className=\{s\.resultShareBubble\}>혹시 진짜로 입어볼 생각도 있어요\? \(3장\)<\/span><\/div>\}/);
 assert.match(ai,/if\(shopReward\)void shopReward\.claim\(\)\.then\(paid=>\{if\(paid\)setShopRewardOpen\(true\);\}\);/);
 assert.match(page,/shopReward:guest\.session\.shopRewardClaimed===false\?\{claim:guest\.shopClick\}:undefined/);
 assert.match(model,/const shopClick=async\(\)=>\{const r=await api<\{granted:boolean\}>\('\/guest\/ai-photo\/shop-click',\{\}\);if\(r\.success\)await refresh\(\);return r\.success&&r\.data\.granted;\};/);
 assert.equal((fs.readFileSync('components/crefans/studio/ManagementPages.tsx','utf8').match(/<AiPhotoDialog shopReward=\{guest\?\.shopReward\}/g)||[]).length,2);
});
