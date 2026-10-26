import Image from 'next/image';
import {MarqueeText} from '@/components/ui/MarqueeText';
import s from './creator-name.module.css';
/** The server owns verification. Undefined and false never display a badge. */
export function CreatorName({person}:{person:{name:string;isVerified?:boolean}}){
  return <span className={s.name}><MarqueeText text={person.name}/>{person.isVerified===true&&<Image className={s.badge} src="/brand/verified-creator-v1.png" width={24} height={24} alt="인증 크리에이터" title="운영자가 확인한 크리에이터"/>}</span>;
}
