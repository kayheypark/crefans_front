'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {Action} from '@/components/crefans/ServiceUI';
import {AiPhotoDialog} from '@/components/crefans/studio/AiPhotoDialog';
import {mockAiPhotoCrop,mockAiPhotoEdit,type MockAiPhotoMode} from '@/components/preview/studio/ai-photo-fixtures';
import {AI_PHOTO_DAILY_LIMIT} from '@/lib/crefans/ai-photo';
import s from './custom.module.css';

const photos=[{id:'cover',type:'image' as const,url:'/illustrations/creators/moka/cover-v1.png'},{id:'editorial',type:'image' as const,url:'/illustrations/creators/moka/editorial-v1.png'}];
type State=MockAiPhotoMode|'empty'|'limit'|'ticket'|'waiting';
// 스튜디오 AI 사진 편집 창: 같은 AiPhotoDialog 에 대역 응답을 주입한다(실제 생성 없음).
export function AiPhotoCatalog(){
 const [state,setState]=useState<State>('normal'),[open,setOpen]=useState(false),[added,setAdded]=useState(0);
 const start=state==='limit'||state==='ticket'?0:AI_PHOTO_DAILY_LIMIT;
 // 보관형 리셋권(2026-11-13): '한도 소진 + 리셋권 2장' 상태에서 1장 쓰면 오늘 횟수가 다시 채워진다.
 const [tickets,setTickets]=useState(2),expiry=new Date(Date.now()+30*86400000).toISOString();
 return <section className={s.section} id="ai-photo-catalog">
  <div className={s.sectionHeading}><h2>AI 사진 편집</h2><p>게시물 작성의 업로드 아래 버튼으로 엽니다. 옷은 바꿀 부분을 칠하고, 메이크업·표정·포즈·배경·구도·캐논 렌즈 촬영 느낌·신체 보정은 사진 프리셋을 고르거나 직접 입력합니다. 편집 항목과 프리셋은 한 번에 하나만 선택하며 커스텀 프롬프트로 추가 요청을 적을 수 있습니다. 선택한 프리셋을 다시 누르면 해제되며 생성 인물의 성별도 바꿀 수 있습니다. 만들기 버튼만 고정하고 원본·예시·입력·안내·횟수는 함께 스크롤합니다. 나를 코스어로 만들기에서 일반·게임·애니메이션 7개 카테고리의 의상 32종과 카드·목록·의상 크게·모아 보기·입력 우선의 보기 형식을 고를 수 있어요. 신체 보정은 가슴·힙·키의 보이는 비율을 조정합니다. 결과의 이미지 편집으로 이어서 수정할 수 있습니다. 별도 체크 없이 만들기 버튼으로 사진 사용 권한을 확인하고 1장을 만들며, 고른 사진만 ‘AI 생성’ 표시와 함께 게시물에 넣습니다.</p></div>
  <SelectField label="상태" value={state} onChange={value=>{setState(value as State);setAdded(0);}} options={[{value:'normal',label:'정상'},{value:'waiting',label:'생성 대기 · 하트 모으기'},{value:'empty',label:'올린 사진 없음'},{value:'error',label:'생성 실패'},{value:'blocked',label:'안전 기준 차단'},{value:'limit',label:'오늘 한도 소진'},{value:'ticket',label:'한도 소진 + 리셋권'}]}/>
  <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16}}><Action type="button" variant="secondary" onClick={()=>setOpen(true)}>AI 사진 편집</Action>{added>0&&<span>게시물에 {added}장 추가됨</span>}</div>
  <AiPhotoDialog onCrop={mockAiPhotoCrop} shop={state==='limit'?{products:[],orders:[],loading:false,error:'',refresh:async()=>{},purchase:async()=>({success:false as const,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 결제하지 않습니다.'}),refund:async()=>({success:false as const,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 환불하지 않습니다.'})}:undefined} key={state} open={open} onClose={()=>setOpen(false)} images={state==='empty'?[]:photos} quota={{remaining:start,limit:AI_PHOTO_DAILY_LIMIT,...(state==='ticket'?{resetTickets:{count:tickets,nextExpiresAt:tickets?expiry:null}}:{})}} room={8} onUseTicket={state==='ticket'?async()=>{const left=Math.max(0,tickets-1);setTickets(left);return {success:true as const,data:{remaining:AI_PHOTO_DAILY_LIMIT,limit:AI_PHOTO_DAILY_LIMIT,resetTickets:{count:left,nextExpiresAt:left?expiry:null},message:`리셋권 1장을 사용했어요. 오늘 ${AI_PHOTO_DAILY_LIMIT}회를 다시 만들 수 있어요.`},errorMessage:null,errorCode:null};}:undefined} onEdit={mockAiPhotoEdit({delay:state==='waiting'?30000:undefined,start,mode:state==='error'||state==='blocked'?state:'normal'})} onAdd={made=>setAdded(count=>count+made.length)}/>
 </section>;
}
