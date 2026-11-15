'use client';
import {useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';

// 2026-11-15: a creator asks for the Modusign partnership contract from the withdrawal screen (server: POST studio/partner-request,
// once a day, operator alert). Preview mode answers locally without calling the server.
export function usePartnerRequest(mock=false){
 const [pending,setPending]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function request(){
  if(pending)return;setPending(true);setError('');
  try{
   if(mock){setMessage('목업: 파트너 계약 요청을 보냈어요.');return;}
   const r=await api<{requested:boolean;message:string}>('/studio/partner-request',{});
   if(r.success)setMessage(r.data.message);else setError(r.errorMessage||'요청하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }finally{setPending(false);}
 }
 return{pending,message,error,request};
}
