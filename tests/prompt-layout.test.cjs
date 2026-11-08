const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const mocks={'next/image':props=>el('img',{src:props.src,alt:props.alt}),'next/link':({children,href,onClick,className})=>el('a',{href,onClick,className},children),'./useCurrentLoginHref':{useCurrentLoginHref:base=>base+'/login?next=x'},'./ServiceFooter':{ServiceFooter:()=>el('footer',null,'footer')}};
const {PromptLayout}=loadTypeScript('components/crefans/PromptLayout.tsx',mocks);
const {SignInPrompt}=loadTypeScript('components/crefans/SignInPrompt.tsx',mocks);
const text=node=>typeof node==='string'?node:(node?.children||[]).map(text).join('');

test('PromptLayout: illustration, heading by variant, description and given actions',()=>{
 let r;act(()=>{r=create(el(PromptLayout,{icon:'/brand/x.png',title:'제목',description:'설명',variant:'dialog',actions:el('button',null,'확인')}));});
 assert.equal(r.root.findByType('img').props.src,'/brand/x.png');assert.equal(r.root.findByType('h3').children[0],'제목');
 assert.match(text(r.toJSON()),/설명/);assert.equal(r.root.findAllByType('button').length,1);assert.equal(r.root.findAllByType('footer').length,0);
 act(()=>{r.update(el(PromptLayout,{icon:'/i.png',title:'페이지',description:'d',actions:null,footer:el('footer',null,'f')}));});
 assert.equal(r.root.findAllByType('h1').length,1);assert.equal(r.root.findAllByType('footer').length,1);
});

test('SignInPrompt keeps its layout; in a titled dialog the heading can be hidden and links close the dialog',()=>{
 let r,closed=0;act(()=>{r=create(el(SignInPrompt,{basePath:'/service'}));});
 assert.equal(r.root.findByType('h1').children[0],'로그인이 필요해요');assert.equal(r.root.findAllByType('footer').length,1);
 assert.deepEqual(r.root.findAllByType('a').map(a=>[text(a),a.props.href]),[['로그인','/service/login?next=x'],['회원가입','/service/signup']]);
 act(()=>{r.update(el(SignInPrompt,{basePath:'/service',variant:'dialog',hideTitle:true,description:'팔로우하려면 로그인',onNavigate:()=>closed++}));});
 assert.equal(r.root.findAll(n=>['h1','h3'].includes(n.type)).length,0);assert.match(text(r.toJSON()),/팔로우하려면 로그인/);assert.equal(r.root.findAllByType('footer').length,0);
 r.root.findAllByType('a').forEach(a=>a.props.onClick());assert.equal(closed,2);
});
