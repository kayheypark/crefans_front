'use client';

import {useState} from 'react';
import {PinField} from '@/components/ui/PinField';
import s from './custom.module.css';

export function PinFieldCatalog(){
  const [pin,setPin]=useState('');
  return <section className={s.section}><div className={s.sectionHeading}><h2>출금 PIN 입력</h2><p>숫자 6자리만 입력받고 내용을 가려 표시합니다. 검증과 설정은 화면 모델에서 처리합니다.</p></div><div className={s.controlGrid}>
    <PinField label="PIN 입력" value={pin} onChange={setPin} required hint="로컬 예시 번호만 입력해 주세요."/>
    <PinField label="PIN 오류" value="" onChange={()=>{}} error="PIN이 일치하지 않아요. 다시 입력해 주세요."/>
    <PinField label="비활성 PIN" value="" onChange={()=>{}} disabled/>
    <PinField label="읽기 전용 PIN" value="123456" onChange={()=>{}} readOnly/>
  </div></section>;
}
