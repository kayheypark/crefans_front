'use client';
import Image from 'next/image';
import {Chip} from '@/components/ui/Primitives';

const icons:Record<string,string>={
  '전체':'all','라이프스타일':'lifestyle','뷰티':'beauty','코스프레':'cosplay','피트니스':'fitness',
  '음악':'music','여행':'travel','게임':'gaming','아트':'art','일상':'daily',
};

/** Unknown categories retain their label without borrowing a misleading icon. */
export function CategoryIcon({label}:{label:string}){
  const icon=Object.hasOwn(icons,label)?icons[label]:undefined;
  return icon?<Image src={`/brand/categories/${icon}-round-flat-v1.png`} alt="" width={20} height={20} sizes="20px" draggable={false}/>:null;
}

export function CategoryChip({label,selected,onClick}:{label:string;selected?:boolean;onClick?:()=>void}){
  return <Chip selected={selected} onClick={onClick} icon={Object.hasOwn(icons,label)?<CategoryIcon label={label}/>:undefined}>{label}</Chip>;
}
