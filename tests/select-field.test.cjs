const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {SelectField}=loadTypeScript('components/ui/SelectField.tsx',{'./select.module.css':{__esModule:true,default:styles}});

function mount(props){
 const previous={window:global.window,document:global.document};
 const listeners=new Map(),nodes={};
 global.window={innerWidth:375,innerHeight:850,matchMedia:()=>({matches:false}),setTimeout,clearTimeout,requestAnimationFrame:callback=>setTimeout(callback,0),cancelAnimationFrame:clearTimeout,addEventListener(){},removeEventListener(){}};
 global.document={addEventListener:(type,callback)=>listeners.set(type,callback),removeEventListener:type=>listeners.delete(type),getElementById:()=>({scrollIntoView(){}})};
 let rendered;
 act(()=>{rendered=create(React.createElement(SelectField,props),{createNodeMock:element=>{
  const node={focusCount:0,focus(){this.focusCount++;},contains:target=>target?.inside===element.props['data-select'],scrollHeight:400,matches:()=>false,showPopover(){this.popoverShown=true;},getBoundingClientRect:()=>({left:250,right:370,top:790,bottom:838,width:120,height:48})};
  if(element.props['data-select'])nodes[element.props['data-select']]=node;
  if(element.type==='input'&&element.props.type==='search')nodes.search=node;
  return node;
 }});});
 const role=name=>rendered.root.findByProps({role:name});
 return {rendered,nodes,listeners,role,open(){act(()=>role('combobox').props.onClick());},update(next){act(()=>rendered.update(React.createElement(SelectField,next)));},dispose(){act(()=>rendered.unmount());global.window=previous.window;global.document=previous.document;}};
}
function key(view,key,target=view.nodes.trigger,extra={}){
 const event={key,target,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...extra};
 act(()=>view.role(target===view.nodes.search?'searchbox':'combobox').props.onKeyDown(event));
 return event;
}
const options=[{value:'',label:'전체 공개'},{value:'a',label:'블루 A'},{value:'b',label:'블루 B',disabled:true},{value:'c',label:'코럴 C'},{value:'d',label:'블루 D'}];

test('select preserves empty-string option labels and associates required/error text',()=>{
 const view=mount({label:'공개 범위',options,value:'',onChange(){},required:true,error:'범위를 확인하세요',name:'audience'});
 try{
  assert.equal(view.rendered.root.findByProps({className:'value '}).children[0],'전체 공개');
  assert.equal(view.role('combobox').props['aria-required'],true);
  assert.equal(view.role('combobox').props['aria-invalid'],true);
  assert.equal(view.role('combobox').props['aria-describedby'],view.rendered.root.findByType('small').props.id);
  assert.equal(view.rendered.root.findByProps({type:'hidden'}).props.value,'');
  assert.equal(view.rendered.root.findAllByType('select').length,0);
 }finally{view.dispose();}
});

test('single select emits injected option value without mutating controlled selection',()=>{
 const changes=[];const view=mount({label:'공개 범위',options,value:'c',onChange:value=>changes.push(value)});
 try{
  view.open();
  act(()=>view.rendered.root.findAllByProps({role:'option'})[0].props.onClick());
  assert.deepEqual(changes,['']);
  assert.equal(view.rendered.root.findByProps({className:'value '}).children[0],'코럴 C');
  assert.equal(view.role('combobox').props['aria-expanded'],false);
  assert.equal(view.nodes.trigger.focusCount,1);
 }finally{view.dispose();}
});

test('filtered select-all toggles only enabled matching values and preserves other selections',()=>{
 const changes=[];const props={label:'카테고리',options:options.slice(1),multiple:true,searchable:true,selectAll:true,value:['c','b'],onChange:value=>changes.push(value)};
 const view=mount(props);
 try{
  view.open();
  act(()=>view.role('searchbox').props.onChange({target:{value:'블루'}}));
  act(()=>view.rendered.root.findByProps({className:'selectAll'}).props.onClick());
  assert.deepEqual(changes[0],['c','b','a','d']);
  view.update({...props,value:changes[0]});
  act(()=>view.rendered.root.findByProps({className:'selectAll'}).props.onClick());
  assert.deepEqual(changes[1],['c','b']);
  act(()=>view.rendered.root.findByProps({'aria-disabled':true,role:'option'}).props.onClick());
  assert.equal(changes.length,2);
  act(()=>view.role('searchbox').props.onChange({target:{value:'없음'}}));
  assert.equal(view.role('status').children[0],'검색 결과가 없습니다.');
  assert.equal(view.rendered.root.findByProps({className:'selectAll'}).props.disabled,true);
 }finally{view.dispose();}
});

