'use client';
import {useState} from 'react';
import s from './social.module.css';

const MENTION_PREVIEW=12;
export function CommentMentions({mentions}:{mentions?:{id:string;name:string}[]}){
  const [expanded,setExpanded]=useState(false);
  if(!mentions?.length)return null;
  const shown=expanded?mentions:mentions.slice(0,MENTION_PREVIEW),rest=mentions.length-shown.length;
  return <div className={s.mentions} aria-label={`태그된 사람 ${mentions.length}명`}>{shown.map(person=><span key={person.id} className={s.mention}>@{person.name}</span>)}{rest>0&&<button type="button" className={s.mentionMore} onClick={()=>setExpanded(true)}>외 {rest}명</button>}{expanded&&mentions.length>MENTION_PREVIEW&&<button type="button" className={s.mentionMore} onClick={()=>setExpanded(false)}>접기</button>}</div>;
}
