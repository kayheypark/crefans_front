const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {SensitivePhoto}=loadTypeScript('components/crefans/SensitivePhoto.tsx');
global.IS_REACT_ACT_ENVIRONMENT=true;
test('revealing a sensitive photo is explicit and does not reveal another photo',async()=>{
 const photo=url=>React.createElement(SensitivePhoto,{url},React.createElement('img',{src:url,alt:'revealed'}));
 let tree;
 await act(async()=>{tree=create(photo('/a'));});
 assert.equal(tree.root.findAllByProps({alt:'revealed'}).length,0);
 await act(async()=>tree.root.findByType('button').props.onClick({stopPropagation(){}}));
 assert.equal(tree.root.findByProps({alt:'revealed'}).props.src,'/a');
 await act(async()=>tree.update(photo('/b')));
 assert.equal(tree.root.findAllByProps({alt:'revealed'}).length,0);
 await act(async()=>tree.unmount());
});
