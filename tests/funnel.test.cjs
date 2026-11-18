const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
// 2026-11-18: funnel view steps are sent once per tab session, carry only the step name, and fail silently.
function load(storage,page={}){
 const code=ts.transpileModule(fs.readFileSync('lib/api/funnel.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,calls=[],module={exports:{}};
 new Function('module','exports','fetch','window','document',code)(module,module.exports,async(url,options)=>{calls.push({url,options});throw Error('offline');},{sessionStorage:storage,location:{hostname:'crefans.com',search:page.search||''}},{referrer:page.referrer||''});
 return{...module.exports,calls};
}
const memory=()=>{const map=new Map();return{getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))};};
test('each step is posted once per tab session with only the step name',async()=>{
 const {reportFunnelStep,calls}=load(memory());
 reportFunnelStep('landing_view');reportFunnelStep('landing_view');reportFunnelStep('signup_view');await new Promise(r=>setImmediate(r));
 assert.equal(calls.length,2);assert.equal(calls[0].url,'/api/v1/telemetry/funnel');assert.deepEqual(JSON.parse(calls[0].options.body),{step:'landing_view'});assert.deepEqual(JSON.parse(calls[1].options.body),{step:'signup_view'});
 assert.equal(calls[0].options.credentials,'same-origin');
});
test('blocked storage still sends (approximate count) and never throws',async()=>{
 const {reportFunnelStep,calls}=load({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});
 assert.doesNotThrow(()=>{reportFunnelStep('guest_consent_view');reportFunnelStep('guest_consent_view');});await new Promise(r=>setImmediate(r));assert.equal(calls.length,2);
});
test('the landing, consent screen and live signup form report their step',()=>{
 assert.match(fs.readFileSync('components/service/AiPhotoLanding.tsx','utf8'),/useFunnelStep\('landing_view'\)/);
 assert.match(fs.readFileSync('components/service/GuestTrialPage.tsx','utf8'),/useFunnelStep\('guest_consent_view',!model\.signedIn&&!done&&guest\.session\?\.active===false\)/);
 assert.match(fs.readFileSync('components/service/ServiceRouter.tsx','utf8'),/useFunnelStep\('signup_view',!loading&&!model\.signedIn&&screen==='signup'&&id!=='complete'\)/);
});
// 2026-11-18 랜딩 방문 알림: only the external referrer host and utm_source go with landing_view; never the full URL.
test('landing_view carries only an external referrer host and a valid utm_source',async()=>{
 const first=load(memory(),{referrer:'https://m.search.naver.com/search.naver?query=secret',search:'?utm_source=insta_bio&x=1'});first.reportFunnelStep('landing_view');first.reportFunnelStep('signup_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(first.calls[0].options.body),{step:'landing_view',referrerHost:'m.search.naver.com',utmSource:'insta_bio'});
 assert.deepEqual(JSON.parse(first.calls[1].options.body),{step:'signup_view'},'other steps stay step-only');
 const internal=load(memory(),{referrer:'https://crefans.com/service/x?a=b',search:'?utm_source=bad%20value!'});internal.reportFunnelStep('landing_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(internal.calls[0].options.body),{step:'landing_view'},'same-site referrer and invalid utm are not sent');
 const broken=load(memory(),{referrer:'not a url'});broken.reportFunnelStep('landing_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(broken.calls[0].options.body),{step:'landing_view'});
});
// 2026-11-18 당근 캠페인: utm_medium and utm_campaign go with landing_view the same way; invalid values are dropped one by one.
test('landing_view also carries valid utm_medium and utm_campaign',async()=>{
 const page=load(memory(),{search:'?utm_source=daangn&utm_medium=cpc&utm_campaign=daangn_202611&utm_term=x'});page.reportFunnelStep('landing_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(page.calls[0].options.body),{step:'landing_view',utmSource:'daangn',utmMedium:'cpc',utmCampaign:'daangn_202611'});
 const ad=load(memory(),{search:'?utm_source=daangn&utm_campaign=daangn_202611&utm_content=2'});ad.reportFunnelStep('landing_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(ad.calls[0].options.body),{step:'landing_view',utmSource:'daangn',utmCampaign:'daangn_202611',utmContent:'2'});
 const bad=load(memory(),{search:'?utm_source=daangn&utm_medium=c%20pc&utm_campaign='+'a'.repeat(41)});bad.reportFunnelStep('landing_view');await new Promise(r=>setImmediate(r));
 assert.deepEqual(JSON.parse(bad.calls[0].options.body),{step:'landing_view',utmSource:'daangn'});
});
