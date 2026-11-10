'use client';
import {TIP_PROVISION} from '@/lib/crefans/creator-provision';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {BeanTipSource,BeanPayoutSource} from './BeanAttribution';
import {beanPayoutNotesFor} from '@/lib/crefans/creator-payout-policy';
import {PolicyNotes} from './PolicyNotes';
import {CreatorClosingNotes,closingAllowed} from './CreatorClosingNotes';
import type {ClosingBlocker,CreatorReceivable} from '@/types/crefans-studio-finance';
import Link from 'next/link';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {rememberTipRecipient} from '@/lib/crefans/bean-tip-return';
import {useBeans} from './BeanContext';
import {BeanBalanceSummary} from './BeanBalanceSummary';
import Icon from './Icon';
import {Avatar} from '@/components/ui/Avatar';
import {CreatorName} from './CreatorName';
import type {Creator,Post} from '@/types/crefans';
import {Action,ActionLink,Empty,PageTitle} from './ServiceUI';
import {SignInPrompt} from './SignInPrompt';
import {BackButton} from './BackButton';
import {Dialog,Field} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {PinPad} from '@/components/ui/PinPad';
import {usePinPad} from '@/hooks/usePinPad';
import {Checkbox,Radio} from '@/components/ui/Choice';
import {SelectField} from '@/components/ui/SelectField';
import type {BeanTip,BeanQuote} from '@/types/crefans-beans';
import s from './beans.module.css';
const beans=(n:number|string)=>Number(n).toLocaleString('ko-KR')+'콩',won=(n:number|string)=>Number(n).toLocaleString('ko-KR')+'원';
// The fee rate comes from the server quote (creator terms may differ from the platform default); no rate, no number.
const feeLabel=(bps?:number)=>typeof bps==='number'&&Number.isFinite(bps)?`수수료 ${Number((bps/100).toFixed(2))}%`:'수수료';
const statusNames:Record<string,string>={requested:'접수',processing:'처리 중',paid:'완료',rejected:'반려',blocked:'보류',pending:'결제 대기',failed:'실패',cancelled:'취소',disputed:'확인 필요'};
// Profile wallet shows a bean icon and spendable balance; it loads once when signed in.
export function BeanWalletLink({basePath,className}:{basePath:string;className?:string}){const model=useBeans(),refresh=useRef(model?.refresh),loaded=useRef(false),load=!!className&&!!model?.enabled&&!!model.signedIn;
 refresh.current=model?.refresh;
 // Once per mount: some models recreate refresh on every render, so it must not be an effect dependency.
 useEffect(()=>{if(load&&!loaded.current){loaded.current=true;void refresh.current?.();}},[load]);
 // Loading rule (/ux-spinner 2026-11-01): before the first response the label stays empty for 1s, then a small spinner;
 // only the response shows the balance (or '내 지갑' when it failed). A refresh keeps the previous balance.
 const pending=load&&!model?.wallet&&!model?.error,slow=useDelayedLoading(pending);
 if(!model?.enabled)return null;const balance=model.wallet?model.wallet.spendableBeans??(model.wallet.accounts||[]).filter(a=>['purchased','promotion'].includes(a.bucket)).reduce((n,a)=>n+Number(a.balance),0):null;
 return className?<Link href={`${basePath}/beans`} className={className} aria-label={balance===null?'내 지갑':`내 지갑 · 사용 가능한 ${beans(balance)}`}><Image src="/brand/beans/soft3d-v2/10.png" width={20} height={20} sizes="20px" alt="" draggable={false}/><span>{balance!==null?beans(balance):pending?(slow?<LoadingSpinner inline/>:null):'내 지갑'}</span></Link>:<div style={{padding:'12px 16px'}}><Link href={`${basePath}/beans`}>내 콩 지갑</Link></div>;}
