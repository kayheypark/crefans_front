import {aiPhotoKindIsNew} from '@/lib/crefans/ai-photo';
import Image from 'next/image';
import s from './ai-photo.module.css';
import type {AiPhotoKind} from '@/types/crefans-studio-management';

export function AiPhotoCategoryIcon({kind}:{kind:AiPhotoKind}){
 return <>
  {aiPhotoKindIsNew(kind)&&<span className={s.skinNew}>NEW</span>}
  <Image src={`/brand/ai-photo/category-soft3d/${kind==='skin'?'skin-v3':kind+'-v2'}.png`} alt="" width={24} height={24} aria-hidden="true" draggable={false}/>
 </>;
}
