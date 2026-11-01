import type {LegalDocument} from '@/types/crefans-common';
import s from './common.module.css';

/** The public page and signup dialog display the same injected document: title (by the caller), effective date and sections only. Until a signup effective date is set, the latest revision date is shown. */
export function LegalDocumentBody({document,idPrefix='legal',contents=false}:{document:LegalDocument;idPrefix?:string;contents?:boolean}){
 const effective=document.effectiveAt||document.updatedAt;
 return <>
  {effective&&<div className={s.legalMeta}><span>시행일 {formatDate(effective)}</span></div>}
  {contents&&document.sections.length>0&&<nav aria-label="문서 목차" className={s.legalContents}>{document.sections.map((section,index)=><a key={index} href={`#${idPrefix}-${index}`}>{section.title}</a>)}</nav>}
  <div className={s.documentBody}>{document.sections.map((section,index)=><section id={`${idPrefix}-${index}`} key={index}><h2>{section.title}</h2><p>{section.body}</p>{section.links?.map(link=><p key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></p>)}</section>)}</div>
 </>;
}

const formatDate=(value:string)=>{const [y,m,d]=value.slice(0,10).split('-').map(Number);return y&&m&&d?`${y}년 ${m}월 ${d}일`:value;};
