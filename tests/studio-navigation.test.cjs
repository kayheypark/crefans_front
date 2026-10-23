const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {default:StudioShell}=loadTypeScript('components/crefans/studio/StudioShell.tsx',{
 './studio.module.css':styles,
 'next/link':props=>React.createElement('a',props),
 '../Brand':{Brand:props=>React.createElement('a',props,'brand')},
 '../ServiceUI':{Avatar:()=>null,NavIcon:()=>React.createElement('svg',{'aria-hidden':true})},
});
const props={active:'reports/followers',basePath:'/creator-space',fanPath:'/fan-space',profile:{name:'작성자',handle:'creator',avatar:''},children:'페이지 본문'};
function mount(overrides={}){
 const focus={count:0};let view;
 act(()=>{view=create(React.createElement(StudioShell,{...props,...overrides}),{createNodeMock:()=>null});});
 return {view,focus,update(value){act(()=>view.update(React.createElement(StudioShell,{...props,...value})));},close(){act(()=>view.unmount());}};
}
function group(view,label){return view.root.findAllByType('button').find(button=>button.props.className==='groupToggle'&&button.findAllByType('span').some(span=>span.children.includes(label)));}
function viewport(initial){
 const previous=global.window,listeners=new Set(),media={matches:initial,addEventListener(_event,listener){listeners.add(listener);},removeEventListener(_event,listener){listeners.delete(listener);}};
 global.window={matchMedia:()=>media};
 return {resize(matches){act(()=>{media.matches=matches;listeners.forEach(listener=>listener());});},restore(){global.window=previous;},listeners};
}

test('current report opens its own group and all three report destinations remain distinct',()=>{
 const {view,close}=mount();
 try{
  const current=view.root.findAllByType('a').filter(link=>link.props['aria-current']==='page');
  assert.equal(current.length,1);assert.equal(current[0].props.href,'/creator-space/reports/followers');
  const reports=group(view,'리포트');assert.equal(reports.props['aria-expanded'],true);
  const panel=view.root.findByProps({id:reports.props['aria-controls']});assert.equal(panel.props['aria-hidden'],undefined);assert.equal(panel.props.inert,undefined);assert.equal(panel.props['aria-labelledby'],reports.props.id);
  assert.deepEqual(panel.findAllByType('a').map(link=>link.props.href),['/creator-space/analytics','/creator-space/reports/revenue','/creator-space/reports/subscribers','/creator-space/reports/followers']);
  assert.equal(group(view,'콘텐츠').props['aria-expanded'],false);
  assert.ok(view.root.findAllByType('a').some(link=>link.props.href==='/creator-space'&&link.children.includes('대시보드')));
 }finally{close();}
});

test('groups can be collapsed and navigation into nested content automatically opens the matching group',()=>{
 const {view,update,close}=mount();
 try{
  act(()=>group(view,'리포트').props.onClick());assert.equal(group(view,'리포트').props['aria-expanded'],false);
  const panel=view.root.findByProps({id:group(view,'리포트').props['aria-controls']});
  assert.equal(panel.props['aria-hidden'],true);assert.equal(panel.props.inert,'');assert.equal(panel.props['data-open'],false);
  assert.equal(panel.props.hidden,undefined);assert.equal(panel.findAllByType('a').length,4);
  update({active:'content/new'});assert.equal(group(view,'콘텐츠').props['aria-expanded'],true);
  const current=view.root.findAllByType('a').find(link=>link.props['aria-current']==='page');assert.equal(current.props.href,'/creator-space/content');
  assert.equal(group(view,'리포트').props['aria-expanded'],false);
 }finally{close();}
});

test('external route changes open the new current group and mark the current link',()=>{
 const {view,update,close}=mount();
 try{
  update({active:'security'});
  assert.equal(group(view,'설정').props['aria-expanded'],true);
  assert.equal(view.root.findAllByType('a').find(link=>link.props['aria-current']==='page').props.href,'/creator-space/security');
 }finally{close();}
});

test('rapid group reversal retains link instances and immediately restores keyboard availability',()=>{
 const {view,close}=mount();
 try{
  const control=group(view,'리포트'),panel=()=>view.root.findByProps({id:control.props['aria-controls']}),link=panel().findAllByType('a')[0];
  act(()=>control.props.onClick());
  assert.equal(panel().props.inert,'');assert.equal(panel().props['data-open'],false);
  assert.equal(panel().findAllByType('a')[0],link);
  act(()=>group(view,'리포트').props.onClick());
  assert.equal(panel().props.inert,undefined);assert.equal(panel().props['aria-hidden'],undefined);assert.equal(panel().props['data-open'],true);
  assert.equal(panel().findAllByType('a')[0],link);
 }finally{close();}
});

test('mobile viewports replace the studio with an unsupported notice and restore navigation on desktop',()=>{
 const screen=viewport(true),{view,close}=mount({mock:true});
 try{
  assert.equal(view.root.findAllByType('nav').length,0);assert.equal(view.root.findAllByType('aside').length,0);
  assert.match(JSON.stringify(view.toJSON()),/모바일에서는 지원하지 않습니다/);
  assert.doesNotMatch(JSON.stringify(view.toJSON()),/페이지 본문/);
  assert.equal(view.root.findByType('main').findByType('a').props.href,'/fan-space/feed');
  screen.resize(false);
  assert.equal(view.root.findAllByType('nav').length,1);assert.match(JSON.stringify(view.toJSON()),/페이지 본문/);
  assert.equal(group(view,'수익,정산,출금 관리').props['aria-expanded'],false);
  screen.resize(true);assert.equal(view.root.findAllByType('nav').length,0);
 }finally{close();assert.equal(screen.listeners.size,0);screen.restore();}
});
