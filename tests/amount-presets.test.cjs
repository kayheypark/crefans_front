const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const h=React.createElement;
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {AmountPresets}=loadTypeScript('components/ui/AmountPresets.tsx',{
  './amount-presets.module.css':styles,
  './Primitives':{Button:({tone,children,...props})=>h('button',props,children)},
});
const {krwAmountPresets}=loadTypeScript('lib/design/amount-presets.ts');
const label=node=>node.children.filter(child=>typeof child==='string').join('');
function setup(props={}){
  const changes=[];let tree;
  const initial={value:'',onChange:value=>changes.push(value),availableAmount:1151900,presets:krwAmountPresets,...props};
  act(()=>{tree=create(h(AmountPresets,initial));});
  return {tree,changes,click:text=>act(()=>tree.root.findAllByType('button').find(button=>label(button)===text).props.onClick()),update:patch=>act(()=>tree.update(h(AmountPresets,{...initial,...patch}))),close:()=>act(()=>tree.unmount())};
}

test('preset controls only add to the injected value and do not own the amount',()=>{
  const page=setup({value:'20000'});
  page.click('+ 1만');
  assert.deepEqual(page.changes,['30000']);
  page.click('+ 1만');
  assert.equal(page.changes.at(-1),'30000');
  page.update({value:'30000'});
  page.click('+ 1만');
  assert.equal(page.changes.at(-1),'40000');
  assert.equal(page.tree.root.findAllByType('button').length,7);
  assert.equal(page.tree.root.findAllByType('button').some(button=>button.props['aria-pressed']!==undefined||label(button).includes('빼기')),false);
  page.close();
});

test('amount additions clamp to available funds without unsafe integer arithmetic',()=>{
  const page=setup({value:'1145000'});
  page.click('+ 100만');assert.equal(page.changes.at(-1),'1151900');
  page.update({value:'5000'});page.click('+ 1만');
  assert.equal(page.changes.at(-1),'15000');
  page.update({value:String(Number.MAX_SAFE_INTEGER),availableAmount:Number.MAX_SAFE_INTEGER});
  page.click('+ 100만');
  assert.equal(page.changes.at(-1),String(Number.MAX_SAFE_INTEGER));
  page.close();
});

test('all funds selects the entire available balance and reset clears the injected value',()=>{
  const page=setup({value:'50000'});
  page.click('전액');
  assert.equal(page.changes.at(-1),'1151900');
  page.click('초기화');assert.equal(page.changes.at(-1),'');
  assert.equal(page.tree.root.findAllByProps({'aria-label':'금액 증감 방식'}).length,0);
  page.close();
});

test('empty amounts start at zero, zero balances remain zero, and invalid entries can be reset',()=>{
  const page=setup();page.click('+ 5만');assert.equal(page.changes.at(-1),'50000');
  page.update({value:'',availableAmount:0});page.click('+ 1만');assert.equal(page.changes.at(-1),'0');
  page.update({value:'12.5'});
  assert.ok(page.tree.root.findAllByType('button').filter(button=>button.props['aria-label']).every(button=>button.props.disabled));
  const count=page.changes.length;page.click('+ 1만');assert.equal(page.changes.length,count);
  page.click('전액');assert.equal(page.changes.at(-1),'1151900');
  page.click('초기화');assert.equal(page.changes.at(-1),'');
  page.close();
});

test('disabled controls emit no amount changes and never submit the surrounding form',()=>{
  const page=setup({disabled:true,value:'40000'});
  assert.ok(page.tree.root.findAllByType('button').every(button=>button.props.disabled&&button.props.type==='button'));
  page.click('+ 1만');page.click('전액');page.click('초기화');
  assert.deepEqual(page.changes,[]);
  page.close();
});

test('the component renders only injected denominations and blocks unusable balance values',()=>{
  const page=setup({presets:[{label:'2만',amount:20000}],availableAmount:NaN});
  assert.equal(page.tree.root.findAllByType('button').filter(button=>button.props['aria-label']).length,1);
  page.click('+ 2만');page.click('전액');assert.deepEqual(page.changes,[]);
  page.close();
});
