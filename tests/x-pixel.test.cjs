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
// 2026-11-23 user decision (/ask-me "주소 정리 + Purchase 추가"): payment-return queries never reach X; Purchase only after server approval.
const vm=require('node:vm');
const tossSuccess='?id=11111111-1111-1111-1111-111111111111&paymentType=NORMAL&orderId=ord_1&paymentKey=tgen_secret&amount=9900';
function runBase(search,referrer=''){
 const inserted=[],first={parentNode:{insertBefore:el=>inserted.push(el.src)}};
 const win={location:{search,origin:'https://crefans.com'}};
 const doc={referrer,createElement:()=>({}),getElementsByTagName:()=>[first]};
 win.window=win;vm.runInNewContext(load('lib/analytics/x-pixel.ts').X_PIXEL_BASE_CODE,{window:win,document:doc,twq:(...a)=>win.twq(...a)});
 return {win,inserted};
}
test('base code does not load uwt.js while a payment or card-registration query is in the address',()=>{
 for(const q of [tossSuccess,'?id=x&code=PAY_PROCESS_CANCELED&message=m&orderId=o','?registrationId=r&state=s&customerKey=c&authKey=a','?result=fail&code=X']){
  const {win,inserted}=runBase(q);assert.deepEqual(inserted,[],q);assert.equal(JSON.stringify(win.twq.queue.map(a=>[...a])),'[["config","rjls2"]]');
 }
 // A same-origin referrer that still carries the query would be sent as tw_document_referrer.
 assert.deepEqual(runBase('','https://crefans.com/service/payment/success'+tossSuccess).inserted,[]);
 assert.deepEqual(runBase('','https://pay.toss.im/x?orderId=o').inserted,['https://static.ads-twitter.com/uwt.js']);
 const clean=runBase('?id=11111111-1111-1111-1111-111111111111');assert.deepEqual(clean.inserted,['https://static.ads-twitter.com/uwt.js']);
 // After the page replaces the address, the next event loads the pixel once.
 const late=runBase(tossSuccess);late.win.location.search='?id=1';late.win.__xPixelLoad();late.win.__xPixelLoad();assert.equal(late.inserted.length,1);
});
test('xEvent sends nothing while the address carries payment parameters',()=>{
 const {xEvent}=load('lib/analytics/x-pixel.ts'),calls=[];let loads=0;
 global.window={location:{search:tossSuccess,origin:'https://crefans.com'},document:{referrer:''},twq:(...a)=>calls.push(a),__xPixelLoad:()=>loads++};
 xEvent('page_view');assert.deepEqual(calls,[]);assert.equal(loads,0);
 global.window.location.search='?id=1';xEvent('page_view');assert.deepEqual(calls,[['event','tw-rjls2-rjror',{}]]);assert.equal(loads,1);
 delete global.window;
});
test('Purchase sends value, KRW and the internal order id only, to the 이용권 결제 event the server API also uses',()=>{
 const {purchaseParams,xPurchase}=load('lib/analytics/x-pixel.ts'),calls=[];
 assert.deepEqual(purchaseParams(9900,'11111111-1111-1111-1111-111111111111'),{value:9900,currency:'KRW',conversion_id:'11111111-1111-1111-1111-111111111111'});
 for(const [v,id] of [[NaN,'a'],[0,'a'],[-1,'a'],[9900,'']])assert.equal(purchaseParams(v,id),null);
 global.window={location:{search:''},twq:(...a)=>calls.push(a)};xPurchase(9900,'shop-a');xPurchase(0,'shop-b');xPurchase(9900,'');
 global.window.location.search=tossSuccess;xPurchase(9900,'shop-c');delete global.window;
 assert.deepEqual(calls,[['event','tw-rjls2-rjoi0',{value:9900,currency:'KRW',conversion_id:'shop-a'}]]);
});
test('Purchase fires only on the approved branch of each payment return',()=>{
 const read=p=>fs.readFileSync(p,'utf8'),count=(s)=>(s.match(/xPurchase\(/g)||[]).length;
 const one=read('features/service/useOneTimePayment.ts'),bean=read('features/service/useBeanPaymentResult.ts'),shop=read('features/service/useShopPayment.ts');
 assert.match(one,/const response=await api<\{message:string\}>\(`\/checkout\/\$\{id\}\/confirm`,body\);if\(response\.success\)\{done\.current=true;input\.current\.paymentKey='';xPurchase\(body\.amount,'checkout-'\+id\);\}/);assert.equal(count(one),1);
 assert.match(bean,/if\(charge\.status==='paid'\)\{\n    done\.current=true;input\.current\.paymentKey='';\n.*\n    if\(success&&body\.paymentKey\)xPurchase\(charge\.amount,'bean-'\+id\);/);assert.equal(count(bean),1);
 assert.match(shop,/if\(r\.success\)\{setOrder\(r\.data\);history\.replaceState\(null,'',`\?id=\$\{encodeURIComponent\(id\)\}`\);if\(r\.data\.status==='paid'\)xPurchase\(r\.data\.amount,'shop-'\+id\);\}else setError/);assert.equal(count(shop),1);
 assert.match(read('app/layout.tsx'),/<Script id="x-pixel" strategy="afterInteractive">\s*\{X_PIXEL_BASE_CODE\}\s*<\/Script>/);
});
