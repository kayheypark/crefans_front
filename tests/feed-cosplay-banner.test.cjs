// 2026-11-22 user request: on the feed, the cosplay banner and 'AI 사진 편집 더 알아보기' both open the AI photo landing,
// and the banner action reads '로그인 없이 0원 체험'.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const {GuestCosplayBanner}=loadTypeScript('components/crefans/GuestCosplayBanner.tsx',{'next/link':({href,children,...props})=>el('a',{href,...props},children),'next/image':()=>el('img')});
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
test('banner action reads 로그인 없이 0원 체험',()=>{
 let r;act(()=>{r=create(el(GuestCosplayBanner,{href:'/x',aboutHref:'/y'}));});
 const body=text(r.toJSON());assert.match(body,/로그인 없이 0원 체험/);assert.doesNotMatch(body,/무료 체험/);
});
test('feed passes the AI photo landing to both links (not /try)',()=>{
 const src=fs.readFileSync(path.join(__dirname,'../components/crefans/SocialPages.tsx'),'utf8');
 assert.match(src,/<GuestCosplayBanner href="\/service\/landing-ai-image-generation" aboutHref="\/service\/landing-ai-image-generation"\/>/);
});
