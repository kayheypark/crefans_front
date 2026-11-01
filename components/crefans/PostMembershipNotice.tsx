'use client';
import {MarqueeText} from '@/components/ui/MarqueeText';


import {useState} from 'react';
import Link from 'next/link';
import {Dialog} from '@/components/ui/Primitives';
import {OptionalImage} from '@/components/ui/OptionalImage';
import {getPostMembershipOffer} from '@/lib/crefans/membership-plans';
import type {Post,ServiceData} from '@/types/crefans';
import Icon from './Icon';
import s from './social.module.css';

/** The shared locked-post notice opens details in place; choosing an offer continues the existing subscription flow. */
export function PostMembershipNotice({post,data,basePath,readOnly=false}:{post:Post;data:Pick<ServiceData,'creators'|'plans'|'creatorPlans'>;basePath:string;readOnly?:boolean}){
  const [open,setOpen]=useState(false);
  const creator=data.creators.find(item=>item.id===post.creatorId),offer=getPostMembershipOffer(data,post);
  const previewPlan=offer.plans[0];
  return <>
    <div className={s.lockedMedia}>{previewPlan&&<OptionalImage src={previewPlan.image} alt={`${previewPlan.name} 멤버십`} className={s.lockedMembershipImage}/>}<Icon name="lock" width={30} height={30}/><strong>멤버십 전용 콘텐츠입니다</strong><p><MarqueeText text={offer.description}/></p><button type="button" className={s.subscribe} aria-haspopup="dialog" aria-expanded={open} disabled={readOnly} onClick={event=>{if(!readOnly){event.currentTarget.focus();setOpen(true);}}}>멤버십 안내</button></div>
    <Dialog open={open} onClose={()=>setOpen(false)} title={creator?`${creator.name}의 멤버십`:'멤버십 안내'} sheet>
      {offer.plans.length?<div className={s.membershipOffers}>{offer.plans.map(plan=><section key={plan.id} className={s.membershipOffer} aria-label={`${plan.name} 멤버십`}>
        <OptionalImage src={plan.image} alt={`${plan.name} 멤버십`}/>
        <div className={s.membershipOfferHeading}><h3><MarqueeText text={plan.name}/></h3><p><strong>₩{plan.price.toLocaleString('ko-KR')}</strong><span>/월</span></p></div>
        {plan.description&&<p>{plan.description}</p>}
        {plan.benefits.length?<ul>{plan.benefits.map((benefit,index)=><li key={index}><Icon name="check" width={16} height={16}/><span>{benefit}</span></li>)}</ul>:<p>등록된 혜택 안내가 없습니다.</p>}
        <Link className={s.subscribe} href={`${basePath}/membership/${encodeURIComponent(post.creatorId)}?plan=${encodeURIComponent(plan.id)}`} aria-label={`${plan.name} 선택하고 계속`} onClick={()=>setOpen(false)}>선택하고 계속</Link>
      </section>)}</div>:<p role="status">현재 이 게시물을 볼 수 있는 판매 중 멤버십이 없습니다.</p>}
    </Dialog>
  </>;
}
