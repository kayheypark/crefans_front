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

test('landing search and browse stay in the same data source as creator cards',()=>{
 const pushed=[],styles=new Proxy({},{get:(_,key)=>String(key)});
 const LandingPage=loadTypeScript('components/crefans/LandingPage.tsx',{
  'next/navigation':{useRouter:()=>({push:url=>pushed.push(url)})},
  './landing.module.css':styles,'./Brand':{Brand:()=>null},
  './Icon':{__esModule:true,default:()=>null},
  '@/components/ui/Primitives':{Dialog:()=>null},
  '@/components/ui/TextLink':{TextLink:()=>null},
 }).default;
 for(const creatorBasePath of ['/preview',undefined]){
  pushed.length=0;
  let tree;act(()=>{tree=create(React.createElement(LandingPage,{model:{basePath:'/service',following:[],toggleFollow(){}},content:assets,creatorBasePath}));});
  act(()=>tree.root.findByProps({'aria-label':'크리에이터 검색'}).props.onChange({target:{value:' 모카 '}}));
  act(()=>tree.root.findByProps({role:'search'}).props.onSubmit({preventDefault(){}}));
  act(()=>tree.root.findAllByType('button').find(button=>button.children.includes('더보기 ')).props.onClick());
  const prefix=creatorBasePath??'/service';
  assert.deepEqual(pushed,[`${prefix}/explore?q=${encodeURIComponent('모카')}`,`${prefix}/explore`]);
  act(()=>tree.unmount());
 }
});
