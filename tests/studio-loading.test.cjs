const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// /ux-spinner 2026-11-01: "화면을 불러오지 못했습니다" flashed after sign-in. Real useStudioModel + real StudioRouter (pages stubbed):
// for 1s after sign-in nothing shows, then a spinner; only the responses show the dashboard or the error.
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement,css=new Proxy({},{get:(_,key)=>String(key)});
const text=node=>node==null?'':typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):(node.children||[]).map(text).join('');
let calls=[];const api=path=>new Promise(resolve=>calls.push({path,resolve}));
const hook=loadTypeScript('features/service/useStudioModel.ts',{'next/navigation':{useSearchParams:()=>new URLSearchParams()},'@/lib/api/platform':{platformRequest:api}});
const stub=name=>()=>el('div',{'data-page':name});let fan;
const StudioRouter=loadTypeScript('components/service/StudioRouter.tsx',{'./loading-spinner.module.css':{__esModule:true,default:css},
 './AdvertisingContainer':{AdvertisingContainer:stub('ad')},'@/components/crefans/BeanPages':{BeanStudioPage:stub('beans')},'@/components/crefans/studio/StudioShell':({children})=>el('div',null,children),
 '@/components/crefans/studio/OverviewPages':{DashboardPage:stub('dashboard'),AnalyticsPage:stub('a'),CreatorStartPage:stub('start'),CreatorSettingsPage:stub('s')},
 '@/components/crefans/studio/ManagementPages':{ContentManagementPage:stub('c'),ContentEditorPage:stub('e'),MembershipManagementPage:stub('m'),SubscriberManagementPage:stub('sub')},
 '@/components/crefans/studio/FinancePages':{EarningsPage:stub('x'),SettlementsPage:stub('x'),WithdrawalPage:stub('x'),WithdrawalsPage:stub('x'),SettlementAccountsPage:stub('x')},
 '@/components/crefans/studio/CommunityPages':{CreatorMessagesPage:stub('x'),CreatorCommentsPage:stub('x')},'@/features/service/useStudioModel':hook,
 '@/components/crefans/AccountPages':{SignInPrompt:stub('signin')},'@/components/crefans/ServiceShell':({children})=>children,'./ServiceProvider':{useService:()=>fan},
 '@/components/crefans/studio/ReportPage':{ReportPage:stub('report')},'@/components/crefans/studio/WithdrawalSecurityPage':{WithdrawalSecurityPage:stub('sec')}}).default;
const ok=data=>({success:true,data,errorMessage:null,errorCode:null}),fail=message=>({success:false,data:null,errorMessage:message,errorCode:'X'});
const data={'/studio/overview':ok({started:true,profile:{handle:'h'},management:{}}),'/studio/finance':ok({receivables:[],closingBlockers:[]}),'/studio/community':ok({})};
const probe=tree=>{const t=text(tree.toJSON());return{spinner:tree.root.findAll(n=>typeof n.type==='string'&&n.props?.role==='status').length,error:/불러오지 못했습니다/.test(t)||tree.root.findAll(n=>n.props?.role==='alert').length>0,page:tree.root.findAll(n=>n.props?.['data-page']==='dashboard').length};};
async function signIn(t){calls=[];fan={model:{signedIn:false},loading:true};let tree;await act(async()=>{tree=create(el(StudioRouter,{segments:['dashboard']}));});
 fan={model:{signedIn:true},loading:false};await act(async()=>{tree.update(el(StudioRouter,{segments:['dashboard']}));});return tree;}
async function answer(overrides={}){await act(async()=>{for(const c of calls.splice(0))c.resolve(overrides[c.path]||data[c.path]);});}
const tick=(t,ms)=>act(()=>t.mock.timers.tick(ms));
function rows(t,name,r){t.diagnostic(name+' '+JSON.stringify(r));}

test('slow first load (2.5s): blank for 1s, then a spinner, never the error screen; dashboard on response',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const tree=await signIn(t);const r={};
 try{r['0ms']=probe(tree);tick(t,500);r['500ms']=probe(tree);tick(t,499);r['999ms']=probe(tree);tick(t,1);r['1000ms']=probe(tree);tick(t,1500);r['2500ms']=probe(tree);await answer();r.response=probe(tree);rows(t,'slow',r);
  for(const k of ['0ms','500ms','999ms'])assert.deepEqual(r[k],{spinner:0,error:false,page:0},k);
  assert.deepEqual(r['1000ms'],{spinner:1,error:false,page:0});assert.deepEqual(r['2500ms'],{spinner:1,error:false,page:0});assert.deepEqual(r.response,{spinner:0,error:false,page:1});
 }finally{act(()=>tree.unmount());}
});
test('fast response (300ms): no spinner, no error, then the dashboard',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const tree=await signIn(t);
 try{assert.deepEqual(probe(tree),{spinner:0,error:false,page:0});tick(t,300);await answer();assert.deepEqual(probe(tree),{spinner:0,error:false,page:1});tick(t,1000);assert.deepEqual(probe(tree),{spinner:0,error:false,page:1});}finally{act(()=>tree.unmount());}
});
test('a failed response shows the error only after the response, with the server message',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const tree=await signIn(t);
 try{assert.equal(probe(tree).error,false);tick(t,1200);assert.deepEqual(probe(tree),{spinner:1,error:false,page:0});await answer({'/studio/overview':fail('크리에이터 정보를 확인할 수 없습니다.')});
  assert.deepEqual(probe(tree),{spinner:0,error:true,page:0});assert.match(text(tree.toJSON()),/크리에이터 정보를 확인할 수 없습니다/);}finally{act(()=>tree.unmount());}
});
test('a failed community request names its own reason instead of the bare fallback',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const tree=await signIn(t);
 try{await answer({'/studio/community':fail('커뮤니티 정보를 불러오지 못했어요.')});assert.match(text(tree.toJSON()),/커뮤니티 정보를 불러오지 못했어요/);}finally{act(()=>tree.unmount());}
});
