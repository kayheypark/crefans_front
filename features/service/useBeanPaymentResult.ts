'use client';
import {useEffect,useRef,useState} from 'react';
import {useSearchParams,useRouter} from 'next/navigation';
import type {BeanModel,BeanCharge,BeanPaymentStatus} from '@/types/crefans-beans';
type Result={status:BeanPaymentStatus;charge:BeanCharge|null;message:string};
const validId=(id:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
export function useBeanPaymentResult(model:BeanModel|null,success:boolean){
 const query=useSearchParams(),router=useRouter();
 // Keep callback credentials in memory only while replacing the address with the order ID.
 const input=useRef({id:query.get('id')||'',orderId:query.get('orderId')||'',amount:Number(query.get('amount')),paymentKey:query.get('paymentKey')||''});
 const busy=useRef(false),done=useRef(false),active=useRef(true),currentModel=useRef(model);
 currentModel.current=model;
 const [state,setState]=useState<Result>({status:success?'loading':'cancelled',charge:null,message:success?'충전 결과를 확인하고 있습니다.':'결제가 중단되었습니다. 내 콩 지갑에서 주문을 확인해주세요.'});
 async function confirm(){
  const current=currentModel.current;
  if(!current?.enabled||!current.signedIn||busy.current||done.current)return;
  busy.current=true;
  setState({status:'loading',charge:null,message:'충전 결과를 확인하고 있습니다.'});
  try{
   const {id,...body}=input.current;
   if(!validId(id)){setState({status:'error',charge:null,message:'충전 주문 정보를 찾을 수 없습니다. 내 콩 지갑에서 주문을 확인해주세요.'});return;}
   // A successful return URL is not proof of payment. Read the owner's saved order first.
   let result=await current.getCharge(id);
   if(!active.current)return;
   if(result.success&&['pending','processing'].includes(result.data.status)&&success&&body.paymentKey){
    result=await current.confirmCharge(id,body);
    if(!active.current)return;
   }
   if(!result.success){setState({status:'error',charge:null,message:result.errorMessage});return;}
   const charge=result.data;
   if(charge.status==='paid'){
    done.current=true;input.current.paymentKey='';
    setState({status:'success',charge,message:''});
    // Wallet refresh failure must not turn an approved charge into a failed payment.
    try{await current.refresh();}catch{}
   }else if(charge.status==='cancelled'||!success&&charge.status==='pending'){
    setState({status:'cancelled',charge:null,message:'결제가 중단되었습니다. 내 콩 지갑에서 같은 주문을 이어갈 수 있습니다.'});
   }else if(['pending','processing'].includes(charge.status)){
    setState({status:'pending',charge:null,message:'아직 충전 완료가 확인되지 않았습니다. 같은 주문의 결과를 다시 확인해주세요.'});
   }else{
    setState({status:'error',charge:null,message:'충전 완료 상태가 아닙니다. 내 콩 지갑에서 주문을 확인해주세요.'});
   }
  }catch{
   if(active.current)setState({status:'error',charge:null,message:'충전 결과를 확인하지 못했습니다. 같은 주문으로 다시 확인해주세요.'});
  }finally{busy.current=false;}
 }
 useEffect(()=>{
  active.current=true;
  const id=input.current.id;
  if(model)router.replace(`${model.basePath}/beans/${success?'success':'fail'}${validId(id)?`?id=${id}`:id?'?id=invalid':''}`,{scroll:false});
  if(success||validId(id))void confirm();
  return()=>{active.current=false;};
 },[model?.enabled,model?.signedIn,success]);
 return{...state,retry:confirm};
}
