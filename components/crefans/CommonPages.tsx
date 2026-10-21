'use client';

import {DialogActions} from '@/components/ui/DialogActions';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {useEffect,useState,type FormEvent} from 'react';
import {Checkbox} from '@/components/ui/Choice';
import {SelectField} from '@/components/ui/SelectField';
import {Dialog,Field} from '@/components/ui/Primitives';
import type {ServiceViewModel} from '@/types/crefans';
import type {CommonActionResult,CommonModel,LegalKind} from '@/types/crefans-common';
import {Action,Avatar,Empty,Notice,PageTitle} from './ServiceUI';
import {FollowButton} from './FollowButton';
import Icon from './Icon';
import s from './common.module.css';

function useTask(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  async function run(action:()=>Promise<CommonActionResult>,success?:()=>void){if(busy)return;setBusy(true);setError('');setMessage('');try{const result=await action();if(result.success){setMessage(result.data.message);success?.();}else setError(result.errorMessage);}catch{setError('요청을 처리하지 못했어요. 다시 시도해 주세요.');}finally{setBusy(false);}}
  return {busy,error,message,run,setError};
}
function Status({task}:{task:ReturnType<typeof useTask>}){return <>{task.error&&<p className={s.error} role="alert">{task.error}</p>}{task.message&&<p className={s.status} role="status">{task.message}</p>}</>;}
export function CommonNavigation({basePath}:{basePath:string}){return <nav className={s.supportNav} aria-label="서비스 안내">{[['notices','공지사항'],['support','고객센터'],['legal/terms','이용약관'],['legal/privacy','개인정보처리방침'],['legal/policy','운영정책']].map(([path,label])=><Link key={path} href={`${basePath}/${path}`}>{label}</Link>)}</nav>;}

export function FollowingPage({model}:{model:ServiceViewModel}){
  const [query,setQuery]=useState('');
  /** Rows stay on screen after an unfollow so a change of heart is one click away; new follows are added as they happen. */
  const [shown,setShown]=useState(()=>model.following);
  useEffect(()=>{setShown(previous=>[...previous,...model.following.filter(id=>!previous.includes(id))]);},[model.following]);
  const following=model.data.creators.filter(creator=>model.following.includes(creator.id));
  const filtered=model.data.creators.filter(creator=>shown.includes(creator.id)&&`${creator.name} ${creator.handle}`.includes(query.trim()));
  return <section className={s.page}><PageTitle action={<TextLink className={s.textLink} href={`${model.basePath}/me`}>내 프로필</TextLink>}>팔로잉 목록 <small>{following.length}</small></PageTitle><label className={s.search}><Icon name="search" width={18} height={18}/><input value={query} onChange={event=>setQuery(event.target.value)} aria-label="팔로잉 검색" placeholder="크리에이터 이름으로 검색"/></label><div className={s.followingList}>{filtered.map(creator=><div className={s.following} key={creator.id}><Link href={`${model.basePath}/creator/${creator.id}`}><Avatar creator={creator} size={52}/><span><strong>{creator.name}</strong><small>@{creator.handle}</small><p>{creator.bio}</p></span></Link><FollowButton following={model.following.includes(creator.id)} name={creator.name} onToggle={()=>model.toggleFollow(creator.id)}/></div>)}</div>{!filtered.length&&<Empty title={query?'검색 결과가 없어요':'팔로잉한 크리에이터가 없어요'} action={<TextLink href={`${model.basePath}/explore`}>크리에이터 둘러보기</TextLink>}/>}</section>;
}

/** People following me: read-only rows, no follow-back button (the fan may not be a creator). */
export function FollowersPage({model}:{model:ServiceViewModel}){
  const [query,setQuery]=useState('');
  const followers=model.data.followers||[],filtered=followers.filter(person=>`${person.name} ${person.handle}`.includes(query.trim()));
  return <section className={s.page}><PageTitle action={<TextLink className={s.textLink} href={`${model.basePath}/me`}>내 프로필</TextLink>}>팔로워 목록 <small>{followers.length}</small></PageTitle><label className={s.search}><Icon name="search" width={18} height={18}/><input value={query} onChange={event=>setQuery(event.target.value)} aria-label="팔로워 검색" placeholder="이름으로 검색"/></label><div className={s.followingList}>{filtered.map(person=><div className={s.following} key={person.id}><Avatar creator={person} size={52}/><span className={s.followerName}><strong>{person.name}</strong><small>@{person.handle}</small></span></div>)}</div>{!filtered.length&&<Empty title={query?'검색 결과가 없어요':'아직 팔로워가 없어요'} description={query?undefined:'게시물과 댓글로 활동하면 팔로워가 생겨요.'}/>}</section>;
}

