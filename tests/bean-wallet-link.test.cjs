const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// Loading rule (/ux-spinner 2026-11-01): the profile wallet button stays blank for 1s, then a small spinner; the response decides balance or '내 지갑'.
const {BeanContext}=loadTypeScript('components/crefans/BeanContext.tsx');
const {BeanWalletLink}=loadTypeScript('components/crefans/BeanPages.tsx',{'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'next/image':({sizes,draggable,...props})=>React.createElement('img',props),'./BeanContext':{useBeans:()=>React.useContext(BeanContext),BeanContext}});
const base={enabled:true,signedIn:true,basePath:'/service',loading:true,wallet:null,error:'',refresh:async()=>{}};
const mount=model=>{let tree;act(()=>{tree=create(React.createElement(BeanContext.Provider,{value:model},React.createElement(BeanWalletLink,{basePath:'/service',className:'wallet'})))});return tree;};
const label=tree=>tree.root.findByType('a').findByType('span');
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const spinner=tree=>tree.root.findAll(n=>n.props?.role==='status').length;
test('before the first response: blank, spinner after 1s, then the balance',t=>{
 t.mock.timers.enable({apis:['setTimeout']});const tree=mount(base);
 try{
  assert.equal(text(label(tree)),'');assert.equal(spinner(tree),0);
  act(()=>t.mock.timers.tick(999));assert.equal(spinner(tree),0);assert.doesNotMatch(text(tree.toJSON()),/내 지갑/);
  act(()=>t.mock.timers.tick(1));assert.equal(spinner(tree),1);
  act(()=>tree.update(React.createElement(BeanContext.Provider,{value:{...base,loading:false,wallet:{spendableBeans:1200,accounts:[]}}},React.createElement(BeanWalletLink,{basePath:'/service',className:'wallet'}))));
  assert.equal(spinner(tree),0);assert.equal(text(label(tree)),'1,200콩');
 }finally{act(()=>tree.unmount());}
});
test('a failed response shows the plain label; a refresh keeps the previous balance',()=>{
 let tree=mount({...base,loading:false,error:'조회 실패'});try{assert.equal(text(label(tree)),'내 지갑');}finally{act(()=>tree.unmount());}
 tree=mount({...base,loading:true,wallet:{spendableBeans:50,accounts:[]}});try{assert.equal(text(label(tree)),'50콩');assert.equal(spinner(tree),0);}finally{act(()=>tree.unmount());}
});
