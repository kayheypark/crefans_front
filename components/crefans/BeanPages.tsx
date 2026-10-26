'use client';
import {BeanTipSource,BeanPayoutSource} from './BeanAttribution';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {rememberTipRecipient} from '@/lib/crefans/bean-tip-return';
import {useBeans} from './BeanContext';
import {BeanBalanceSummary} from './BeanBalanceSummary';
import {Avatar} from '@/components/ui/Avatar';
import {CreatorName} from './CreatorName';
import type {Creator,Post} from '@/types/crefans';
import {Action,PageTitle,NavIcon} from './ServiceUI';
import {SignInPrompt} from './SignInPrompt';
import {Dialog,Field} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {PinField} from '@/components/ui/PinField';
import {Radio} from '@/components/ui/Choice';
import {SelectField} from '@/components/ui/SelectField';
import type {BeanTip,BeanQuote} from '@/types/crefans-beans';
import s from './beans.module.css';
const beans=(n:number|string)=>Number(n).toLocaleString('ko-KR')+'콩',won=(n:number|string)=>Number(n).toLocaleString('ko-KR')+'원';
const statusNames:Record<string,string>={requested:'접수',processing:'처리 중',paid:'완료',rejected:'반려',blocked:'보류',pending:'결제 대기',failed:'실패',cancelled:'취소',disputed:'확인 필요'};
export function BeanWalletLink({basePath,className}:{basePath:string;className?:string}){const model=useBeans();if(!model?.enabled)return null;return className?<Link href={`${basePath}/beans`} className={className}>내 지갑</Link>:<div style={{padding:'12px 16px'}}><Link href={`${basePath}/beans`}>내 콩 지갑</Link></div>;}
export function BeanIncomeLink({basePath}:{basePath:string}){const model=useBeans();return model?.enabled?<p>이 화면은 멤버십 원화 수익 기준입니다. <Link href={`${basePath}/beans`}>콩 후원 수익·출금 보기</Link></p>:null;}
export function TipButton({creatorId,name,postId,post,creator,disabled=false,profile=false}:{creatorId:string;name:string;postId?:string;post?:Post;creator?:Creator;disabled?:boolean;profile?:boolean}){
 const model=useBeans(),[open,setOpen]=useState(false),[confirming,setConfirming]=useState(false),[quantity,setQuantity]=useState('10'),[message,setMessage]=useState(''),[error,setError]=useState(''),[result,setResult]=useState<BeanTip|null>(null),[pending,setPending]=useState(false),request=useRef(''),busy=useRef(false);
 useEffect(()=>{if(typeof window!=='undefined'&&(profile||!!postId)&&new URLSearchParams(window.location.search).get('tip')==='1'){setOpen(true);const url=new URL(window.location.href);url.searchParams.delete('tip');window.history.replaceState(window.history.state,'',url.toString());}},[profile,postId]);
 if(!model?.enabled||disabled||post?.tipsEnabled===false||model.ownCreatorIds.includes(creatorId))return null;
 const available=model.wallet?.spendableBeans??(model.wallet?.accounts||[]).filter(a=>['purchased','promotion'].includes(a.bucket)).reduce((n,a)=>n+Number(a.balance),0),amount=Number(quantity),ready=Number.isSafeInteger(amount)&&amount>0&&amount<=available&&amount<=100000;
 async function send(){if(!confirming||busy.current||!ready||!model)return;busy.current=true;setPending(true);setError('');request.current ||=crypto.randomUUID();try{const r=await model.tip(creatorId,{quantity:amount,message,postId,requestId:request.current});if(r.success)setResult(r.data);else setError(r.errorMessage);}catch{setError('후원 결과를 확인하지 못했습니다. 같은 요청으로 다시 확인해주세요.');}finally{busy.current=false;setPending(false);setConfirming(false);}}
 return <><Action variant="secondary" data-tip-button="true" aria-label={postId?`게시물 후원 · ${model.postSupporterCounts?.[postId]??post?.supporterCount??0}명`:undefined} className={profile?`${s.walletCharge} ${s.profileTip}`:s.postTip} onClick={()=>{setOpen(true);setResult(null);setError('');request.current='';}}>{profile?<><img src="/brand/beans/soft3d-v2/10.png" width={28} height={28} alt=""/><span>후원하기</span></>:<><NavIcon name="coin"/><span>{(model.postSupporterCounts?.[postId||'']??post?.supporterCount??0).toLocaleString()}</span></>}</Action>
 <Dialog open={open} onClose={()=>{if(!pending)setOpen(false);}} title={result?(postId?'게시물 후원 완료':'후원 완료'):postId?'이 게시물 후원하기':'콩 후원'}>
  {!model.signedIn?<SignInPrompt basePath={model.basePath}/>:result?<div className={s.tipComplete}>
   <img src="/brand/beans/soft3d-v2/10.png" width={104} height={104} alt=""/>
   <p className={s.tipCompleteTitle} role="status">{beans(result.quantity)} 후원을 보냈어요</p>
   <p className={s.tipRecipient}>{post&&<><strong>{post.title}</strong><br/></>}{name}님께 마음을 전했습니다.</p>
   {result.message&&<blockquote className={s.tipSentMessage}>{result.message}</blockquote>}
   <Link className={s.tipHistoryLink} href={`${model.basePath}/beans/tips`}>보낸 후원 보기</Link>
   <Action className={s.tipSubmit} onClick={()=>setOpen(false)}>확인</Action>
  </div>:<div className={s.tipForm} aria-busy={pending}>
   <div className={s.tipIntro}><Avatar src={creator?.image} name={name} position={creator?.position} size={56}/><div className={s.tipIdentity}><strong><CreatorName person={{name,isVerified:creator?.isVerified}}/></strong>{creator?.handle&&<span className={s.tipHandle}>@{creator.handle}</span>}<span>콩으로 응원의 마음을 전해보세요.</span></div></div>
   {post&&<div className={s.tipPost}><span>후원할 게시물</span><strong>{post.title}</strong><small>이 게시물에 대한 응원을 크리에이터에게 보냅니다.</small></div>}
   <div className={s.tipBalance}><span>사용 가능한 콩</span><strong>{model.loading?'불러오는 중…':beans(available)}</strong><Link href={`${model.basePath}/beans/charge?tipCreator=${encodeURIComponent(creatorId)}`} aria-disabled={pending} onClick={e=>{if(pending)e.preventDefault();else if(creator)rememberTipRecipient(model.basePath,{...creator,postId});}}>충전</Link></div>
   <fieldset className={s.tipOptions} disabled={pending}><legend>후원할 콩 선택</legend><div className={s.tipPresets}>{[
    [10,'soft3d-v6/10'],[30,'soft3d-v5/50'],[50,'soft3d-v6/30'],[100,'soft3d-v7/100'],[300,'soft3d-v5/300'],[500,'soft3d-v7/500'],[1000,'soft3d-v7/1000'],[5000,'soft3d-v5/5000'],[10000,'soft3d-v7/10000']
   ].map(([value,image])=><Radio key={value} name={`tip-${creatorId}-${postId||'profile'}`} className={s.tipPreset} label={<><img src={`/brand/beans/${image}.png`} width={64} height={64} alt=""/><strong>{beans(value)}</strong></>} value={value} checked={amount===value} onChange={checked=>{if(checked){setQuantity(String(value));setError('');request.current='';}}}/>)}</div></fieldset>
   <Field label="직접 입력 (콩)" type="number" min="1" max={Math.min(available,100000)} value={quantity} onChange={e=>{setQuantity(e.target.value);setError('');request.current='';}} disabled={pending}/>
   {amount>available&&<p className={s.tipHint}>콩이 부족해요. 충전 후 후원할 수 있습니다.</p>}
   <Field label="응원 메시지 (선택)" placeholder="크리에이터에게 응원의 한마디를 남겨보세요" value={message} maxLength={500} onChange={e=>{setMessage(e.target.value);request.current='';}} disabled={pending}/>
   <p className={s.tipHint}>프로모션콩부터 사용합니다. 후원은 멤버십 이용 권한을 제공하지 않습니다.</p>
   {error&&<p role="alert" className={s.tipError}>{error}</p>}
   <Action className={s.tipSubmit} disabled={pending||model.loading||!ready} onClick={()=>{if(ready&&!pending)setConfirming(true);}}>{pending?'후원 확인 중…':`${ready?beans(amount)+' ':''}후원하기`}</Action>
  </div>}
 </Dialog>
 <Dialog open={open&&confirming} onClose={()=>{if(!pending)setConfirming(false);}} title="후원 확인">
  <div className={s.tipForm}>
   <div className={s.tipIntro}><Avatar src={creator?.image} name={name} position={creator?.position} size={48}/><div className={s.tipIdentity}><strong><CreatorName person={{name,isVerified:creator?.isVerified}}/></strong>{creator?.handle&&<span className={s.tipHandle}>@{creator.handle}</span>}</div></div>
   {post&&<div className={s.tipPost}><span>후원할 게시물</span><strong>{post.title}</strong></div>}
   <p className={s.tipConfirmQuestion}><strong>{beans(amount)}</strong>을 정말 후원하시겠어요?</p>
   {message&&<blockquote className={s.tipSentMessage}>{message}</blockquote>}
   <DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setConfirming(false)}>취소</Action><Action disabled={pending||model.loading||!ready} onClick={()=>void send()}>{pending?'후원 중…':'확인하고 후원하기'}</Action></DialogActions>
  </div>
 </Dialog></>;

}
export function BeanStudioPage(){const model=useBeans(),[q,setQ]=useState('1000'),[account,setAccount]=useState(''),[quote,setQuote]=useState<BeanQuote|null>(null),[pin,setPin]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[pending,setPending]=useState(false),key=useRef(''),grant=useRef(''),busy=useRef(false);const refresh=model?.refresh;
 useEffect(()=>{if(model?.signedIn)void refresh?.(true);},[refresh,model?.signedIn]);
 if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;const data=model.studio,n=Number(q),accountId=account||data?.accounts[0]?.id||'',ready=Number.isSafeInteger(n)&&n>=1000&&n<=(data?.availableBeans||0)&&!!accountId;
 async function review(){if(!model||busy.current||!ready)return;busy.current=true;setPending(true);setError('');try{const r=await model.quote(n,accountId);if(r.success){setQuote(r.data);key.current=crypto.randomUUID();grant.current='';}else setError(r.errorMessage);}finally{busy.current=false;setPending(false);}}
 async function submit(){if(!model||!quote||busy.current)return;busy.current=true;setPending(true);setError('');try{if(!grant.current){const a=await model.authorize(quote.quantity,quote.accountId,pin);setPin('');if(!a.success){setError(a.errorMessage);return;}grant.current=a.data.authorizationId;}const r=await model.withdraw({quantity:quote.quantity,accountId:quote.accountId,authorizationId:grant.current,requestId:key.current});if(r.success){setQuote(null);setNotice('후원콩 출금이 접수되었습니다. 은행 지급 완료와는 다릅니다.');grant.current='';}else{setError(r.errorMessage);grant.current='';}}catch{setError('접수 결과를 확인하지 못했습니다. 같은 요청으로 다시 확인해주세요.');}finally{busy.current=false;setPending(false);}}
 return <section className={s.page}><PageTitle>콩 후원·출금</PageTitle>{model.mode==='mock'&&<p className={s.notice}>목업 출금입니다. 실제 송금하지 않습니다. PIN 123456</p>}{model.error&&<p role="alert">{model.error}</p>}<BeanBalanceSummary wallet={data?.wallet??model.wallet} withdrawableBeans={data?.availableBeans} loading={model.loading}/><p>후원받은 일반콩과 프로모션콩을 출금할 수 있습니다. 일반콩은 실제 입금 확인과 7일 보류가 필요하고, 프로모션콩은 지급 출처를 확인합니다. 직접 충전하거나 지급받은 콩은 출금할 수 없습니다. 1,000콩(총액 10만 원)부터 신청하며 수수료는 출금 시 20%입니다.</p><form className={s.form} onSubmit={e=>{e.preventDefault();void review();}}><h2>후원콩 출금</h2><Field label="출금할 콩" type="number" min="1000" max={data?.availableBeans||0} value={q} disabled={pending} onChange={e=>setQ(e.target.value)}/><SelectField label="받을 계좌" value={accountId} options={(data?.accounts||[]).map(a=>({value:a.id,label:a.label}))} onChange={setAccount}/>{!data?.pinConfigured&&<Link href={`${model.basePath}/studio/security`}>출금 PIN 설정</Link>}<Link href={`${model.basePath}/studio/accounts`}>정산 계좌 관리</Link><Action type="submit" disabled={pending||!ready||!data?.pinConfigured}>출금 내용 확인</Action></form>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}<section><h2>받은 후원</h2>{data?.receivedByType&&<dl className={s.tipTotals}>{data.receivedByType.map(g=><div key={g.sourceType}><dt>{g.sourceType==='post'?'게시물 후원':'프로필 후원'} · {g.count.toLocaleString()}건</dt><dd>일반 {beans(g.paidQuantity)}<small>프로모션 {beans(g.promotionQuantity)}</small></dd></div>)}</dl>}{data?.tips.items.length?data.tips.items.map(t=><div key={t.id} className={s.row}><span><BeanTipSource tip={t} basePath={model.basePath}/><small>보낸 사람 {t.senderName||'탈퇴한 회원'}</small>{t.message&&<small>{t.message}</small>}</span><span>일반 {beans(t.paid_quantity)} / 프로모션 {beans(t.promotion_quantity)}</span></div>):<p>받은 후원이 없습니다.</p>}{data&&<><Action variant="secondary" disabled={data.tips.page<=1||model.loading} onClick={()=>void model.refresh(true,data.tips.page-1)}>이전 후원</Action><Action variant="secondary" disabled={data.tips.items.length<20||model.loading} onClick={()=>void model.refresh(true,data.tips.page+1)}>다음 후원</Action></>}</section><section><h2>콩 출금 내역</h2><p>최근 50건을 표시합니다.</p>{data?.payouts.length?data.payouts.map(p=><div key={p.id} className={s.row}><span>{beans(p.quantity)} · {statusNames[p.status]||p.status}<small>총액 {won(p.gross)} · 수수료 {won(p.fee)} · 지급 {won(p.net)}</small><BeanPayoutSource sources={p.sources} funding={p.funding}/><small>{p.note}</small></span></div>):<p>출금 내역이 없습니다.</p>}</section><Dialog open={!!quote} onClose={()=>{if(!pending)setQuote(null);}} title="콩 출금 확인"><div className={s.form}>{quote&&<><p>{quote.accountLabel}</p><dl className={s.quote}><dt>신청 총액</dt><dd>{won(quote.grossKrw)}</dd><dt>수수료 20%</dt><dd>{won(quote.feeKrw)}</dd><dt>실지급 예정액</dt><dd>{won(quote.netKrw)}</dd></dl><PinField label="콩 출금 PIN" value={pin} onChange={setPin} disabled={pending}/><DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setQuote(null)}>취소</Action><Action disabled={pending||!grant.current&&!/^\d{6}$/.test(pin)} onClick={()=>void submit()}>출금 신청하기</Action></DialogActions></>}</div></Dialog></section>;
}
