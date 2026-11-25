const {test}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {SensitivePhoto,SensitiveRoomConsent}=loadTypeScript('components/crefans/SensitivePhoto.tsx');
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

test('room consent reveals photos only inside its provider',async()=>{
 const photo=()=>React.createElement(SensitivePhoto,{url:'/a'},React.createElement('img',{alt:'visible'}));
 let tree;
 await act(async()=>{tree=create(React.createElement(React.Fragment,null,photo(),React.createElement(SensitiveRoomConsent.Provider,{value:true},photo())));});
 assert.equal(tree.root.findAllByProps({alt:'visible'}).length,1);
 assert.equal(tree.root.findAllByType('button').length,1);
 await act(async()=>tree.unmount());
});
