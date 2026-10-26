const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {CreatorName}=loadTypeScript('components/crefans/CreatorName.tsx');
test('only an explicit verified creator flag renders the named badge beside the nickname',()=>{
 for(const isVerified of [undefined,false,null,'true',1]){
  const view=create(React.createElement(CreatorName,{person:{name:'미인증',isVerified}}));
  assert.equal(view.root.findAllByType('img').length,0);view.unmount();
 }
 const view=create(React.createElement(CreatorName,{person:{name:'인증 작가',isVerified:true}}));
 const icon=view.root.findByType('img');assert.equal(icon.props.alt,'인증 크리에이터');
 assert.ok(icon.props.src.includes('verified-creator-v1.png'));
 assert.equal(view.root.findByProps({'data-marquee':true}).props.title,'인증 작가');view.unmount();
});
test('featured placement and creator status alone never grant a verification badge',()=>{
 for(const person of [{name:'광고',promoted:true},{name:'크리에이터',isCreator:true},{name:'PASS',identityVerified:true}]){
  const view=create(React.createElement(CreatorName,{person}));assert.equal(view.root.findAllByType('img').length,0);view.unmount();
 }
});
