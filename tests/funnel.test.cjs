const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
// 2026-11-18: funnel view steps are sent once per tab session, carry only the step name, and fail silently.
function load(storage){
 const code=ts.transpileModule(fs.readFileSync('lib/api/funnel.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,calls=[],module={exports:{}};
 new Function('module','exports','fetch','window',code)(module,module.exports,async(url,options)=>{calls.push({url,options});throw Error('offline');},{sessionStorage:storage});
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
