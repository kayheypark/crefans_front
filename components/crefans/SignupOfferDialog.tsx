import Image from 'next/image';
import type {ReactNode} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {Action,ActionLink} from './ServiceUI';
import s from './studio/ai-photo.module.css';

export function SignupOfferDialog({open,onClose,title,art,signupHref,children}:{open:boolean;onClose:()=>void;title:string;art:string;signupHref:string;children:ReactNode}){
 return <Dialog open={open} onClose={onClose} title={title} className={s.publishOffer}
  illustration={<div className={s.publishOfferArt}><Image src={art} alt="" width={112} height={112}/></div>}>
  <div className={s.publishOfferBody}><p>{children}</p>
   <div className={s.publishOfferActions}><ActionLink href={signupHref}>무료로 회원가입</ActionLink><Action type="button" variant="secondary" onClick={onClose}>나중에</Action></div></div>
 </Dialog>;
}
