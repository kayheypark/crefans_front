'use client';
import {MarqueeText} from '@/components/ui/MarqueeText';


import type {Plan} from '@/types/crefans';
import Icon from './Icon';
import {Action} from './ServiceUI';
import s from './creator.module.css';
import {OptionalImage} from '@/components/ui/OptionalImage';

/** `compact` shows a small membership image and summary on profiles; details live on the membership page. */
export function MembershipPlanCard({plan,selected=false,disabled=false,compact=false,actionLabel='선택하고 계속',onSelect}:{plan:Plan;selected?:boolean;disabled?:boolean;compact?:boolean;actionLabel?:string;onSelect:()=>void}){
  if(compact)return <article className={`${s.plan} ${s.compactPlan} ${selected?s.selectedPlan:''}`}>
    <OptionalImage src={plan.image} alt={`${plan.name} 멤버십`} className={s.compactPlanImage}/>
    <div className={s.compactPlanIdentity}>
      <h2><MarqueeText text={plan.name}/></h2>
      <p className={s.price}><strong>{`₩${plan.price.toLocaleString('ko-KR')}`}</strong><span>/월</span></p>
    </div>
    <div className={s.compactPlanActions}>
      <div className={s.compactPlanMeta}><span className={s.planLevel}>Lv.{plan.rank}</span>{plan.recommended&&<span className={s.recommended}>추천</span>}</div>
      <Action variant={plan.recommended?'brand':'primary'} disabled={disabled} onClick={onSelect}>{actionLabel}</Action>
    </div>
  </article>;
  return <article className={`${s.plan} ${selected?s.selectedPlan:''}`}>
    {plan.recommended&&<span className={s.recommended}>추천</span>}
    <OptionalImage src={plan.image} alt={`${plan.name} 멤버십`}/>
    <h2><MarqueeText text={plan.name}/></h2>{plan.description&&<p className={s.planDescription}>{plan.description}</p>}
    <p>레벨 {plan.rank}</p><p className={s.price}><strong>{`₩${plan.price.toLocaleString('ko-KR')}`}</strong><span>/월</span></p>
    <ul>{plan.benefits.map(benefit=><li key={benefit}><Icon name="check" width="14" height="14"/>{benefit}</li>)}</ul>
    <Action variant={plan.recommended?'brand':'primary'} disabled={disabled} onClick={onSelect}>{actionLabel}</Action>
  </article>;
}
