const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const {createInitialFinanceState}=loadTypeScript('components/preview/studio/finance-fixtures.ts');
const {useMockFinance,applyMockWithdrawal}=loadTypeScript('components/preview/studio/useMockFinance.ts');
const pin='246810',intent={amount:100000,accountId:'account-verified'};
function mount(){let model,tree,closed=false;function Probe(){model=useMockFinance();return null;}act(()=>{tree=create(React.createElement(Probe));});return {get model(){return model;},close(){if(!closed){act(()=>tree.unmount());closed=true;}}};}
async function call(operation){let result;await act(async()=>{result=await operation();});return result;}
async function setup(view,value=pin){const result=await call(()=>view.model.setupWithdrawalPin(value));assert.equal(result.success,true);}
async function grant(view,input=intent){const result=await call(()=>view.model.verifyWithdrawalPin(pin,input));assert.equal(result.success,true);return result.data.authorizationId;}
async function submit(view,authorizationId,input=intent,requestId='intent-1'){return call(()=>view.model.requestWithdrawal({...input,requestId,authorizationId}));}

test('withdrawal PIN starts unset, accepts exactly six digits and cannot be overwritten by setup',async()=>{
 const view=mount();
 try{
  assert.equal(view.model.pinConfigured,false);
  for(const value of ['', '12345','1234567','12345a',' 246810',246810]){
   const result=await call(()=>view.model.setupWithdrawalPin(value));assert.equal(result.errorCode,'INVALID_PIN_FORMAT');assert.equal(view.model.pinConfigured,false);
  }
  await setup(view);assert.equal(view.model.pinConfigured,true);
  assert.doesNotMatch(JSON.stringify(view.model),new RegExp(pin));
  const overwrite=await call(()=>view.model.setupWithdrawalPin('135790'));assert.equal(overwrite.errorCode,'PIN_ALREADY_CONFIGURED');
  assert.equal((await call(()=>view.model.verifyWithdrawalPin('135790',intent))).errorCode,'INCORRECT_PIN');
  assert.ok(await grant(view));
 }finally{view.close();}
});

test('new withdrawal requests cannot bypass PIN authorization through either mock boundary',async()=>{
 const state=createInitialFinanceState(),transaction=applyMockWithdrawal(state,{...intent,requestId:'bypass',authorizationId:''},'2030-01-01');
 assert.equal(transaction.result.errorCode,'WITHDRAWAL_AUTH_REQUIRED');assert.equal(transaction.state,state);
 const view=mount();
 try{
  assert.equal((await call(()=>view.model.verifyWithdrawalPin(pin,intent))).errorCode,'PIN_NOT_CONFIGURED');
  assert.equal((await submit(view,'forged')).errorCode,'WITHDRAWAL_AUTH_REQUIRED');
  await setup(view);assert.equal((await submit(view,undefined)).errorCode,'WITHDRAWAL_AUTH_REQUIRED');
  assert.equal(view.model.data.withdrawals.length,3);assert.equal(view.model.data.summary.available,1151900);
 }finally{view.close();}
});

test('authorization is scoped to the verified amount and account, consumed only on acceptance, and replay remains idempotent',async()=>{
 const view=mount();
 try{
  await setup(view);const authorizationId=await grant(view);
  assert.equal((await submit(view,authorizationId,{...intent,amount:intent.amount+1})).errorCode,'WITHDRAWAL_AUTH_MISMATCH');
  assert.equal((await submit(view,authorizationId,{...intent,accountId:'account-unverified'})).errorCode,'WITHDRAWAL_AUTH_MISMATCH');
  const accepted=await submit(view,authorizationId);assert.equal(accepted.success,true);
  const withdrawals=view.model.data.withdrawals,balance=view.model.data.summary.available;
  assert.equal((await submit(view,authorizationId,intent,'intent-2')).errorCode,'WITHDRAWAL_AUTH_REQUIRED');
  const replay=await submit(view,authorizationId);assert.equal(replay.success,true);assert.equal(replay.data.withdrawal.id,accepted.data.withdrawal.id);
  assert.equal(view.model.data.withdrawals,withdrawals);assert.equal(view.model.data.summary.available,balance);
  assert.equal((await submit(view,authorizationId,{...intent,amount:1})).errorCode,'REQUEST_CONFLICT');
 }finally{view.close();}
});

test('authorization expires after two minutes and the same unaccepted request can succeed after fresh verification',async()=>{
 const previousNow=Date.now;let now=1000000;Date.now=()=>now;const view=mount();
 try{
  await setup(view);const authorizationId=await grant(view);now+=120000;
  assert.equal((await submit(view,authorizationId)).errorCode,'WITHDRAWAL_AUTH_EXPIRED');assert.equal(view.model.data.withdrawals.length,3);
  const fresh=await grant(view);assert.notEqual(fresh,authorizationId);const accepted=await submit(view,fresh);assert.equal(accepted.success,true);
  now+=120001;const replay=await submit(view,fresh);assert.equal(replay.success,true);assert.equal(replay.data.withdrawal.id,accepted.data.withdrawal.id);
 }finally{view.close();Date.now=previousNow;}
});

