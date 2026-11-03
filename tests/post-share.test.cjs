const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const browser=loadTypeScript('lib/browser/post-share.ts');
function globals(values){const saved={};for(const [key,value]of Object.entries(values)){saved[key]=Object.getOwnPropertyDescriptor(global,key);Object.defineProperty(global,key,{configurable:true,writable:true,value});}return()=>{for(const key of Object.keys(values)){if(saved[key])Object.defineProperty(global,key,saved[key]);else delete global[key];}};}
test('sharing uses only the post page URL and title, preserving preview/service and encoding IDs',()=>{
 for(const base of ['/preview','/service']){
  const data=browser.postShareData('https://beta.crefans.com',base,'a/b?token=secret#x','공개 제목');assert.equal(data.url,`https://beta.crefans.com${base}/post/a%2Fb%3Ftoken%3Dsecret%23x`);assert.deepEqual(Object.keys(data).sort(),['title','url']);assert.equal(new URL(data.url).search,'');assert.equal(new URL(data.url).hash,'');
 }
 const template=browser.kakaoShareTemplate({title:'😀'.repeat(250),url:'https://example.com/service/post/id'});assert.equal(Array.from(template.content.title).length,200);assert.equal(template.objectType,'feed');assert.equal(template.content.link.webUrl,template.content.link.mobileWebUrl);assert.equal(template.content.imageUrl,'https://example.com/brand/share/default-post-v1.jpg');
});
test('Kakao loads once with official SRI, initializes once and sends only on explicit action',async()=>{
 const scripts=[],sent=[],inits=[];let initialized=false;
 const restore=globals({window:{},document:{createElement:()=>({remove(){}}),head:{appendChild:script=>scripts.push(script)}}});
 try{
  const sdk=loadTypeScript('lib/browser/post-share.ts');await assert.rejects(()=>sdk.prepareKakaoShare(''),/NOT_CONFIGURED/);assert.equal(scripts.length,0);
  const one=sdk.prepareKakaoShare('test-public-key'),two=sdk.prepareKakaoShare('test-public-key');assert.equal(one,two);assert.equal(scripts.length,1);assert.equal(scripts[0].src,sdk.kakaoSdkUrl);assert.equal(scripts[0].integrity,sdk.kakaoSdkIntegrity);assert.equal(scripts[0].crossOrigin,'anonymous');
  window.Kakao={init:key=>{inits.push(key);initialized=true;},isInitialized:()=>initialized,Share:{sendDefault:data=>sent.push(data)}};scripts[0].onload();await one;await sdk.prepareKakaoShare('test-public-key');assert.equal(inits.length,1);assert.equal(sent.length,0);
  sdk.shareToKakao({title:'제목',url:'https://example.com/service/post/id'});assert.deepEqual(sent,[sdk.kakaoShareTemplate({title:'제목',url:'https://example.com/service/post/id'})]);
 }finally{restore();}
});
test('a failed SDK request is removed and a later opening can retry',async()=>{
 const scripts=[];let removed=0;const restore=globals({window:{},document:{createElement:()=>({remove(){removed++;}}),head:{appendChild:script=>scripts.push(script)}}});
 try{const sdk=loadTypeScript('lib/browser/post-share.ts'),one=sdk.prepareKakaoShare('test-key');scripts[0].onerror();await assert.rejects(one,/LOAD_FAILED/);assert.equal(removed,1);const two=sdk.prepareKakaoShare('test-key');assert.equal(scripts.length,2);window.Kakao={init(){},isInitialized:()=>true,Share:{sendDefault(){}}};scripts[1].onload();await two;}finally{restore();}
});
function hook({nav={},key='',prepare=async()=>{},send=()=>{}}={}){
 const restore=globals({window:{location:{origin:'https://beta.crefans.com'}},navigator:nav});
 const {usePostShare}=loadTypeScript('features/post-share/usePostShare.ts',{'@/lib/browser/post-share':{...browser,kakaoJavaScriptKey:key,prepareKakaoShare:prepare,shareToKakao:send}});
 let state,tree,props={open:false,basePath:'/preview',postId:'sample',title:'공개 제목'};function Probe(input){state=usePostShare(input);return null;}
 act(()=>{tree=create(React.createElement(Probe,props));});return{get state(){return state;},update(patch){props={...props,...patch};act(()=>tree.update(React.createElement(Probe,props)));},close(){act(()=>tree.unmount());restore();}};
}
test('opening never copies; copy success, rejection and absent clipboard are distinct',async()=>{
 const calls=[];const h=hook({nav:{clipboard:{writeText:async value=>{calls.push(value);}}}});
 try{h.update({open:true});assert.equal(calls.length,0);await act(async()=>h.state.copy());assert.deepEqual(calls,['https://beta.crefans.com/preview/post/sample']);assert.equal(h.state.message,'링크를 복사했어요.');navigator.clipboard.writeText=async()=>{throw Error('denied');};await act(async()=>h.state.copy());assert.equal(h.state.manualCopy,true);assert.equal(h.state.message,'');delete navigator.clipboard;await act(async()=>h.state.copy());assert.equal(h.state.manualCopy,true);}finally{h.close();}
});
test('native share runs synchronously on the action, prevents duplicates and treats cancellation quietly',async()=>{
 let settle,seen=0,payload;const h=hook({nav:{canShare:()=>true,share:data=>{seen++;payload=data;return new Promise(resolve=>{settle=resolve;});}}});
 try{h.update({open:true});assert.equal(seen,0);let pending;act(()=>{pending=h.state.shareMore();void h.state.shareMore();});assert.equal(seen,1);assert.equal(payload.url,h.state.url);assert.equal(h.state.pending,true);await act(async()=>{settle();await pending;});assert.equal(h.state.pending,false);assert.equal(h.state.message,'');
  navigator.share=async()=>{throw Object.assign(Error(),{name:'AbortError'});};await act(async()=>h.state.shareMore());assert.equal(h.state.error,'');
  navigator.share=async()=>{throw Object.assign(Error(),{name:'NotAllowedError'});};await act(async()=>h.state.shareMore());assert.match(h.state.error,/기기 공유창/);
 }finally{h.close();}
});
test('unsupported sharing is unavailable, while missing Kakao config makes no SDK request',async()=>{
 let load=0;const h=hook({nav:{share:async()=>{},canShare:()=>false},prepare:async()=>{load++;}});
 try{h.update({open:true});assert.equal(h.state.nativeSupported,false);assert.equal(h.state.kakao,'unavailable');await act(async()=>h.state.shareKakao());assert.equal(load,0);}finally{h.close();}
});
test('configured Kakao preloads, does not send on opening and keeps delivery claims separate',async()=>{
 let ready,load=0;const sent=[];const h=hook({key:'public-key',prepare:()=>{load++;return new Promise(resolve=>{ready=resolve;});},send:data=>sent.push(data)});
 try{h.update({open:true});assert.equal(h.state.kakao,'loading');assert.equal(load,1);await act(async()=>h.state.shareKakao());assert.equal(sent.length,0);await act(async()=>ready());assert.equal(h.state.kakao,'ready');act(()=>{void h.state.shareKakao();});assert.equal(sent.length,1);await act(async()=>{});assert.match(h.state.message,/공유 대상을 선택/);assert.doesNotMatch(h.state.message,/전송.*완료/);}finally{h.close();}
});
test('late work from a closed layer does not contaminate the next post',async()=>{
 let finish;const h=hook({nav:{clipboard:{writeText:()=>new Promise(resolve=>{finish=resolve;})}}});
 try{h.update({open:true});let pending;act(()=>{pending=h.state.copy();});h.update({open:false});h.update({open:true,postId:'next'});await act(async()=>{finish();await pending;});assert.equal(h.state.message,'');assert.equal(h.state.url,'https://beta.crefans.com/preview/post/next');assert.equal(h.state.pending,false);}finally{h.close();}
});

test('real SDK exposes Share only after init, so initialize before checking the module',async()=>{
 const scripts=[];let initialized=false;const sdkObject={isInitialized:()=>initialized,init(){initialized=true;this.Share={sendDefault(){}};}};
 const restore=globals({window:{},document:{createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}}});
 try{const sdk=loadTypeScript('lib/browser/post-share.ts'),ready=sdk.prepareKakaoShare('public-test-key');window.Kakao=sdkObject;scripts[0].onload();await ready;assert.equal(initialized,true);assert.equal(typeof window.Kakao.Share.sendDefault,'function');}finally{restore();}
});

test('image sharing exposes only the public post resolver, never sender-authenticated media URLs',()=>{
 assert.equal(browser.postShareImage('https://crefans.com','/service','a/b','/api/v1/media/private/file'),'https://crefans.com/api/v1/media/posts/a%2Fb/share-image');
 assert.equal(browser.postShareImage('https://crefans.com','/preview','x','/illustrations/a.png'),'https://crefans.com/illustrations/a.png');
 for(const unsafe of ['https://evil.example/image','/api/v1/media/private/file',undefined])assert.equal(browser.postShareImage('https://crefans.com','/preview','x',unsafe),'https://crefans.com/brand/share/default-post-v1.jpg');
});
