const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
// Loading rule (/ux-spinner 2026-11-01): for 1s after a request nothing changes (previous content, or blank on a first load);
// then a spinner (over content, or where it goes); only the response shows content, empty or error; the last request wins.
const el=React.createElement,text=node=>node==null?'':typeof node==='string'?node:Array.isArray(node)?node.map(text).join(''):(node.children||[]).map(text).join('');
global.IS_REACT_ACT_ENVIRONMENT=true;
const css=new Proxy({},{get:(_,key)=>String(key)});
// The spinner's CSS module is mapped so its class (block / overlay / inline) can be read.
const M={'./loading-spinner.module.css':{__esModule:true,default:css},'./beans.module.css':{__esModule:true,default:css}};
const link=({children,...props})=>el('a',props,children);
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}
/** Every LoadingSpinner variant renders role=status + aria-live=polite; its class tells block / overlay / inline. */
const isSpinner=n=>typeof n.type==='string'&&n.props?.role==='status'&&n.props?.['aria-live']==='polite'&&['block','overlay','inline'].includes(n.props.className);
const spinners=tree=>tree.root.findAll(isSpinner).map(n=>n.props.className);
const LOADING_TEXT=/불러오는 중|불러오고 있어요|Loading|화면을 준비하고|표시할 데이터/;
/** Page text without the spinner's screen-reader label. */
const bare=node=>node==null?'':typeof node==='string'?node:Array.isArray(node)?node.map(bare).join(''):isSpinner(node)?'':(node.children||[]).map(bare).join('');
const visibleText=tree=>bare(tree.toJSON());
/** Samples a probe just after the request, at 500ms, 999ms and 1000ms. */
function timeline(t,probe){const out={'0ms':probe()};act(()=>t.mock.timers.tick(500));out['500ms']=probe();act(()=>t.mock.timers.tick(499));out['999ms']=probe();act(()=>t.mock.timers.tick(1));out['1000ms']=probe();return out;}
function report(t,name,rows){t.diagnostic(`${name} ${JSON.stringify(rows)}`);}
const ui={Action:({children,variant,...props})=>el('button',props,children),Avatar:({creator})=>el('img',{alt:creator?.name}),Empty:({title,description})=>el('section',{'data-empty':true},title,description),PageTitle:({children,action,back})=>el('header',null,back,el('h1',null,children),action),Notice:({children})=>el('p',null,children),NavIcon:()=>null};

// ---- Route fallbacks
{
 const {DelayedSpinner}=loadTypeScript('components/ui/DelayedSpinner.tsx',M);
 const ServiceLayout=loadTypeScript('app/service/layout.tsx',{...M,'@/components/service/BrowserErrors':{BrowserErrors:()=>null},'@/components/service/BetaClosedNotice':{BetaClosedNotice:()=>null},'@/components/service/ServiceProvider':{ServiceProvider:({children})=>children}}).default;
 const pass=({children})=>children;
 const RootLayout=loadTypeScript('app/layout.tsx',{...M,'@/components/providers/PresentationProviders':pass,'@/components/providers/ApplicationProviders':pass,'@/lib/AntdRegistry':pass,'antd/dist/reset.css':{},'./globals.css':{},'@/lib/seo/site':{SITE_URL:'https://crefans.com',SITE_NAME:'',SITE_TITLE:'',SITE_DESCRIPTION:'',SITE_KEYWORDS:[],DEFAULT_OG_IMAGE:{url:'/x.png'}}}).default;
 function suspender(){const gate=deferred();let done=false;gate.promise.then(()=>{done=true;});return{gate,Page:()=>{if(!done)throw gate.promise;return el('main',null,'페이지 본문');}};}
 for(const [name,Layout] of [['app/service/layout.tsx',ServiceLayout],['app/layout.tsx',RootLayout]]){
  test(`${name}: the route fallback is blank for 1s, then the shared spinner, then the page`,async t=>{
   t.mock.timers.enable({apis:['setTimeout']});const {gate,Page}=suspender();let tree;act(()=>{tree=create(el(Layout,null,el(Page)));});
   try{
    const rows=timeline(t,()=>({spinner:spinners(tree).join()||'-',text:LOADING_TEXT.test(visibleText(tree))}));report(t,name,rows);
    for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',text:false},at);assert.deepEqual(rows['1000ms'],{spinner:'block',text:false});
    await act(async()=>{gate.resolve();await gate.promise;});assert.deepEqual(spinners(tree),[]);assert.match(text(tree.toJSON()),/페이지 본문/);
   }finally{act(()=>tree.unmount());}
  });
 }
 test('a fast route never shows the spinner',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const {gate,Page}=suspender();let tree;act(()=>{tree=create(el(ServiceLayout,null,el(Page)));});
  try{act(()=>t.mock.timers.tick(300));await act(async()=>{gate.resolve();await gate.promise;});act(()=>t.mock.timers.tick(2000));assert.deepEqual(spinners(tree),[]);assert.match(text(tree.toJSON()),/페이지 본문/);}finally{act(()=>tree.unmount());}
 });
 test('DelayedSpinner itself: nothing until 1000ms',t=>{t.mock.timers.enable({apis:['setTimeout']});let tree;act(()=>{tree=create(el(DelayedSpinner));});try{const rows=timeline(t,()=>spinners(tree).join()||'-');assert.deepEqual(rows,{'0ms':'-','500ms':'-','999ms':'-','1000ms':'block'});}finally{act(()=>tree.unmount());}});
}