test('account changes invalidate the destination snapshot, while failed validation does not consume the grant',async()=>{
 const view=mount();
 try{
  await setup(view);const authorizationId=await grant(view),account=view.model.data.accounts.find(item=>item.id===intent.accountId);
  await call(()=>view.model.saveAccount({bank:'변경 은행',holderAlias:'다른 별칭',lastFour:'0099'},account.id));
  assert.equal((await submit(view,authorizationId)).errorCode,'ACCOUNT_NOT_VERIFIED');
  await call(()=>view.model.verifyAccount(account.id));
  assert.equal((await submit(view,authorizationId)).errorCode,'WITHDRAWAL_AUTH_MISMATCH');
  await call(()=>view.model.saveAccount({bank:account.bank,holderAlias:account.holderAlias,lastFour:account.lastFour},account.id));
  await call(()=>view.model.verifyAccount(account.id));
  assert.equal((await submit(view,authorizationId)).success,true);
 }finally{view.close();}
});

test('five incorrect PINs impose a thirty-second lock and a correct PIN cannot bypass the lock',async()=>{
 const previousNow=Date.now;let now=2000000;Date.now=()=>now;const view=mount();
 try{
  await setup(view);
  for(let attempt=0;attempt<4;attempt++)assert.equal((await call(()=>view.model.verifyWithdrawalPin('111111',intent))).errorCode,'INCORRECT_PIN');
  assert.equal((await call(()=>view.model.verifyWithdrawalPin('111111',intent))).errorCode,'PIN_LOCKED');
  assert.equal((await call(()=>view.model.verifyWithdrawalPin(pin,intent))).errorCode,'PIN_LOCKED');
  now+=29999;assert.equal((await call(()=>view.model.verifyWithdrawalPin(pin,intent))).errorCode,'PIN_LOCKED');
  now+=1;assert.ok(await grant(view));
  assert.equal((await call(()=>view.model.verifyWithdrawalPin('111111',intent))).errorCode,'INCORRECT_PIN');
 }finally{view.close();Date.now=previousNow;}
});

test('parallel setup and PIN checks do not overwrite the verifier or bypass serialized attempt accounting',async()=>{
 const view=mount();
 try{
  let setupResults;await act(async()=>{setupResults=await Promise.all([view.model.setupWithdrawalPin(pin),view.model.setupWithdrawalPin('135790')]);});
  assert.equal(setupResults[0].success,true);assert.equal(setupResults[1].errorCode,'PIN_SETUP_BUSY');
  let attempts;await act(async()=>{attempts=await Promise.all([view.model.verifyWithdrawalPin('111111',intent),view.model.verifyWithdrawalPin('111111',intent)]);});
  assert.equal(attempts[0].errorCode,'INCORRECT_PIN');assert.equal(attempts[1].errorCode,'PIN_CHECK_BUSY');
  assert.ok(await grant(view));
 }finally{view.close();}
});

test('authorization belongs to one provider session and old callbacks stop accepting requests after unmount',async()=>{
 const first=mount(),second=mount();
 try{
  await setup(first);await setup(second);const authorizationId=await grant(first);
  assert.equal((await submit(second,authorizationId)).errorCode,'WITHDRAWAL_AUTH_REQUIRED');
  const previous=first.model;first.close();
  assert.equal((await call(()=>previous.requestWithdrawal({...intent,requestId:'closed',authorizationId}))).errorCode,'SESSION_CLOSED');
  assert.equal((await call(()=>previous.verifyWithdrawalPin(pin,intent))).errorCode,'SESSION_CLOSED');
  assert.equal((await call(()=>previous.setupWithdrawalPin(pin))).errorCode,'SESSION_CLOSED');
 }finally{first.close();second.close();}
});

test('a correct PIN cannot authorize an invalid amount, an unverified account or an insufficient balance',async()=>{
 const view=mount();
 try{
  await setup(view);
  for(const [input,code] of [[{...intent,amount:0},'INVALID_AMOUNT'],[{...intent,accountId:'account-unverified'},'ACCOUNT_NOT_VERIFIED'],[{...intent,amount:1151901},'INSUFFICIENT_BALANCE']]){
   const result=await call(()=>view.model.verifyWithdrawalPin(pin,input));assert.equal(result.errorCode,code);assert.equal(result.data,null);
  }
  assert.equal(view.model.data.withdrawals.length,3);
 }finally{view.close();}
});
