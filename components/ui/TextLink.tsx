import Link from 'next/link';
import type {ComponentPropsWithoutRef} from 'react';
import s from './text-link.module.css';

export function TextLink({className='',...props}:ComponentPropsWithoutRef<typeof Link>){
  return <Link {...props} data-text-link className={`${s.link} ${className}`}/>;
}
