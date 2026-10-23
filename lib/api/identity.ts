import {platformRequest as api} from './platform';
import type {ApiResult} from '@/types/crefans';
export async function verifyIdentity(purpose:'signup'|'withdrawal-pin'):Promise<ApiResult<{message:string;proof:string}>>{
 const popup=window.open('about:blank','crefans-pass','width=480,height=720');
 const start=await api<{attemptId:string;state:string;redirectUrl:string}>('/identity/start',{purpose});
 if(!start.success){popup?.close();return start;}
 if(!popup)return{success:false,data:null,errorMessage:'본인인증 팝업을 허용해주세요.',errorCode:'POPUP_BLOCKED'};
 popup.location.href=start.data.redirectUrl;
 for(let count=0;count<180;count++){
   await new Promise(resolve=>setTimeout(resolve,2000));
   const result=await api<{status:string;proof:string|null;message:string}>('/identity/status',{attemptId:start.data.attemptId,state:start.data.state});
   if(!result.success){popup.close();return result;}
   if(result.data.status==='verified'&&result.data.proof){popup.close();return{success:true,data:{message:result.data.message,proof:result.data.proof},errorMessage:null,errorCode:null};}
   if(popup.closed)break;
 }
 popup.close();return{success:false,data:null,errorMessage:'본인인증을 완료하지 못했습니다. 다시 시도해주세요.',errorCode:'IDENTITY_INCOMPLETE'};
}
