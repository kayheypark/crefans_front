'use client';
import Link from 'next/link';
import {createContext,useContext,useId,useRef,useState,type ChangeEvent,type KeyboardEvent,type ReactNode} from 'react';
import type {ReportReason} from '@/lib/crefans/report-reasons';
import type {CommentLikeResult,MentionCandidate,SocialActionResult} from '@/types/crefans-social';
import {Avatar} from './ServiceUI';
import s from './social.module.css';

/** What every comment row and input of one post shares: profile links, tag candidates and reporting. */
export type CommentContextValue={basePath?:string;mentionCandidates?:()=>Promise<MentionCandidate[]>;onLike?:(commentId:string,enabled:boolean)=>Promise<CommentLikeResult>;onReport?:(commentId:string,reason:ReportReason)=>Promise<SocialActionResult>};
export const CommentContext=createContext<CommentContextValue>({});

/** The body with each tagged "@이름" as a blue link to that person's profile (plain text when no base path). */
export function CommentBody({body,mentions}:{body:string;mentions?:{id:string;name:string}[]}){
  const {basePath}=useContext(CommentContext);
  const tags=[...(mentions||[])].sort((a,b)=>b.name.length-a.name.length);
  if(!tags.length)return <p>{body}</p>;
  const parts:ReactNode[]=[];let rest=body,key=0;
  while(rest){
    let at=-1,tag:typeof tags[number]|undefined;
    for(const item of tags){const index=rest.indexOf('@'+item.name);if(index>=0&&(at<0||index<at)){at=index;tag=item;}}
    if(!tag){parts.push(rest);break;}
    if(at)parts.push(rest.slice(0,at));
    const text='@'+tag.name;
    parts.push(basePath?<Link key={key++} className={s.mentionLink} href={`${basePath}/creator/${encodeURIComponent(tag.id)}`}>{text}</Link>:<span key={key++} className={s.mentionLink}>{text}</span>);
    rest=rest.slice(at+text.length);
  }
  return <p>{parts}</p>;
}

type Field=HTMLInputElement|HTMLTextAreaElement;
// The "@word" being typed right before the caret.
function typedTag(value:string,caret:number){const match=/(^|\s)@([^\s@]{0,20})$/.exec(value.slice(0,caret));return match?{start:caret-match[2].length-1,text:match[2]}:null;}

/** Typing "@" opens a list of people who can be tagged; ↑↓ move, Enter or Tab picks, Esc closes. Candidates load once, on the first "@". */
export function useMentionInput(value:string,onChange:(value:string)=>void){
  const {mentionCandidates}=useContext(CommentContext);
  const [candidates,setCandidates]=useState<MentionCandidate[]|null>(null),[tag,setTag]=useState<{start:number;text:string}|null>(null),[active,setActive]=useState(0);
  const field=useRef<Field|null>(null),loading=useRef(false),listId=useId();
  const sync=(target:Field)=>{
    if(!mentionCandidates)return;
    const next=typedTag(target.value,target.selectionStart??target.value.length);setTag(next);setActive(0);
    if(next&&!candidates&&!loading.current){loading.current=true;mentionCandidates().then(setCandidates,()=>setCandidates([])).finally(()=>{loading.current=false;});}
  };
  const matches=tag&&candidates?candidates.filter(person=>person.name.toLowerCase().includes(tag.text.toLowerCase())).slice(0,6):[];
  const open=matches.length>0;
  const pick=(person:MentionCandidate)=>{
    const target=field.current;if(!target||!tag)return;
    const caret=target.selectionStart??value.length,inserted=`@${person.name} `,position=tag.start+inserted.length;
    onChange(value.slice(0,tag.start)+inserted+value.slice(caret));setTag(null);
    requestAnimationFrame(()=>{target.focus();target.setSelectionRange(position,position);});
  };
  const fieldProps={
    'aria-autocomplete':'list' as const,'aria-controls':open?listId:undefined,'aria-activedescendant':open?`${listId}-${active}`:undefined,
    onClick:(event:{currentTarget:Field})=>sync(event.currentTarget),
    onBlur:()=>setTag(null),
    onKeyUp:(event:KeyboardEvent<Field>)=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key))sync(event.currentTarget);},
    onKeyDown:(event:KeyboardEvent<Field>)=>{
      if(!open||event.nativeEvent.isComposing)return;
      if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setActive(index=>(index+(event.key==='ArrowDown'?1:matches.length-1))%matches.length);}
      else if(event.key==='Enter'||event.key==='Tab'){event.preventDefault();pick(matches[active]);}
      else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setTag(null);}
    },
  };
  const change=(event:ChangeEvent<Field>)=>{onChange(event.target.value);sync(event.target);};
  const list=open?<ul id={listId} role="listbox" aria-label="태그할 사람" className={s.mentionList}>{matches.map((person,index)=><li key={`${person.name}-${index}`} id={`${listId}-${index}`} role="option" aria-selected={index===active} onMouseDown={event=>{event.preventDefault();pick(person);}}><Avatar creator={person} size={24}/><span>{person.name}</span></li>)}</ul>:null;
  return {ref:(element:Field|null)=>{field.current=element;},fieldProps,change,list};
}
