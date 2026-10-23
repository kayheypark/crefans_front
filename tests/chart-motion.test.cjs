const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {useAnimatedChartValues}=loadTypeScript('components/ui/useAnimatedChartValues.ts');
const {BarChart,Trend}=loadTypeScript('components/ui/Charts.tsx',{'./charts.module.css':new Proxy({},{get:(_,key)=>String(key)})});

function mount(Component,props,{reduced=false}={}){
 const keys=['window','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame'];
 const previous=Object.fromEntries(keys.map(key=>[key,global[key]]));
 const frames=new Map(),observers=[],listeners=new Set();let frameId=0;
 const media={matches:reduced,addEventListener(_event,callback){listeners.add(callback);},removeEventListener(_event,callback){listeners.delete(callback);}};
 class Observer{constructor(callback){this.callback=callback;this.active=true;observers.push(this);}observe(){}disconnect(){this.active=false;}}
 global.window={matchMedia:()=>media,IntersectionObserver:Observer};global.IntersectionObserver=Observer;
 global.requestAnimationFrame=callback=>{frames.set(++frameId,callback);return frameId;};
 global.cancelAnimationFrame=id=>frames.delete(id);
 let tree;act(()=>{tree=create(React.createElement(Component,props),{createNodeMock:()=>({})});});
 return {tree,frames,listeners,observers,
  enter(){act(()=>observers.filter(item=>item.active).forEach(item=>item.callback([{isIntersecting:true}])));},
  tick(time){act(()=>{const pending=[...frames.values()];frames.clear();pending.forEach(callback=>callback(time));});},
  update(next){act(()=>tree.update(React.createElement(Component,next)));},
  reduce(value){act(()=>{media.matches=value;listeners.forEach(callback=>callback());});},
  dispose(){act(()=>tree.unmount());for(const key of keys){if(previous[key]===undefined)delete global[key];else global[key]=previous[key];}},
 };
}
function Probe({items}){const {ref,values}=useAnimatedChartValues(items);return React.createElement('div',{ref,'data-values':values});}
const values=view=>view.tree.root.findByType('div').props['data-values'];

test('chart waits for viewport entry and progressively grows to the injected geometry',()=>{
 const items=[{id:'a',value:40},{id:'b',value:100}],view=mount(Probe,{items});
 try{
  assert.deepEqual(values(view),{});assert.equal(view.frames.size,0);
  view.enter();view.tick(0);assert.deepEqual(values(view),{a:0,b:0});
  view.tick(300);assert.deepEqual(values(view),{a:35,b:87.5});
  view.tick(600);assert.deepEqual(values(view),{a:40,b:100});assert.equal(view.frames.size,0);
  assert.equal(view.observers.every(item=>!item.active),true);
 }finally{view.dispose();}
});

test('an equal fresh array does not restart a chart and never mutates its input',()=>{
 const items=[{id:'a',value:80},{id:'b',value:20}],before=JSON.stringify(items),view=mount(Probe,{items});
 try{
  view.enter();view.tick(0);view.tick(200);
  const halfway=values(view);view.update({items:items.map(item=>({...item}))});
  assert.deepEqual(values(view),halfway);assert.equal(view.frames.size,1);
  view.tick(600);assert.deepEqual(values(view),{a:80,b:20});assert.equal(view.frames.size,0);
  assert.equal(JSON.stringify(items),before);
 }finally{view.dispose();}
});

test('data changes retarget from the current geometry, increasing and decreasing by stable item id',()=>{
 const view=mount(Probe,{items:[{id:'a',value:100},{id:'b',value:50}]});
 try{
  view.enter();view.tick(0);view.tick(300);assert.deepEqual(values(view),{a:87.5,b:43.75});
  view.update({items:[{id:'b',value:100},{id:'a',value:20},{id:'c',value:30}]});
  assert.equal(view.frames.size,1);view.tick(300);assert.deepEqual(values(view),{b:43.75,a:87.5,c:0});
  view.tick(600);assert.deepEqual(values(view),{b:92.96875,a:28.4375,c:26.25});
  view.tick(900);assert.deepEqual(values(view),{b:100,a:20,c:30});
 }finally{view.dispose();}
});

test('reduced motion immediately applies data and cancels an ongoing transition',()=>{
 const view=mount(Probe,{items:[{id:'a',value:70}]},{reduced:true});
 try{
  assert.deepEqual(values(view),{a:70});assert.equal(view.frames.size,0);
  view.update({items:[{id:'a',value:10}]});assert.deepEqual(values(view),{a:10});
  view.enter();view.reduce(false);view.update({items:[{id:'a',value:90}]});view.tick(0);view.tick(200);
  assert.ok(values(view).a>10&&values(view).a<90);
  view.reduce(true);assert.deepEqual(values(view),{a:90});assert.equal(view.frames.size,0);
 }finally{view.dispose();}
 assert.equal(view.listeners.size,0);
});

test('empty data clears animation state and unmount cancels frames and observers',()=>{
 const view=mount(Probe,{items:[]});
 try{
  assert.equal(view.frames.size,0);view.update({items:[{id:'new',value:50}]});
  view.enter();view.tick(0);view.tick(200);assert.ok(values(view).new>0);
  view.update({items:[]});assert.deepEqual(values(view),{});assert.equal(view.frames.size,0);
  view.update({items:[{id:'new',value:60}]});view.tick(300);assert.deepEqual(values(view),{new:0});
 }finally{view.dispose();}
 assert.equal(view.frames.size,0);assert.equal(view.listeners.size,0);assert.equal(view.observers.every(item=>!item.active),true);
});

test('shared charts render only supplied labels, keep zero bars empty, and omit empty datasets',()=>{
 const view=mount(BarChart,{label:'주입된 통계',items:[{id:'a',label:'첫 기간',value:0,valueLabel:'0명'},{id:'b',label:'다음 기간',value:100,valueLabel:'100명'}]},{reduced:true});
 try{
  const bars=view.tree.root.findAllByType('span');assert.equal(bars[0].props.style.height,'0%');assert.equal(bars[1].props.style.height,'100%');
  assert.equal(view.tree.root.findByProps({role:'img'}).props['aria-label'],'주입된 통계. 첫 기간: 0명, 다음 기간: 100명');
  view.update({label:'주입된 통계',items:[]});assert.equal(view.tree.toJSON(),null);
 }finally{view.dispose();}
 const line=mount(Trend,{points:[3,5,4],label:'주입된 추이'},{reduced:true});
 try{
  assert.equal(line.tree.root.findByType('svg').props['aria-label'],'주입된 추이');
  assert.equal(line.tree.root.findByType('polyline').props.points,'8,54 150,14 292,34');
  line.update({points:[],label:'주입된 추이'});assert.equal(line.tree.toJSON(),null);
 }finally{line.dispose();}
});
