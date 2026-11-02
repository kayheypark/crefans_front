import {Action,ActionLink} from './ServiceUI';
import {Toggle} from '@/components/ui/Toggle';
import type {FoundingBadgeModel} from '@/types/crefans-events';
import s from './events.module.css';

export function FoundingBadgeClaim({model,basePath}:{model:FoundingBadgeModel;basePath:string}){
 const {status,visible,busy,error,onClaim,onReload,onVisible}=model,claimed=status==='claimed';
 return <section className={s.claim} aria-labelledby="badge-claim-title" aria-busy={busy} data-pull-refresh-block={busy||undefined}>
  <h2 id="badge-claim-title">{claimed?'원년멤버 배지를 받았어요':'원년멤버 배지, 지금 받아보세요'}</h2>
  <p role="status">{claimed?'함께한 시작을 프로필에 남겨보세요. 배지를 숨겨도 수령 기록은 유지돼요.':status==='ineligible'?'이번 이벤트의 지급 대상이 아니에요. 참여 대상은 아래 유의사항에서 확인해 주세요.':status==='unavailable'?'지금은 배지를 받을 수 없어요. 잠시 후 다시 확인해 주세요.':'참여가 확정된 계정으로 받기 버튼을 누르면 배지가 바로 지급돼요.'}</p>
  {claimed?<><ActionLink className={s.claimAction} href={`${basePath}/me`}>내 프로필 보기</ActionLink><div className={s.badgePreference}><Toggle label="프로필에 배지 표시" description={busy?'표시 설정 저장 중…':visible?'이름 옆에 원년멤버 배지가 표시돼요.':'배지가 다른 사람에게 보이지 않아요.'} checked={visible} onChange={onVisible} disabled={busy}/></div></>:status==='signed-out'?<ActionLink className={s.claimAction} href={`${basePath}/login?next=${encodeURIComponent(`${basePath}/events/founding-badge`)}`}>로그인하고 배지 받기</ActionLink>:status==='error'||status==='unavailable'?<Action className={s.claimAction} variant="secondary" onClick={onReload} disabled={busy}>다시 확인하기</Action>:<Action className={s.claimAction} onClick={onClaim} disabled={busy||status!=='available'}>{busy?'배지 받는 중…':status==='loading'?'수령 대상 확인 중…':status==='ineligible'?'지급 대상이 아닙니다':'원년멤버 배지 받기'}</Action>}
  {error&&<p className={s.claimError} role="alert">{error}</p>}
 </section>;
}
