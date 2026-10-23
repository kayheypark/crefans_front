'use client';
import {useState} from 'react';
import {BenefitsField} from '@/components/ui/BenefitsField';
import {SelectField} from '@/components/ui/SelectField';
import s from './custom.module.css';

const examples=['멤버십 전용 게시물','월간 라이브 참여'];
export function BenefitsFieldCatalog(){
 const [value,setValue]=useState([...examples]),[state,setState]=useState('normal');
 function changeState(next:string){setState(next);setValue(next==='empty'||next==='error'?[]:[...examples]);}
 return <section className={s.section}><div className={s.sectionHeading}><h2>멤버십 혜택 입력</h2><p>혜택을 하나씩 입력하고 추가·삭제합니다. 멤버십 등록과 수정 화면에서도 같은 컴포넌트를 사용합니다.</p></div><div style={{maxWidth:640,display:'grid',gap:24}}>
  <SelectField label="혜택 입력 상태" value={state} onChange={changeState} options={[{value:'normal',label:'기본'},{value:'empty',label:'빈 목록'},{value:'error',label:'입력 오류'},{value:'disabled',label:'비활성'},{value:'readOnly',label:'읽기 전용'}]}/>
  <BenefitsField label="혜택" value={value} onChange={setValue} disabled={state==='disabled'} readOnly={state==='readOnly'} error={state==='error'&&!value.some(item=>item.trim())?'혜택을 하나 이상 입력해주세요.':undefined} hint="각 항목을 수정하거나 삭제하고, 새 혜택을 추가해 보세요."/>
 </div></section>;
}
