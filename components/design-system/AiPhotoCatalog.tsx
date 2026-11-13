'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {Action} from '@/components/crefans/ServiceUI';
import {AiPhotoDialog} from '@/components/crefans/studio/AiPhotoDialog';
import {mockAiPhotoEdit,type MockAiPhotoMode} from '@/components/preview/studio/ai-photo-fixtures';
import {AI_PHOTO_DAILY_LIMIT} from '@/lib/crefans/ai-photo';
import s from './custom.module.css';

const photos=[{id:'cover',type:'image' as const,url:'/illustrations/creators/moka/cover-v1.png'},{id:'editorial',type:'image' as const,url:'/illustrations/creators/moka/editorial-v1.png'}];
type State=MockAiPhotoMode|'empty'|'limit';
// 스튜디오 AI 사진 편집 창: 같은 AiPhotoDialog 에 대역 응답을 주입한다(실제 생성 없음).
export function AiPhotoCatalog(){
 const [state,setState]=useState<State>('normal'),[open,setOpen]=useState(false),[added,setAdded]=useState(0);
 const start=state==='limit'?0:AI_PHOTO_DAILY_LIMIT;
 return <section className={s.section} id="ai-photo-catalog">
  <div className={s.sectionHeading}><h2>AI 사진 편집</h2><p>게시물 작성의 업로드 아래 버튼으로 엽니다. 옷은 바꿀 부분을 칠하고, 메이크업·표정·포즈·배경·구도·캐논 렌즈 촬영 느낌·신체 보정은 사진 프리셋을 고르거나 직접 입력합니다. 선택한 요청은 최종 프롬프트 하나에 누적되고 생성 인물의 성별도 바꿀 수 있습니다. 만들기 버튼만 고정하고 원본·예시·입력·동의·횟수는 함께 스크롤합니다. 나를 코스어로 만들기에서 일반·게임·애니메이션 7개 카테고리의 의상 32종과 카드·목록·의상 크게·모아 보기·입력 우선의 보기 형식을 고를 수 있어요. 신체 보정은 가슴·힙·키의 보이는 비율을 조정합니다. 결과의 이미지 편집으로 이어서 수정할 수 있습니다. 본인·동의 확인 후 1장을 만들고, 고른 사진만 ‘AI 생성’ 표시와 함께 게시물에 넣습니다.</p></div>
  <SelectField label="상태" value={state} onChange={value=>{setState(value as State);setAdded(0);}} options={[{value:'normal',label:'정상'},{value:'empty',label:'올린 사진 없음'},{value:'error',label:'생성 실패'},{value:'blocked',label:'안전 기준 차단'},{value:'limit',label:'오늘 한도 소진'}]}/>
  <div style={{display:'flex',alignItems:'center',gap:12,marginTop:16}}><Action type="button" variant="secondary" onClick={()=>setOpen(true)}>AI 사진 편집</Action>{added>0&&<span>게시물에 {added}장 추가됨</span>}</div>
  <AiPhotoDialog key={state} open={open} onClose={()=>setOpen(false)} images={state==='empty'?[]:photos} quota={{remaining:start,limit:AI_PHOTO_DAILY_LIMIT}} room={8} onEdit={mockAiPhotoEdit({start,mode:state==='error'||state==='blocked'?state:'normal'})} onAdd={made=>setAdded(count=>count+made.length)}/>
 </section>;
}
