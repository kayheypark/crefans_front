const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const Card=loadTypeScript('components/business-card/BusinessCard.tsx').default;
function clock(){
 const previous=global.window,timers=new Map();let now=0,id=0,destination;
 global.window={performance:{now:()=>now},requestAnimationFrame:fn=>{timers.set(++id,{fn,at:now+16});return id;},cancelAnimationFrame:key=>timers.delete(key),location:{replace:url=>{destination=url;}}};
 return {stall(ms){now+=ms;for(const timer of timers.values())timer.at=now;},advance(ms){const end=now+ms;while(true){const entry=[...timers].sort((a,b)=>a[1].at-b[1].at).find(([,t])=>t.at<=end);if(!entry)break;const [key,t]=entry;now=t.at;timers.delete(key);act(()=>t.fn());}now=end;},get destination(){return destination;},get timers(){return timers.size;},restore(){global.window=previous;}};
}
const phase=tree=>tree.root.find(node=>node.props['data-phase']!==undefined).props['data-phase'];
const click=(tree,label)=>act(()=>tree.root.findByProps({'aria-label':label}).props.onClick());
const progress=tree=>tree.root.findByProps({role:'progressbar'}).props['aria-valuenow'];
function mount(cached=true){let tree;act(()=>{tree=create(React.createElement(Card),cached?{createNodeMock:node=>node.type==='img'?{complete:true,naturalWidth:1364}:null}:undefined);});return tree;}
test('timeline waits for both images then shows back, flips, and gives front five seconds',()=>{
 const time=clock();let tree;try{
  tree=mount(false);assert.equal(phase(tree),'loading');act(()=>tree.root.findAllByType('img')[0].props.onLoad());assert.equal(phase(tree),'loading');act(()=>tree.root.findAllByType('img')[1].props.onLoad());assert.equal(phase(tree),'entering');
  time.advance(800);assert.equal(phase(tree),'back');time.advance(992);assert.equal(phase(tree),'back');time.advance(16);assert.equal(phase(tree),'flipping');time.advance(688);assert.equal(phase(tree),'flipping');time.advance(16);assert.equal(phase(tree),'front');
  time.advance(4976);assert.equal(time.destination,undefined);time.advance(16);assert.equal(time.destination,'https://beta.crefans.com/service/landing');act(()=>tree.unmount());assert.equal(time.timers,0);
 }finally{time.restore();}
});
test('stop freezes a flip and play continues from the same position',()=>{
 const time=clock();let tree;try{tree=mount();time.advance(2000);assert.equal(phase(tree),'flipping');click(tree,'중지');const snapshot=JSON.stringify(tree.toJSON());time.advance(10000);assert.equal(JSON.stringify(tree.toJSON()),snapshot);assert.equal(time.destination,undefined);assert.equal(time.timers,0);click(tree,'재생');time.advance(5408);assert.equal(time.destination,undefined);time.advance(112);assert.equal(time.destination,'https://beta.crefans.com/service/landing');act(()=>tree.unmount());}finally{time.restore();}
});
test('replay resets paused progress and repeated replay cannot duplicate timers',()=>{
 const time=clock();let tree;try{tree=mount();time.advance(4512);assert.ok(progress(tree)>0);click(tree,'중지');const value=progress(tree);time.advance(10000);assert.equal(progress(tree),value);click(tree,'다시보기');assert.equal(phase(tree),'entering');assert.equal(progress(tree),0);assert.equal(time.timers,1);for(let i=0;i<3;i++)click(tree,'다시보기');assert.equal(time.timers,1);time.advance(7504);assert.equal(time.destination,'https://beta.crefans.com/service/landing');act(()=>tree.unmount());assert.equal(time.timers,0);}finally{time.restore();}
});
test('cached images start without load events and unmount cancels pending frames',()=>{
 const time=clock();try{const tree=mount();assert.equal(phase(tree),'entering');assert.equal(time.timers,1);act(()=>tree.unmount());assert.equal(time.timers,0);}finally{time.restore();}
});
test('image failure disables playback and prevents navigation',()=>{
 const time=clock();let tree;try{tree=mount(false);act(()=>tree.root.findAllByType('img')[0].props.onError());time.advance(20000);assert.equal(time.destination,undefined);for(const button of tree.root.findAllByType('button'))assert.equal(button.props.disabled,true);act(()=>tree.unmount());}finally{time.restore();}
});
test('only greeting, card, progress and three labelled icon buttons remain',()=>{
 const time=clock();let tree;try{tree=mount();assert.equal(tree.root.findByType('h1').props.children,'안녕하세요, 만나서 반갑습니다.');assert.equal(tree.root.findAllByType('a').length,0);assert.equal(tree.root.findAllByType('nav').length,0);assert.equal(tree.root.findAllByType('p').length,0);assert.deepEqual(tree.root.findAllByType('button').map(b=>b.props['aria-label']),['중지','재생','다시보기']);act(()=>tree.unmount());}finally{time.restore();}
});
test('unknown or missing identity is not replaced with another persons card',async()=>{
 const Page=loadTypeScript('app/card/page.tsx',{'next/navigation':{notFound(){throw Error('404');}},'@/components/business-card/BusinessCard':Card}).default;
 for(const who of [undefined,'unknown',['khpark'],'https://example.org'])await assert.rejects(()=>Page({searchParams:Promise.resolve({who})}),/404/);
 assert.ok(await Page({searchParams:Promise.resolve({who:'khpark'})}));
});
test('card middleware returns real 404 for unknown, missing or repeated identity',()=>{
 const next={next:()=>({status:200}),redirect:()=>({status:302})};
 function Response(body,options){this.body=body;this.status=options.status;}Object.assign(Response,next);
 const {middleware}=loadTypeScript('middleware.ts',{'next/server':{NextResponse:Response}});
 for(const query of ['','?who=unknown','?who=khpark&who=khpark','?who=khpark&who=unknown'])assert.equal(middleware({nextUrl:new URL('https://business.crefans.com/card'+query)}).status,404);
 assert.equal(middleware({nextUrl:new URL('https://business.crefans.com/card?who=khpark')} ).status,200);
});


