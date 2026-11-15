'use client';
import {useState} from 'react';
import Image from 'next/image';
import {aiPhotoCostumeGender,type AiPhotoCostume} from '@/lib/crefans/ai-photo-costumes';
import {aiPhotoPresetText} from '@/lib/crefans/ai-photo';
import {AI_PHOTO_PRESET_PAGE_SIZE} from '@/lib/crefans/ai-photo-presets';
import s from './ai-photo.module.css';
import {AiPresetPager} from './AiPresetPager';

export function AiPhotoWardrobe({items,selectedPrompts,disabled,onPick}:{items:readonly AiPhotoCostume[];selectedPrompts:readonly string[];disabled:boolean;onPick:(prompt:string)=>void}){
 const [page,setPage]=useState(0),pages=Math.max(1,Math.ceil(items.length/AI_PHOTO_PRESET_PAGE_SIZE)),pageIndex=page%pages,visible=items.slice(pageIndex*AI_PHOTO_PRESET_PAGE_SIZE,(pageIndex+1)*AI_PHOTO_PRESET_PAGE_SIZE);
 function step(direction:number){if(!disabled)setPage(previous=>(previous+direction+pages)%pages);}
 const isSelected=(value:string)=>selectedPrompts.includes(aiPhotoPresetText(value));
 if(!items.length)return <p className={s.presetEmpty} role="status">검색 결과가 없어요. 다른 검색어를 입력해 주세요.</p>;
 return <div className={s.wardrobeLayout}>
  <div className={s.presetNavigation}><button type="button" aria-label="이전 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(-1)}>‹</button><span aria-live="polite">{pageIndex+1} / {pages}</span><button type="button" aria-label="다음 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(1)}>›</button></div>
  <AiPresetPager disabled={disabled||pages<=1} onStep={step}><div className={s.costumeGrid} aria-label="코스프레 의상">{visible.map(costume=><button type="button" key={costume.id} className={s.costumeCard} aria-label={costume.name} aria-pressed={isSelected(costume.prompt)} disabled={disabled} onClick={()=>onPick(costume.prompt)}><span className={s.costumeImage}><Image src={costume.image} alt="" width={240} height={240} sizes="(max-width:767px) 28vw, 180px"/><CostumeGender gender={aiPhotoCostumeGender(costume)}/>{isSelected(costume.prompt)&&<span className={s.costumeSelected} aria-hidden="true">✓</span>}</span><strong>{costume.name}</strong></button>)}</div></AiPresetPager>
 </div>;
}

const genderMarks={female:[['female','♀']],male:[['male','♂']],both:[['female','♀'],['male','♂']]} as const;
const genderTitles={female:'원작 여성',male:'원작 남성',both:'원작 성별 무관·미표기'} as const;
function CostumeGender({gender}:{gender:keyof typeof genderMarks|undefined}){
 if(!gender)return null;
 return <span className={s.costumeGender} title={genderTitles[gender]} data-gender={gender}>{genderMarks[gender].map(([tone,mark])=><span key={tone} className={tone==='female'?s.costumeGenderFemale:s.costumeGenderMale}><svg viewBox="0 0 24 24" aria-hidden="true">{tone==='female'?<path d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 0v7m-3-3h6"/>:<path d="M10 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5-8.5L19 5m-5 0h5v5"/>}</svg><span className={s.costumeGenderText}>{mark}</span></span>)}</span>;
}
