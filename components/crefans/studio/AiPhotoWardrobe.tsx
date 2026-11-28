'use client';
import {useState} from 'react';
import Image from 'next/image';
import {aiPhotoCostumeGender,type AiPhotoCostume} from '@/lib/crefans/ai-photo-costumes';
import {useLowSuccessCostumeIds} from '@/features/service/useLowSuccessCostumeIds';
import {aiPhotoPresetText} from '@/lib/crefans/ai-photo';
import {AI_PHOTO_PRESET_PAGE_SIZE} from '@/lib/crefans/ai-photo-presets';
import s from './ai-photo.module.css';
import {AiPresetPager} from './AiPresetPager';

export function AiPhotoWardrobe({items,selectedPrompts,disabled,onPick}:{items:readonly AiPhotoCostume[];selectedPrompts:readonly string[];disabled:boolean;onPick:(prompt:string)=>void}){
 // 2026-11-19 user request: open on the page that holds the selected costume.
 const [page,setPage]=useState(()=>Math.max(0,Math.floor(items.findIndex(item=>selectedPrompts.includes(aiPhotoPresetText(item.prompt)))/AI_PHOTO_PRESET_PAGE_SIZE))),pages=Math.max(1,Math.ceil(items.length/AI_PHOTO_PRESET_PAGE_SIZE)),pageIndex=page%pages,visible=items.slice(pageIndex*AI_PHOTO_PRESET_PAGE_SIZE,(pageIndex+1)*AI_PHOTO_PRESET_PAGE_SIZE);
 function step(direction:number){if(!disabled)setPage(previous=>(previous+direction+pages)%pages);}
 const isSelected=(value:string)=>selectedPrompts.includes(aiPhotoPresetText(value));
 const lowSuccessIds=useLowSuccessCostumeIds(),lowSuccess=(costume:AiPhotoCostume)=>lowSuccessIds.includes(costume.id);
 if(!items.length)return <p className={s.presetEmpty} role="status">검색 결과가 없어요. 다른 검색어를 입력해 주세요.</p>;
 return <div className={s.wardrobeLayout}>
  <div className={s.presetNavigation}><button type="button" aria-label="이전 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(-1)}>‹</button><span aria-live="polite">{pageIndex+1} / {pages}</span><button type="button" aria-label="다음 의상 페이지" disabled={disabled||pages<=1} onClick={()=>step(1)}>›</button></div>
  <AiPresetPager disabled={disabled||pages<=1} onStep={step}><div className={s.costumeGrid} aria-label="코스프레 의상">{visible.map(costume=><button type="button" key={costume.id} className={s.costumeCard} aria-label={costume.name} aria-description={costume.isNew?'최근 추가된 프리셋':undefined} aria-describedby={lowSuccess(costume)?`costume-low-success-${costume.id}`:undefined} aria-pressed={isSelected(costume.prompt)} disabled={disabled} onClick={()=>onPick(costume.prompt)}><span className={s.costumeImage}><Image src={costume.image} alt="" width={240} height={240} sizes="(max-width:767px) 28vw, 180px"/><CostumeGender gender={aiPhotoCostumeGender(costume)}/>{costume.isNew&&<b className={s.presetNewBadge}>NEW</b>}{lowSuccess(costume)&&<span id={`costume-low-success-${costume.id}`} className={s.costumeLowSuccess}>성공률 낮음</span>}{costume.id==='4a0c8f'&&!isSelected(costume.prompt)&&<span className={s.costumePopular}>가장 인기 있어요</span>}{isSelected(costume.prompt)&&<span className={s.costumeSelected} aria-hidden="true">✓</span>}</span><strong className={s.presetCaption}>{costume.name}</strong></button>)}</div></AiPresetPager>
 </div>;
}

const genderMarks={female:[['female','♀']],male:[['male','♂']],both:[['female','♀'],['male','♂']]} as const;
const genderTitles={female:'원작 여성',male:'원작 남성',both:'원작 성별 무관·미표기'} as const;
// 코스튬(원작 성별)과 메이크업(카드 성별)이 같이 쓰는 ♀/♂ 배지. title은 쓰는 곳에서 바꿀 수 있다.
export function CostumeGender({gender,title}:{gender:keyof typeof genderMarks|undefined;title?:string}){
 if(!gender)return null;
 return <span className={s.costumeGender} title={title??genderTitles[gender]} data-gender={gender}>{genderMarks[gender].map(([tone,mark])=><span key={tone} className={tone==='female'?s.costumeGenderFemale:s.costumeGenderMale}><svg viewBox="0 0 24 24" aria-hidden="true">{tone==='female'?<path d="M12 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 0v7m-3-3h6"/>:<path d="M10 19a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5-8.5L19 5m-5 0h5v5"/>}</svg><span className={s.costumeGenderText}>{mark}</span></span>)}</span>;
}
