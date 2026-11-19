// 2026-11-19 user request: AI result share links are short (/s/<8-character code>) and redirect to the landing.
const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const nextServer={NextResponse:class{constructor(body,init){this.status=init.status;this.headers=new Map(Object.entries(init.headers));}}};
const route=loadTypeScript('app/s/[[...code]]/route.ts',{'next/server':nextServer});
const share=loadTypeScript('lib/api/ai-result-share.ts',{'./platform':{platformRequest:async(path,body)=>{sent.push([path,body]);return {success:true};}}});
const sent=[];
test('the share URL is the origin plus /s/<code>; without a code it is /s',()=>{
 global.window={location:{origin:'https://crefans.com',hash:''}};
 try{
  assert.equal(share.aiResultShareUrl('Ab3dE9xK'),'https://crefans.com/s/Ab3dE9xK');
  assert.equal(share.aiResultShareUrl(),'https://crefans.com/s');
  assert.ok(share.aiResultShareUrl('Ab3dE9xK').length<40);
 }finally{delete global.window;}
});
test('/s/<code> redirects (302, noindex) to the landing with share tags and the code in the fragment',async()=>{
 const go=async code=>route.GET(new Request('http://internal/s'),{params:Promise.resolve({code})});
 const ok=await go(['Ab3dE9xK']);assert.equal(ok.status,302);assert.equal(ok.headers.get('X-Robots-Tag'),'noindex');
 assert.equal(ok.headers.get('location'),'/service/landing-ai-image-generation?utm_source=crefans_share&utm_medium=share&utm_campaign=ai_photo&utm_content=result#result-share=Ab3dE9xK');
 for(const bad of [undefined,['short'],['Ab3dE9xK','x'],['Ab3d<9xK']])assert.doesNotMatch((await go(bad)).headers.get('location'),/#/,String(bad));
});
test('a visit through the short link reports the code; a malformed fragment is ignored',async()=>{
 global.window={location:{origin:'https://crefans.com',hash:'#result-share=Ab3dE9xK'}};
 try{
  sent.length=0;await share.reportAiResultShareVisit();assert.deepEqual(sent,[['/guest/ai-photo/share-visit',{token:'Ab3dE9xK'}]]);
  window.location.hash='#result-share=Ab3d!9xK';sent.length=0;await share.reportAiResultShareVisit();assert.equal(sent.length,0);
 }finally{delete global.window;}
});
