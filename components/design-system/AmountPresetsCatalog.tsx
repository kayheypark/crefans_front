'use client';
import {useState} from 'react';
import {Field} from '@/components/ui/Field';
import {AmountPresets} from '@/components/ui/AmountPresets';
import {krwAmountPresets} from '@/lib/design/amount-presets';
import s from './custom.module.css';

export function AmountPresetsCatalog(){
  const [value,setValue]=useState(''),[disabled,setDisabled]=useState(false),[zero,setZero]=useState(false);
  const available=zero?0:1151900;
  const amount=Number(value),invalid=value!==''&&(!Number.isSafeInteger(amount)||amount<0||amount>available);
  return <section className={s.section}><div className={s.sectionHeading}><h2>금액 빠른 입력</h2><p>출금 화면과 같은 컴포넌트에 예시 금액을 주입합니다. 금액 버튼으로 더하거나 전액을 입력할 수 있습니다.</p></div><div className={s.row}><label className={s.check}><input type="checkbox" checked={disabled} onChange={event=>setDisabled(event.target.checked)}/>비활성 상태</label><label className={s.check}><input type="checkbox" checked={zero} onChange={event=>{setZero(event.target.checked);setValue('');}}/>사용 가능 금액 없음</label></div><div style={{maxWidth:600,display:'grid',gap:12,marginTop:20}}><Field label="입력 금액" value={value} onChange={event=>setValue(event.target.value)} type="number" inputMode="numeric" min={0} max={available} step={1} suffix="원" disabled={disabled} placeholder="금액을 입력해 주세요" error={invalid?'사용 가능 금액 이내의 정수로 입력해 주세요.':undefined} hint={`사용 가능 금액 ${available.toLocaleString('ko-KR')}원 · 검수용 예시`}/><AmountPresets value={value} onChange={setValue} availableAmount={available} presets={krwAmountPresets} disabled={disabled} hint="금액은 사용 가능 금액까지만 더해집니다. 초기화하면 입력을 비웁니다."/></div></section>;
}
