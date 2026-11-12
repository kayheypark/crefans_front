// 목업 AI 가이드: 서버(OpenAI)를 호출하지 않는 대역. 디자인 시스템 카탈로그와 /preview 고객센터가 같은 대역을 쓴다.
import type {ApiResult} from '@/types/crefans';
import type {AdvisorAnswer} from '@/lib/crefans/advisor';

const GUIDE='https://guide.crefans.com';
export const mockAdvisorAnswers={
 table:{answer:'멤버십과 콩 충전은 환불 기준이 달라요.\n\n| 구분 | 7일 이내 | 7일 이후 |\n| --- | --- | --- |\n| 멤버십 | **구독 콘텐츠를 이용하지 않았다면 전액** | 가입 당시 조건 확인 |\n| 충전 콩 | **쓰지 않은 콩 전액** | **10% 공제** 후 환불 |\n\n멤버십 환불은 고객센터 문의로, 콩 환불은 지갑의 충전 내역에서 신청해요.',found:true,
  sources:[{title:'멤버십 구독·해지·환불',section:'환불',url:`${GUIDE}/fans/membership/#환불`},{title:'콩 충전과 후원',section:'환불과 유효기간',url:`${GUIDE}/fans/beans/#환불과-유효기간`}]},
 plain:{answer:'갱신을 해지해도 **이미 결제한 이용 기간이 끝날 때까지** 그대로 이용할 수 있어요. 해지 예약은 다음 자동 갱신을 멈추는 기능이고, 결제한 금액을 자동으로 환불하지는 않아요.',found:true,
  sources:[{title:'멤버십 구독·해지·환불',section:'해지 예약',url:`${GUIDE}/fans/membership/#해지-예약`}]},
 creator:{answer:'==크리에이터 전환은 로그인한 뒤 크리에이터 스튜디오에서 **크리에이터 시작하기**를 눌러 진행하면 돼요.== 활동명과 주요 활동 분야를 입력하고 공개 프로필 설정을 완료하면 스튜디오를 이용할 수 있어요.',found:true,
  sources:[{title:'크리에이터 시작하기',section:'전환 방법',url:`${GUIDE}/creators/start/`}]},
 notFound:{answer:'크레팬스 이용 방법과 정책에 대해서만 답변할 수 있어요. 크레팬스와 관련된 질문을 해 주세요.',found:false,sources:[]},
} satisfies Record<string,AdvisorAnswer>;

export type MockAdvisorMode='normal'|'notFound'|'error'|'limit';
const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export function mockAdvisorAsk(mode:MockAdvisorMode='normal',delay=700){
 return async(question:string):Promise<ApiResult<AdvisorAnswer>>=>{
  await wait(delay);
  if(mode==='error')return{success:false,data:null,errorMessage:'답변을 가져오지 못했어요.',errorCode:'PROVIDER_ERROR'};
  if(mode==='limit')return{success:false,data:null,errorMessage:'오늘 질문 15회를 모두 사용했어요. 매일 오전 9시에 다시 이용할 수 있어요.',errorCode:'DAILY_LIMIT'};
  const data=mode==='notFound'?mockAdvisorAnswers.notFound:/환불|충전/.test(question)?mockAdvisorAnswers.table:/크리에이터/.test(question)?mockAdvisorAnswers.creator:mockAdvisorAnswers.plain;
  return{success:true,data,errorMessage:null,errorCode:null};
 };
}
