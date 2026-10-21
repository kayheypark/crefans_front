import {platformRequest as api} from './platform';
export async function startOneTimePayment(id:string){
 const result=await api<{clientKey:string;customerKey:string;orderId:string;amount:number;orderName:string}>(`/checkout/${encodeURIComponent(id)}/payment-window`,{});
 if(!result.success)return result;
 try{const {loadTossPayments}=await import('@tosspayments/tosspayments-sdk'),{clientKey,customerKey,...order}=result.data;
  const sdk=await loadTossPayments(clientKey),query=new URLSearchParams({id});
  await sdk.payment({customerKey}).requestPayment({method:'CARD',...order,amount:{currency:'KRW',value:order.amount},successUrl:`${location.origin}/service/payment/success?${query}`,failUrl:`${location.origin}/service/payment/fail?${query}`});
  return{success:true as const,data:{message:'결제창을 열었습니다.'},errorCode:null,errorMessage:null};
 }catch{return{success:false as const,data:null,errorCode:'PAYMENT_WINDOW_CLOSED',errorMessage:'결제창이 닫혔습니다. 다시 시도해주세요.'};}
}
