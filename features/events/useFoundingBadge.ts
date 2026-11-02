'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {FoundingBadgeActions,FoundingBadgeModel,FoundingBadgeStatus} from '@/types/crefans-events';

export function useFoundingBadge(signedIn:boolean,actions?:FoundingBadgeActions):FoundingBadgeModel{
 const [status,setStatus]=useState<FoundingBadgeModel['status']>(signedIn?'loading':'signed-out');
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const generation=useRef(0),inFlight=useRef(false);
 const load=actions?.load,claim=actions?.claim,save=actions?.setVisible;
 const accept=(result:ApiResult<FoundingBadgeStatus>)=>{
  if(result.success){setStatus(result.data.status);setVisible(result.data.visible);}
  else{if(result.errorCode==='UNAUTHORIZED')setStatus('signed-out');setError(result.errorMessage);}
 };
 const reload=useCallback(async()=>{
  if(inFlight.current)return;
  const token=++generation.current;setError('');
  if(!signedIn){setStatus('signed-out');return;}
  if(!load){setStatus('unavailable');return;}
  setStatus('loading');
  try{const result=await load();if(token!==generation.current)return;
   if(result.success){setStatus(result.data.status);setVisible(result.data.visible);}
   else{setStatus(result.errorCode==='UNAUTHORIZED'?'signed-out':'error');setError(result.errorMessage);}
  }catch{if(token===generation.current){setStatus('error');setError('배지 상태를 확인하지 못했어요. 다시 확인해 주세요.');}}
 },[signedIn,load]);
 useEffect(()=>{inFlight.current=false;setBusy(false);void reload();return()=>{generation.current++;};},[reload]);
 const change=async(next?:boolean)=>{
  if(!signedIn||inFlight.current)return;
  const request=next===undefined?(status==='available'?claim:undefined):(status==='claimed'&&save?()=>save(next):undefined);
  if(!request)return;
  const token=++generation.current;inFlight.current=true;setBusy(true);setError('');
  try{const result=await request();if(token===generation.current)accept(result);}
  catch{if(token===generation.current)setError('저장 결과를 확인하지 못했어요. 다시 시도해 주세요. 중복 수령되지 않아요.');}
  finally{if(token===generation.current){inFlight.current=false;setBusy(false);}}
 };
 return{status:signedIn?status:'signed-out',visible,busy,error,onClaim:()=>{void change();},onVisible:value=>{void change(value);},onReload:()=>{void reload();}};
}
