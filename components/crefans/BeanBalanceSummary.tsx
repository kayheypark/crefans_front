'use client';

import {AccordionItem} from '@/components/ui/Accordion';
import type {ReactNode} from 'react';
import type {BeanWallet} from '@/types/crefans-beans';
import s from './beans.module.css';

const beans=(value:number|undefined,loading:boolean)=>value===undefined?(loading?'불러오는 중…':'확인할 수 없습니다'):value.toLocaleString('ko-KR')+'콩';

export function BeanBalanceSummary({wallet,loading=false,withdrawableBeans,action}:{wallet:BeanWallet|null|undefined;loading?:boolean;withdrawableBeans?:number;action?:ReactNode}){
  const available=wallet?.spendableBeans,withdrawable=withdrawableBeans??wallet?.withdrawableBeans;
  const purchased=wallet?.spendableBreakdown?.purchased,promotion=wallet?.spendableBreakdown?.promotion;
  const balance=(bucket:string)=>wallet?Number(wallet.accounts.find(account=>account.bucket===bucket)?.balance||0):undefined;
  const heldSpendable=!wallet||available===undefined?undefined:Math.max(0,(balance('purchased')||0)+(balance('promotion')||0)-available);
  const heldEarned=!wallet||withdrawable===undefined?undefined:Math.max(0,(balance('earned-paid')||0)+(balance('earned-promotion')||0)-withdrawable);
  const amount=(value:number|undefined)=>beans(value,loading);
  return <section aria-label="콩 잔액">
    <dl className={s.walletSummary}>
      <div><dt>사용 가능한 콩</dt><dd>{amount(available)}</dd></div>
      <div><dt>출금 가능한 콩</dt><dd>{amount(withdrawable)}</dd></div>
    </dl>
    {action}
    <div className={s.balanceDetails}><AccordionItem title="콩 세부 내역" defaultOpen>
      <ul className={s.balanceTree}>
        <li><div><strong>사용 가능한 콩</strong><span>{amount(available)}</span></div><ul>
          <li><div><span>일반콩</span><span>{amount(purchased)}</span></div></li>
          <li><div><span>프로모션콩</span><span>{amount(promotion)}</span></div></li>
        </ul></li>
        <li><div><strong>출금 가능한 콩</strong><span>{amount(withdrawable)}</span></div><ul>
          <li><div><span>일반 후원콩</span><span>{amount(wallet?.withdrawableBreakdown?.paid)}</span></div></li>
          <li><div><span>프로모션 후원콩</span><span>{amount(wallet?.withdrawableBreakdown?.promotion)}</span></div></li>
        </ul></li>
        <li><div><strong>보류·출금 제외 내역</strong></div><ul>
          <li><div><span>사용 보류 콩</span><span>{amount(heldSpendable)}</span></div></li>
          <li><div><span>출금 제외 후원콩</span><span>{amount(heldEarned)}</span></div><small>미입금·보류·동결·테스트 결제 또는 지급 출처 미확인 등으로 출금 조건을 충족하지 않은 콩</small></li>
          <li><div><span>출금 처리 중인 콩</span><span>{amount(balance('reserved-paid'))}</span></div></li>
        </ul></li>
      </ul>
    </AccordionItem></div>
  </section>;
}
