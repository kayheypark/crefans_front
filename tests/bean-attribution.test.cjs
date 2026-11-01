const {test}=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {BeanTipSource,BeanPayoutSource}=loadTypeScript('components/crefans/BeanAttribution.tsx',{'next/link':({children,...props})=>React.createElement('a',props,children)});
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='string'?n:(n?.children||[]).map(text).join('');
test('post title and link, profile source and unavailable legacy titles remain distinct',()=>{
 for(const [tip,expected,links] of [[{sourceType:'profile'},/프로필 후원/,0],[{post_id:'post/1',postTitle:'촬영 비하인드',postAvailable:true},/게시물 후원촬영 비하인드/,1],[{post_id:'old',postTitle:'현재 제목',postTitleSource:'current',postAvailable:true},/후원 당시 제목 미기록/,1],[{post_id:'removed',postTitle:'당시 제목',postAvailable:false},/당시 제목현재 열 수 없는 게시물/,0],[{post_id:'gone',postAvailable:false},/게시물 정보 없음/,0]]){
  let tree;act(()=>tree=create(React.createElement(BeanTipSource,{tip,basePath:'/service'})));
  assert.match(text(tree.toJSON()),expected);assert.equal(tree.root.findAllByType('a').length,links);if(tip.post_id==='post/1')assert.equal(tree.root.findByType('a').props.href,'/service/post/post%2F1');act(()=>tree.unmount());
 }
});
test('payout source quantities and unknown portions are explicit, never represented as a profile donation',()=>{
 let tree;act(()=>tree=create(React.createElement(BeanPayoutSource,{sources:{postQuantity:1000,profileQuantity:200,unattributedQuantity:5}})));
 assert.match(text(tree.toJSON()),/게시물 1,000콩 · 프로필 200콩 · 확인 필요 5콩/);act(()=>tree.update(React.createElement(BeanPayoutSource,{})));assert.match(text(tree.toJSON()),/후원 출처: 확인 필요/);act(()=>tree.unmount());
});

test('payout type distinguishes company-funded promotion from paid beans',()=>{let tree;act(()=>tree=create(React.createElement(BeanPayoutSource,{funding:{paidQuantity:600,promotionQuantity:400,unknownQuantity:0}})));assert.match(text(tree.toJSON()),/콩 종류: 일반 600콩 · 프로모션 400콩/);act(()=>tree.unmount());});
