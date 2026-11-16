// 2026-11-16 user request: AI photo editing landing at /service/landing-ai-image-generation, built from the service catalog.
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const page=loadTypeScript('components/service/AiPhotoLanding.tsx',{'./ai-photo-landing.module.css':{__esModule:true,default:styles},'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),'@/components/crefans/Brand':{Brand:()=>React.createElement('span',null,'crefans')}});
const text=node=>JSON.stringify(node.toJSON());
test('landing uses catalog costumes without game/anime characters or revealing outfits, and every CTA opens the real trial',()=>{
 assert.deepEqual(page.landingCostumes.map(item=>item.category),['general','general','general','general','general']);
 assert.ok(!page.landingCostumes.some(item=>/비치|오프숄더|치어/.test(item.name)));assert.ok(!page.landingKinds.some(item=>item.value==='body'));
 let tree;act(()=>{tree=create(React.createElement(page.default));});
 try{
  const links=tree.root.findAllByType('a').map(a=>a.props.href);assert.ok(links.filter(href=>href==='/service/try').length>=3);
  assert.match(text(tree),/가상 인물 · AI 생성 이미지/);assert.match(text(tree),/로그인 없이 무료 체험/);
  const radio=tree.root.findAll(node=>node.props.role==='radio').find(node=>node.findByType('span').props.children==='사이버 슈트');act(()=>radio.props.onClick());
  assert.ok(tree.root.findAll(node=>node.type==='img'&&/사이버 슈트 결과/.test(node.props.alt||'')).length===1,'choosing a look swaps the result image');
  const tab=tree.root.findAll(node=>node.props.role==='tab').find(node=>node.findByType('span').props.children==='포즈');act(()=>tab.props.onClick());
  assert.match(text(tree),/손인사/,'the pose tab lists the real preset names');
  const range=tree.root.find(node=>node.type==='input'&&node.props.type==='range');act(()=>range.props.onChange({target:{value:'20'}}));
  assert.ok(tree.root.findAll(node=>node.props.style?.clipPath==='inset(0 0 0 20%)').length===1,'the compare slider moves the split');
 }finally{act(()=>tree.unmount());}
});
