'use client';
import Link from 'next/link';
import Icon from './Icon';
import s from './back-button.module.css';

type Props={label:string;className?:string}&({href:string;onClick?:never}|{href?:never;onClick:()=>void});

/** Keep destination links and local navigation actions semantically distinct. */
export function BackButton({label,className='',href,onClick}:Props){
  const props={className:`${s.button} ${className}`,'aria-label':label,title:label};
  const icon=<Icon name="arrowLeft" width={22} height={22}/>;
  return href!==undefined?<Link {...props} href={href}>{icon}</Link>:<button {...props} type="button" onClick={onClick}>{icon}</button>;
}
