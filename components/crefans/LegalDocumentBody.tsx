import type {LegalDocument} from '@/types/crefans-common';
import {Notice} from './ServiceUI';
import s from './common.module.css';

/** The public page and signup dialog display the same injected document. */
export function LegalDocumentBody({document,idPrefix='legal',contents=false}:{document:LegalDocument;idPrefix?:string;contents?:boolean}){
 return <>
  <div className={s.legalMeta}>{document.status==='draft'?<strong>검토 초안 · 시행 전</strong>:document.effectiveAt?<span>시행일 {document.effectiveAt}</span>:document.publishedAt?<><strong>공개본 · 가입 적용 준비 중</strong><span>공개일 {document.publishedAt}</span></>:null}{document.updatedAt&&<span>작성·수정일 {document.updatedAt}</span>}{document.version&&<span>버전 {document.version}</span>}</div>
  {document.notice&&<Notice>{document.notice}</Notice>}
  {contents&&document.sections.length>0&&<nav aria-label="문서 목차" className={s.legalContents}>{document.sections.map((section,index)=><a key={index} href={`#${idPrefix}-${index}`}>{section.title}</a>)}</nav>}
  <div className={s.documentBody}>{document.sections.map((section,index)=><section id={`${idPrefix}-${index}`} key={index}><h2>{section.title}</h2><p>{section.body}</p>{section.links?.map(link=><p key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></p>)}</section>)}</div>
 </>;
}
