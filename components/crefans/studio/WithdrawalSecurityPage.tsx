'use client';

import {useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {PinField} from '@/components/ui/PinField';
import type {StudioFinanceModel} from '@/types/crefans-studio-finance';
import {Action,PageTitle} from '../ServiceUI';
import Icon from '../Icon';
import s from './withdrawal-security.module.css';

export function WithdrawalSecurityPage({model,basePath}:{model:StudioFinanceModel;basePath:string}){
  const [pin,setPin]=useState(''),[confirmation,setConfirmation]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
  const busy=useRef(false);
  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    if(busy.current||model.pinConfigured)return;
    setError('');setMessage('');
    if(!/^\d{6}$/.test(pin)){setError('PIN은 숫자 6자리로 입력해 주세요.');return;}
    if(pin!==confirmation){setError('입력한 PIN이 서로 달라요. 다시 확인해 주세요.');setConfirmation('');return;}
    busy.current=true;setPending(true);
    try{
      const response=await model.setupWithdrawalPin(pin);
      if(!response.success){setError(response.errorMessage);return;}
      setMessage(response.data.message);
    }catch{setError('PIN을 설정하지 못했어요. 다시 시도해 주세요.');}
    finally{setPin('');setConfirmation('');busy.current=false;setPending(false);}
  };
  return <section className={s.page}>
    <PageTitle>출금 PIN 설정</PageTitle>
    <p className={s.lead}>출금 요청을 확인할 때 사용할 숫자 6자리를 설정해 주세요.</p>
    {model.pinConfigured?<div className={s.configured}><span className={s.icon}><Icon name="lock"/></span><h2>출금 PIN이 설정되어 있어요</h2><p>출금 금액과 수령 계좌를 확인한 뒤 PIN을 입력해 주세요.</p>{message&&<p role="status">{message}</p>}<Link className={s.primaryLink} href={`${basePath}/withdraw`}>출금 요청으로 이동</Link></div>:<form className={s.form} noValidate onSubmit={submit}>
      <PinField label="새 출금 PIN" value={pin} onChange={value=>{setPin(value);setError('');}} autoComplete="new-password" required disabled={pending} hint="다른 사람에게 알려주지 않는 번호를 사용해 주세요."/>
      <PinField label="출금 PIN 확인" value={confirmation} onChange={value=>{setConfirmation(value);setError('');}} autoComplete="new-password" required disabled={pending} error={error||undefined}/>
      <Action type="submit" variant="brand" disabled={pending||!/^\d{6}$/.test(pin)||pin!==confirmation} aria-busy={pending}>{pending?'설정 중…':'PIN 설정하기'}</Action>
    </form>}
    <TextLink className={s.back} href={`${basePath}/earnings`}>수익 현황으로 돌아가기</TextLink>
  </section>;
}
