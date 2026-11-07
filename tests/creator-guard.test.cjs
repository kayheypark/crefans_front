const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-07 사용자 요청: 크리에이터 미전환 회원은 스튜디오에서 시작하기 화면으로 바로 가지 않고, 가입 완료와 같은 톤의 가드 페이지를 본다.
global.IS_REACT_ACT_ENVIRONMENT=true;global.requestAnimationFrame=()=>0;global.cancelAnimationFrame=()=>{};
const el=React.createElement;
const link={__esModule:true,default:({href,children,...rest})=>el('a',{href,...rest},children)};
const css={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const guard=loadTypeScript('components/crefans/GuardPage.tsx',{'next/link':link,'./signup-complete.module.css':css});
const {SignupCompletePage}=loadTypeScript('components/crefans/SignupCompletePage.tsx',{'./GuardPage':guard});
const stub=name=>()=>el('div',{'data-page':name});let fan,studio;
const StudioRouter=loadTypeScript('components/service/StudioRouter.tsx',{
 './AdvertisingContainer':{AdvertisingContainer:stub('ad')},'@/components/crefans/BeanPages':{BeanStudioPage:stub('beans')},'@/components/crefans/studio/StudioShell':({children})=>el('div',{'data-shell':'studio'},children),
 '@/components/crefans/studio/OverviewPages':{DashboardPage:stub('dashboard'),AnalyticsPage:stub('analytics'),CreatorStartPage:stub('start'),CreatorSettingsPage:stub('settings')},
 '@/components/crefans/studio/ManagementPages':{ContentManagementPage:stub('content'),ContentEditorPage:stub('editor'),MembershipManagementPage:stub('m'),SubscriberManagementPage:stub('sub')},
 '@/components/crefans/studio/FinancePages':{EarningsPage:stub('x'),SettlementsPage:stub('x'),WithdrawalPage:stub('x'),WithdrawalsPage:stub('x'),SettlementAccountsPage:stub('x')},
 '@/components/crefans/studio/CommunityPages':{CreatorMessagesPage:stub('x'),CreatorCommentsPage:stub('x')},'@/features/service/useStudioModel':{useStudioModel:()=>studio},
 '@/components/crefans/AccountPages':{SignInPrompt:stub('signin')},'@/components/crefans/ServiceShell':({children})=>el('div',{'data-shell':'fan'},children),'./ServiceProvider':{useService:()=>fan},
 '@/components/crefans/studio/ReportPage':{ReportPage:stub('report')},'@/components/crefans/studio/WithdrawalSecurityPage':{WithdrawalSecurityPage:stub('sec')},'@/components/ui/DelayedSpinner':{DelayedSpinner:stub('spinner')},
 '@/components/crefans/GuardPage':guard}).default;
function render(node){let tree;act(()=>{tree=create(node);});return tree;}
const links=tree=>tree.root.findAll(n=>n.type==='a').map(n=>[n.props.children,n.props.href]);
const pages=tree=>tree.root.findAll(n=>n.props?.['data-page']).map(n=>n.props['data-page']);
const heading=tree=>tree.root.findByType('h1').props.children;
function setStudio(started){fan={model:{signedIn:true,data:{creators:[]}},loading:false};studio={overview:{started,profile:{handle:'h',commentsEnabled:true}},management:{},finance:{data:{receivables:[],closingBlockers:[]}},community:{},reports:{},error:'',loading:false,refresh:()=>{}};}

test('GuardPage: default check badge, title, primary and secondary links',()=>{
 const tree=render(el(guard.GuardPage,{title:'제목',description:'설명',primary:{href:'/a',label:'주 버튼'},secondary:{href:'/b',label:'보조'}}));
 assert.equal(tree.root.findAll(n=>n.type==='img').length,0);
 assert.equal(tree.root.findAll(n=>n.props?.className==='check').length,1);
 assert.equal(heading(tree),'제목');
 assert.deepEqual(links(tree),[['주 버튼','/a'],['보조','/b']]);
});
test('GuardPage: an injected image replaces the check badge',()=>{
 const tree=render(el(guard.GuardPage,{image:{src:'/brand/guard.png'},title:'제목',description:'설명',primary:{href:'/a',label:'주 버튼'}}));
 assert.equal(tree.root.findByType('img').props.src,'/brand/guard.png');
 assert.equal(tree.root.findAll(n=>n.props?.className==='check').length,0);
 assert.deepEqual(links(tree),[['주 버튼','/a']]);
});
test('creator guard image is a separate replacement constant, unset for now (check badge)',()=>{
 assert.equal(guard.creatorGuardImage,undefined);
});
test('non-creator on a studio screen sees the guard, not the start form; buttons go to start and the fan home',()=>{
 setStudio(false);
 for(const segments of [[],['content'],['settings'],['security']]){
  const tree=render(el(StudioRouter,{segments}));
  assert.deepEqual(pages(tree),[],segments.join('/'));
  assert.equal(heading(tree),'크리에이터 전환이 필요해요');
  assert.equal(tree.root.findAll(n=>n.props?.['data-shell']==='fan').length,1);
  assert.deepEqual(links(tree),[['크리에이터 시작하기','/service/studio/start'],['팬 화면으로','/service']]);
 }
});
test('non-creator can still open the start form directly',()=>{
 setStudio(false);
 assert.deepEqual(pages(render(el(StudioRouter,{segments:['start']}))),['start']);
});
test('creators keep the studio as before',()=>{
 setStudio(true);
 assert.deepEqual(pages(render(el(StudioRouter,{segments:[]}))),['dashboard']);
 assert.deepEqual(pages(render(el(StudioRouter,{segments:['content']}))),['content']);
 assert.deepEqual(pages(render(el(StudioRouter,{segments:['start']}))),['start']);
});
test('signed-out members still get the sign-in prompt',()=>{
 setStudio(false);fan={model:{signedIn:false,data:{creators:[]}},loading:false};
 assert.deepEqual(pages(render(el(StudioRouter,{segments:[]}))),['signin']);
});
test('signup complete page shares the guard layout with the same copy and login link',()=>{
 const tree=render(el(SignupCompletePage,{basePath:'/preview',live:false}));
 assert.equal(heading(tree),'회원가입이 완료됐어요');
 assert.equal(tree.root.findAll(n=>n.props?.className==='check').length,1);
 assert.deepEqual(links(tree),[['로그인하러 가기','/preview/login']]);
});
