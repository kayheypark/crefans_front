const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-18 사용자 결정: 가입이 끝나면 로그인 상태가 되고, 가입 완료 화면의 '계속하기'가 가입을 시작한 화면으로 돌려보낸다.
global.IS_REACT_ACT_ENVIRONMENT=true;global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=()=>{};
const el=React.createElement;
const link={__esModule:true,default:({href,children,...rest})=>el('a',{href,...rest},children)};
const guard=loadTypeScript('components/crefans/GuardPage.tsx',{'next/link':link});
const {SignupCompletePage}=loadTypeScript('components/crefans/SignupCompletePage.tsx',{'./GuardPage':guard});
const {signupHref,loginTarget,loginHref}=loadTypeScript('lib/crefans/login-return.ts');
function render(node){let tree;act(()=>{tree=create(node);});return tree;}
const links=tree=>tree.root.findAll(n=>n.type==='a').map(n=>[n.props.children,n.props.href]);
function live(props){global.sessionStorage={getItem:()=>'fan@example.invalid'};try{return render(el(SignupCompletePage,{basePath:'/service',live:true,leave:()=>{throw Error('should not leave');},...props}));}finally{delete global.sessionStorage;}}

test('signupHref keeps the current service path like loginHref and refuses auth screens',()=>{
 assert.equal(signupHref('/service','/service/try'),'/service/signup?next=%2Fservice%2Ftry');
 assert.equal(signupHref('/service','/service/creator/a?tab=posts'),'/service/signup?next=%2Fservice%2Fcreator%2Fa%3Ftab%3Dposts');
 for(const path of ['/service/login?next=/service/me','/service/signup','/service/reset-password','/other/try','https://evil.example/service/try'])assert.equal(signupHref('/service',path),'/service/signup');
 assert.equal(loginHref('/service','/service/try'),'/service/login?next=%2Fservice%2Ftry');
});
test('signed in after signup: 계속하기 returns to the validated start screen, otherwise the feed',()=>{
 assert.deepEqual(links(live({signedIn:true,next:'/service/try'})),[['계속하기','/service/try']]);
 assert.deepEqual(links(live({signedIn:true,next:null})),[['계속하기','/service/feed']]);
 for(const next of ['https://evil.example/x','//evil.example','/service/login','/service/a b'])assert.deepEqual(links(live({signedIn:true,next})),[['계속하기','/service/feed']]);
});
test('no session after signup: the page still offers login and carries the return path',()=>{
 assert.deepEqual(links(live({signedIn:false,next:'/service/try'})),[['로그인하러 가기','/service/login?next=%2Fservice%2Ftry']]);
 assert.deepEqual(links(live({signedIn:false})),[['로그인하러 가기','/service/login']]);
 // While the session check is still loading nothing is shown, so 로그인 never flips to 계속하기 on screen.
 assert.equal(live({signedIn:undefined,next:'/service/try'}).toJSON(),null);
});
