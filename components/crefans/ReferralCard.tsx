'use client';
import {useEffect,useState} from 'react';
import {referralLink} from '@/lib/crefans/referral';
import type {ReferralSummary} from '@/types/crefans-beans';
import {Action} from './ServiceUI';
import Icon from './Icon';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import s from './referral.module.css';

/** Friend invite card on the bean wallet (2026-11-01). Shows only counts: invitee identities and payments are not disclosed. */
export function ReferralCard({referral}:{referral:ReferralSummary}){
  const [notice,setNotice]=useSnackbarMessage(),[error,setError]=useState(''),[copying,setCopying]=useState(false),[link,setLink]=useState('');
  useEffect(()=>setLink(referralLink(window.location.origin,referral.code)),[referral.code]);
  async function copy(){if(!link||copying)return;setCopying(true);setError('');try{await navigator.clipboard.writeText(link);setNotice('초대 링크를 복사했어요.');}catch{setError('복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.');}finally{setCopying(false);}}
  return <section className={s.card} aria-label="친구 초대">
    <p className={s.eyebrow}>친구와 함께하는 크레팬스</p>
    <div className={s.reward}><h2>초대 보상 {referral.rewardPerInvite.toLocaleString('ko-KR')}콩</h2><img src="/brand/beans/soft3d-v2/10.png" width={44} height={44} alt=""/></div><p className={s.limit}>후원에 쓸 수 있는 프로모션콩 · 월 최대 {referral.monthlyCap}명</p>
    <p className={s.lead}>초대 링크로 가입한 친구의 첫 결제가 {referral.holdDays}일 동안 환불되지 않으면 보상을 드려요.</p>
    <div className={s.link}><input readOnly value={link} aria-label="내 초대 링크" onFocus={event=>event.currentTarget.select()}/><Action type="button" disabled={!link||copying} onClick={()=>void copy()}><Icon name="copy" width={18} height={18}/>{copying?'복사 중':'링크 복사'}</Action></div>
    {error&&<p className={s.error} role="alert">{error}</p>}
    <dl className={s.stats}><div><dt>초대로 가입</dt><dd>{referral.invited}명</dd></div><div><dt>확정 대기</dt><dd>{referral.qualified}명</dd></div><div><dt>받은 보상</dt><dd>{referral.rewardBeans.toLocaleString('ko-KR')}콩</dd></div></dl>
    <div className={s.guide}><h3>초대 보상 안내</h3><ul className={s.terms}>
      <li>직접 초대한 친구의 첫 실결제(멤버십·콩 충전) 1회만 인정돼요. 친구가 초대한 사람의 결제는 해당하지 않아요.</li>
      <li>한 달(한국 시간)에 최대 {referral.monthlyCap}명까지 보상하고, 넘는 초대는 보상하지 않아요. 보상 때 탈퇴·이용 정지 상태면 보상은 소멸돼요.</li>
      <li>보상 콩은 후원에만 쓸 수 있고 출금할 수 없어요. 유효기간은 다른 프로모션콩과 같아요.</li>
      <li>친구의 결제가 일부라도 환불·취소되면 보상 전체를 회수해요. 이미 후원에 쓴 콩은 돌려받지 않아요.</li>
      <li>자기 초대·여러 계정·부정 가입은 운영자가 확인해 보상에서 제외하거나 회수할 수 있어요. 초대 내역에는 친구 닉네임 앞 세 글자와 보상 진행 상태만 보여요.</li>
    </ul></div>
    <Toast message={notice} onClose={()=>setNotice('')}/>
  </section>;
}