export function NoticesPage({model,basePath}:{model:CommonModel;basePath:string}){
  const [query,setQuery]=useState('');
  const filtered=model.notices.filter(notice=>`${notice.title} ${notice.category}`.includes(query.trim()));
  return <section className={s.page}><PageTitle>공지사항</PageTitle><label className={s.search}><Icon name="search" width={18} height={18}/><input value={query} onChange={event=>setQuery(event.target.value)} aria-label="공지사항 검색" placeholder="공지 제목을 검색해 보세요"/></label><div className={s.noticeList}>{filtered.map(notice=><Link href={`${basePath}/notices/${notice.id}`} key={notice.id}><div><span className={s.badge}>{notice.pinned?'중요':notice.category}</span><h2>{notice.title}</h2><small>{notice.date}</small></div><Icon name="chevron" width={18} height={18}/></Link>)}</div>{!filtered.length&&<Empty title={query?'검색 결과가 없어요':'등록된 공지가 없어요'}/>}<CommonNavigation basePath={basePath}/></section>;
}
export function NoticeDetailPage({id,model,basePath}:{id:string;model:CommonModel;basePath:string}){
  const notice=model.notices.find(item=>item.id===id);
  if(!notice)return <Empty title="공지사항을 찾을 수 없어요" action={<TextLink href={`${basePath}/notices`}>공지 목록으로</TextLink>}/>;
  return <article className={s.page}><TextLink className={s.back} href={`${basePath}/notices`}>공지사항</TextLink><header className={s.documentHead}><span className={s.badge}>{notice.category}</span><h1>{notice.title}</h1><small>{notice.date}</small></header><div className={s.documentBody}>{notice.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><CommonNavigation basePath={basePath}/></article>;
}
export function LegalPage({kind,model,basePath}:{kind:LegalKind;model:CommonModel;basePath:string}){
  const document=model.legal[kind];
  if(!document)return <Empty title="문서를 찾을 수 없어요" action={<TextLink href={`${basePath}/support`}>고객센터</TextLink>}/>;
  return <article className={s.page}><PageTitle>{document.title}</PageTitle>{document.updatedAt&&<small className={s.muted}>{document.updatedAt}</small>}{document.notice&&<Notice>{document.notice}</Notice>}<div className={s.documentBody}>{document.sections.map((section,index)=><section key={index}><h2>{section.title}</h2><p>{section.body}</p></section>)}</div><CommonNavigation basePath={basePath}/></article>;
}

export function PasswordResetPage({model,basePath}:{model:CommonModel;basePath:string}){
  const task=useTask(),[email,setEmail]=useState(model.auth.email),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[requested,setRequested]=useState(false),[complete,setComplete]=useState(false);
  function request(event:FormEvent){event.preventDefault();void task.run(()=>model.actions.requestPasswordReset(email),()=>{setRequested(true);setCode('');});}
  function reset(event:FormEvent){event.preventDefault();if(password.length<8){task.setError('새 비밀번호를 8자 이상 입력해 주세요.');return;}if(password!==confirm){task.setError('비밀번호가 서로 일치하지 않습니다.');return;}if(!code.trim()){task.setError('인증 코드를 입력해 주세요.');return;}void task.run(()=>model.actions.resetPassword({email,code,password}),()=>{setComplete(true);setPassword('');setConfirm('');setCode('');});}
  return <section className={s.authPage}><PageTitle>비밀번호 재설정</PageTitle>{complete?<div className={s.complete}><Icon name="check"/><h2>비밀번호 재설정을 완료했습니다</h2><Link href={`${basePath}/login`} className={s.primaryLink}>로그인하기</Link></div>:<><p className={s.description}>가입한 이메일로 인증한 뒤 새 비밀번호를 설정하세요.</p><form className={s.form} onSubmit={request}><Field label="이메일" type="email" autoComplete="email" required value={email} disabled={task.busy} onChange={event=>{setEmail(event.target.value);setRequested(false);}}/><Action type="submit" disabled={task.busy||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())} variant={requested?'secondary':'primary'}>{requested?'인증 코드 다시 받기':'재설정 코드 받기'}</Action></form>{requested&&<form className={s.form} onSubmit={reset}><Field label="인증 코드" value={code} onChange={event=>setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={12}/>{model.auth.codeHint&&<small className={s.muted}>{model.auth.codeHint}</small>}<Field label="새 비밀번호" type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} hint="8자 이상 입력해 주세요."/><Field label="새 비밀번호 확인" type="password" autoComplete="new-password" value={confirm} onChange={event=>setConfirm(event.target.value)}/><Action type="submit" disabled={task.busy||!code.trim()||password.length<8||password!==confirm}>{task.busy?'변경 중...':'비밀번호 변경'}</Action></form>}</>}<Status task={task}/>{model.auth.guidance&&<Notice>{model.auth.guidance}</Notice>}<TextLink href={`${basePath}/login`} className={s.textLink}>로그인 화면으로</TextLink></section>;
}

