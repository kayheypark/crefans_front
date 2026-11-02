import Image from 'next/image';
import {MarqueeText} from '@/components/ui/MarqueeText';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import s from './creator-name.module.css';
/** Badges are explicitly supplied by the model. Commemorative membership never grants creator verification.
 *  `explain` (profile header) makes each badge a button that shows its short meaning; elsewhere badges stay inside their links. */
const badgeInfo={verified:{label:'인증 크리에이터 배지 설명',content:'인증 크리에이터: 운영자가 확인한 크리에이터예요.'},founding:{label:'오픈 기념 배지 설명',content:'크레팬스 오픈을 기념하는 배지예요.'}};
export function CreatorName({person,explain=false}:{person:{name:string;isVerified?:boolean;isFoundingMember?:boolean};explain?:boolean}){
  const verified=<Image className={s.badge} src="/brand/verified-creator-v1.png" width={24} height={24} alt="인증 크리에이터" title={explain?undefined:'운영자가 확인한 크리에이터'}/>;
  const founding=<Image className={`${s.badge} ${s.foundingBadge}`} src="/brand/events/beta-first/color-cards-v1/badge.webp" width={30} height={30} alt="오픈 기념 한정판 배지" title={explain?undefined:'크레팬스 오픈 기념 배지'}/>;
  return <span className={s.name}><MarqueeText text={person.name}/>{person.isVerified===true&&(explain?<InfoTooltip {...badgeInfo.verified} trigger={verified}/>:verified)}{person.isFoundingMember===true&&(explain?<InfoTooltip {...badgeInfo.founding} trigger={founding}/>:founding)}</span>;
}
