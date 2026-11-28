const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {loadTypeScript}=require('./load-typescript.cjs');
const now=Date.parse('2026-11-28T03:00:00Z'),addedAt=new Date(now).toISOString();
const releases=['costume','outfit','makeup','contacts','skin','expression','pose','background','camera','lens','body'].map(kind=>({kind,key:'fresh',category:'fresh-group',active:true,addedAt}));
const N=loadTypeScript('lib/crefans/ai-photo-new.ts',{'./ai-photo-releases':{aiPhotoPresetReleases:releases}});
test('NEW lasts exactly seven elapsed days; absent, malformed and future dates are not NEW',()=>{
 assert.equal(N.aiPhotoAddedIsNew(addedAt,now),true);
 assert.equal(N.aiPhotoAddedIsNew(addedAt,now+N.AI_PHOTO_NEW_MS-1),true);
 assert.equal(N.aiPhotoAddedIsNew(addedAt,now+N.AI_PHOTO_NEW_MS),false);
 for(const date of [null,undefined,'bad',new Date(now+1).toISOString()])assert.equal(N.aiPhotoAddedIsNew(date,now),false);
});
test('all kinds propagate NEW through parent, subgroup and select options, and expire together',()=>{
 for(const {kind} of releases){
  assert.equal(N.aiPhotoReleaseIsNew(kind,'fresh',now),true);
  assert.equal(N.aiPhotoGroupIsNew(kind,undefined,now),true);
  assert.equal(N.aiPhotoGroupIsNew(kind,'old-group',now),false);
  const options=N.aiPhotoNewOptions(kind,[{value:'old-group'},{value:'fresh-group'}],now);
  assert.equal(options[0].value,'fresh-group');assert.equal(options[0].badge,'NEW');
  assert.equal(N.aiPhotoNewOptions(kind,options,now+N.AI_PHOTO_NEW_MS).some(o=>o.badge),false);
 }
 const old=releases[0].active;releases[0].active=false;
 assert.equal(N.aiPhotoGroupIsNew('costume',undefined,now),false);releases[0].active=old;
});
test('NEW outranks popularity and expiry restores popularity; input is preserved',()=>{
 const {aiPhotoSortByUsage}=loadTypeScript('lib/crefans/ai-photo-popularity.ts');
 const items=['다리 꼬아 앉기','fresh'];
 assert.deepEqual(aiPhotoSortByUsage('pose',items,x=>x,x=>N.aiPhotoReleaseIsNew('pose',x,now)),['fresh','다리 꼬아 앉기']);
 assert.deepEqual(aiPhotoSortByUsage('pose',items,x=>x,x=>N.aiPhotoReleaseIsNew('pose',x,now+N.AI_PHOTO_NEW_MS)),items);
 assert.deepEqual(items,['다리 꼬아 앉기','fresh']);
});
function sync(records,check=false){
 let output,exitCode=0;
 const source=fs.readFileSync('scripts/sync-ai-photo-releases.cjs','utf8');
 const catalog={groups:[{key:'costume',items:[{id:'new-id',category:'new-category',title:'new'}]}]};
 const mockRequire=name=>name==='node:fs'?{writeFileSync:(_,text)=>{output=text;}}:name==='../tests/load-typescript.cjs'?{loadTypeScript:file=>file.includes('catalog')?{aiPhotoCatalog:()=>catalog}:file.includes('presets.ts')?{aiPhotoPresets:{body:[]},aiPhotoPresetTitles:{body:[]}}:{aiPhotoPresetReleases:records}}:require(name);
 try{vm.runInNewContext(source,{require:mockRequire,__dirname:require('node:path').resolve('scripts'),process:{argv:check?['--check']:[],chdir(){},exit(code){exitCode=code;throw Error('exit');}},console:{log(){},error(){}},Date});}catch(error){if(error.message!=='exit')throw error;}
 return {exitCode,records:output?JSON.parse(output.slice(output.indexOf('=[')+1,-2)):undefined};
}
test('automatic registration is idempotent; category changes and retirement preserve first date; check rejects missing records',()=>{
 assert.equal(sync([],true).exitCode,1,'negative control detects an unregistered preset');
 const first=sync([]).records;assert.equal(first.length,1);assert.ok(Number.isFinite(Date.parse(first[0].addedAt)));
 const date=first[0].addedAt;first[0].category='old-category';
 assert.equal(sync(first,true).exitCode,1,'negative control detects stale category');
 const second=sync(first).records;assert.equal(second[0].addedAt,date);assert.equal(second[0].category,'new-category');
 assert.equal(sync(second,true).exitCode,0);
 second.push({kind:'costume',key:'retired',category:'new-category',active:true,addedAt:date});
 const third=sync(second).records;assert.equal(third[1].active,false);assert.equal(third[1].addedAt,date);
});
test('an open browser refreshes at expiry and removes its timer and focus listener on unmount',async()=>{
 const React=require('react'),{create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
 const saved={window:global.window,setTimeout:global.setTimeout,clearTimeout:global.clearTimeout,now:Date.now};
 let time=now,timer,delay,listeners=new Set(),cleared=false,r;
 try{
  Date.now=()=>time;global.window={addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};
  global.setTimeout=(fn,ms)=>{timer=fn;delay=ms;return 1;};global.clearTimeout=()=>{cleared=true;};
  const {useAiPhotoNewExpiry}=loadTypeScript('components/crefans/studio/useAiPhotoNewExpiry.ts',{'@/lib/crefans/ai-photo-releases':{aiPhotoPresetReleases:[releases[0]]}});
  function View(){useAiPhotoNewExpiry();return React.createElement('span',null,N.aiPhotoGroupIsNew('costume')?'NEW':'expired');}
  await act(async()=>{r=create(React.createElement(View));});assert.equal(r.toJSON().children[0],'NEW');assert.equal(delay,N.AI_PHOTO_NEW_MS+1);
  time+=N.AI_PHOTO_NEW_MS;await act(async()=>timer());assert.equal(r.toJSON().children[0],'expired');
  await act(async()=>r.unmount());assert.equal(listeners.size,0);assert.equal(cleared,true);
 }finally{Date.now=saved.now;global.setTimeout=saved.setTimeout;global.clearTimeout=saved.clearTimeout;if(saved.window===undefined)delete global.window;else global.window=saved.window;}
});