// ---- ApiState (shared)
{
 const {ApiState}=loadTypeScript('components/crefans/ApiState.tsx',{...M,'./ServiceUI':ui});
 const mount=props=>{let tree;act(()=>{tree=create(el(ApiState,props,data=>el('p',null,`내용:${data}`)));});return tree;};
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',empty:/표시할 데이터/.test(text(tree.toJSON())),loadingText:LOADING_TEXT.test(visibleText(tree))});
 test('ApiState: no response yet is blank for 1s then a spinner, never "표시할 데이터가 없어요"; the response replaces it',t=>{
  t.mock.timers.enable({apis:['setTimeout']});const tree=mount({response:null});
  try{
   const rows=timeline(t,probe(tree));report(t,'ApiState slow first load',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',empty:false,loadingText:false},at);assert.deepEqual(rows['1000ms'],{spinner:'block',empty:false,loadingText:false});
   act(()=>tree.update(el(ApiState,{response:{success:true,data:'A',errorMessage:null,errorCode:null}},data=>el('p',null,`내용:${data}`))));
   assert.deepEqual(spinners(tree),[]);assert.equal(text(tree.toJSON()),'내용:A');
  }finally{act(()=>tree.unmount());}
 });
 test('ApiState: loading=true shows no text; fast response, error and success each appear only after the response',t=>{
  t.mock.timers.enable({apis:['setTimeout']});const tree=mount({response:null,loading:true});
  try{
   act(()=>t.mock.timers.tick(400));assert.deepEqual(probe(tree)(),{spinner:'-',empty:false,loadingText:false});
   act(()=>tree.update(el(ApiState,{response:{success:false,data:null,errorMessage:'서버 오류',errorCode:'E1'}},()=>null)));
   assert.match(text(tree.toJSON()),/내용을 불러오지 못했어요서버 오류/);act(()=>t.mock.timers.tick(2000));assert.deepEqual(spinners(tree),[]);
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Studio router (account first, then studio data)
{
 const stub=name=>()=>el('div',{'data-page':name});
 let fan,studio;
 const StudioRouter=loadTypeScript('components/service/StudioRouter.tsx',{...M,
  './AdvertisingContainer':{AdvertisingContainer:stub('ad')},'@/components/crefans/BeanPages':{BeanStudioPage:stub('beans')},'@/components/crefans/studio/StudioShell':({children})=>el('div',{'data-shell':true},children),
  '@/components/crefans/studio/OverviewPages':{DashboardPage:stub('dashboard'),AnalyticsPage:stub('a'),CreatorStartPage:stub('start'),CreatorSettingsPage:stub('s')},
  '@/components/crefans/studio/ManagementPages':{ContentManagementPage:stub('c'),ContentEditorPage:stub('e'),MembershipManagementPage:stub('m'),SubscriberManagementPage:stub('sub')},
  '@/components/crefans/studio/FinancePages':{EarningsPage:stub('x'),SettlementsPage:stub('x'),WithdrawalPage:stub('x'),WithdrawalsPage:stub('x'),SettlementAccountsPage:stub('x')},
  '@/components/crefans/studio/CommunityPages':{CreatorMessagesPage:stub('x'),CreatorCommentsPage:stub('x')},
  '@/features/service/useStudioModel':{useStudioModel:()=>studio},'@/components/crefans/AccountPages':{SignInPrompt:stub('signin')},'@/components/crefans/ServiceShell':({children})=>children,
  './ServiceProvider':{useService:()=>fan},'@/components/crefans/studio/ReportPage':{ReportPage:stub('report')},'@/components/crefans/studio/WithdrawalSecurityPage':{WithdrawalSecurityPage:stub('sec')},
 }).default;
 const ready={overview:{started:true,profile:{handle:'h'}},management:{},finance:{},community:{},reports:{},error:'',loading:false,refresh(){}};
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',text:LOADING_TEXT.test(visibleText(tree)),page:tree.root.findAll(n=>n.props?.['data-page']).length});
 test('StudioRouter: one 1s timer spans the account and studio requests; no "불러오는 중…" text',t=>{
  t.mock.timers.enable({apis:['setTimeout']});fan={model:{signedIn:false,data:{creators:[]}},loading:true};studio={...ready,overview:null,loading:true};
  let tree;act(()=>{tree=create(el(StudioRouter,{segments:[]}));});
  try{
   const rows={'0ms':probe(tree)()};act(()=>t.mock.timers.tick(500));rows['500ms (account done)']=(fan={model:{signedIn:true,data:{creators:[]}},loading:false},act(()=>tree.update(el(StudioRouter,{segments:[]}))),probe(tree)());
   act(()=>t.mock.timers.tick(499));rows['999ms']=probe(tree)();act(()=>t.mock.timers.tick(1));rows['1000ms']=probe(tree)();
   studio=ready;act(()=>tree.update(el(StudioRouter,{segments:[]})));rows['response']=probe(tree)();report(t,'StudioRouter slow',rows);
   for(const at of ['0ms','500ms (account done)','999ms'])assert.deepEqual(rows[at],{spinner:'-',text:false,page:0},at);
   assert.deepEqual(rows['1000ms'],{spinner:'block',text:false,page:0});assert.deepEqual(rows.response,{spinner:'-',text:false,page:1});
  }finally{act(()=>tree.unmount());}
 });
 test('StudioRouter: a failed response shows only the error',t=>{
  t.mock.timers.enable({apis:['setTimeout']});fan={model:{signedIn:true,data:{creators:[]}},loading:false};studio={...ready,overview:null,loading:true};
  let tree;act(()=>{tree=create(el(StudioRouter,{segments:[]}));});
  try{act(()=>t.mock.timers.tick(300));studio={...ready,overview:null,error:'스튜디오 오류'};act(()=>tree.update(el(StudioRouter,{segments:[]})));assert.deepEqual(spinners(tree),[]);assert.match(text(tree.toJSON()),/스튜디오 오류/);}finally{act(()=>tree.unmount());}
 });
}

// ---- Bean withdrawal container
{
 let finance;
 const {BeanWithdrawContainer}=loadTypeScript('components/service/BeanWithdrawContainer.tsx',{...M,'@/components/crefans/BeanWithdrawPage':{BeanWithdrawPage:()=>el('div',{'data-page':'withdraw'})},'@/features/service/useStudioFinanceModel':{useStudioFinanceModel:()=>finance}});
 test('BeanWithdrawContainer: blank for 1s, spinner at 1000ms, then the page or the error',t=>{
  t.mock.timers.enable({apis:['setTimeout']});finance={finance:null,error:'',loading:true,refresh(){}};let tree;act(()=>{tree=create(el(BeanWithdrawContainer,{signedIn:true,basePath:'/service'}));});
  try{
   const rows=timeline(t,()=>({spinner:spinners(tree).join()||'-',text:LOADING_TEXT.test(visibleText(tree))}));report(t,'BeanWithdrawContainer slow',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',text:false},at);assert.deepEqual(rows['1000ms'],{spinner:'block',text:false});
   finance={finance:{},error:'',loading:false,refresh(){}};act(()=>tree.update(el(BeanWithdrawContainer,{signedIn:true,basePath:'/service'})));assert.deepEqual(spinners(tree),[]);assert.equal(tree.root.findAll(n=>n.props?.['data-page']).length,1);
   finance={finance:null,error:'출금 정보 오류',loading:false,refresh(){}};act(()=>tree.update(el(BeanWithdrawContainer,{signedIn:true,basePath:'/service'})));assert.match(text(tree.toJSON()),/출금 정보 오류/);
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Terms page
{
 const styles={__esModule:true,default:css};
 const pages=loadTypeScript('components/crefans/CommonPages.tsx',{...M,'./common.module.css':styles,'./ServiceUI':ui,'./Icon':()=>el('svg'),'@/components/ui/Primitives':{Dialog:()=>null,Field:()=>null},'next/link':link});
 test('LegalPage: no "불러오는 중…" while the terms load; spinner at 1000ms; the document or the error after the response',t=>{
  t.mock.timers.enable({apis:['setTimeout']});const mount=model=>el(pages.LegalPage,{kind:'terms',model,basePath:'/service'});let tree;act(()=>{tree=create(mount({legal:{},legalStatus:'loading'}));});
  try{
   const rows=timeline(t,()=>({spinner:spinners(tree).join()||'-',text:LOADING_TEXT.test(visibleText(tree)),notFound:/찾을 수 없어요/.test(text(tree.toJSON()))}));report(t,'LegalPage slow',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',text:false,notFound:false},at);assert.deepEqual(rows['1000ms'],{spinner:'block',text:false,notFound:false});
   act(()=>tree.update(mount({legal:{},legalStatus:'error'})));assert.deepEqual(spinners(tree),[]);assert.match(text(tree.toJSON()),/문서를 불러오지 못했어요/);
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Studio advertising
{
 const {AdvertisingPage}=loadTypeScript('components/crefans/studio/AdvertisingPage.tsx',{...M,'../ServiceUI':ui,'@/components/ui/Primitives':{Dialog:()=>null,Chip:({children,...p})=>el('button',p,children)},'@/components/ui/Toast':{Toast:()=>null},'@/components/ui/SnackbarProvider':{useSnackbarMessage:()=>React.useState('')},'next/link':link});
 const product={id:'p',name:'주목할 크리에이터 7일',description:'',terms:'',placement:'featured_creator',amount:11000,durationDays:7,onSale:true,visible:true,sortOrder:0,version:1};
 const model=patch=>({products:[],orders:[],loading:false,error:'',purchaseReady:false,guidance:'',refresh:async()=>{},purchase:async()=>({success:false}),...patch});
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',cards:tree.root.findAll(n=>n.type==='article').length,empty:/판매 중인 광고상품이 없습니다/.test(text(tree.toJSON())),error:tree.root.findAll(n=>n.props?.role==='alert').length,text:LOADING_TEXT.test(visibleText(tree))});
 const render=(tree,m)=>act(()=>tree.update(el(AdvertisingPage,{model:m,basePath:'/service/studio'})));
 test('AdvertisingPage: slow first load, then products; empty only after the response',t=>{
  t.mock.timers.enable({apis:['setTimeout']});let tree;act(()=>{tree=create(el(AdvertisingPage,{model:model({loading:true}),basePath:'/service/studio'}));});
  try{
   const rows=timeline(t,probe(tree));render(tree,model({products:[product]}));rows.response=probe(tree)();report(t,'AdvertisingPage slow first load',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',cards:0,empty:false,error:0,text:false},at);
   assert.deepEqual(rows['1000ms'],{spinner:'block',cards:0,empty:false,error:0,text:false});assert.deepEqual(rows.response,{spinner:'-',cards:1,empty:false,error:0,text:false});
   render(tree,model({}));assert.equal(probe(tree)().empty,true);
  }finally{act(()=>tree.unmount());}
 });
 test('AdvertisingPage: a refresh keeps the products (overlay after 1s); a retry keeps the error (small spinner after 1s)',t=>{
  t.mock.timers.enable({apis:['setTimeout']});let tree;act(()=>{tree=create(el(AdvertisingPage,{model:model({products:[product]}),basePath:'/service/studio'}));});
  try{
   render(tree,model({products:[product],loading:true}));const refresh=timeline(t,probe(tree));report(t,'AdvertisingPage refresh with products',refresh);
   assert.deepEqual(refresh['999ms'],{spinner:'-',cards:1,empty:false,error:0,text:false});assert.deepEqual(refresh['1000ms'],{spinner:'overlay',cards:1,empty:false,error:0,text:false});
   render(tree,model({error:'광고상품을 불러오지 못했습니다.'}));render(tree,model({error:'광고상품을 불러오지 못했습니다.',loading:true}));
   const retry=timeline(t,probe(tree));report(t,'AdvertisingPage retry after error',retry);
   assert.deepEqual(retry['0ms'],{spinner:'-',cards:0,empty:false,error:1,text:false});assert.deepEqual(retry['999ms'],retry['0ms']);assert.deepEqual(retry['1000ms'],{spinner:'inline',cards:0,empty:false,error:1,text:false});
   assert.equal(tree.root.findAll(n=>n.type==='button'&&text(n)==='다시 불러오기')[0].props.disabled,true,'one retry at a time');
   render(tree,model({products:[product]}));assert.deepEqual(probe(tree)(),{spinner:'-',cards:1,empty:false,error:0,text:false});
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Profile followers/following
{
 const {ProfileConnectionsPage}=loadTypeScript('components/crefans/ProfileConnectionsPage.tsx',{...M,'./ServiceUI':ui,'next/link':link});
 const person=id=>({id,name:`이름${id}`,handle:id,image:''}),answer=(ids,next=null)=>({success:true,data:{profile:{id:'p',name:'프로필',handle:'p'},people:ids.map(person),nextOffset:next},errorMessage:null,errorCode:null});
 const failure={success:false,data:null,errorMessage:'목록 오류',errorCode:'E'};
 function setup(){const calls=[];const load=(id,kind,offset)=>{const d=deferred();calls.push({id,offset,d});return d.promise;};return{calls,load};}
 const view=(load,id='a')=>el(ProfileConnectionsPage,{id,kind:'followers',basePath:'/service',load});
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',rows:tree.root.findAll(n=>n.type==='li').length,empty:/팔로워가 없습니다/.test(text(tree.toJSON())),error:/목록 오류/.test(text(tree.toJSON())),text:LOADING_TEXT.test(visibleText(tree))});
 test('ProfileConnectionsPage: slow first load, fast load, empty and error',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const {calls,load}=setup();let tree;act(()=>{tree=create(view(load));});
  try{
   const rows=timeline(t,probe(tree));await act(async()=>{calls[0].d.resolve(answer(['x','y'],2));});rows.response=probe(tree)();report(t,'ProfileConnections slow first load',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',rows:0,empty:false,error:false,text:false},at);
   assert.deepEqual(rows['1000ms'],{spinner:'block',rows:0,empty:false,error:false,text:false});assert.deepEqual(rows.response,{spinner:'-',rows:2,empty:false,error:false,text:false});
   // 더 보기: the list stays, an overlay only after 1s (the button label is out of scope).
   act(()=>tree.root.findAll(n=>n.type==='button'&&text(n)==='더 보기')[0].props.onClick());const more=timeline(t,probe(tree));report(t,'ProfileConnections load more',more);
   assert.deepEqual(more['999ms'],{spinner:'-',rows:2,empty:false,error:false,text:false});assert.deepEqual(more['1000ms'],{spinner:'overlay',rows:2,empty:false,error:false,text:false});
   await act(async()=>{calls[1].d.resolve(answer(['z']));});assert.deepEqual(probe(tree)(),{spinner:'-',rows:3,empty:false,error:false,text:false});
  }finally{act(()=>tree.unmount());}
  for(const [name,result,expected] of [['fast',answer(['x']),{spinner:'-',rows:1,empty:false,error:false,text:false}],['empty',answer([]),{spinner:'-',rows:0,empty:true,error:false,text:false}],['error',failure,{spinner:'-',rows:0,empty:false,error:true,text:false}]]){
   const s=setup();act(()=>{tree=create(view(s.load));});try{act(()=>t.mock.timers.tick(200));assert.equal(probe(tree)().empty,false,`${name}: no empty message before the response`);await act(async()=>{s.calls[0].d.resolve(result);});act(()=>t.mock.timers.tick(2000));assert.deepEqual(probe(tree)(),expected,name);}finally{act(()=>tree.unmount());}
  }
 });
 test('ProfileConnectionsPage: the error stays while the next profile loads, and a late older answer is ignored',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const {calls,load}=setup();let tree;act(()=>{tree=create(view(load,'a'));});
  try{
   await act(async()=>{calls[0].d.resolve(failure);});act(()=>tree.update(view(load,'b')));act(()=>tree.update(view(load,'c')));
   assert.deepEqual(calls.map(c=>c.id),['a','b','c']);assert.equal(probe(tree)().error,true,'error kept when the request starts');
   await act(async()=>{calls[2].d.resolve(answer(['c1']));});await act(async()=>{calls[1].d.resolve(answer(['b1','b2']));});
   assert.deepEqual(probe(tree)(),{spinner:'-',rows:1,empty:false,error:false,text:false});
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Shared DataTable
{
 const {DataTable}=loadTypeScript('components/ui/DataTable.tsx',M);
 const columns=[{key:'name',label:'이름',render:row=>row.name,sortValue:row=>row.name}];
 const props=patch=>({rows:[],columns,rowKey:row=>row.id,sort:null,onSortChange(){},caption:'목록',...patch});
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',rows:tree.root.findByType('tbody').findAll(n=>n.type==='tr'&&!n.findAll(c=>c.props?.role==='status').length).length,empty:/표시할 데이터가 없어요/.test(text(tree.toJSON())),text:/불러오는 중이에요/.test(text(tree.toJSON()))});
 test('DataTable: first load has no empty message and a spinner row only at 1000ms; a reload keeps rows with an overlay',t=>{
  t.mock.timers.enable({apis:['setTimeout']});let tree;act(()=>{tree=create(el(DataTable,props({loading:true})));});
  try{
   const first=timeline(t,probe(tree));act(()=>tree.update(el(DataTable,props({rows:[{id:'a',name:'가'}]}))));first.response=probe(tree)();report(t,'DataTable slow first load',first);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(first[at],{spinner:'-',rows:0,empty:false,text:false},at);
   assert.deepEqual(first['1000ms'],{spinner:'block',rows:0,empty:false,text:false});assert.deepEqual(first.response,{spinner:'-',rows:1,empty:false,text:false});
   act(()=>tree.update(el(DataTable,props({rows:[{id:'a',name:'가'}],loading:true}))));const again=timeline(t,probe(tree));report(t,'DataTable reload with rows',again);
   assert.deepEqual(again['999ms'],{spinner:'-',rows:1,empty:false,text:false});assert.deepEqual(again['1000ms'],{spinner:'overlay',rows:1,empty:false,text:false});
   act(()=>tree.update(el(DataTable,props({rows:[]}))));assert.deepEqual(probe(tree)(),{spinner:'-',rows:1,empty:true,text:false},'empty row only after the response');
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Comments and replies
{
 const {CommentsSection}=loadTypeScript('components/crefans/SocialPages.tsx',{...M,'./social.module.css':{__esModule:true,default:css},'./ServiceUI':ui,'./Icon':()=>el('svg'),'next/link':link,'@/components/ui/Primitives':{Chip:()=>null,TextAreaField:()=>null,Dialog:()=>null},'./CommentComposer':{CommentComposer:()=>null,CommentDock:()=>null,CommentDockProvider:({children})=>children}});
 const post={id:'p1',title:'글',creatorId:'c',commentsEnabled:true};
 const comment=(id,replyCount=0)=>({id,body:`댓글${id}`,createdAt:'2026-11-01T00:00:00Z',author:{id:'u',name:'작성자',handle:'u',image:''},replyCount});
 const model=patch=>({basePath:'/service',commentsByPost:{},loadComments:async()=>{},loadReplies:async()=>({success:true,data:[]}),addComment:async()=>({success:true}),...patch});
 const section=m=>el(CommentsSection,{post,model:m,count:0,locked:false});
 const probe=tree=>()=>({spinner:spinners(tree).join()||'-',none:/댓글이 없습니다/.test(text(tree.toJSON())),text:/불러오는 중…|불러오는 중\.\.\./.test(text(tree.toJSON()))});
 test('Comments: before the first response nothing for 1s, then a spinner; "댓글이 없습니다" only after the response',t=>{
  t.mock.timers.enable({apis:['setTimeout']});let tree;act(()=>{tree=create(section(model({commentPaging:{p1:{hasMore:false,loading:true,loadMore:async()=>{}}}})));});
  try{
   const rows=timeline(t,probe(tree));act(()=>tree.update(section(model({commentPaging:{p1:{hasMore:false,loading:false,loadMore:async()=>{}}},commentsByPost:{p1:[]}}))));rows.response=probe(tree)();report(t,'Comments slow first load (empty answer)',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{spinner:'-',none:false,text:false},at);assert.deepEqual(rows['1000ms'],{spinner:'block',none:false,text:false});assert.deepEqual(rows.response,{spinner:'-',none:true,text:false});
  }finally{act(()=>tree.unmount());}
  // The first render, before the model has even marked the request as loading, must not say "댓글이 없습니다" either.
  act(()=>{tree=create(section(model({})));});try{assert.equal(probe(tree)().none,false);}finally{act(()=>tree.unmount());}
  act(()=>{tree=create(section(model({loadComments:undefined})));});try{assert.equal(probe(tree)().none,true,'no loader means no request: the empty answer is final');}finally{act(()=>tree.unmount());}
 });
 test('Replies: the toggle keeps its label for 1s, then a small spinner; an earlier error stays until the next response',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});const answers=[];const loadReplies=()=>{const d=deferred();answers.push(d);return d.promise;};
  let tree;act(()=>{tree=create(section(model({commentPaging:{p1:{hasMore:false,loading:false,loadMore:async()=>{}}},commentsByPost:{p1:[comment('c1',2)]},loadReplies})));});
  const toggle=()=>tree.root.findAll(n=>n.type==='button'&&n.props['aria-expanded']!==undefined)[0];
  const rprobe=()=>({label:bare(toggle()),spinner:spinners(tree).join()||'-',error:tree.root.findAll(n=>n.props?.role==='alert').map(text).join(),replies:/답글 내용/.test(text(tree.toJSON()))});
  try{
   act(()=>{toggle().props.onClick();});const rows=timeline(t,rprobe);await act(async()=>{answers[0].resolve({success:false,errorMessage:'답글 오류'});});rows.response=rprobe();
   act(()=>{toggle().props.onClick();});rows['retry 0ms']=rprobe();act(()=>t.mock.timers.tick(999));rows['retry 999ms']=rprobe();act(()=>t.mock.timers.tick(1));rows['retry 1000ms']=rprobe();
   await act(async()=>{answers[1].resolve({success:true,data:[{...comment('r1'),body:'답글 내용'}]});});rows['retry response']=rprobe();report(t,'Replies slow, error, retry',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{label:'답글 2개 보기',spinner:'-',error:'',replies:false},at);
   assert.deepEqual(rows['1000ms'],{label:'답글 2개 보기',spinner:'inline',error:'',replies:false});assert.deepEqual(rows.response,{label:'답글 2개 보기',spinner:'-',error:'답글 오류',replies:false});
   assert.deepEqual(rows['retry 999ms'],{label:'답글 2개 보기',spinner:'-',error:'답글 오류',replies:false},'error kept while retrying');assert.equal(rows['retry 1000ms'].spinner,'inline');
   assert.deepEqual(rows['retry response'],{label:'답글 숨기기',spinner:'-',error:'',replies:true});
  }finally{act(()=>tree.unmount());}
 });
}

// ---- Balance cells (tip dialog, charge page)
{
 let beanModel;
 const {TipButton}=loadTypeScript('components/crefans/BeanPages.tsx',{...M,'./BeanContext':{useBeans:()=>beanModel},'next/image':({unoptimized,priority,...props})=>el('img',props),'next/link':link,'@/components/ui/Primitives':{Dialog:({open,children})=>open?el('dialog',null,children):null,Field:()=>null}});
 const {BeanChargePage}=loadTypeScript('components/crefans/BeanChargePage.tsx',{...M,'./BeanContext':{useBeans:()=>beanModel},'next/link':link,'@/components/ui/InfoTooltip':{InfoTooltip:()=>null}});
 const wallet={spendableBeans:120,accounts:[]};
 const base=patch=>({enabled:true,signedIn:true,ownCreatorIds:[],basePath:'/service',mode:'live',wallet:null,loading:true,error:'',refresh:async()=>{},tip:async()=>({success:false}),...patch});
 const cell=(tree,cls)=>tree.root.findAll(n=>n.props?.className===cls)[0].findByType('strong');
 const probe=(tree,cls)=>()=>({value:bare(cell(tree,cls))||'(blank)',spinner:spinners(tree).filter(k=>k==='inline').join()||'-'});
 test('Charge page balance: blank for 1s, small spinner at 1000ms, then the balance; a refresh keeps the balance; an error says so',t=>{
  t.mock.timers.enable({apis:['setTimeout']});beanModel=base();let tree;act(()=>{tree=create(el(BeanChargePage));});
  try{
   const rows=timeline(t,probe(tree,'chargeBalance'));beanModel=base({wallet,loading:false});act(()=>tree.update(el(BeanChargePage)));rows.response=probe(tree,'chargeBalance')();
   beanModel=base({wallet,loading:true});act(()=>tree.update(el(BeanChargePage)));rows['refresh 0ms']=probe(tree,'chargeBalance')();act(()=>t.mock.timers.tick(1000));rows['refresh 1000ms']=probe(tree,'chargeBalance')();
   beanModel=base({loading:false,error:'지갑 오류'});act(()=>tree.update(el(BeanChargePage)));rows.error=probe(tree,'chargeBalance')();report(t,'Charge balance',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{value:'(blank)',spinner:'-'},at);assert.deepEqual(rows['1000ms'],{value:'(blank)',spinner:'inline'});
   assert.deepEqual(rows.response,{value:'120콩',spinner:'-'});assert.deepEqual(rows['refresh 0ms'],{value:'120콩',spinner:'-'});assert.deepEqual(rows['refresh 1000ms'],{value:'120콩',spinner:'inline'});assert.deepEqual(rows.error,{value:'확인할 수 없습니다',spinner:'-'});
  }finally{act(()=>tree.unmount());}
 });
 test('Tip dialog balance: blank for 1s, small spinner at 1000ms, then the balance',t=>{
  t.mock.timers.enable({apis:['setTimeout']});beanModel=base();let tree;act(()=>{tree=create(el(TipButton,{creatorId:'c',name:'작가',profile:true}));});
  try{
   act(()=>tree.root.findAll(n=>n.props?.['data-tip-button']==='true'&&n.props.onClick)[0].props.onClick());
   const rows=timeline(t,probe(tree,'tipBalance'));beanModel=base({wallet,loading:false});act(()=>tree.update(el(TipButton,{creatorId:'c',name:'작가',profile:true})));rows.response=probe(tree,'tipBalance')();report(t,'Tip balance',rows);
   for(const at of ['0ms','500ms','999ms'])assert.deepEqual(rows[at],{value:'(blank)',spinner:'-'},at);assert.deepEqual(rows['1000ms'],{value:'(blank)',spinner:'inline'});assert.deepEqual(rows.response,{value:'120콩',spinner:'-'});
  }finally{act(()=>tree.unmount());}
 });
}