test('keyboard navigation skips disabled options and selection closes with focus restored',()=>{
 const changes=[];const view=mount({label:'정렬',options,value:'a',onChange:value=>changes.push(value)});
 try{
  key(view,'ArrowDown');
  key(view,'ArrowDown');
  const id=view.role('combobox').props['aria-activedescendant'];
  assert.equal(view.rendered.root.findByProps({id,role:'option'}).children.at(-1).children[0],'코럴 C');
  key(view,'End');key(view,'Enter');
  assert.deepEqual(changes,['d']);
  assert.equal(view.role('combobox').props['aria-expanded'],false);
  key(view,'Home');key(view,' ');
  assert.deepEqual(changes,['d','']);
 }finally{view.dispose();}
});

test('Escape stays inside the parent dialog, Tab reaches popup actions, and focus/pointer can exit',()=>{
 const view=mount({label:'멤버십',options,value:['a'],multiple:true,searchable:true,selectAll:true,onChange(){}});
 try{
  view.open();
  const escape=key(view,'Escape',view.nodes.search);
  assert.equal(escape.prevented,true);assert.equal(escape.stopped,true);
  assert.equal(view.role('combobox').props['aria-expanded'],false);
  view.open();
  const tab=key(view,'Tab',view.nodes.search);
  assert.equal(tab.prevented,false);
  assert.equal(view.role('combobox').props['aria-expanded'],true);
  const all=view.rendered.root.findByProps({className:'selectAll'});
  assert.notEqual(all.props.tabIndex,-1);
  assert.equal(all.props.disabled,false);
  assert.notEqual(view.rendered.root.findByProps({'aria-label':'선택 목록 닫기'}).props.tabIndex,-1);
  act(()=>view.rendered.root.findByProps({'data-select':'root'}).props.onBlur({relatedTarget:{inside:'root'}}));
  assert.equal(view.role('combobox').props['aria-expanded'],true);
  act(()=>view.rendered.root.findByProps({'data-select':'root'}).props.onBlur({relatedTarget:{inside:'elsewhere'}}));
  assert.equal(view.role('combobox').props['aria-expanded'],false);
  view.open();
  act(()=>view.listeners.get('pointerdown')({target:{inside:'elsewhere'}}));
  assert.equal(view.role('combobox').props['aria-expanded'],false);
 }finally{view.dispose();}
});

test('disabled/read-only selects cannot open or emit values',()=>{
 for(const state of [{disabled:true},{readOnly:true}]){
  const changes=[];const view=mount({label:'상태',options,value:'a',onChange:value=>changes.push(value),...state});
  try{view.open();key(view,'Enter');assert.equal(view.role('combobox').props['aria-expanded'],false);assert.deepEqual(changes,[]);}finally{view.dispose();}
 }
});

test('popup enters the top layer, stays within viewport, and remains for its exit animation',async()=>{
 const view=mount({label:'목록',options,value:'a',onChange(){}});
 try{
  view.open();
  const menu=view.rendered.root.findByProps({'data-select':'popup'});
  assert.equal(view.nodes.popup.popoverShown,true);
  assert.equal(menu.props.popover,'manual');
  assert.ok(menu.props.style.left>=8);
  assert.ok(menu.props.style.left+menu.props.style.width<=367);
  assert.ok(menu.props.style.top+menu.props.style.maxHeight<=850);
  key(view,'Escape');
  assert.equal(view.rendered.root.findByProps({'data-select':'popup'}).props['data-open'],false);
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,145));});
  assert.equal(view.rendered.root.findAllByProps({'data-select':'popup'}).length,0);
 }finally{view.dispose();}
});
