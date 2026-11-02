'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {PromotionClaimModel,PromotionClaimStatus} from '@/types/crefans-events';

type Request=()=>Promise<ApiResult<PromotionClaimStatus>>;
export function usePromotionClaim(signedIn:boolean,load?:Request,claim?:Request):PromotionClaimModel{
 const [status,setStatus]=useState<PromotionClaimModel['status']>(signedIn?'loading':'signed-out');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const generation=useRef(0),inFlight=useRef(false);
 const reload=useCallback(async()=>{
  if(inFlight.current)return;
  const token=++generation.current;
  if(!signedIn){setStatus('signed-out');setError('');return;}
  if(!load){setStatus('unavailable');return;}
  setStatus('loading');setError('');
  try{const r=await load();if(token!==generation.current)return;
   if(r.success)setStatus(r.data.status);
   else{setStatus(r.errorCode==='UNAUTHORIZED'?'signed-out':'error');setError(r.errorMessage);}
  }catch{if(token===generation.current){setStatus('error');setError('지급 상태를 확인하지 못했어요. 다시 확인해 주세요.');}}
 },[signedIn,load]);
 useEffect(()=>{inFlight.current=false;setBusy(false);void reload();return()=>{generation.current++;};},[reload]);
 const receive=async()=>{
  if(!signedIn||status!=='available'||!claim||inFlight.current)return;
  inFlight.current=true;const token=++generation.current;setBusy(true);setError('');
  try{const r=await claim();if(token!==generation.current)return;
   if(r.success)setStatus(r.data.status);
   else{if(r.errorCode==='UNAUTHORIZED')setStatus('signed-out');setError(r.errorMessage);}
  }catch{if(token===generation.current)setError('지급 결과를 확인하지 못했어요. 다시 눌러도 중복 지급되지 않아요.');}
  finally{if(token===generation.current){inFlight.current=false;setBusy(false);}}
 };
 return{status:signedIn?status:'signed-out',busy,error,onClaim:()=>{void receive();},onReload:()=>{void reload();}};
}
