const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
let beanModel;
const {TipButton}=loadTypeScript('components/crefans/BeanPages.tsx',{
 './BeanContext':{useBeans:()=>beanModel},
 'next/image':({unoptimized,priority,...props})=>React.createElement('img',props),
 '@/components/ui/Primitives':{Dialog:()=>null},
});
const post={id:'sample-post',creatorId:'creator',supporterCount:7,tipsEnabled:true,requiredRank:0};
const props={post,postId:post.id,creatorId:'creator',name:'작성자'};
const coin='/brand/post-actions/support-coin-flat-v1.png';
function check(model,input,verify){beanModel=model;let view;act(()=>{view=create(React.createElement(TipButton,input));});try{verify(view.root);}finally{act(()=>view.unmount());}}
function base(patch={}){return{enabled:true,ownCreatorIds:[],signedIn:true,...patch};}
function image(root){assert.equal(root.findAllByType('img').filter(n=>n.props.src===coin).length,1);}
test('own post keeps coin and supporter count without a donation action',()=>{
 check(base({ownCreatorIds:['creator'],postSupporterCounts:{[post.id]:12}}),props,root=>{image(root);assert.equal(root.findAllByType('button').length,0);assert.match(root.findByProps({'data-post-support-count':true}).props['aria-label'],/12명/);});
});
test('studio read-only preview and unbound catalog keep noninteractive coin with supplied count',()=>{
 for(const model of [null,base({ownCreatorIds:['creator']})])check(model,{...props,disabled:true},root=>{image(root);assert.equal(root.findAllByType('button').length,0);assert.match(root.findByProps({'data-post-support-count':true}).props['aria-label'],/7명/);});
 check(null,props,root=>{image(root);assert.equal(root.findAllByType('button').length,0);});
});
test('public, members-only and signed-out eligible cards retain the donation button',()=>{
 for(const rank of [0,2])for(const signedIn of [true,false])check(base({signedIn}),{...props,post:{...post,requiredRank:rank}},root=>{image(root);assert.equal(root.findAllByType('button').length,1);assert.match(root.findByType('button').props['aria-label'],/7명/);});
});
test('disabled tipping and feature flag remain hidden, own profile cannot tip itself',()=>{
 for(const model of [null,base()])check(model,{...props,post:{...post,tipsEnabled:false},disabled:true},root=>assert.equal(root.findAllByType('img').length,0));
 for(const disabled of [false,true])check(base({enabled:false}),{...props,disabled},root=>assert.equal(root.findAllByType('img').length,0));
 check(base({ownCreatorIds:['creator']}),{creatorId:'creator',name:'작성자',profile:true},root=>assert.equal(root.findAllByType('button').length,0));
});
