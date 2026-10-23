const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const {ChipRow}=loadTypeScript('components/ui/ChipRow.tsx',{'./chip-row.module.css':styles});
const h=React.createElement;
function mount(){
  const node={scrollLeft:0};
  let tree;act(()=>{tree=create(h(ChipRow,{label:'분야',className:'extra'},[h('button',{key:'a'},'전체'),h('button',{key:'b'},'음악')]),{createNodeMock:()=>node});});
  return {tree,node,row:tree.root.findByProps({role:'group'})};
}
test('renders children in a labelled group and keeps extra classes',()=>{
  const {row,tree}=mount();
  assert.equal(row.props['aria-label'],'분야');assert.equal(row.props.className,'row extra');
  assert.equal(tree.root.findAllByType('button').length,2);
});
test('mouse drag scrolls sideways and swallows the click that ends it; a plain click passes through',()=>{
  const {row,node}=mount();
  act(()=>row.props.onPointerDown({pointerType:'mouse',button:0,clientX:100}));
  act(()=>row.props.onPointerMove({clientX:98}));
  assert.equal(node.scrollLeft,0,'tiny movements are not drags');
  act(()=>row.props.onPointerMove({clientX:40}));
  assert.equal(node.scrollLeft,60);
  act(()=>row.props.onPointerUp());
  let prevented=0;
  act(()=>row.props.onClickCapture({preventDefault(){prevented++;},stopPropagation(){}}));
  assert.equal(prevented,1,'the click after a drag is suppressed');
  act(()=>row.props.onPointerDown({pointerType:'mouse',button:0,clientX:10}));
  act(()=>row.props.onPointerUp());
  act(()=>row.props.onClickCapture({preventDefault(){prevented++;},stopPropagation(){}}));
  assert.equal(prevented,1,'a click without movement is not suppressed');
  act(()=>row.props.onPointerDown({pointerType:'touch',button:0,clientX:10}));
  act(()=>row.props.onPointerMove({clientX:300}));
  assert.equal(node.scrollLeft,60,'touch scrolls natively; the drag handler ignores it');
});
