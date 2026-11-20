const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-18 PostHog (lib/analytics/posthog.ts): nothing loads without the build key, replay is limited to allowlisted routes,
// all media is blocked from replay, and URLs lose query strings/hashes before they leave the browser.
function load(key){
 const previous=process.env.NEXT_PUBLIC_POSTHOG_KEY;if(key)process.env.NEXT_PUBLIC_POSTHOG_KEY=key;else delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
 const calls={required:0,init:[],capture:[],start:0,stop:0},state={started:false};
 const fake={init:(k,config)=>calls.init.push({k,config}),capture:(name,props)=>calls.capture.push([name,props]),sessionRecordingStarted:()=>state.started,startSessionRecording:()=>{calls.start++;state.started=true;},stopSessionRecording:()=>{calls.stop++;state.started=false;}};
 const mocks={get 'posthog-js'(){calls.required++;return{__esModule:true,default:fake};}};
 const mod=loadTypeScript('lib/analytics/posthog.ts',mocks);
 if(previous===undefined)delete process.env.NEXT_PUBLIC_POSTHOG_KEY;else process.env.NEXT_PUBLIC_POSTHOG_KEY=previous;
 return{mod,calls,state};
}
const withWindow=async(pathname,run)=>{global.window={location:{pathname}};try{return await run();}finally{delete global.window;}};

