'use client';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {Checkbox} from '@/components/ui/Choice';
import {PAYMENT_TERMS} from '@/lib/crefans/payment-terms';
import s from './payment-terms.module.css';

/** Payment conditions shown right above a payment button; paying stays disabled until the fan ticks the agreement. */
export function PaymentTerms({items,agreed,onAgree,basePath,disabled}:{items:{label:string;value:ReactNode}[];agreed:boolean;onAgree:(agreed:boolean)=>void;basePath:string;disabled?:boolean}){
 return <section className={s.terms} aria-label="결제 전 확인"><h2>결제 전 확인</h2><dl>{items.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl><p className={s.links}><Link href={`${basePath}/legal/terms`}>이용약관</Link> · <Link href={`${basePath}/legal/policy`}>운영정책</Link></p><Checkbox label={`${PAYMENT_TERMS.agreement} (필수)`} checked={agreed} disabled={disabled} onChange={onAgree}/></section>;
}
