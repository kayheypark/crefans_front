'use client';
import {useCallback,useRef,type Dispatch,type SetStateAction} from 'react';
import type {ApiResult,Viewer} from '@/types/crefans';
import type {FoundingBadgeActions,FoundingBadgeStatus} from '@/types/crefans-events';
export function useMockFoundingBadge(setViewer:Dispatch<SetStateAction<Viewer>>):FoundingBadgeActions{
 const receipt=useRef<FoundingBadgeStatus>({status:'available',visible:false,claimedAt:null});
 const load=useCallback(async():Promise<ApiResult<FoundingBadgeStatus>>=>({success:true,data:{...receipt.current},errorCode:null,errorMessage:null}),[]);
 const claim=useCallback(async()=>{if(receipt.current.status!=='claimed'){receipt.current={status:'claimed',visible:true,claimedAt:new Date().toISOString()};setViewer(v=>({...v,isFoundingMember:true}));}return load();},[load,setViewer]);
 const setVisible=useCallback(async(visible:boolean):Promise<ApiResult<FoundingBadgeStatus>>=>{if(receipt.current.status!=='claimed')return{success:false,data:null,errorCode:'BADGE_NOT_CLAIMED',errorMessage:'배지를 먼저 받아주세요.'};receipt.current={...receipt.current,visible};setViewer(v=>({...v,isFoundingMember:visible}));return load();},[load,setViewer]);
 return{load,claim,setVisible};
}