test('without NEXT_PUBLIC_POSTHOG_KEY posthog-js is never imported and events are dropped',async()=>{
 const {mod,calls}=load('');
 await withWindow('/service/feed',async()=>{assert.equal(await mod.loadPostHog(),null);mod.captureEvent('landing_view');mod.syncReplay('/service/beans');});
 assert.equal(calls.required,0);assert.equal(calls.init.length,0);assert.equal(calls.capture.length,0);
 const component=fs.readFileSync('components/service/PostHogAnalytics.tsx','utf8');
 assert.match(component,/if\(POSTHOG_KEY\)void loadPostHog\(\)/);assert.match(component,/if\(POSTHOG_KEY\)syncReplay\(pathname\)/);
});
test('posthog-js is imported only dynamically by lib/analytics and mounted only in the /service layout',()=>{
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const sources=['app','components','features','lib','hooks','contexts'].flatMap(walk).filter(f=>/\.(t|j)sx?$/.test(f));
 const users=sources.filter(f=>/['"]posthog-js['"]/.test(fs.readFileSync(f,'utf8'))),mounts=sources.filter(f=>/<PostHogAnalytics\/>/.test(fs.readFileSync(f,'utf8')));
 assert.deepEqual(users,['lib/analytics/posthog.ts']);assert.deepEqual(mounts,['app/service/layout.tsx']);
 const lib=fs.readFileSync('lib/analytics/posthog.ts','utf8');assert.match(lib,/import type \{[^}]*\} from 'posthog-js'/);assert.match(lib,/import\('posthog-js'\)/);
 assert.doesNotMatch(lib,/phc_/);
});
test('service pages render inside a persistent wrapper so Safari replays keep client-navigated pages',()=>{
 // posthog-js 1.445.1 on WebKit leaves an untracked iframe[__rrwebUntaintedPrototype] at the end of <body>; a page root inserted
 // right before it is dropped from the replay (white screen after landing → /service/try). The wrapper must sit outside Suspense
 // and add no box of its own.
 const layout=fs.readFileSync('app/service/layout.tsx','utf8');
 assert.match(layout,/return <div data-service-root="" style=\{\{display:'contents'\}\}><Suspense[\s\S]*<\/Suspense><\/div>;\}/);
});
test('with a key it initialises once with the hardened config and flushes queued funnel events',async()=>{
 const {mod,calls}=load('phc_test_only');
 await withWindow('/service/landing-ai-image-generation',async()=>{mod.captureEvent('landing_view');await mod.loadPostHog();await mod.loadPostHog();mod.captureEvent('ai_generation_started',mod.aiProps('guest',{mode:'cosplay',kind:'combined',presetKeys:[{kind:'pose',key:'a'},{kind:'background',key:'b'},{kind:'pose',key:'c'}]}));});
 assert.equal(calls.init.length,1);const c=calls.init[0].config;
 assert.equal(c.api_host,'https://us.i.posthog.com');assert.equal(c.persistence,'cookie');assert.equal(c.respect_dnt,true);assert.equal(c.person_profiles,'identified_only');assert.equal(c.disable_session_recording,false);
 assert.equal(c.session_recording.maskAllInputs,true);assert.equal(c.session_recording.maskInputOptions.text,true);assert.equal(c.session_recording.maskInputOptions.textarea,true);
 assert.equal(c.session_recording.recordBody,false);assert.equal(c.capture_performance,false);assert.equal(c.enable_recording_console_log,false);
 // 2026-11-19: dead clicks on (clicks, masked); exceptions on after privacy posthog.2 named screen error information; console logs off.
 assert.equal(c.capture_dead_clicks,true);assert.equal(c.capture_exceptions,true);
 assert.deepEqual(c.autocapture,{dom_event_allowlist:['click'],element_allowlist:['a','button']});assert.equal(c.mask_all_text,true);assert.equal(c.mask_all_element_attributes,true);
 assert.deepEqual(calls.capture,[['landing_view',{}],['ai_generation_started',{actor:'guest',mode:'cosplay',kind:'combined',preset_kinds:['background','pose']}]]);
});
test('events from /preview or the design system are never queued',async()=>{
 const {mod,calls}=load('phc_test_only');
 await withWindow('/preview/landing',async()=>mod.captureEvent('landing_view'));await withWindow('/service/feed',()=>mod.loadPostHog());
 assert.deepEqual(calls.capture,[]);
});
test('replay is off on sensitive routes and follows navigation',async()=>{
 const {mod,calls,state}=load('phc_test_only');
 const sensitive=['/service/beans','/service/beans/charge','/service/beans/withdraw','/service/payment/abc','/service/checkout/p1','/service/billing/x','/service/payment-methods','/service/subscriptions','/service/settings','/service/login','/service/signup','/service/signup/complete','/service/reset-password','/service/messages','/service/me','/service/membership/c1','/service/studio','/service/studio/withdraw','/service/studio/withdrawals','/service/studio/accounts','/service/studio/security','/service/studio/security/reset','/service/studio/beans/payouts','/service/studio/shop/pay','/service/studio/settlements','/service/studio/earnings','/service/studio/settings','/service/studio/messages','/service/studio/subscribers','/preview/feed','/design-system','/card'];
 const allowed=['/service/landing-ai-image-generation','/service/landing','/service/try','/service/try/done','/service/feed','/service/explore','/service/post/p1','/service/creator/c1','/service/events/feedback','/service/studio/content/new','/service/studio/content/p1/edit'];
 for(const p of sensitive)assert.equal(mod.replayAllowed(p),false,p);
 for(const p of allowed)assert.equal(mod.replayAllowed(p),true,p);
 await withWindow('/service/beans/charge',()=>mod.loadPostHog());assert.equal(calls.init[0].config.disable_session_recording,true);
 mod.syncReplay('/service/feed');assert.equal(state.started,true);mod.syncReplay('/service/checkout/p1');assert.equal(state.started,false);assert.deepEqual([calls.start,calls.stop],[1,1]);
});
test('all media and the phone check dialog are blocked from replay',()=>{
 const {mod}=load('');
 const unless=':not(html[data-ph-unmask] *)',blocked=mod.REPLAY_BLOCK_SELECTOR.split(',').map(s=>s.endsWith(unless)?s.slice(0,-unless.length):s);
 for(const tag of ['picture','video','canvas','iframe','input[type="file"]'])assert.ok(blocked.includes(tag),tag);
 // Images: only public app artwork under /brand/ and /illustrations/ is exempt; every other <img> (API media, blob:, data:) is blocked.
 assert.equal(blocked.find(s=>s.startsWith('img')),'img:not([src^="/brand/"]):not([src^="/_next/image?url=%2Fbrand%2F"]):not([src^="/illustrations/"]):not([src^="/_next/image?url=%2Fillustrations%2F"])');
 assert.ok(blocked.some(s=>s.startsWith('[style*="url("]:not(')),'background images blocked unless public artwork');
 const imgRule=blocked.find(s=>s.startsWith('img'));const exempt=[...imgRule.matchAll(/\^="([^"]+)"/g)].map(m=>m[1]);
 const matches=src=>!exempt.some(prefix=>src.startsWith(prefix));
 for(const src of ['/api/v1/media/abc','/_next/image?url=%2Fapi%2Fv1%2Fmedia%2Fabc&w=640','blob:https://crefans.com/1','data:image/png;base64,AA','https://cdn.example/x.jpg','/uploads/a.png'])assert.equal(matches(src),true,src);
 for(const src of ['/brand/ai-photo/costume-1.webp','/_next/image?url=%2Fbrand%2Fai-photo%2Fcostumes%2Fa.webp&w=256','/illustrations/landing/ai-photo/base-v1.webp'])assert.equal(matches(src),false,src);
 assert.equal(mod.REPLAY_BLOCK_CLASS,'ph-no-capture');
 assert.match(fs.readFileSync('components/crefans/PhoneCheckDialog.tsx','utf8'),/title="휴대폰 번호 확인" className=\{REPLAY_BLOCK_CLASS\}/);
 // Service media is rendered as <img>/<video>, never as a CSS background that the selector could miss.
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const offenders=['components/crefans','components/service','components/ui'].flatMap(walk).filter(f=>/backgroundImage|background(-image)?:\s*`?url\(\$\{/.test(fs.readFileSync(f,'utf8')));
 assert.deepEqual(offenders,[]);
});
test('before_send and the replay URL mask strip query strings and hashes',()=>{
 const {mod}=load('');
 const event={event:'$pageview',properties:{$current_url:'https://crefans.com/service/reset-password?token=secret#x',$referrer:'https://mail.example/?email=a@b.c',$pathname:'/service/feed',nested:{u:'https://crefans.com/a?b=1'},list:['https://x.test/?q=1']},$set_once:{$initial_current_url:'https://crefans.com/service/login?next=/me'}};
 const out=mod.beforeSend(event);
 assert.equal(out.properties.$current_url,'https://crefans.com/service/reset-password');assert.equal(out.properties.$referrer,'https://mail.example/');assert.equal(out.properties.$pathname,'/service/feed');
 assert.equal(out.properties.nested.u,'https://crefans.com/a');assert.deepEqual(out.properties.list,['https://x.test/']);assert.equal(out.$set_once.$initial_current_url,'https://crefans.com/service/login');
 assert.equal(event.properties.$current_url.includes('token'),true,'input is not mutated');
 const mask=mod.posthogConfig('/service/feed').session_recording.maskCapturedNetworkRequestFn;
 assert.equal(mask({name:'https://crefans.com/service/try?code=1#h'}).name,'https://crefans.com/service/try');
 assert.equal(mod.beforeSend(null),null);
});
test('funnel views, consent, AI generation, caption, publish and signup send PostHog events without changing the server count',()=>{
 assert.match(fs.readFileSync('features/service/useFunnelStep.ts','utf8'),/reportFunnelStep\(step\);captureEvent\(step\);/);
 const guest=fs.readFileSync('features/service/useGuestTrialModel.ts','utf8'),studio=fs.readFileSync('features/service/useStudioModel.ts','utf8'),service=fs.readFileSync('features/service/useServiceModel.ts','utf8');
 for(const name of ['guest_consent_agreed','ai_generation_started','caption_written','post_published'])assert.match(guest,new RegExp(`captureEvent\\('${name}'`));
 assert.match(guest,/'ai_generation_succeeded':'ai_generation_failed'/);assert.match(studio,/'ai_generation_succeeded':'ai_generation_failed'/);
 assert.match(studio,/input\.status==='published'&&!input\.id\)captureEvent\('post_published',\{actor:'member'\}\)/);
 assert.match(service,/if\(result\.success\)captureEvent\('signup_completed',\{actor:'member'\}\)/);
 assert.doesNotMatch(fs.readFileSync('lib/api/funnel.ts','utf8'),/posthog/i);
});

test('exception events are scrubbed: URL query/hash, e-mails and long digit runs never leave the browser',()=>{
 const {mod}=load('phc_test_only');
 const out=mod.beforeSend({event:'$exception',properties:{$exception_list:[{type:'TypeError',value:'failed https://crefans.com/service/post/1?token=abc#x for kay@example.com 01012345678',stacktrace:{frames:[{filename:'https://crefans.com/_next/static/chunks/app.js?v=1',lineno:3}]}}],$current_url:'https://crefans.com/service/try?code=1'}});
 const ex=out.properties.$exception_list[0];
 assert.equal(ex.value,'failed https://crefans.com/service/post/1 for <email> <number>');assert.equal(ex.stacktrace.frames[0].filename,'https://crefans.com/_next/static/chunks/app.js');assert.equal(out.properties.$current_url,'https://crefans.com/service/try');
 assert.equal(mod.scrubErrorText('x'.repeat(900)).length,500);
 const normal=mod.beforeSend({event:'landing_view',properties:{note:'call 01012345678'}});assert.equal(normal.properties.note,'call 01012345678','only exception events get the text scrub');
});


// 2026-11-19 user decision (처리방침 2026-11-19.guest-replay.1 17항): only a guest with a recorded replay consent, only on the trial page.
test('consenting guests are recorded unmasked on the trial page only; file/hidden inputs, passwords and the phone dialog stay masked',async()=>{
 const {mod,calls}=load('phc_test_only');
 const parts=mod.REPLAY_BLOCK_SELECTOR.split(','),unless=`:not(html[${mod.REPLAY_UNMASK_ATTR}] *)`;
 assert.equal(mod.REPLAY_UNMASK_ATTR,'data-ph-unmask');
 for(const part of parts.filter(s=>!s.startsWith('input')))assert.ok(part.endsWith(unless),part);
 assert.ok(parts.includes('input[type="file"]')&&parts.includes('input[type="hidden"]'),'file/hidden inputs are always blocked');
 const on={closest:sel=>sel==='html[data-ph-unmask]'?{}:null,type:'text'},off={closest:()=>null,type:'text'},pw={closest:()=>({}),type:'password'};
 assert.equal(mod.maskReplayInput('제목',on),'제목');assert.equal(mod.maskReplayInput('제목',off),'**');assert.equal(mod.maskReplayInput('secret',pw),'******');assert.equal(mod.maskReplayInput('ab'),'**');
 const attrs=new Map();global.document={documentElement:{setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)}};
 try{mod.setReplayUnmasked(true);assert.ok(attrs.has('data-ph-unmask'));mod.setReplayUnmasked(false);assert.ok(!attrs.has('data-ph-unmask'));}finally{delete global.document;}
 await withWindow('/service/try',()=>mod.loadPostHog());
 const rec=calls.init[0].config.session_recording;assert.equal(rec.maskAllInputs,true);assert.equal(rec.maskInputFn,mod.maskReplayInput);assert.equal(rec.blockSelector,mod.REPLAY_BLOCK_SELECTOR);
});
test('only the guest trial model toggles unmasking, gated on a recorded replay consent',()=>{
 const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
 const users=['app','components','features','lib','hooks','contexts'].flatMap(walk).filter(f=>/\.(t|j)sx?$/.test(f)&&f!=='lib/analytics/posthog.ts'&&/setReplayUnmasked\(/.test(fs.readFileSync(f,'utf8')));
 assert.deepEqual(users,['features/service/useGuestTrialModel.ts']);
 const model=fs.readFileSync('features/service/useGuestTrialModel.ts','utf8');
 assert.match(model,/if\(!enabled\|\|!session\?\.active\|\|!session\.replayConsented\)return;setReplayUnmasked\(true\);setReplayInlineImages\(true\);return\(\)=>\{setReplayInlineImages\(false\);setReplayUnmasked\(false\);\};/);
 const inliners=['app','components','features','lib','hooks','contexts'].flatMap(walk).filter(f=>/\.(t|j)sx?$/.test(f)&&f!=='lib/analytics/posthog.ts'&&/setReplayInlineImages\(/.test(fs.readFileSync(f,'utf8')));
 assert.deepEqual(inliners,['features/service/useGuestTrialModel.ts']);
 // 2026-11-20: the replay session ID (console trial history link) is reported only for a recorded replay consent.
 assert.match(model,/useEffect\(\(\)=>\{if\(enabled&&session\?\.active&&session\.replayConsented\)void reportReplaySession\(\);/);
 assert.match(model,/aiEdit=async\(input:AiPhotoEditInput\)=>\{if\(session\?\.replayConsented\)void reportReplaySession\(\);/);
 assert.match(model,/save=async\(input:unknown\)=>\{if\(session\?\.replayConsented\)void reportReplaySession\(\);/);
});

// 2026-11-20 user report: replays showed the AI result as a broken image (private URL needs the visitor's session). While unmasked,
// private photos are swapped for a downscaled embedded copy so the replay carries the image; public images and masked pages are untouched.
test('unmasked replays embed private photos as downscaled data URLs; public images and masked pages are left alone',async()=>{
 const {mod}=load('phc_test_only');
 let unmasked=true,drawn=null;const fetched=[];
 const saved={document:global.document,fetch:global.fetch,createImageBitmap:global.createImageBitmap};
 global.document={documentElement:{hasAttribute:()=>unmasked},createElement:()=>({width:0,height:0,getContext:()=>({drawImage:(b,x,y,w,h)=>{drawn=[w,h];}}),toDataURL(type,q){return `data:${type};q=${q};${this.width}x${this.height}`;}})};
 global.fetch=async(url,init)=>{fetched.push([url,init.credentials]);return {ok:true,blob:async()=>'blob'};};
 global.createImageBitmap=async()=>({width:1440,height:1800});
 const img=src=>{const attrs={src,srcset:'x 1x'};return {getAttribute:k=>attrs[k]??null,setAttribute:(k,v)=>{attrs[k]=v;},removeAttribute:k=>{delete attrs[k];},attrs};};
 try{
  const result=img('/api/v1/media/0df01137-1c9c-423d-9c2f-1f1400000000/file');
  assert.equal(await mod.inlineReplayImage(result),true);
  assert.deepEqual(fetched,[['/api/v1/media/0df01137-1c9c-423d-9c2f-1f1400000000/file','include']]);assert.deepEqual(drawn,[576,720]);
  assert.equal(result.attrs.src,'data:image/jpeg;q=0.82;576x720');assert.equal(result.attrs.srcset,undefined);
  assert.equal(await mod.inlineReplayImage(result),false,'already embedded');
  const optimized=img('/_next/image?url=%2Fapi%2Fv1%2Fmedia%2Fabc%2Ffile&w=640&q=75');assert.equal(await mod.inlineReplayImage(optimized),true);
  const brand=img('/brand/ai-photo/swipe-hand-v2.webp');assert.equal(await mod.inlineReplayImage(brand),false);assert.equal(brand.attrs.src,'/brand/ai-photo/swipe-hand-v2.webp');
  unmasked=false;const later=img('/api/v1/media/zzz/file');assert.equal(await mod.inlineReplayImage(later),false);assert.equal(later.attrs.src,'/api/v1/media/zzz/file','masked page keeps the private URL');
  assert.equal(fetched.length,3);
 }finally{Object.assign(global,saved);for(const k of Object.keys(saved))if(saved[k]===undefined)delete global[k];}
});
