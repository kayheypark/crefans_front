'use client';
import Image from 'next/image';
import {Avatar} from '@/components/ui/Avatar';
import s from './navigation-icon.module.css';

export type NavigationIconName='home'|'explore'|'message'|'bell'|'user';

export function NavigationIcon({name,active=false,size=28}:{name:NavigationIconName;active?:boolean;size?:number}){
  return <Image className={s.icon} data-navigation-icon={name} data-active={active} src={`/brand/navigation/${name}-round-flat-v1.png`} alt="" aria-hidden="true" width={size} height={size} sizes={`${size}px`} loading="eager" draggable={false}/>;
}

/** Preserve the user's photo; missing or failed images use the same navigation family. */
export function NavigationAvatar({person,active=false}:{person?:{name:string;image?:string;position?:string};active?:boolean}){
  return <span className={s.profile}><Avatar src={person?.image} name={person?.name} position={person?.position} size={28} fallback={<NavigationIcon name="user" active={active}/>}/></span>;
}
