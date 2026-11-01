'use client';
import {useEffect,useState} from 'react';
import {referralLink} from '@/lib/crefans/referral';
import type {ReferralSummary} from '@/types/crefans-beans';
import {Action} from './ServiceUI';
import s from './referral.module.css';

/** Friend invite card on the bean wallet (2026-11-01). Shows only counts: invitee identities and payments are not disclosed. */
export function ReferralCard({referral}:{referral:ReferralSummary}){
  const [copied,setCopied]=useState(''),[link,setLink]=useState('');
  useEffect(()=>setLink(referralLink(window.location.origin,referral.code)),[referral.code]);
  async function copy(){try{await navigator.clipboard.writeText(link);setCopied('초대 링크를 복사했어요.');}catch{setCopied('복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.');}}
  return <section className={s.card} aria-labelledby="referral-title">
    <h2 id="referral-title">친구 초대</h2>
    <p className={s.lead}>초대 링크로 가입한 친구의 첫 결제가 7일 동안 환불되지 않으면 <strong>후원에 쓸 수 있는 프로모션콩 {referral.rewardPerInvite}개</strong>를 드려요.</p>
    <div className={s.link}><input readOnly value={link} aria-label="내 초대 링크" onFocus={event=>event.currentTarget.select()}/><Action type="button" variant="secondary" onClick={()=>void copy()}>링크 복사</Action></div>
    {copied&&<p className={s.status} role="status">{copied}</p>}
    <dl className={s.stats}><div><dt>초대로 가입</dt><dd>{referral.invited}명</dd></div><div><dt>확정 대기</dt><dd>{referral.qualified}명</dd></div><div><dt>받은 보상</dt><dd>{referral.rewardBeans.toLocaleString('ko-KR')}콩</dd></div></dl>
    <ul className={s.terms}>
      <li>직접 초대한 친구의 첫 실결제(멤버십·콩 충전) 1회만 인정돼요. 친구가 초대한 사람의 결제는 해당하지 않아요.</li>
      <li>한 달(한국 시간)에 최대 {referral.monthlyCap}명까지 보상하고, 넘는 초대는 보상하지 않아요. 보상 때 탈퇴·이용 정지 상태면 보상은 소멸돼요.</li>
      <li>보상 콩은 후원에만 쓸 수 있고 출금할 수 없어요. 유효기간은 다른 프로모션콩과 같아요.</li>
      <li>친구의 결제가 일부라도 환불·취소되면 보상 전체를 회수해요. 이미 후원에 쓴 콩은 돌려받지 않아요.</li>
      <li>자기 초대·여러 계정·부정 가입은 운영자가 확인해 보상에서 제외하거나 회수할 수 있어요. 초대 내역에는 친구 닉네임 앞 세 글자와 보상 진행 상태만 보여요.</li>
    </ul>
  </section>;
}
