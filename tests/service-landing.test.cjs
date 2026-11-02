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
test('landing defaults to fictional creator assets with disclosure and preview destinations',()=>{
 const {tree,View}=render();let props=tree.root.findByType(View).props;
 assert.deepEqual(props.content,assets);
 assert.equal(props.creatorBasePath,'/preview');
 assert.equal(props.model.basePath,'/service');
 assert.equal(props.content.creatorDisclosure,'이 서비스 소개에 표시된 크리에이터는 가상의 인물입니다.');
});
test('one false flag uses live creators and actions while retaining introduction assets',()=>{
 const {tree,View,model}=render('false'),props=tree.root.findByType(View).props;
 assert.equal(props.model,model);assert.equal(props.creatorBasePath,'/service');
 assert.equal(props.content.creatorDisclosure,undefined,'real creators must not be described as fictional');
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
  'next/link':{__esModule:true,default:({children,...props})=>React.createElement('a',props,children)},
  '@/components/ui/InfoTooltip':{InfoTooltip:()=>null},
  '@/components/ui/TextLink':{TextLink:()=>null},
 }).default;
 for(const creatorBasePath of ['/preview',undefined]){
  pushed.length=0;
  let tree;act(()=>{tree=create(React.createElement(LandingPage,{model:{basePath:'/service',following:[],toggleFollow(){}},content:assets,creatorBasePath}));});
  act(()=>tree.root.findByProps({'aria-label':'크리에이터 검색'}).props.onChange({target:{value:' 모카 '}}));
  act(()=>tree.root.findByProps({role:'search'}).props.onSubmit({preventDefault(){}}));
  const prefix=creatorBasePath??'/service';
  assert.deepEqual(pushed,[`${prefix}/explore?q=${encodeURIComponent('모카')}`]);
  const hrefs=tree.root.findAllByType('a').map(link=>link.props.href);
  assert.ok(hrefs.includes(`${prefix}/explore`));
  for(const creator of assets.creators)assert.ok(hrefs.includes(`${prefix}/creator/${creator.id}`));
  act(()=>tree.unmount());
 }
});
