'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {AiPhotoCostume} from '@/lib/crefans/ai-photo-costumes';
import {aiPhotoPresetText} from '@/lib/crefans/ai-photo';
import s from './ai-photo.module.css';
import {AiPresetPager} from './AiPresetPager';

export function AiPhotoWardrobe({items,selectedPrompts,disabled,onPick}:{items:readonly AiPhotoCostume[];selectedPrompts:readonly string[];disabled:boolean;onPick:(prompt:string)=>void}){
 const [page,setPage]=useState(0),pages=Math.ceil(items.length/6),pageIndex=page%pages,visible=items.slice(pageIndex*6,pageIndex*6+6);
 function step(direction:number){if(!disabled)setPage(previous=>(previous+direction+pages)%pages);}
 const isSelected=(value:string)=>selectedPrompts.includes(aiPhotoPresetText(value));
 return <div className={s.wardrobeLayout}>
  <div className={s.presetNavigation}><button type="button" aria-label="이전 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(-1)}>‹</button><span aria-live="polite">{pageIndex+1} / {pages}</span><button type="button" aria-label="다음 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(1)}>›</button></div>
  <AiPresetPager disabled={disabled||pages<=1} onStep={step}><div className={s.costumeGrid} aria-label="코스프레 의상">{visible.map(costume=><button type="button" key={costume.id} className={s.costumeCard} aria-label={costume.name} aria-pressed={isSelected(costume.prompt)} disabled={disabled} onClick={()=>onPick(costume.prompt)}><span className={s.costumeImage}><Image src={costume.image} alt="" width={240} height={240} sizes="(max-width:767px) 28vw, 180px"/>{isSelected(costume.prompt)&&<span className={s.costumeSelected} aria-hidden="true">✓</span>}</span><strong>{costume.name}</strong></button>)}</div></AiPresetPager>
 </div>;
}
