'use client';
import {Dialog} from '@/components/ui/Primitives';
import {Checkbox} from '@/components/ui/Choice';
import {DialogActions} from '@/components/ui/DialogActions';
import {TextLink} from '@/components/ui/TextLink';
import {Action} from './ServiceUI';
import type {Subscription} from '@/types/crefans';
import s from './creator.module.css';

export function SubscriptionResumeDialog({subscription,planName,basePath,agreed,pending,error,onAgree,onClose,onConfirm}:{subscription:Subscription|null;planName:string;basePath:string;agreed:boolean;pending:boolean;error:string;onAgree:(value:boolean)=>void;onClose:()=>void;onConfirm:()=>void}){
 return <Dialog open={!!subscription} onClose={()=>{if(!pending)onClose();}} title="다시 이용할까요?">
  {subscription&&<div className={s.dialogContent}>
   <p>지금은 결제하지 않아요. 다음 결제일부터 기본 결제수단으로 매월 자동 결제됩니다.</p>
   <dl className={s.summaryRows}><div><dt>멤버십</dt><dd>{planName}</dd></div><div><dt>다음 결제일</dt><dd>{subscription.renewAt.replaceAll('-','.')}</dd></div><div><dt>월 결제금액</dt><dd>{subscription.price.toLocaleString('ko-KR')}원 <small>(VAT 포함)</small></dd></div></dl>
   <p className={s.helper}>남은 이용 기간과 기존 구독 조건은 그대로 유지됩니다. 내 구독에서 다음 갱신을 다시 해지할 수 있어요.</p>
   <p className={s.helper}><TextLink href={`${basePath}/legal/terms`}>이용약관</TextLink> · <TextLink href={`${basePath}/payment-methods`}>결제수단 관리</TextLink></p>
   <Checkbox label="위 결제 조건과 이용약관을 확인했으며 매월 자동 결제에 동의합니다. (필수)" checked={agreed} disabled={pending} onChange={onAgree}/>
   {error&&<p className={s.error} role="alert">{error}</p>}
   <DialogActions><Action variant="secondary" disabled={pending} onClick={onClose}>취소</Action><Action variant="brand" disabled={!agreed||pending} aria-busy={pending} onClick={onConfirm}>{pending?'처리 중…':'다시 이용할래요'}</Action></DialogActions>
  </div>}
 </Dialog>;
}
