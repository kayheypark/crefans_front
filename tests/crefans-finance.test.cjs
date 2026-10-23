const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {createInitialFinanceState}=loadTypeScript('components/preview/studio/finance-fixtures.ts');
const {calculateFinanceSummary,reviewMockWithdrawal,useMockFinance}=loadTypeScript('components/preview/studio/useMockFinance.ts');

function financeView(){
  let model,tree;function Probe(){model=useMockFinance();return null;}
  act(()=>{tree=create(React.createElement(Probe));});
  return {get model(){return model;},close(){act(()=>tree.unmount());}};
}
async function setupPin(view){let result;await act(async()=>{result=await view.model.setupWithdrawalPin('246810');});assert.equal(result.success,true);}
async function authorize(view,input){let result;await act(async()=>{result=await view.model.verifyWithdrawalPin('246810',input);});assert.equal(result.success,true);return result.data.authorizationId;}
async function request(view,input){let result;await act(async()=>{result=await view.model.requestWithdrawal(input);});return result;}

function invariant(state){
  const summary=calculateFinanceSummary(state);
  for(const earning of state.earnings)assert.equal(earning.net,earning.gross-earning.reversals-earning.fees);
  assert.equal(summary.net,summary.gross-summary.reversals-summary.fees);
  assert.equal(summary.net,summary.pending+summary.available+summary.requested+summary.paid);
  assert.ok(summary.available>=0);
  return summary;
}

test('finance ledger partitions net income without counting reserved or paid money as available',()=>{
  const state=createInitialFinanceState();
  const summary=invariant(state);
  assert.equal(summary.gross,2480000);
  assert.equal(summary.reversals,99000);
  assert.equal(summary.fees,238100);
  assert.equal(summary.pending,441000);
  assert.equal(summary.requested,200000);
  assert.equal(summary.paid,350000);
  assert.equal(summary.available,1151900);
  const withoutRejected={...state,withdrawals:state.withdrawals.filter(item=>item.status!=='rejected')};
  assert.deepEqual(calculateFinanceSummary(withoutRejected),summary);
});

test('withdrawal review rejects invalid KRW, insufficient balances, and unverified or missing accounts without mutation',()=>{
  const state=createInitialFinanceState();
  const before=JSON.stringify(state);
  for(const amount of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){
    const result=reviewMockWithdrawal(state,{amount,accountId:'account-verified'});
    assert.equal(result.success,false);
    assert.equal(result.errorCode,'INVALID_AMOUNT');
  }
  assert.equal(reviewMockWithdrawal(state,{amount:1,accountId:'account-unverified'}).errorCode,'ACCOUNT_NOT_VERIFIED');
  assert.equal(reviewMockWithdrawal(state,{amount:1,accountId:'missing'}).errorCode,'ACCOUNT_NOT_FOUND');
  assert.equal(reviewMockWithdrawal(state,{amount:1151901,accountId:'account-verified'}).errorCode,'INSUFFICIENT_BALANCE');
  const quote=reviewMockWithdrawal(state,{amount:100000,accountId:'account-verified'});
  assert.equal(quote.success,true);
  assert.equal(quote.data.availableAfterRequest,1051900);
  assert.equal(JSON.stringify(state),before);
});

test('acceptance reserves the exact amount once; repeat request keys are idempotent and conflicting payloads fail',async()=>{
  const view=financeView();
  try{
    await setupPin(view);
    const intent={amount:100000,accountId:'account-verified'};
    const input={...intent,requestId:'stable-user-intent',authorizationId:await authorize(view,intent)};
    const initial=view.model.data.withdrawals,first=await request(view,input);
    assert.equal(first.success,true);assert.equal(first.data.withdrawal.status,'requested');
    assert.equal(first.data.withdrawal.requestedAt,view.model.today);
    const next=invariant(view.model.data);
    assert.equal(next.available,1051900);assert.equal(next.requested,300000);assert.equal(next.paid,350000);
    const after=view.model.data.withdrawals,repeated=await request(view,input);
    assert.equal(repeated.success,true);assert.equal(view.model.data.withdrawals,after);
    assert.equal(repeated.data.withdrawal.id,first.data.withdrawal.id);
    const conflict=await request(view,{...input,amount:100001});
    assert.equal(conflict.errorCode,'REQUEST_CONFLICT');assert.equal(view.model.data.withdrawals,after);assert.equal(initial.length,3);
  }finally{view.close();}
});

test('requesting the full balance reaches zero without touching pending or completed money',async()=>{
  const view=financeView();
  try{
    await setupPin(view);
    const all={amount:view.model.data.summary.available,accountId:'account-verified'},extra={amount:1,accountId:'account-verified'};
    const authorizationId=await authorize(view,all),extraAuthorizationId=await authorize(view,extra);
    const transaction=await request(view,{...all,requestId:'all-available',authorizationId});
    assert.equal(transaction.success,true);const summary=invariant(view.model.data);assert.equal(summary.available,0);
    const after=view.model.data.withdrawals,result=await request(view,{...extra,requestId:'overdraft',authorizationId:extraAuthorizationId});
    assert.equal(result.errorCode,'INSUFFICIENT_BALANCE');assert.equal(view.model.data.withdrawals,after);
  }finally{view.close();}
});

