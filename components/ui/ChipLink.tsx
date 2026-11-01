import Link from 'next/link';
import type {ReactNode} from 'react';
import s from './ui.module.css';

/** Same look as Chip (Primitives), for navigation such as the profile wallet and settings links. `selected` marks the current page (aria-current) with the selected chip look. */
export function ChipLink({href,children,icon,className='',selected=false}:{href:string;children:ReactNode;icon?:ReactNode;className?:string;selected?:boolean}){
  return <Link href={href} aria-current={selected?'page':undefined} className={`${s.chip} ${s.chipLink}${icon?` ${s.chipWithIcon}`:''} ${className}`.trim()}>{icon&&<span className={s.chipIcon} aria-hidden="true">{icon}</span>}{children}</Link>;
}
