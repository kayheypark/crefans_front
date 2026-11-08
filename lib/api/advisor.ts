import type {ApiResult} from '@/types/crefans';
import {isAdvisorAnswer,type AdvisorAnswer} from '@/lib/crefans/advisor';

/** AI 가이드 질문. 계정과 무관한 기능이라 쿠키를 보내지 않는다(credentials: omit). 서버가 같은 출처 Origin 만 받는다. */
export async function askAdvisor(question:string,client?:string):Promise<ApiResult<AdvisorAnswer>>{
 try{
  const response=await fetch('/api/v1/guide/advisor',{method:'POST',credentials:'omit',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(client?{question,client}:{question}),signal:AbortSignal.timeout(30000)});
  const result=await response.json();
  if(result?.success===true&&isAdvisorAnswer(result.data))return result;
  if(result?.success===false)return{success:false,data:null,errorMessage:result.errorMessage||'답변을 가져오지 못했어요.',errorCode:String(result.errorCode||'ADVISOR_ERROR')};
  throw new Error('Invalid response');
 }catch(error:any){
  if(error?.name==='TimeoutError')return{success:false,data:null,errorMessage:'답변이 늦어지고 있어요.',errorCode:'TIMEOUT'};
  return{success:false,data:null,errorMessage:'답변을 가져오지 못했어요.',errorCode:'NETWORK_ERROR'};
 }
}
