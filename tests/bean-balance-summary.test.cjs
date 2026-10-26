const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {BeanBalanceSummary}=loadTypeScript('components/crefans/BeanBalanceSummary.tsx');
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const wallet={accounts:[{bucket:'purchased',balance:'100'},{bucket:'promotion',balance:'20'},{bucket:'earned-paid',balance:'300'},{bucket:'earned-promotion',balance:'50'},{bucket:'reserved-paid',balance:'60'}],spendableBeans:90,spendableBreakdown:{purchased:80,promotion:10},withdrawableBeans:0,withdrawableBreakdown:{paid:0,promotion:0}};
function mount(props){let tree;act(()=>tree=create(React.createElement(BeanBalanceSummary,props)));return tree;}
test('only two main totals; authoritative zero excludes held income and shows paid/promotion eligibility separately',()=>{
 const tree=mount({wallet});try{const totals=tree.root.findAllByType('dd').map(text);assert.deepEqual(totals,['90콩','0콩']);assert.deepEqual(tree.root.findAllByType('dt').map(text),['사용 가능한 콩','출금 가능한 콩']);const panel=tree.root.findByProps({role:'region'});assert.equal(panel.props['aria-hidden'],undefined);act(()=>tree.root.findByType('button').props.onClick());assert.equal(tree.root.findByProps({role:'region'}).props['aria-hidden'],true);const all=text(tree.toJSON());assert.match(all,/일반콩80콩프로모션콩10콩/);assert.match(all,/사용 보류 콩30콩/);assert.match(all,/출금 제외 후원콩350콩/);assert.match(all,/일반 후원콩0콩프로모션 후원콩0콩/);assert.match(all,/출금 처리 중인 콩60콩/);}finally{act(()=>tree.unmount());}
});
test('missing totals are unknown rather than derived from raw accounts; studio uses its available total',()=>{
 for(const props of [{wallet:{accounts:wallet.accounts}},{wallet,withdrawableBeans:40}]){const tree=mount(props);try{assert.deepEqual(tree.root.findAllByType('dd').map(text),props.withdrawableBeans?['90콩','40콩']:['확인할 수 없습니다','확인할 수 없습니다']);}finally{act(()=>tree.unmount());}}
});
test('loading does not show fabricated zero balances',()=>{const tree=mount({wallet:null,loading:true});try{assert.deepEqual(tree.root.findAllByType('dd').map(text),['불러오는 중…','불러오는 중…']);}finally{act(()=>tree.unmount());}});

test('promotional income is included only in server-provided eligibility, not direct promotional grants',()=>{
 const tree=mount({wallet:{...wallet,withdrawableBeans:330,withdrawableBreakdown:{paid:280,promotion:50}}});try{const all=text(tree.toJSON());assert.deepEqual(tree.root.findAllByType('dd').map(text),['90콩','330콩']);assert.match(all,/일반 후원콩280콩프로모션 후원콩50콩/);assert.match(all,/출금 제외 후원콩20콩/);}finally{act(()=>tree.unmount());}
});
