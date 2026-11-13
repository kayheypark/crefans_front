'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {AiPhotoCostume} from '@/lib/crefans/ai-photo-costumes';
import {aiPhotoPresetText} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';
import {AiPresetPager} from './AiPresetPager';

export const costumeViews=[{value:'grid',label:'카드'},{value:'list',label:'목록'},{value:'carousel',label:'의상 크게'},{value:'compact',label:'모아 보기'},{value:'composer',label:'입력 우선'}] as const;
export type CostumeView=typeof costumeViews[number]['value'];

export function AiPhotoWardrobe({items,view,selectedPrompts,disabled,onPick}:{items:readonly AiPhotoCostume[];view:CostumeView;selectedPrompts:readonly string[];disabled:boolean;onPick:(prompt:string)=>void}){
 const [browsed,setBrowsed]=useState<number|null>(null),[page,setPage]=useState(0);
 const paged=view!=='carousel',pages=Math.ceil(items.length/6),pageIndex=page%pages,visible=paged?items.slice(pageIndex*6,pageIndex*6+6):items;
 function step(direction:number){if(!disabled)setPage(previous=>(previous+direction+pages)%pages);}
 const isSelected=(value:string)=>selectedPrompts.includes(aiPhotoPresetText(value));
 const index=browsed??Math.max(0,items.findIndex(item=>isSelected(item.prompt))),current=items[index];
 function move(direction:number){setBrowsed((index+direction+items.length)%items.length);}
 const cards=<div className={s.costumeGrid} aria-label="코스프레 의상">{visible.map((costume,i)=><button type="button" key={costume.id} className={s.costumeCard} aria-label={costume.name} aria-pressed={isSelected(costume.prompt)} aria-current={view==='carousel'&&index===i?'true':undefined} disabled={disabled} onClick={()=>{setBrowsed(paged?pageIndex*6+i:i);onPick(costume.prompt);}}><span className={s.costumeImage}><Image src={costume.image} alt="" width={240} height={240} sizes={view==='list'||view==='carousel'?'80px':view==='compact'?'(max-width:767px) 28vw, 180px':'(max-width:767px) 45vw, 280px'}/>{isSelected(costume.prompt)&&<span className={s.costumeSelected} aria-hidden="true">✓</span>}</span><strong>{costume.name}</strong></button>)}</div>;
 return <div data-costume-view={view} className={s.wardrobeLayout}>
  {view==='carousel'&&<div className={s.costumeShowcase} role="group" aria-label="의상 크게 보기">
   <div className={s.showcaseImage}><Image src={current.image} alt={current.name} width={512} height={512} sizes="(max-width:767px) 85vw, 540px"/>
    <button type="button" className={s.showcasePrevious} aria-label="이전 의상" disabled={disabled} onClick={()=>move(-1)}>‹</button><button type="button" className={s.showcaseNext} aria-label="다음 의상" disabled={disabled} onClick={()=>move(1)}>›</button>
   </div>
   <div className={s.showcaseCaption} aria-live="polite"><strong>{current.name}</strong><span>{index+1} / {items.length}</span></div>
   <button type="button" className={s.applyCostume} aria-pressed={isSelected(current.prompt)} disabled={disabled} onClick={()=>onPick(current.prompt)}>{isSelected(current.prompt)?'선택 해제':'이 의상 선택'}</button>
  </div>}
  {paged?<><div className={s.presetNavigation}><button type="button" aria-label="이전 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(-1)}>‹</button><span aria-live="polite">{pageIndex+1} / {pages}</span><button type="button" aria-label="다음 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(1)}>›</button></div><AiPresetPager key={view} disabled={disabled||pages<=1} onStep={step}>{cards}</AiPresetPager></>:cards}
 </div>;
}
