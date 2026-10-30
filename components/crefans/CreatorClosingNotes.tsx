import {PolicyNotes} from './PolicyNotes';
import type {ClosingBlocker,CreatorReceivable} from '@/types/crefans-studio-finance';

const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
/** The studio finance API returns closingBlockers=[] only when the creator could leave; a missing list never allows closing. */
export const closingAllowed=(blockers?:ClosingBlocker[])=>Array.isArray(blockers)&&blockers.length===0;
/** Open receivables and what is left before a creator can leave, both as given by the studio finance API. */
export function CreatorClosingNotes({receivables=[],closingBlockers=[]}:{receivables?:CreatorReceivable[];closingBlockers?:ClosingBlocker[]}){
  return <>
    {!!receivables.length&&<PolicyNotes title="미수금" notes={receivables.map(r=>r.kind==='beans'?`콩 후원 미수금 ${won(r.amount)} (${r.createdAt.replaceAll('-','.')}) · 정산이 끝날 때까지 콩 출금이 멈춥니다.`:`멤버십 미수금 ${won(r.amount)} (${r.createdAt.replaceAll('-','.')}) · 이후 정산에서 차감됩니다.`)}/>}
    {!!closingBlockers.length&&<PolicyNotes title="탈퇴 준비" notes={closingBlockers.map(b=>b.message)}/>}
  </>;
}
