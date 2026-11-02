'use client';
import {useState} from 'react';
import {TypedConfirmDialog} from '@/components/ui/TypedConfirmDialog';
import {Button,SelectField} from '@/components/ui/Primitives';
import s from './custom.module.css';

export function TypedConfirmCatalog(){
 const [open,setOpen]=useState(false),[mode,setMode]=useState('normal'),[error,setError]=useState('');
 return <section className={s.section}><div className={s.sectionHeading}><h2>직접 입력 확인</h2><p>대상 문구가 정확히 일치하면 실행 버튼이 켜집니다. 다시 열면 입력을 비웁니다.</p></div><div className={s.row}>
  <SelectField label="확인창 상태" value={mode} onChange={setMode} options={[{value:'normal',label:'정상·빈 입력'},{value:'error',label:'실패 후 재시도'},{value:'busy',label:'처리 중'}]}/>
  <Button onClick={()=>{setError('');setOpen(true);}}>직접 입력 확인창 보기</Button>
 </div>{open&&<TypedConfirmDialog title="멤버십을 삭제할까요?" phrase="예시 멤버십" actionLabel="삭제하기" busy={mode==='busy'} error={error} onCancel={()=>setOpen(false)} onConfirm={()=>{if(mode==='error')setError('삭제하지 못했습니다. 다시 시도해주세요.');else setOpen(false);}}><p>선택한 멤버십을 판매 목록에서 삭제합니다.</p>{mode==='busy'&&<Button tone="quiet" onClick={()=>setMode('normal')}>처리 중 예시 종료</Button>}</TypedConfirmDialog>}</section>;
}
