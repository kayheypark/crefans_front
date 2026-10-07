const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const assets=loadTypeScript('lib/content/landing.ts').landingAssetContent;
function render(flag){
 const previous=process.env.NEXT_PUBLIC_LANDING_USE_ASSETS;
 if(flag===undefined)delete process.env.NEXT_PUBLIC_LANDING_USE_ASSETS;else process.env.NEXT_PUBLIC_LANDING_USE_ASSETS=flag;
 const model={basePath:'/service',following:['live-0'],toggleFollow(){throw Error('asset actions must not call the live model');},data:{creators:Array.from({length:8},(_,i)=>({...assets.creators[0],id:`live-${i}`,name:`실제 ${i}`,promoted:i<7}))}};
 const View=()=>null;
 try{const Landing=loadTypeScript('components/service/Landing.tsx',{'./ServiceProvider':{useService:()=>({model})},'@/components/crefans/LandingPage':{__esModule:true,default:View}}).default;let tree;act(()=>{tree=create(React.createElement(Landing));});return{tree,View,model};}
 finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_LANDING_USE_ASSETS;else process.env.NEXT_PUBLIC_LANDING_USE_ASSETS=previous;}
}
test('landing defaults to shared preview assets and sample follows stay local',()=>{
 const {tree,View}=render();let props=tree.root.findByType(View).props;
 assert.deepEqual(props.content,assets);
 assert.equal(props.creatorBasePath,'/preview');
 assert.equal(props.model.basePath,'/service');
 act(()=>props.model.toggleFollow('haneul'));
 props=tree.root.findByType(View).props;assert.deepEqual(props.model.following,['haneul']);
 act(()=>props.model.toggleFollow('haneul'));assert.deepEqual(tree.root.findByType(View).props.model.following,[]);
});
test('one false flag uses live creators and actions while retaining introduction assets',()=>{
 const {tree,View,model}=render('false'),props=tree.root.findByType(View).props;
 assert.equal(props.model,model);assert.equal(props.creatorBasePath,'/service');
 assert.deepEqual(props.content.hero,assets.hero);assert.deepEqual(props.content.steps,assets.steps);
 assert.deepEqual(props.content.creators.map(c=>c.id),['live-0','live-1','live-2','live-3','live-4']);
 assert.equal(props.content.collage.length,4);assert.ok(props.content.collage.every(c=>c.id.startsWith('live-')));
});
