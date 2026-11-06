'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import Icon from './Icon';
import {Checkbox} from '@/components/ui/Choice';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
import s from './payment-terms.module.css';

/**
 * Payment conditions shown right above a payment button; paying stays disabled until the fan ticks the agreement.
 * `seller` names the contracting party and the intermediary notice in the same type size (전자상거래법 시행규칙 제11조의2②).
 */
export function PaymentTerms({items,agreed,onAgree,basePath,disabled,layout='card',seller}:{items:{label:string;value:ReactNode;summary?:string}[];agreed:boolean;onAgree:(agreed:boolean)=>void;basePath:string;disabled?:boolean;layout?:'card'|'list';seller?:{name:string;notice:string}}){
 return <section className={`${s.terms} ${layout==='list'?s.list:''}`} aria-label="결제 전 확인"><h2>결제 전 확인</h2>{layout==='list'?<div className={s.disclosures}>{items.map(item=><details key={item.label}><summary><span><strong>{item.label}</strong>{item.summary&&<small>{item.summary}</small>}</span><Icon name="chevron" width={16} height={16}/></summary><div className={s.detail}>{item.value}</div></details>)}</div>:<dl>{items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>}{seller&&<div className={s.seller} aria-label="판매자 안내"><p>판매자: <strong>{seller.name}</strong></p><p>{seller.notice}</p></div>}<p className={s.links}><Link href={`${basePath}/legal/terms`}>이용약관</Link> · <Link href={`${basePath}/legal/policy`}>운영정책</Link></p><Checkbox label={`${PAYMENT_TERMS.agreement} (필수)`} checked={agreed} disabled={disabled} onChange={onAgree}/></section>;
}