export function BeanIncomeLink({basePath}:{basePath:string}){const model=useBeans();return model?.enabled?<p className={s.incomeLink}>이 화면은 멤버십 원화 수익 기준입니다. <Link href={`${basePath}/beans`}>콩 후원 수익·출금 보기</Link></p>:null;}
export function TipButton({creatorId,name,postId,post,creator,disabled=false,profile=false}:{creatorId:string;name:string;postId?:string;post?:Post;creator?:Creator;disabled?:boolean;profile?:boolean}){
 const model=useBeans(),[open,setOpen]=useState(false),[confirming,setConfirming]=useState(false),[quantity,setQuantity]=useState('10'),[message,setMessage]=useState(''),[error,setError]=useState(''),[result,setResult]=useState<BeanTip|null>(null),[pending,setPending]=useState(false),[shared,setShared]=useState(false),request=useRef(''),busy=useRef(false);
 useEffect(()=>{if(typeof window!=='undefined'&&(profile||!!postId)&&new URLSearchParams(window.location.search).get('tip')==='1'){setOpen(true);const url=new URL(window.location.href);url.searchParams.delete('tip');window.history.replaceState(window.history.state,'',url.toString());}},[profile,postId]);
 // Loading rule: the balance stays (blank before the first response); a small spinner only after 1s.
 const balancePending=!!model&&(model.loading||(!model.wallet&&!model.error)),slowBalance=useDelayedLoading(open&&balancePending);
 const own=!!model?.ownCreatorIds.includes(creatorId),supporterCount=model?.postSupporterCounts?.[postId||'']??post?.supporterCount??0;
 const postIcon=<><Image className={s.postTipIcon} src="/brand/post-actions/support-coin-flat-v1.png" width={24} height={24} sizes="24px" alt="" aria-hidden="true" draggable={false}/><span>{supporterCount.toLocaleString()}</span></>;
 if(post?.tipsEnabled===false||(model&&!model.enabled))return null;
 // Ownership and preview mode prevent donations, but still show the post's support count.
 if(postId&&(disabled||own||!model))return <span className={s.postTip} data-post-support-count={true} role="img" aria-label={`게시물 후원 · ${supporterCount}명`}>{postIcon}</span>;
 if(!model?.enabled||disabled||own)return null;
 const available=model.wallet?.spendableBeans??(model.wallet?.accounts||[]).filter(a=>['purchased','promotion'].includes(a.bucket)).reduce((n,a)=>n+Number(a.balance),0),amount=Number(quantity),ready=Number.isSafeInteger(amount)&&amount>0&&amount<=available&&amount<=100000;
 async function send(){if(!confirming||busy.current||!ready||!shared||!model)return;busy.current=true;setPending(true);setError('');request.current ||=crypto.randomUUID();try{const r=await model.tip(creatorId,{quantity:amount,message,postId,requestId:request.current,creatorProvision:TIP_PROVISION.version});if(r.success)setResult(r.data);else setError(r.errorMessage);}catch{setError('후원 결과를 확인하지 못했습니다. 같은 요청으로 다시 확인해주세요.');}finally{busy.current=false;setPending(false);setConfirming(false);}}
 return <><Action variant="secondary" data-tip-button="true" aria-label={postId?`게시물 후원 · ${supporterCount}명`:undefined} className={profile?`${s.walletCharge} ${s.profileTip}`:s.postTip} onClick={()=>{setOpen(true);setResult(null);setError('');request.current='';}}>{profile?<><img src="/brand/beans/soft3d-v2/10.png" width={28} height={28} alt=""/><span>후원하기</span></>:postIcon}</Action>
 <Dialog open={open} onClose={()=>{if(!pending)setOpen(false);}} title={result?(postId?'게시물 후원 완료':'후원 완료'):postId?'이 게시물 후원하기':'콩 후원'}>
  {!model.signedIn?<SignInPrompt basePath={model.basePath} variant="dialog" description="크리에이터에게 후원하려면 로그인해주세요."/>:result?<div className={s.tipComplete}>
   <img src="/brand/beans/soft3d-v2/10.png" width={104} height={104} alt=""/>
   <p className={s.tipCompleteTitle} role="status">{beans(result.quantity)} 후원을 보냈어요</p>
   <p className={s.tipRecipient}>{post&&<><strong>{post.title}</strong><br/></>}{name}님께 마음을 전했습니다.</p>
   {result.message&&<blockquote className={s.tipSentMessage}>{result.message}</blockquote>}
   <Link className={s.tipHistoryLink} href={`${model.basePath}/beans/tips`}>후원 내역 보기</Link>
   <Action className={s.tipSubmit} onClick={()=>setOpen(false)}>확인</Action>
  </div>:<div className={s.tipForm} aria-busy={pending}>
   <div className={s.tipIntro}><Avatar src={creator?.image} name={name} position={creator?.position} size={56}/><div className={s.tipIdentity}><strong><CreatorName person={{name,isVerified:creator?.isVerified}}/></strong>{creator?.handle&&<span className={s.tipHandle}>@{creator.handle}</span>}<span>콩으로 응원의 마음을 전해보세요.</span></div></div>
   {post&&<div className={s.tipPost}><span>후원할 게시물</span><strong>{post.title}</strong><small>이 게시물에 대한 응원을 크리에이터에게 보냅니다.</small></div>}
   <div className={s.tipBalance}><span>사용 가능한 콩</span><strong>{balancePending&&!model.wallet?null:beans(available)}{slowBalance&&<LoadingSpinner inline/>}</strong><Link href={`${model.basePath}/beans/charge?tipCreator=${encodeURIComponent(creatorId)}`} aria-disabled={pending} onClick={e=>{if(pending)e.preventDefault();else if(creator)rememberTipRecipient(model.basePath,{...creator,postId});}}>충전</Link></div>
   <fieldset className={s.tipOptions} disabled={pending}><legend>후원할 콩 선택</legend><div className={s.tipPresets}>{[
    [10,'soft3d-v6/10'],[30,'soft3d-v5/50'],[50,'soft3d-v6/30'],[100,'soft3d-v7/100'],[300,'soft3d-v5/300'],[500,'soft3d-v7/500'],[1000,'soft3d-v7/1000'],[5000,'soft3d-v5/5000'],[10000,'soft3d-v7/10000']
   ].map(([value,image])=><Radio key={value} name={`tip-${creatorId}-${postId||'profile'}`} className={s.tipPreset} label={<><img src={`/brand/beans/${image}.png`} width={64} height={64} alt=""/><strong>{beans(value)}</strong></>} value={value} checked={amount===value} onChange={checked=>{if(checked){setQuantity(String(value));setError('');request.current='';}}}/>)}</div></fieldset>
   <Field label="직접 입력 (콩)" type="number" min="1" max={Math.min(available,100000)} value={quantity} onChange={e=>{setQuantity(e.target.value);setError('');request.current='';}} disabled={pending}/>
   {amount>available&&<p className={s.tipHint}>콩이 부족해요. 충전 후 후원할 수 있습니다.</p>}
   <Field label="응원 메시지 (선택)" placeholder="크리에이터에게 응원의 한마디를 남겨보세요" value={message} maxLength={500} onChange={e=>{setMessage(e.target.value);request.current='';}} disabled={pending}/>
   <p className={s.tipHint}>프로모션콩부터 사용합니다. 후원은 멤버십 이용 권한을 제공하지 않습니다.</p>
   {error&&<p role="alert" className={s.tipError}>{error}</p>}
   <Action className={s.tipSubmit} disabled={pending||model.loading||!ready} onClick={()=>{if(ready&&!pending){setShared(false);setConfirming(true);}}}>{pending?'후원 확인 중…':`${ready?beans(amount)+' ':''}후원하기`}</Action>
  </div>}
 </Dialog>
 <Dialog open={open&&confirming} onClose={()=>{if(!pending)setConfirming(false);}} title="후원 확인">
  <div className={s.tipForm}>
   <div className={s.tipIntro}><Avatar src={creator?.image} name={name} position={creator?.position} size={48}/><div className={s.tipIdentity}><strong><CreatorName person={{name,isVerified:creator?.isVerified}}/></strong>{creator?.handle&&<span className={s.tipHandle}>@{creator.handle}</span>}</div></div>
   {post&&<div className={s.tipPost}><span>후원할 게시물</span><strong>{post.title}</strong></div>}
   <p className={s.tipConfirmQuestion}><strong>{beans(amount)}</strong>을 정말 후원하시겠어요?</p>
   {message&&<blockquote className={s.tipSentMessage}>{message}</blockquote>}
   <dl className={s.provisionRows} aria-label="크리에이터에게 제공하는 정보"><div><dt>받는 사람</dt><dd>{TIP_PROVISION.recipient}</dd></div><div><dt>제공 항목</dt><dd>{TIP_PROVISION.items}</dd></div><div><dt>목적</dt><dd>{TIP_PROVISION.purpose}</dd></div><div><dt>보유 기간</dt><dd>{TIP_PROVISION.retention}</dd></div></dl>
   <p className={s.tipHint}>{TIP_PROVISION.refusal}</p>
   <Checkbox label="(필수) 위 정보를 크리에이터에게 제공하는 데 동의합니다." checked={shared} disabled={pending} onChange={setShared}/>
   <DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setConfirming(false)}>취소</Action><Action disabled={pending||model.loading||!ready||!shared} onClick={()=>void send()}>{pending?'후원 중…':'확인하고 후원하기'}</Action></DialogActions>
  </div>
 </Dialog></>;

}
// `links` lets the fan withdrawal page point back to the wallet and to its own account/PIN sections; the studio keeps the defaults.
const beanStudioTitles={overview:'콩 후원·출금',withdraw:'후원콩 출금',tips:'받은 후원',payouts:'콩 출금 내역'};
export type BeanStudioView=keyof typeof beanStudioTitles;
export function BeanStudioPage({receivables,closingBlockers,links,view}:{receivables?:CreatorReceivable[];closingBlockers?:ClosingBlocker[];links?:{back:string;backLabel:string;accounts:string;security:string};view?:BeanStudioView}={}){const model=useBeans(),[q,setQ]=useState('1000'),[closing,setClosing]=useState(false),[account,setAccount]=useState(''),[quote,setQuote]=useState<BeanQuote|null>(null),[error,setError]=useState(''),[notice,setNotice]=useSnackbarMessage(),[pending,setPending]=useState(false),key=useRef(''),grant=useRef(''),busy=useRef(false);const refresh=model?.refresh;
 useEffect(()=>{if(model?.signedIn)void refresh?.(true);},[refresh,model?.signedIn]);
 const pad=usePinPad({disabled:pending,onComplete:pin=>void submit(pin)});
 if(!model?.enabled)return <p>콩 후원을 준비 중입니다.</p>;const data=model.studio,canClose=closingAllowed(closingBlockers)&&(data?.availableBeans||0)>0,minimum=closing?1:data?.policy?.minimumWithdrawalBeans??1000,n=Number(q),accountId=account||data?.accounts[0]?.id||'',ready=Number.isSafeInteger(n)&&n>=minimum&&n<=(data?.availableBeans||0)&&!!accountId;
 async function review(){if(!model||busy.current||!ready)return;busy.current=true;setPending(true);setError('');try{const r=await model.quote(n,accountId,closing);if(r.success){setQuote(r.data);key.current=crypto.randomUUID();grant.current='';}else setError(r.errorMessage);}finally{busy.current=false;setPending(false);}}
 async function submit(pin?:string){if(!model||!quote||busy.current)return;if(!grant.current&&!/^\d{6}$/.test(pin||''))return;busy.current=true;setPending(true);setError('');try{if(!grant.current){const a=await model.authorize(quote.quantity,quote.accountId,pin!,closing);if(!a.success){setError(a.errorMessage);return;}grant.current=a.data.authorizationId;}const r=await model.withdraw({quantity:quote.quantity,accountId:quote.accountId,authorizationId:grant.current,requestId:key.current,...(closing?{closing:true}:{})});if(r.success){setQuote(null);setClosing(false);setNotice('후원콩 출금이 접수되었습니다. 은행 지급 완료와는 다릅니다.');grant.current='';}else{setError(r.errorMessage);grant.current='';}}catch{setError('접수 결과를 확인하지 못했습니다. 같은 요청으로 다시 확인해주세요.');}finally{pad.reset();busy.current=false;setPending(false);}}
 const show=(part:'overview'|'withdraw'|'tips'|'payouts')=>!view||view===part;
 // 2026-11-01: like the wallet, the studio bean page is an overview (balance, folded breakdown, withdraw button, links) with
 // withdraw / received tips / payout history on their own pages; notices sit at the very bottom. Without `view` (fan
 // withdraw route) every part is shown on one page as before.
 return <section className={s.page}><PageTitle back={view&&view!=='overview'?<BackButton href={`${model.basePath}/studio/beans`} label="콩 후원·출금으로 돌아가기"/>:<BackButton href={links?.back??`${model.basePath}/studio`} label={links?.backLabel??'대시보드로 돌아가기'}/>}>{beanStudioTitles[view||'overview']}</PageTitle>{model.mode==='mock'&&show('withdraw')&&<p className={s.notice}>목업 출금입니다. 실제 송금하지 않습니다. PIN 123456</p>}{model.error&&<p role="alert">{model.error}</p>}{show('overview')&&<BeanBalanceSummary wallet={data?.wallet??model.wallet} withdrawableBeans={data?.availableBeans} loading={model.loading} detailsOpen={!view} action={view==='overview'?<ActionLink className={s.studioWithdraw} href={`${model.basePath}/studio/beans/withdraw`}>후원콩 출금하기</ActionLink>:undefined}/>}{view==='overview'&&<nav className={s.walletLinks} aria-label="콩 후원·출금 내역">{(['tips','payouts'] as const).map(kind=><Link key={kind} href={`${model.basePath}/studio/beans/${kind}`}><Icon name={kind==='tips'?'heart':'arrow'} width={26} height={26}/><span>{beanStudioTitles[kind]}</span><Icon name="chevron" width={16} height={16}/></Link>)}</nav>}{show('withdraw')&&<>{view==='withdraw'&&<p className={s.withdrawable}>출금 가능한 콩 <strong>{data?(data.availableBeans||0).toLocaleString('ko-KR')+'콩':''}</strong></p>}<form className={s.form} onSubmit={e=>{e.preventDefault();void review();}}>{!view&&<h2>후원콩 출금</h2>}<Field label="출금할 콩" type="number" min={minimum} max={data?.availableBeans||0} value={q} disabled={pending||closing} onChange={e=>setQ(e.target.value)}/>{canClose&&<Checkbox label="탈퇴 전 전액 출금" description="탈퇴를 위해 남은 후원콩 전체를 최소 수량과 관계없이 출금합니다." checked={closing} disabled={pending} onChange={checked=>{setClosing(checked);setQ(String(checked?data?.availableBeans||0:data?.policy?.minimumWithdrawalBeans??1000));setError('');}}/>}<SelectField label="받을 계좌" value={accountId} options={(data?.accounts||[]).map(a=>({value:a.id,label:a.label}))} onChange={setAccount}/><div className={s.formLinks}>{!data?.pinConfigured&&<ActionLink variant="secondary" href={links?.security??`${model.basePath}/studio/security`}>출금 PIN 설정</ActionLink>}<ActionLink variant="secondary" href={links?.accounts??`${model.basePath}/studio/accounts`}>정산 계좌 관리</ActionLink></div><Action type="submit" disabled={pending||!ready||!data?.pinConfigured||!!receivables?.some(r=>r.kind==='beans')}>출금 내용 확인</Action></form>{error&&!quote&&<p role="alert">{error}</p>}<Toast message={notice} onClose={()=>setNotice('')}/></>}{show('tips')&&<section>{!view&&<h2>받은 후원</h2>}{data?.receivedByType&&<dl className={s.tipTotals}>{data.receivedByType.map(g=><div key={g.sourceType}><dt>{g.sourceType==='post'?'게시물 후원':'프로필 후원'} · {g.count.toLocaleString()}건</dt><dd>일반 {beans(g.paidQuantity)}<small>프로모션 {beans(g.promotionQuantity)}</small></dd></div>)}</dl>}{data?.tips.items.length?data.tips.items.map(t=><div key={t.id} className={s.row}><span><BeanTipSource tip={t} basePath={model.basePath}/><small>보낸 사람 {t.senderName||'탈퇴한 회원'}</small>{t.message&&<small>{t.message}</small>}</span><span>일반 {beans(t.paid_quantity)} / 프로모션 {beans(t.promotion_quantity)}</span></div>):<Empty title="아직 받은 후원이 없습니다" description="팬이 보내준 후원이 이곳에 표시됩니다."/>}{data&&(data.tips.items.length>0||data.tips.page>1)&&<div className={s.pager}><Action variant="secondary" disabled={data.tips.page<=1||model.loading} onClick={()=>void model.refresh(true,data.tips.page-1)}>이전 후원</Action><Action variant="secondary" disabled={data.tips.items.length<20||model.loading} onClick={()=>void model.refresh(true,data.tips.page+1)}>다음 후원</Action></div>}</section>}{show('payouts')&&<section>{!view&&<h2>콩 출금 내역</h2>}{!!data?.payouts.length&&<p>최근 50건을 표시합니다.</p>}{data?.payouts.length?data.payouts.map(p=><div key={p.id} className={s.row}><span>{beans(p.quantity)} · {statusNames[p.status]||p.status}<small>총액 {won(p.gross)} · 수수료 {won(p.fee)} · 지급 {won(p.net)}</small><BeanPayoutSource sources={p.sources} funding={p.funding}/><small>{p.note}</small></span></div>):<Empty title="아직 출금 내역이 없습니다" description="콩 출금을 신청하면 이곳에서 내역을 확인할 수 있습니다."/>}</section>}{(show('overview')||view==='withdraw')&&<div className={s.studioNotes}><CreatorClosingNotes receivables={receivables} closingBlockers={closingBlockers}/><PolicyNotes title="콩 출금 기준" notes={beanPayoutNotesFor(data?.policy&&{platformFeeBps:null,settlementHoldDays:null,beanWithdrawalFeeBps:data.policy.withdrawalFeeBps,minimumWithdrawalKrw:data.policy.minimumWithdrawalKrw})}/></div>}<Dialog open={!!quote} onClose={()=>{if(!pending){setQuote(null);pad.reset();}}} title="콩 출금 확인" sheet>{quote&&(grant.current?<div className={s.form}><p>{quote.accountLabel}</p><dl className={s.quote}><dt>실지급 예정액</dt><dd>{won(quote.netKrw)}</dd></dl>{error&&<p role="alert">{error}</p>}<DialogActions><Action variant="secondary" disabled={pending} onClick={()=>setQuote(null)}>닫기</Action><Action disabled={pending} onClick={()=>void submit()}>접수 결과 다시 확인</Action></DialogActions></div>
   :<PinPad pad={pad} title="콩 출금 PIN 입력" eyebrow={quote.accountLabel} hint="설정한 숫자 6자리를 입력하면 바로 출금을 신청해요." error={error||undefined} busy={pending}><dl className={s.quote}><dt>신청 총액</dt><dd>{won(quote.grossKrw)}</dd><dt>{feeLabel(quote.feeBps)}</dt><dd>{won(quote.feeKrw)}</dd><dt>실지급 예정액</dt><dd>{won(quote.netKrw)}</dd></dl></PinPad>)}</Dialog></section>;
}
