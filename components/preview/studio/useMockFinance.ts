'use client';

import {useEffect,useRef,useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {FinanceSummary,SettlementAccount,SettlementAccountInput,StudioFinanceModel,WithdrawalInput,WithdrawalQuote,WithdrawalRequest,StudioWithdrawal} from '@/types/crefans-studio-finance';
import {createInitialFinanceState,FINANCE_SAMPLE_DATE,type MockFinanceState} from './finance-fixtures';

const success=<T,>(data:T):ApiResult<T>=>({success:true,data,errorMessage:null,errorCode:null});
const failure=<T,>(errorMessage:string,errorCode:string):ApiResult<T>=>({success:false,data:null,errorMessage,errorCode});
type WithdrawalAuthorization={id:string;amount:number;accountId:string;accountSnapshot:string;expiresAt:number};
const accountSnapshot=(account:SettlementAccount)=>JSON.stringify([account.id,account.bank,account.holderAlias,account.lastFour]);
const validPin=(pin:string)=>typeof pin==='string'&&/^\d{6}$/.test(pin);
// This in-memory verifier only protects the local preview flow; live authorization belongs on the server.
async function hashPin(pin:string,salt:Uint8Array){
  const encoded=new TextEncoder().encode(pin),bytes=new Uint8Array(salt.length+encoded.length);
  bytes.set(salt);bytes.set(encoded,salt.length);
  return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
}
function sameHash(left:Uint8Array,right:Uint8Array){let difference=left.length^right.length;for(let index=0;index<left.length;index++)difference|=left[index]^(right[index]??0);return difference===0;}

export function calculateFinanceSummary(state:MockFinanceState):FinanceSummary{
  const summary:FinanceSummary={gross:0,reversals:0,fees:0,net:0,pending:0,available:0,requested:0,paid:0};
  for(const earning of state.earnings){
    summary.gross+=earning.gross;summary.reversals+=earning.reversals;summary.fees+=earning.fees;summary.net+=earning.net;
    if(state.settlements.find(settlement=>settlement.id===earning.settlementId)?.status==='available')summary.available+=earning.net;
    else summary.pending+=earning.net;
  }
  for(const withdrawal of state.withdrawals){
    if(withdrawal.status==='requested'||withdrawal.status==='processing')summary.requested+=withdrawal.amount;
    if(withdrawal.status==='paid')summary.paid+=withdrawal.amount;
  }
  summary.available-=summary.requested+summary.paid;
  return summary;
}

export function reviewMockWithdrawal(state:MockFinanceState,input:WithdrawalInput):ApiResult<WithdrawalQuote>{
  if(!Number.isFinite(input.amount)||!Number.isSafeInteger(input.amount)||input.amount<=0)return failure('출금 금액은 1원 이상의 정수로 입력해 주세요.','INVALID_AMOUNT');
  const account=state.accounts.find(item=>item.id===input.accountId);
  if(!account)return failure('수령 계좌를 선택해 주세요.','ACCOUNT_NOT_FOUND');
  if(!account.verified)return failure('확인이 완료된 계좌로만 출금을 요청할 수 있습니다.','ACCOUNT_NOT_VERIFIED');
  const available=calculateFinanceSummary(state).available;
  if(input.amount>available)return failure('출금 가능 금액을 초과했습니다. 잔액을 확인해 주세요.','INSUFFICIENT_BALANCE');
  return success({amount:input.amount,account:{...account},availableAfterRequest:available-input.amount});
}

export function applyMockWithdrawal(state:MockFinanceState,input:WithdrawalRequest,today:string,authorization?:WithdrawalAuthorization):{state:MockFinanceState;result:ApiResult<{withdrawal:StudioWithdrawal;message:string}>}{
  if(typeof input.requestId!=='string'||!input.requestId.trim())return {state,result:failure('요청 식별자가 필요합니다. 다시 시도해 주세요.','MISSING_REQUEST_ID')};
  const existing=state.withdrawals.find(item=>item.requestId===input.requestId);
  if(existing){
    if(existing.amount!==input.amount||existing.accountId!==input.accountId)return {state,result:failure('같은 요청 식별자로 다른 출금을 요청할 수 없습니다.','REQUEST_CONFLICT')};
    return {state,result:success({withdrawal:existing,message:'이미 접수된 출금 요청입니다.'})};
  }
  if(!input.authorizationId||!authorization||authorization.id!==input.authorizationId)return {state,result:failure('출금 비밀번호를 확인한 뒤 다시 요청해 주세요.','WITHDRAWAL_AUTH_REQUIRED')};
  if(authorization.expiresAt<=Date.now())return {state,result:failure('비밀번호 확인 시간이 만료되었습니다. 다시 확인해 주세요.','WITHDRAWAL_AUTH_EXPIRED')};
  if(authorization.amount!==input.amount||authorization.accountId!==input.accountId)return {state,result:failure('출금 금액이나 계좌가 변경되었습니다. 비밀번호를 다시 확인해 주세요.','WITHDRAWAL_AUTH_MISMATCH')};
  const quote=reviewMockWithdrawal(state,input);
  if(!quote.success)return {state,result:failure(quote.errorMessage,quote.errorCode)};
  if(authorization.accountSnapshot!==accountSnapshot(quote.data.account))return {state,result:failure('수령 계좌 정보가 변경되었습니다. 비밀번호를 다시 확인해 주세요.','WITHDRAWAL_AUTH_MISMATCH')};
  const withdrawal:StudioWithdrawal={id:`withdrawal-${state.sequence+1}`,requestId:input.requestId,accountId:quote.data.account.id,accountLabel:`${quote.data.account.bank} · •••• ${quote.data.account.lastFour}`,amount:input.amount,requestedAt:today,status:'requested',statusNote:'출금 요청이 접수되어 처리 대기 중입니다.'};
  return {state:{...state,sequence:state.sequence+1,withdrawals:[withdrawal,...state.withdrawals]},result:success({withdrawal,message:'출금 요청이 접수되었습니다.'})};
}

export function useMockFinance():StudioFinanceModel{
  const [state,setState]=useState(createInitialFinanceState);
  const [pinConfigured,setPinConfigured]=useState(false);
  const current=useRef(state);
  const verifier=useRef<{salt:Uint8Array;hash:Uint8Array}|null>(null),authorizations=useRef(new Map<string,WithdrawalAuthorization>());
  const active=useRef(true),settingPin=useRef(false),checkingPin=useRef(false),pinAttempts=useRef({failed:0,lockedUntil:0});
  useEffect(()=>{active.current=true;return()=>{active.current=false;verifier.current=null;authorizations.current.clear();};},[]);
  const commit=(next:MockFinanceState)=>{current.current=next;setState(next);};
  const setupWithdrawalPin:StudioFinanceModel['setupWithdrawalPin']=async pin=>{
    if(!active.current)return failure('사용 중인 화면을 다시 열어주세요.','SESSION_CLOSED');
    if(verifier.current)return failure('출금 비밀번호가 이미 설정되어 있습니다.','PIN_ALREADY_CONFIGURED');
    if(!validPin(pin))return failure('출금 비밀번호는 숫자 6자리로 입력해주세요.','INVALID_PIN_FORMAT');
    if(settingPin.current)return failure('비밀번호를 설정하고 있습니다. 잠시 기다려주세요.','PIN_SETUP_BUSY');
    settingPin.current=true;
    try{
      const salt=crypto.getRandomValues(new Uint8Array(16)),hash=await hashPin(pin,salt);
      if(!active.current)return failure('사용 중인 화면을 다시 열어주세요.','SESSION_CLOSED');
      verifier.current={salt,hash};setPinConfigured(true);
      return success({message:'출금 비밀번호를 설정했습니다.'});
    }catch{return failure('출금 비밀번호를 설정하지 못했습니다. 다시 시도해주세요.','PIN_SETUP_FAILED');}finally{settingPin.current=false;}
  };
  const verifyWithdrawalPin:StudioFinanceModel['verifyWithdrawalPin']=async(pin,input)=>{
    if(!active.current)return failure('사용 중인 화면을 다시 열어주세요.','SESSION_CLOSED');
    const stored=verifier.current;if(!stored)return failure('출금 비밀번호를 먼저 설정해주세요.','PIN_NOT_CONFIGURED');
    const now=Date.now();
    if(pinAttempts.current.lockedUntil>now)return failure(`${Math.ceil((pinAttempts.current.lockedUntil-now)/1000)}초 후에 출금 비밀번호를 다시 확인해주세요.`,'PIN_LOCKED');
    if(pinAttempts.current.lockedUntil)pinAttempts.current={failed:0,lockedUntil:0};
    if(!validPin(pin))return failure('출금 비밀번호는 숫자 6자리로 입력해주세요.','INVALID_PIN_FORMAT');
    if(checkingPin.current)return failure('비밀번호를 확인하고 있습니다. 잠시 기다려주세요.','PIN_CHECK_BUSY');
    checkingPin.current=true;
    try{
      const candidate=await hashPin(pin,stored.salt);
      if(!active.current)return failure('사용 중인 화면을 다시 열어주세요.','SESSION_CLOSED');
      if(!sameHash(stored.hash,candidate)){
        pinAttempts.current.failed++;
        if(pinAttempts.current.failed>=5){pinAttempts.current.lockedUntil=Date.now()+30000;return failure('비밀번호를 5회 잘못 입력했습니다. 30초 후 다시 시도해주세요.','PIN_LOCKED');}
        return failure('출금 비밀번호가 일치하지 않습니다.','INCORRECT_PIN');
      }
      pinAttempts.current={failed:0,lockedUntil:0};
      const quote=reviewMockWithdrawal(current.current,input);
      if(!quote.success)return failure(quote.errorMessage,quote.errorCode);
      const id=crypto.randomUUID(),issuedAt=Date.now();
      for(const [key,grant] of Array.from(authorizations.current.entries()))if(grant.expiresAt<=issuedAt)authorizations.current.delete(key);
      authorizations.current.set(id,{id,amount:quote.data.amount,accountId:quote.data.account.id,accountSnapshot:accountSnapshot(quote.data.account),expiresAt:issuedAt+120000});
      return success({authorizationId:id});
    }catch{return failure('출금 비밀번호를 확인하지 못했습니다. 다시 시도해주세요.','PIN_CHECK_FAILED');}finally{checkingPin.current=false;}
  };
  const saveAccount:StudioFinanceModel['saveAccount']=async(input:SettlementAccountInput,accountId?:string)=>{
    const bank=input.bank.trim(),holderAlias=input.holderAlias.trim(),lastFour=input.lastFour.trim();
    if(!bank||!holderAlias||!/^\d{4}$/.test(lastFour))return failure('은행, 예금주 별칭, 계좌 끝 4자리를 확인해 주세요.','INVALID_ACCOUNT');
    const previous=accountId?current.current.accounts.find(account=>account.id===accountId):undefined;
    if(accountId&&!previous)return failure('수정할 계좌를 찾을 수 없습니다.','ACCOUNT_NOT_FOUND');
    if(previous&&previous.bank===bank&&previous.holderAlias===holderAlias&&previous.lastFour===lastFour)return success({account:previous,message:'변경된 계좌 정보가 없습니다. 기존 확인과 기본 계좌 설정을 유지합니다.'});
    if(current.current.accounts.some(account=>account.id!==accountId&&account.bank===bank&&account.lastFour===lastFour))return failure('같은 은행과 끝 번호의 계좌가 이미 등록되어 있습니다.','DUPLICATE_ACCOUNT');
    const sequence=current.current.sequence+1;
    const account={id:previous?.id||`account-${sequence}`,bank,holderAlias,lastFour,verified:false,isDefault:false};
    commit({...current.current,sequence,accounts:previous?current.current.accounts.map(item=>item.id===accountId?account:item):[...current.current.accounts,account]});
    return success({account,message:'계좌 정보를 저장했습니다. 출금 요청 전에 계좌 확인을 완료해 주세요.'});
  };
  const verifyAccount:StudioFinanceModel['verifyAccount']=async accountId=>{
    if(!current.current.accounts.some(account=>account.id===accountId))return failure('확인할 계좌를 찾을 수 없습니다.','ACCOUNT_NOT_FOUND');
    const hasDefault=current.current.accounts.some(account=>account.isDefault&&account.verified);
    commit({...current.current,accounts:current.current.accounts.map(account=>account.id===accountId?{...account,verified:true,isDefault:account.isDefault||!hasDefault}:account)});
    return success({message:'계좌 확인을 완료했습니다.'});
  };
  const setDefaultAccount:StudioFinanceModel['setDefaultAccount']=async accountId=>{
    const account=current.current.accounts.find(item=>item.id===accountId);
    if(!account?.verified)return failure('확인이 완료된 계좌를 기본 계좌로 설정해 주세요.','ACCOUNT_NOT_VERIFIED');
    commit({...current.current,accounts:current.current.accounts.map(item=>({...item,isDefault:item.id===accountId}))});
    return success({message:'기본 수령 계좌를 변경했습니다.'});
  };
  return {
    mode:'mock',today:FINANCE_SAMPLE_DATE,pinConfigured,setupWithdrawalPin,verifyWithdrawalPin,
    data:{earnings:state.earnings,settlements:state.settlements,withdrawals:state.withdrawals,accounts:state.accounts,summary:calculateFinanceSummary(state),policyNotice:''},
    reviewWithdrawal:async input=>reviewMockWithdrawal(current.current,input),
    requestWithdrawal:async input=>{
      if(!active.current)return failure('사용 중인 화면을 다시 열어주세요.','SESSION_CLOSED');
      const transaction=applyMockWithdrawal(current.current,input,FINANCE_SAMPLE_DATE,authorizations.current.get(input.authorizationId));
      if(transaction.result.success&&transaction.state!==current.current){authorizations.current.delete(input.authorizationId);commit(transaction.state);}
      return transaction.result;
    },
    saveAccount,verifyAccount,setDefaultAccount,
  };
}
