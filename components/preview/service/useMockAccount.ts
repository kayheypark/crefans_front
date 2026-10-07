'use client';

import {useState,type Dispatch,type SetStateAction,useRef} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import type {Creator,Viewer} from '@/types/crefans';
import type {AccountModel,AccountActionResult,AccountPreferences,AccountTicket} from '@/types/crefans-account';

const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const success=(message:string):AccountActionResult=>({success:true,data:{message},errorMessage:null,errorCode:null});
const failure=(message:string):AccountActionResult=>({success:false,data:null,errorMessage:message,errorCode:'VALIDATION_ERROR'});

export function useMockAccount({viewer,setViewer,setSignedIn,basePath,creators}:{viewer:Viewer;setViewer:Dispatch<SetStateAction<Viewer>>;setSignedIn:Dispatch<SetStateAction<boolean>>;basePath:string;creators:Creator[]}):AccountModel{
  const router=useRouter(),query=useSearchParams();
  const [email,setEmail]=useState('fanjimin@example.com');
  const [preferences,setPreferences]=useState<AccountPreferences>({contentAlert:true,messageAlert:true,marketingAlert:false,showActivity:false,allowSearch:true,showFollowing:true});
  const [blockedCreatorIds,setBlockedCreatorIds]=useState<string[]>(creators.some(creator=>creator.id==='minji')?['minji']:[]);
  const [tickets,setTickets]=useState<AccountTicket[]>([]);
  const inquiryCategories=['계정','멤버십·결제','콘텐츠','기타'];
  // Pending signup code: resend is throttled for 3 minutes, the code itself stays valid for 10 minutes even across sessions.
  const signupCode=useRef<{email:string;sentAt:number}|null>(null);
  const RESEND_COOLDOWN_MS=3*60*1000,CODE_TTL_MS=10*60*1000;
  const logout=async()=>{setSignedIn(false);router.push(`${basePath}/landing`);return success('로그아웃되었습니다.');};
  return{
    account:{email,stats:{posts:12,followers:56},preferences,blockedCreatorIds,paymentMethods:[],tickets,inquiryCategories,
      banner:creators[0]?{src:'/illustrations/redesign/variety/haneul-courtyard-v3.png',alt:`테라스에서 커피를 즐기는 크리에이터 ${creators[0].name}`} : null,
      policies:{terms:'이용약관을 준비하고 있습니다.',privacy:'개인정보 수집 및 이용 안내를 준비하고 있습니다.'},
      guidance:{},
      route:{profileTab:query.get('tab')==='saved'?'saved':query.get('tab')==='liked'?'liked':null,supportTab:query.get('tab')==='qna'?'qna':'faq',settingsSection:(['account','password','email','notifications','payment','privacy','blocked'] as const).find(section=>section===query.get('section'))||null},
    },
    accountActions:{
      signup:async input=>{if(!validEmail(input.email)||input.password.length<8||!input.nickname.trim()||!input.terms||!input.privacy)return failure('가입 정보를 다시 확인해주세요.');if(!input.emailVerified)return failure('이메일 인증을 먼저 완료해주세요.');if(!input.identityVerified)return failure('PASS 본인인증을 먼저 완료해주세요.');return success('가입이 완료되었습니다. 로그인해 주세요.');},
      requestSignupCode:async value=>{if(!validEmail(value))return failure('올바른 이메일 주소를 입력해주세요.');const pending=signupCode.current,now=Date.now();if(pending&&pending.email===value.trim()&&now-pending.sentAt<RESEND_COOLDOWN_MS){const minutes=Math.ceil((RESEND_COOLDOWN_MS-(now-pending.sentAt))/60000);return {success:false,data:null,errorMessage:`이미 보낸 인증 코드가 있어요. 받은 코드를 입력하거나 ${minutes}분 후 다시 요청할 수 있습니다.`,errorCode:'RESEND_COOLDOWN'};}signupCode.current={email:value.trim(),sentAt:now};return success('인증 코드를 보냈어요. 10분 안에 입력해 주세요. 검수용 코드는 123456입니다.');},
      verifySignupCode:async input=>{const pending=signupCode.current;if(!pending||input.email.trim()!==pending.email)return failure('인증 코드를 먼저 요청해주세요.');if(Date.now()-pending.sentAt>CODE_TTL_MS){signupCode.current=null;return failure('인증 코드가 만료되었어요. 다시 요청해 주세요.');}if(input.code.trim()!=='123456')return failure('인증 코드가 올바르지 않습니다.');signupCode.current=null;return success('이메일 인증이 완료되었습니다.');},
      verifyIdentity:async()=>success('PASS 본인인증이 완료되었습니다.'),
      login:async input=>{if(!validEmail(input.email)||input.password.length<8)return failure('이메일과 8자 이상 비밀번호를 입력해주세요.');setSignedIn(true);router.push(`${basePath}/feed`);return success('로그인되었습니다.');},
      updateProfile:async input=>{if(!input.name.trim())return failure('닉네임을 입력해주세요.');setViewer({...viewer,name:input.name.trim(),bio:input.bio.trim()});return success('프로필을 저장했습니다.');},
      updateSettings:async input=>{
        if(input.section==='account'){if(!input.name.trim())return failure('닉네임을 입력해주세요.');setViewer({...viewer,name:input.name.trim()});}
        if(input.section==='email'){if(!validEmail(input.email))return failure('올바른 이메일 주소를 입력해주세요.');setEmail(input.email.trim());return success('이메일 변경을 요청했습니다.');}
        if(input.section==='password'){if(!input.currentPassword||input.newPassword.length<8)return failure('현재 비밀번호와 8자 이상 새 비밀번호를 입력해주세요.');return success('비밀번호를 변경했습니다.');}
        if(input.section==='notifications'){setPreferences(previous=>({...previous,contentAlert:input.contentAlert,messageAlert:input.messageAlert,marketingAlert:input.marketingAlert}));}
        if(input.section==='privacy'){setPreferences(previous=>({...previous,showActivity:input.showActivity,allowSearch:input.allowSearch,showFollowing:input.showFollowing}));}
        return success('설정을 저장했습니다.');
      },
      unblockCreator:async id=>{setBlockedCreatorIds(previous=>previous.filter(blockedId=>blockedId!==id));return success('차단이 해제되었습니다.');},
      logout,
      withdraw:async()=>{setSignedIn(false);router.push(`${basePath}/landing`);return success('탈퇴가 완료되었습니다.');},
      createInquiry:async input=>{if(!inquiryCategories.includes(input.category)||!input.title.trim()||!input.message.trim())return failure('문의 유형, 제목, 내용을 모두 입력해주세요.');setTickets(previous=>[{id:crypto.randomUUID(),category:input.category,title:input.title.trim(),message:input.message.trim(),statusLabel:'접수 완료'},...previous]);return success('문의가 등록되었습니다.');},
    },
  };
}
