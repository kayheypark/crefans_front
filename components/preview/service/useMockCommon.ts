'use client';

import {useState} from 'react';
import type {CommonActionResult,CommonModel,LegalKind} from '@/types/crefans-common';

const validEmail=(email:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const ok=(message:string):CommonActionResult=>({success:true,data:{message},errorMessage:null,errorCode:null});
const fail=(errorMessage:string,errorCode='VALIDATION_ERROR'):CommonActionResult=>({success:false,data:null,errorMessage,errorCode});
const titles:Record<LegalKind,string>={terms:'이용약관',privacy:'개인정보처리방침',policy:'운영정책'};
const legal=Object.fromEntries(Object.entries(titles).map(([kind,title])=>[kind,{title,updatedAt:'',sections:[{title:'문서 안내',body:`${title}을 준비하고 있습니다.`},{title:'관련 문의',body:'문서와 서비스 이용에 관한 질문은 고객센터의 문의하기를 통해 남길 수 있습니다.'}]}])) as CommonModel['legal'];

export function useMockCommon({email:initialEmail=''}:{email?:string}={}):CommonModel{
  const [email]=useState(initialEmail);
  const [resetRequest,setResetRequest]=useState('');
  const [paymentMethods,setMethods]=useState<CommonModel['paymentMethods']>([]);
  return {
    notices:[{id:'welcome',title:'크레팬스 서비스 이용 안내',category:'안내',date:'2026.09.12',pinned:true,paragraphs:['크리에이터와 팬이 함께하는 화면을 둘러보세요.','관심 있는 크리에이터를 팔로우하고 새로운 소식을 만나보세요.']},{id:'account-check',title:'계정과 멤버십 정보 확인하기',category:'서비스',date:'2026.09.10',pinned:false,paragraphs:['내 프로필에서 팔로잉 목록과 멤버십 상태를 확인할 수 있습니다.','계정 정보와 알림은 설정에서 변경할 수 있습니다.']}],
    legal,auth:{email,guidance:'',codeHint:'인증 코드: 123456'},
    paymentMethods,registrationPreview:{cards:[{value:'shinhan',label:'신한카드',number:'•••• •••• •••• 1234'},{value:'samsung',label:'삼성카드',number:'•••• •••• •••• 5678'},{value:'kb',label:'KB국민카드',number:'•••• •••• •••• 9012'}],expiry:'12 / 29',code:'000000'},paymentGuidance:'정기 결제에 사용할 결제수단을 등록하고 관리하세요.',
    actions:{
      requestPasswordReset:async value=>{if(!validEmail(value))return fail('올바른 이메일 주소를 입력해 주세요.');setResetRequest(value.trim());return ok('인증 코드를 입력하고 새 비밀번호를 설정해주세요.');},
      resetPassword:async input=>{if(input.email.trim()!==resetRequest||!resetRequest)return fail('비밀번호 재설정을 먼저 요청해 주세요.','REQUEST_REQUIRED');if(input.code.trim()!=='123456')return fail('인증 코드가 일치하지 않습니다.','INVALID_CODE');if(input.password.length<8)return fail('새 비밀번호를 8자 이상 입력해 주세요.');setResetRequest('');return ok('비밀번호 재설정이 완료되었습니다.');},
      addPaymentMethod:async input=>{const card=input?.previewCard||'shinhan',labels={shinhan:'신한카드',samsung:'삼성카드',kb:'KB국민카드'},suffix={shinhan:'1234',samsung:'5678',kb:'9012'};setMethods(previous=>[...previous,{id:crypto.randomUUID(),label:labels[card],description:`•••• ${suffix[card]}`,isDefault:previous.length===0}]);return ok('카드 등록이 완료되었습니다.');},
      removePaymentMethod:async id=>{if(!paymentMethods.some(method=>method.id===id))return fail('결제수단을 찾을 수 없습니다.','NOT_FOUND');setMethods(previous=>{const remaining=previous.filter(method=>method.id!==id);return remaining.some(method=>method.isDefault)?remaining:remaining.map((method,index)=>({...method,isDefault:index===0}));});return ok('결제수단을 삭제했습니다.');},
      setDefaultPaymentMethod:async id=>{if(!paymentMethods.some(method=>method.id===id))return fail('결제수단을 찾을 수 없습니다.','NOT_FOUND');setMethods(previous=>previous.map(method=>({...method,isDefault:method.id===id})));return ok('기본 결제수단을 변경했습니다.');},
    },
  };
}
