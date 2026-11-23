import type {ApiResult} from '@/types/crefans';
import {isAdvisorAnswer,type AdvisorAnswer} from '@/lib/crefans/advisor';
import {replaySessionId,replayVisitorId} from '@/lib/analytics/posthog';

/** AI 가이드 질문. 서버가 같은 출처 Origin 만 받는다. `signal`(화면의 멈추기)로 요청을 취소할 수 있고, 30초가 지나면 스스로 취소한다.
 *  2026-11-24 사용자 요청: 서버가 질문·답변을 저장해 운영 콘솔 'AI 가이드 질문 기록'에서 본다. 같은 출처 쿠키(로그인 회원·비회원 체험)를
 *  보내 그 기록을 회원·체험에 연결하고, PostHog 세션·방문자 번호(무작위 UUID, 키가 없으면 없음)를 함께 보내 리플레이로 잇는다. */
export async function askAdvisor(question:string,client?:string,signal?:AbortSignal):Promise<ApiResult<AdvisorAnswer>>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(new DOMException('timeout','TimeoutError')),30000);
 const stop=()=>controller.abort(signal?.reason);
 if(signal?.aborted)stop();else signal?.addEventListener('abort',stop,{once:true});
 try{
  const [sessionId,distinctId]=await Promise.all([replaySessionId(),replayVisitorId()]);
  const replay=sessionId?{replay:{sessionId,...(distinctId?{distinctId}:{})}}:{};
  const response=await fetch('/api/v1/guide/advisor',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,...(client?{client}:{}),...replay}),signal:controller.signal});
  const result=await response.json();
  if(result?.success===true&&isAdvisorAnswer(result.data))return result;
  if(result?.success===false)return{success:false,data:null,errorMessage:result.errorMessage||'답변을 가져오지 못했어요.',errorCode:String(result.errorCode||'ADVISOR_ERROR')};
  throw new Error('Invalid response');
 }catch(error:any){
  if(signal?.aborted)return{success:false,data:null,errorMessage:'답변을 멈췄어요.',errorCode:'ABORTED'};
  if(error?.name==='TimeoutError')return{success:false,data:null,errorMessage:'답변이 늦어지고 있어요.',errorCode:'TIMEOUT'};
  return{success:false,data:null,errorMessage:'답변을 가져오지 못했어요.',errorCode:'NETWORK_ERROR'};
 }finally{clearTimeout(timer);signal?.removeEventListener('abort',stop);}
}