test('a long initial frame stall cannot skip the whole card and redirect',()=>{
 const time=clock();let tree;try{tree=mount();time.stall(10000);time.advance(16);assert.equal(phase(tree),'entering');assert.equal(progress(tree),0);assert.equal(time.destination,undefined);act(()=>tree.unmount());}finally{time.restore();}
});
test('hidden-tab time is not counted and visibility listeners are removed',()=>{
 const previousDocument=global.document,listeners=new Set();global.document={visibilityState:'visible',addEventListener(name,fn){assert.equal(name,'visibilitychange');listeners.add(fn);},removeEventListener(name,fn){listeners.delete(fn);}};
 const time=clock();let tree;try{tree=mount();time.advance(160);global.document.visibilityState='hidden';for(const fn of listeners)fn();time.advance(10000);assert.equal(phase(tree),'entering');assert.equal(progress(tree),0);assert.equal(time.destination,undefined);global.document.visibilityState='visible';for(const fn of listeners)fn();time.advance(800);assert.equal(phase(tree),'back');act(()=>tree.unmount());assert.equal(listeners.size,0);}finally{global.document=previousDocument;time.restore();}
});

test('loading HTML does not carry permanent inline hiding when scripts or styles fail',()=>{
 const time=clock();let tree;try{tree=mount(false);const entrance=tree.root.find(node=>node.type==='div'&&node.props.style&&Object.hasOwn(node.props.style,'opacity'));assert.equal(entrance.props.style.opacity,undefined);assert.equal(entrance.props.style.transform,undefined);assert.equal(entrance.findAllByType('div')[1].props.style.transform,undefined);act(()=>tree.unmount());}finally{time.restore();}
});
