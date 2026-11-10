'use client';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {BackButton} from '../BackButton';

import {useRef,useState} from 'react';
import Link from 'next/link';
import {PinPad} from '@/components/ui/PinPad';
import {usePinPad} from '@/hooks/usePinPad';
import type {StudioFinanceModel} from '@/types/crefans-studio-finance';
import {Action,PageTitle} from '../ServiceUI';
import Icon from '../Icon';
import s from './withdrawal-security.module.css';

export function WithdrawalSecurityPage({model,basePath,embedded=false}:{model:StudioFinanceModel;basePath:string;embedded?:boolean}){
  // Two passes on the same shuffled pad: enter, then enter again. The first value is kept only in a ref until it is sent.
  const [step,setStep]=useState<'enter'|'confirm'>('enter'),[error,setError]=useState(''),[message,setMessage]=useSnackbarMessage(),[pending,setPending]=useState(false);
  const busy=useRef(false),first=useRef('');
  const pad=usePinPad({disabled:pending,onComplete:pin=>void complete(pin)});
  const restart=(reason='')=>{first.current='';setStep('enter');setError(reason);pad.reset();};
  async function complete(pin:string){
    if(busy.current||model.pinConfigured)return;setMessage('');
    if(step==='enter'){first.current=pin;setError('');setStep('confirm');pad.reset();return;}
    if(pin!==first.current){restart('입력한 PIN이 서로 달라요. 처음부터 다시 입력해 주세요.');return;}
    busy.current=true;setPending(true);
    try{
      const response=await model.setupWithdrawalPin(pin);
      if(!response.success){restart(response.errorMessage);return;}
      first.current='';setMessage(response.data.message);
    }catch{restart('PIN을 설정하지 못했어요. 다시 시도해 주세요.');}
    finally{busy.current=false;setPending(false);}
  }
  return <section className={s.page}>
    <PageTitle back={embedded?undefined:<BackButton href={`${basePath}/earnings`} label="수익 현황으로 돌아가기"/>}>출금 PIN 설정</PageTitle>
    <p className={s.lead}>출금 요청을 확인할 때 사용할 숫자 6자리를 설정해 주세요.</p>
    {model.pinConfigured?<div className={s.configured}><span className={s.icon}><Icon name="lock"/></span><h2>출금 PIN이 설정되어 있어요</h2><p>출금 금액과 수령 계좌를 확인한 뒤 PIN을 입력해 주세요.</p><Toast message={message} onClose={()=>setMessage('')}/><Link className={s.primaryLink} href={`${basePath}/withdraw`}>출금 요청으로 이동</Link></div>:<div className={s.form}><PinPad pad={pad} title={step==='enter'?'새 출금 PIN 입력':'출금 PIN 한 번 더 입력'} eyebrow={step==='enter'?'1/2단계':'2/2단계 · 확인'} hint={step==='enter'?'다른 사람에게 알려주지 않는 번호를 사용해 주세요.':'같은 번호를 한 번 더 입력하면 바로 설정돼요.'} error={error||undefined} busy={pending}/>{step==='confirm'&&<Action variant="secondary" disabled={pending} onClick={()=>restart()}>처음부터 다시 입력</Action>}</div>}
  </section>;
}
