import Image from 'next/image';
import type {AiPhotoKind} from '@/types/crefans-studio-management';

export function AiPhotoCategoryIcon({kind}:{kind:AiPhotoKind}){
 return <Image src={`/brand/ai-photo/${kind}-colorful-flat-v3.png`} alt="" width={26} height={26} aria-hidden="true" draggable={false}/>;
}
