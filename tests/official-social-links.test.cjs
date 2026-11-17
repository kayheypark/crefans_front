// 2026-11-17 user request: official X·Instagram·Discord links at the bottom of the service footer (and the PC sidebar).
const test=require('node:test');const assert=require('node:assert/strict');const React=require('react');const {create,act}=require('react-test-renderer');const {loadTypeScript}=require('./load-typescript.cjs');
test('footer ends with the three official account links, opened safely in a new tab',()=>{
 const {ServiceFooter}=loadTypeScript('components/crefans/ServiceFooter.tsx',{'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children)});
 let tree;act(()=>{tree=create(React.createElement(ServiceFooter,{basePath:'/service',always:true,business:true}));});
 try{
  const list=tree.root.find(node=>node.props['aria-label']==='크레팬스 공식 계정');
  const links=list.findAllByType('a').map(a=>[a.props.href,a.props.target,a.props.rel,a.props['aria-label']]);
  assert.deepEqual(links,[['https://x.com/crefans_app','_blank','noopener noreferrer','크레팬스 X'],['https://www.instagram.com/crefans.official','_blank','noopener noreferrer','크레팬스 인스타그램'],['https://discord.gg/DupBW53n6','_blank','noopener noreferrer','크레팬스 디스코드']]);
  const json=tree.toJSON();assert.equal(json.type,'footer');assert.equal(json.children.at(-1).type,'ul','social links sit at the bottom of the footer');assert.equal(json.children.at(-1).props['aria-label'],'크레팬스 공식 계정');
 }finally{act(()=>tree.unmount());}
});
