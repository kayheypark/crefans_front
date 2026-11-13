'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {AiPhotoCostume} from '@/lib/crefans/ai-photo-costumes';
import {selectedAiPhotoPresetIndex} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';

export const costumeViews=[{value:'grid',label:'카드'},{value:'list',label:'목록'},{value:'carousel',label:'의상 크게'},{value:'compact',label:'모아 보기'},{value:'composer',label:'입력 우선'}] as const;
export type CostumeView=typeof costumeViews[number]['value'];

export function AiPhotoWardrobe({items,view,prompt,disabled,onPick}:{items:readonly AiPhotoCostume[];view:CostumeView;prompt:string;disabled:boolean;onPick:(prompt:string)=>void}){
 const [browsed,setBrowsed]=useState<number|null>(null);
 const selected=selectedAiPhotoPresetIndex(prompt,items.map(costume=>costume.prompt)),index=browsed??Math.max(0,selected),current=items[index];
 function move(direction:number){setBrowsed((index+direction+items.length)%items.length);}
 return <div data-costume-view={view} className={s.wardrobeLayout}>
  {view==='carousel'&&<div className={s.costumeShowcase} role="group" aria-label="의상 크게 보기">
   <div className={s.showcaseImage}><Image src={`/brand/ai-photo/costumes/${current.id}-v1.webp`} alt={current.name} width={512} height={512} sizes="(max-width:767px) 85vw, 540px"/>
    <button type="button" className={s.showcasePrevious} aria-label="이전 의상" disabled={disabled} onClick={()=>move(-1)}>‹</button><button type="button" className={s.showcaseNext} aria-label="다음 의상" disabled={disabled} onClick={()=>move(1)}>›</button>
   </div>
   <div className={s.showcaseCaption} aria-live="polite"><strong>{current.name}</strong><span>{index+1} / {items.length}</span></div>
   <button type="button" className={s.applyCostume} aria-pressed={selected===index} disabled={disabled} onClick={()=>onPick(current.prompt)}>{selected===index?'선택한 의상 ✓':'이 의상 선택'}</button>
  </div>}
  <div className={s.costumeGrid} aria-label="코스프레 의상">{items.map((costume,i)=><button type="button" key={costume.id} className={s.costumeCard} aria-label={costume.name} aria-pressed={selected===i} aria-current={view==='carousel'&&index===i?'true':undefined} disabled={disabled} onClick={()=>{setBrowsed(i);onPick(costume.prompt);}}><span className={s.costumeImage}><Image src={`/brand/ai-photo/costumes/${costume.id}-v1.webp`} alt="" width={240} height={240} sizes={view==='list'||view==='carousel'?'80px':view==='compact'?'(max-width:767px) 28vw, 180px':'(max-width:767px) 45vw, 280px'}/>{selected===i&&<span className={s.costumeSelected} aria-hidden="true">✓</span>}</span><strong>{costume.name}</strong></button>)}</div>
 </div>;
}
