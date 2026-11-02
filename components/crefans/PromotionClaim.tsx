import {Action,ActionLink} from './ServiceUI';
import type {PromotionClaimModel} from '@/types/crefans-events';
import s from './events.module.css';

export function PromotionClaim({model,basePath}:{model:PromotionClaimModel;basePath:string}){
 const {status,busy,error,onClaim,onReload}=model;
 const claimed=status==='claimed';
 return <section className={s.claim} aria-labelledby="promotion-claim-title" aria-busy={busy} data-pull-refresh-block={busy||undefined}>
  <h2 id="promotion-claim-title">{claimed?'100콩을 받았어요':'100콩, 지금 받아보세요'}</h2>
  <p role="status">{claimed?'프로모션 100콩이 지갑에 지급되었어요. 좋아하는 크리에이터를 후원해 보세요.':status==='ineligible'?'이번 이벤트의 지급 대상이 아니에요. 참여 대상은 아래 유의사항에서 확인해 주세요.':status==='unavailable'?'지금은 혜택을 받을 수 없어요. 잠시 후 다시 확인해 주세요.':'받기 버튼을 누르면 대상 확인 후 지갑에 바로 지급돼요. 같은 혜택은 한 번만 받을 수 있어요.'}</p>
  {claimed?<ActionLink className={s.claimAction} href={`${basePath}/beans`}>내 지갑 보기</ActionLink>:status==='signed-out'?<ActionLink className={s.claimAction} href={`${basePath}/login?next=${encodeURIComponent(`${basePath}/events/promotion-beans`)}`}>로그인하고 100콩 받기</ActionLink>:status==='error'||status==='unavailable'?<Action className={s.claimAction} variant="secondary" onClick={onReload} disabled={busy}>다시 확인하기</Action>:<Action className={s.claimAction} onClick={onClaim} disabled={busy||status!=='available'}>{busy?'지급 확인 중…':status==='loading'?'지급 대상 확인 중…':status==='ineligible'?'지급 대상이 아닙니다':'100콩 받기'}</Action>}
  {error&&<p className={s.claimError} role="alert">{error}</p>}
 </section>;
}
