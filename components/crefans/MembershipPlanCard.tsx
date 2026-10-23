'use client';

import type {Plan} from '@/types/crefans';
import Icon from './Icon';
import {Action} from './ServiceUI';
import s from './creator.module.css';
import {OptionalImage} from '@/components/ui/OptionalImage';

/** `compact` is the one-line version for the creator profile: name/level, monthly price and the action only; details live on the membership page. */
export function MembershipPlanCard({plan,selected=false,disabled=false,compact=false,actionLabel='선택하고 계속',onSelect}:{plan:Plan;selected?:boolean;disabled?:boolean;compact?:boolean;actionLabel?:string;onSelect:()=>void}){
  if(compact)return <article className={`${s.plan} ${s.compactPlan} ${selected?s.selectedPlan:''}`}>
    <h2>{plan.name} · Lv.{plan.rank}{plan.recommended&&<span className={s.recommended}>추천</span>}</h2>
    <p className={s.price}><strong>{`₩${plan.price.toLocaleString('ko-KR')}`}</strong><span>/월</span></p>
    <Action variant={plan.recommended?'brand':'primary'} disabled={disabled} onClick={onSelect}>{actionLabel}</Action>
  </article>;
  return <article className={`${s.plan} ${selected?s.selectedPlan:''}`}>
    {plan.recommended&&<span className={s.recommended}>추천</span>}
    <OptionalImage src={plan.image} alt={`${plan.name} 멤버십`}/>
    <h2>{plan.name}</h2>{plan.description&&<p className={s.planDescription}>{plan.description}</p>}
    <p>레벨 {plan.rank}</p><p className={s.price}><strong>{`₩${plan.price.toLocaleString('ko-KR')}`}</strong><span>/월</span></p>
    <ul>{plan.benefits.map(benefit=><li key={benefit}><Icon name="check" width="14" height="14"/>{benefit}</li>)}</ul>
    <Action variant={plan.recommended?'brand':'primary'} disabled={disabled} onClick={onSelect}>{actionLabel}</Action>
  </article>;
}
