'use client';
import Link from 'next/link';
import {Toggle} from '@/components/ui/Toggle';
import {useFoundingBadge} from '@/features/events/useFoundingBadge';
import type {FoundingBadgeActions} from '@/types/crefans-events';

export function FoundingBadgeSettings({signedIn,actions,basePath}:{signedIn:boolean;actions?:FoundingBadgeActions;basePath:string}){
 const badge=useFoundingBadge(signedIn,actions);
 return <div>
  {badge.status==='claimed'?<Toggle label="오픈 기념 한정판 배지 표시" description="이름 옆에 배지를 표시해요. 숨겨도 수령 기록은 유지돼요." checked={badge.visible} disabled={badge.busy} onChange={badge.onVisible}/>:badge.status==='loading'?<p role="status">배지 정보를 확인하고 있어요.</p>:badge.status==='error'?<button type="button" onClick={badge.onReload}>배지 정보 다시 확인</button>:<Link href={`${basePath}/events/founding-badge`}>오픈 기념 한정판 배지 받기</Link>}
  {badge.busy&&<p role="status">표시 설정 저장 중…</p>}
  {badge.error&&<p role="alert">{badge.error}</p>}
 </div>;
}
