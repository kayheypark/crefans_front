const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const context=React.createContext({});
const {CommentLikeButton}=loadTypeScript('components/crefans/CommentLikeButton.tsx',{'./CommentMention':{CommentContext:context},'./Icon':props=>React.createElement('svg',props)});
const comment={id:'comment-1',author:{name:'팬',image:''},body:'댓글',time:'방금',likes:2,liked:false};
const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
async function mount(onLike,props={}){let tree;await act(async()=>{tree=create(React.createElement(context.Provider,{value:{onLike}},React.createElement(CommentLikeButton,{comment,onLike,...props})));});return tree;}

test('comment like waits for server, prevents double-submit, toggles with exact state and keeps count on failure',async()=>{
 let finish;const calls=[],tree=await mount((...args)=>{calls.push(args);return new Promise(resolve=>{finish=resolve;});});const button=()=>tree.root.findByType('button');
 await act(async()=>{button().props.onClick();button().props.onClick();});assert.equal(calls.length,1);assert.deepEqual(calls[0],['comment-1',true]);assert.equal(button().props['aria-pressed'],false);assert.match(text(button()),/2/);assert.equal(button().props.disabled,true);
 await act(async()=>finish({success:true,data:{liked:true,likes:3},errorMessage:null,errorCode:null}));assert.equal(button().props['aria-pressed'],true);assert.match(text(button()),/3/);
 await act(async()=>button().props.onClick());assert.deepEqual(calls[1],['comment-1',false]);
 await act(async()=>finish({success:false,data:null,errorMessage:'권한이 변경됐어요.',errorCode:'ACCESS_DENIED'}));assert.equal(button().props['aria-pressed'],true);assert.match(text(button()),/3/);assert.match(text(tree.toJSON()),/권한이 변경됐어요/);
 await act(async()=>button().props.onClick());await act(async()=>finish({success:true,data:{liked:false,likes:2},errorMessage:null,errorCode:null}));assert.equal(button().props['aria-pressed'],false);assert.match(text(button()),/2/);
 await act(async()=>tree.unmount());
});

test('comment like read-only or missing action is inert and request exceptions do not fake success',async()=>{
 for(const props of [{readOnly:true},{}]){let calls=0;const tree=await mount(props.readOnly?async()=>{calls++;}:undefined,props);assert.equal(tree.root.findByType('button').props.disabled,true);await act(async()=>tree.root.findByType('button').props.onClick());assert.equal(calls,0);await act(async()=>tree.unmount());}
 const tree=await mount(async()=>{throw Error('network');});await act(async()=>tree.root.findByType('button').props.onClick());assert.equal(tree.root.findByType('button').props['aria-pressed'],false);assert.match(text(tree.toJSON()),/저장하지 못했어요/);await act(async()=>tree.unmount());
});
