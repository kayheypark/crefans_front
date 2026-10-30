import Link from 'next/link';
import type {ReactNode} from 'react';
import s from './ui.module.css';

/** Same look as Chip (Primitives), for navigation such as the profile wallet and settings links. */
export function ChipLink({href,children,icon,className=''}:{href:string;children:ReactNode;icon?:ReactNode;className?:string}){
  return <Link href={href} className={`${s.chip} ${s.chipLink}${icon?` ${s.chipWithIcon}`:''} ${className}`.trim()}>{icon&&<span className={s.chipIcon} aria-hidden="true">{icon}</span>}{children}</Link>;
}
