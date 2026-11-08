'use client';
// Shared centered prompt: illustration, title, description and actions (2026-11-08 user request: reuse the sign-in layout).
// `page` fills the screen (with an optional footer); `dialog` sits inside a Dialog. Mark the main action with `promptPrimary`.
import Image from 'next/image';
import type {ReactNode} from 'react';
import s from './prompt-layout.module.css';

export const promptPrimary=s.primary;
export function PromptLayout({icon,title,description,actions,variant='page',footer,headingLevel}:{icon:string;title?:string;description:ReactNode;actions:ReactNode;variant?:'page'|'dialog';footer?:ReactNode;headingLevel?:'h1'|'h2'|'h3'}){
 const Heading=headingLevel||(variant==='dialog'?'h3':'h1');
 return <section className={`${s.prompt}${variant==='dialog'?` ${s.dialog}`:''}`}><div className={s.content}>
  <Image className={s.icon} src={icon} width={88} height={88} sizes="88px" alt="" priority/>
  {title&&<Heading className={s.title}>{title}</Heading>}<p>{description}</p>
  <div className={s.actions}>{actions}</div>
 </div>{footer}</section>;
}
