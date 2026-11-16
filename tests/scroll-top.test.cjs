const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {useScrollTopOnChange}=loadTypeScript('lib/design/scroll-top.ts',{});

test('same-route step change scrolls the window and the mobile shell body to the top, but not on first render',()=>{
 const calls=[];const shell={scrollTo:(x,y)=>calls.push(['shell',x,y])};
 global.window={scrollTo:(x,y)=>calls.push(['window',x,y])};
 global.document={querySelector:selector=>selector==='[data-service-scroll]'?shell:null};
 function Step({step}){useScrollTopOnChange(step);return null;}
 let root;act(()=>{root=create(React.createElement(Step,{step:'consent'}));});
 assert.deepEqual(calls,[]);
 act(()=>root.update(React.createElement(Step,{step:'consent'})));
 assert.deepEqual(calls,[]);
 act(()=>root.update(React.createElement(Step,{step:'editor'})));
 assert.deepEqual(calls,[['window',0,0],['shell',0,0]]);
 delete global.window;delete global.document;
});

test('screens that swap the whole page on one route reset scroll on each step',()=>{
 for(const [file,key] of [
  ['components/service/GuestTrialPage.tsx',"useScrollTopOnChange(guest.session?.active?'editor':'consent')"],
  ['components/crefans/studio/OverviewPages.tsx',"useScrollTopOnChange(done?'done':String(step))"],
  ['components/crefans/studio/FinancePages.tsx',"useScrollTopOnChange(result?'result':quote?'quote':'form')"],
  ['components/crefans/CommonPages.tsx',"useScrollTopOnChange(complete?'complete':requested?'code':'email')"],
 ])assert.ok(fs.readFileSync(file,'utf8').includes(key),file);
});