test('mock finance callbacks use the latest balance when two requests arrive before rerender',async()=>{
  const view=financeView();
  try{
    await setupPin(view);
    const intent={amount:1000000,accountId:'account-verified'},firstGrant=await authorize(view,intent),secondGrant=await authorize(view,intent);
    const submit=view.model.requestWithdrawal;let results;
    await act(async()=>{results=await Promise.all([
      submit({...intent,requestId:'first',authorizationId:firstGrant}),
      submit({...intent,requestId:'second',authorizationId:secondGrant}),
    ]);});
    assert.equal(results[0].success,true);assert.equal(results[1].success,false);assert.equal(results[1].errorCode,'INSUFFICIENT_BALANCE');
    assert.equal(view.model.data.summary.available,151900);assert.equal(view.model.data.summary.requested,1200000);
    assert.equal(view.model.data.withdrawals.filter(item=>item.status==='requested').length,1);invariant(view.model.data);
  }finally{view.close();}
});

test('account updates require renewed verification and preserve withdrawal account snapshots',async()=>{
  let model,tree,result;
  function Probe(){model=useMockFinance();return null;}
  act(()=>{tree=create(React.createElement(Probe));});
  const originalSnapshot=model.data.withdrawals[0].accountLabel;
  const view={get model(){return model;}};await setupPin(view);
  const authorizationId=await authorize(view,{amount:10000,accountId:'account-verified'});
  await act(async()=>{result=await model.saveAccount({bank:'다른 가상은행',holderAlias:'검수 별칭',lastFour:'9922'},'account-verified');});
  assert.equal(result.success,true);
  const updated=model.data.accounts.find(item=>item.id==='account-verified');
  assert.equal(updated.verified,false);
  assert.equal(updated.isDefault,false);
  assert.equal(model.data.withdrawals[0].accountLabel,originalSnapshot);
  await act(async()=>{result=await model.requestWithdrawal({amount:10000,accountId:updated.id,requestId:'unverified',authorizationId});});
  assert.equal(result.errorCode,'ACCOUNT_NOT_VERIFIED');
  await act(async()=>{result=await model.verifyAccount(updated.id);});
  assert.equal(result.success,true);
  await act(async()=>{result=await model.setDefaultAccount(updated.id);});
  assert.equal(result.success,true);
  assert.equal(model.data.accounts.filter(item=>item.isDefault).length,1);
  await act(async()=>{result=await model.saveAccount({bank:'추가 가상은행',holderAlias:'두번째 별칭',lastFour:'12345'});});
  assert.equal(result.errorCode,'INVALID_ACCOUNT');
  act(()=>tree.unmount());
});

test('saving an unchanged account preserves verification and the default account',async()=>{
  let model,tree,result;
  function Probe(){model=useMockFinance();return null;}
  act(()=>{tree=create(React.createElement(Probe));});
  const account=model.data.accounts.find(item=>item.id==='account-verified');
  const before=model.data.accounts;
  await act(async()=>{result=await model.saveAccount({bank:account.bank,holderAlias:account.holderAlias,lastFour:account.lastFour},account.id);});
  assert.equal(result.success,true);
  assert.equal(result.data.account,account);
  assert.equal(model.data.accounts,before);
  assert.equal(model.data.accounts.find(item=>item.id===account.id).verified,true);
  assert.equal(model.data.accounts.find(item=>item.id===account.id).isDefault,true);
  act(()=>tree.unmount());
});

test('settlement rows and details distinguish missing earning data from a zero-valued settlement',()=>{
  const h=React.createElement;
  const flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(''):value?.children?flatten(value.children):'';
  const {SettlementsPage}=loadTypeScript('components/crefans/studio/FinancePages.tsx',{
    'next/link':({href,children})=>h('a',{href},children),
    '../Icon':()=>h('svg'),
    './select.module.css':new Proxy({},{get:(_,key)=>String(key)}),
    './pin-field.module.css':new Proxy({},{get:(_,key)=>String(key)}),
    './amount-presets.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./ui.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./field.module.css':new Proxy({},{get:(_,key)=>String(key)}),
    './finance.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),
    '@/components/ui/Primitives':{Dialog:({open,children})=>open?h('section',{role:'dialog'},children):null},
    '../ServiceUI':{
      Action:({children,variant,...props})=>h('button',props,children),
      Empty:({title,description})=>h('section',null,h('h2',null,title),h('p',null,description)),
      Notice:({children})=>h('p',null,children),
      PageTitle:({children})=>h('h1',null,children),
    },
  });
  const model={mode:'live',data:{settlements:[{id:'period-without-entries',period:'2030.01',status:'pending',availableAt:'2030-02-05'}],earnings:[]}};
  let tree;
  act(()=>{tree=create(h(SettlementsPage,{model,basePath:'/studio'}));});
  assert.match(flatten(tree.toJSON()),/금액 정보 없음/);
  assert.doesNotMatch(flatten(tree.toJSON()),/₩0/);
  act(()=>tree.root.findByType('button').props.onClick());
  assert.match(flatten(tree.toJSON()),/정산 상세 금액을 확인할 수 없어요/);
  assert.doesNotMatch(flatten(tree.toJSON()),/₩0/);
  const populated={...model,data:{...model.data,earnings:[{id:'fully-reversed',settlementId:'period-without-entries',date:'2030-01-31',title:'전액 취소',gross:10000,reversals:10000,fees:0,net:0}]}};
  act(()=>tree.update(h(SettlementsPage,{model:populated,basePath:'/studio'})));
  assert.match(flatten(tree.toJSON()),/₩0/);
  assert.doesNotMatch(flatten(tree.toJSON()),/금액 정보 없음|정산 상세 금액을 확인할 수 없어요/);
  act(()=>tree.unmount());
});
