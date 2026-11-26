'use client';
import Link from 'next/link';
import Icon from './Icon';
import s from './back-button.module.css';

/** onLeave: optional notice that the link was followed (e.g. a funnel step); the destination stays the link's own href. */
type Props={label:string;className?:string}&({href:string;onClick?:never;onLeave?:()=>void}|{href?:never;onClick:()=>void;onLeave?:never});

/** Keep destination links and local navigation actions semantically distinct. */
export function BackButton({label,className='',href,onClick,onLeave}:Props){
  const props={className:`${s.button} ${className}`,'aria-label':label,title:label};
  const icon=<Icon name="arrowLeft" width={22} height={22}/>;
  return href!==undefined?<Link {...props} href={href} {...(onLeave?{onClick:()=>onLeave()}:{})}>{icon}</Link>:<button {...props} type="button" onClick={onClick}>{icon}</button>;
}
