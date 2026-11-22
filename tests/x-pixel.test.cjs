const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
// 2026-11-22 user decisions: X funnel events (privacy 9조 ⑤·10조, 2026-11-22.x-ads.1) — event name only, sent through the existing pixel.
function load(path){const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const m={exports:{}};new Function('require','module','exports',code)(require,m,m.exports);return m.exports;}
test('xEvent sends only the event id through twq, and is a no-op without the pixel',()=>{
 const {xEvent}=load('lib/analytics/x-pixel.ts'),calls=[];
 global.window={};assert.doesNotThrow(()=>xEvent('page_view'));
 global.window={twq:(...a)=>calls.push(a)};
 for(const n of ['page_view','trial_start','ai_photo','checkout_start'])xEvent(n);
 assert.deepEqual(calls,[['event','tw-rjls2-rjror',{}],['event','tw-rjls2-rjroo',{}],['event','tw-rjls2-rjrop',{}],['event','tw-rjls2-rjroq',{}]]);
 delete global.window;
});
test('funnel points fire the X events',()=>{
 const read=p=>fs.readFileSync(p,'utf8');
 assert.match(read('components/service/PostHogAnalytics.tsx'),/useEffect\(\(\)=>\{xEvent\('page_view'\);\},\[pathname\]\);/);
 const guest=read('features/service/useGuestTrialModel.ts');
 assert.match(guest,/captureEvent\('guest_consent_agreed',\{actor:'guest'\}\);xEvent\('trial_start'\);/);assert.match(guest,/captureEvent\('ai_generation_started',props\);xEvent\('ai_photo'\);/);
 assert.match(read('features/service/useStudioModel.ts'),/captureEvent\('ai_generation_started',props\);xEvent\('ai_photo'\);/);
 assert.match(read('features/service/useShopPayment.ts'),/async function pay\(\)\{if\(running\.current\)return;running\.current=true;xEvent\('checkout_start'\);/);
});