export function PaymentMethodsPage({model,basePath}:{model:CommonModel;basePath:string}){
  const task=useTask(),[selected,setSelected]=useState<string|null>(null),[adding,setAdding]=useState(false);
  const method=model.paymentMethods.find(item=>item.id===selected);
  return <section className={s.page}><PageTitle action={<Action disabled={task.busy} onClick={()=>{if(model.registrationPreview)setAdding(true);else void task.run(()=>model.actions.addPaymentMethod());}}>결제수단 등록</Action>}>결제수단 관리</PageTitle>{model.paymentMethods.length?<div className={s.paymentList}>{model.paymentMethods.map(item=><article key={item.id}><span className={s.cardIcon}><Icon name="card"/></span><div><strong>{item.label}</strong>{item.isDefault&&<span className={s.badge}>기본</span>}<p>{item.description}</p></div><div className={s.paymentActions}>{!item.isDefault&&<button type="button" disabled={task.busy} onClick={()=>void task.run(()=>model.actions.setDefaultPaymentMethod(item.id))}>기본으로 설정</button>}<button type="button" onClick={()=>setSelected(item.id)}>삭제</button></div></article>)}</div>:<Empty title="등록된 결제수단이 없어요" description="결제수단을 등록하고 이곳에서 관리하세요."/>}<Status task={task}/>{model.paymentGuidance&&<Notice>{model.paymentGuidance}</Notice>}<TextLink href={`${basePath}/subscriptions?tab=payments`} className={s.textLink}>결제 내역 확인</TextLink>{model.registrationPreview&&<PaymentRegistrationPreview config={model.registrationPreview} open={adding} onClose={()=>setAdding(false)} busy={task.busy} error={task.error} onRegister={card=>void task.run(()=>model.actions.addPaymentMethod({previewCard:card}),()=>setAdding(false))}/>}<Dialog open={!!method} onClose={()=>setSelected(null)} title="결제수단을 삭제할까요?"><p className={s.description}>{method?.label} 결제수단을 삭제합니다. 구독이 있다면 다음 결제에 사용할 결제수단을 확인해 주세요.</p><Status task={task}/><DialogActions style={{marginTop:24}}><Action variant="secondary" onClick={()=>setSelected(null)}>취소</Action><Action variant="danger" disabled={task.busy} onClick={()=>{if(method)void task.run(()=>model.actions.removePaymentMethod(method.id),()=>setSelected(null));}}>삭제하기</Action></DialogActions></Dialog></section>;
}


function PaymentRegistrationPreview({config,open,onClose,busy,error,onRegister}:{config:NonNullable<CommonModel['registrationPreview']>;open:boolean;onClose:()=>void;busy:boolean;error:string;onRegister:(card:'shinhan'|'samsung'|'kb')=>void}){
 const [card,setCard]=useState<'shinhan'|'samsung'|'kb'>('shinhan'),[consent,setConsent]=useState(false),[code,setCode]=useState(''),[step,setStep]=useState(1);
 useEffect(()=>{if(open){setStep(1);setConsent(false);setCode('');}},[open]);
 const number=config.cards.find(item=>item.value===card)?.number||'';
 return <Dialog open={open} onClose={busy?()=>{}:onClose} title="카드 등록"><div className={s.registration}><p className={s.description}>{step===1?'카드 정보 확인':'본인 확인'}</p>{step===1?<><SelectField label="카드" value={card} onChange={value=>{if(value==='shinhan'||value==='samsung'||value==='kb')setCard(value);}} options={config.cards}/><Field label="카드번호" value={number} readOnly/><Field label="유효기간" value={config.expiry} readOnly/><Checkbox label="정기결제를 위한 카드 등록에 동의합니다." checked={consent} onChange={setConsent}/></>:<><p>등록할 카드: {number}</p><Field label="인증번호" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,''))} maxLength={6} inputMode="numeric" autoComplete="one-time-code"/><small className={s.muted}>인증번호: {config.code}</small></>}{error&&<p className={s.error} role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={busy} onClick={()=>{if(step===2)setStep(1);else onClose();}}>{step===2?'이전':'취소'}</Action><Action disabled={busy||(step===1?!consent:code!==config.code)} onClick={()=>{if(step===1)setStep(2);else onRegister(card);}}>{busy?'등록 중…':step===1?'다음':'인증하고 등록'}</Action></DialogActions></div></Dialog>;
}

export function BillingRegistrationResultPage({status,message,returnPath,onRetry,retryLabel,kind='billing'}:{kind?:'billing'|'payment';retryLabel?:string;status:'loading'|'success'|'error'|'cancelled';message:string;returnPath:string;onRetry:()=>void}){
 const checkout=returnPath.startsWith('/service/checkout/');
 return <section className={s.page}><PageTitle>{kind==='payment'?(status==='success'?'결제 완료':status==='cancelled'?'결제 취소':'결제 결과'):(status==='success'?'카드 등록 완료':status==='cancelled'?'카드 등록 취소':'카드 등록 결과')}</PageTitle><p role={status==='error'?'alert':'status'}>{message}</p><div className={s.paymentResultActions}>{status==='error'||status==='cancelled'?<Action onClick={onRetry}>{retryLabel||(status==='cancelled'?'다시 등록하기':'다시 확인하기')}</Action>:null}<TextLink href={returnPath}>{checkout?'멤버십 결제로 돌아가기':kind==='payment'?'내 구독으로 이동':'결제수단 관리로 이동'}</TextLink></div></section>;
}
