const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {PostViews}=loadTypeScript('components/crefans/PostViews.tsx');
function render(count){let tree;act(()=>{tree=create(React.createElement(PostViews,{count}));});return tree;}
test('views distinguish measured zero from missing or invalid data',()=>{
 for(const count of [undefined,null,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){const tree=render(count);assert.equal(tree.toJSON(),null);act(()=>tree.unmount());}
 const tree=render(0);assert.equal(tree.root.findByProps({'data-post-views':0}).props['aria-label'],'조회수 0회');act(()=>tree.unmount());
});
test('view counts compact large values while preserving the exact accessible total',()=>{
 for(const [count,label]of [[1842,'1,842'],[24831,'2.5만'],[123456789,'1.2억']]){
  const tree=render(count),root=tree.root.findByProps({'data-post-views':count});assert.equal(root.props.title,`조회수 ${count.toLocaleString('ko-KR')}회`);assert.equal(root.props['aria-label'],root.props.title);assert.equal(root.findAllByType('span').at(-1).children[0],label);assert.equal(tree.root.findAllByType('button').length,0);act(()=>tree.unmount());
 }
});
test('the existing eye icon is decorative and needs no image asset',()=>{
 const tree=render(9),icon=tree.root.findByType('svg');assert.equal(icon.props.viewBox,'0 0 24 24');assert.equal(icon.props['aria-hidden'],'true');assert.equal(icon.findByType('circle').props.r,'3');assert.equal(tree.root.findAllByType('img').length,0);act(()=>tree.unmount());
});
