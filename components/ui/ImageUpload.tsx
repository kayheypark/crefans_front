'use client';
import {useId,useRef,useState,type DragEvent} from 'react';
import {Button} from './Primitives';
import {OptionalImage} from './OptionalImage';
import s from './image-upload.module.css';

export function ImageUpload({label,image,onFileSelect,onRemove,accept,disabled=false,uploading=false,error,hint}:{label:string;image?:string;onFileSelect:(file:File)=>void|Promise<void>;onRemove:()=>void;accept:string;disabled?:boolean;uploading?:boolean;error?:string;hint?:string}){
  const id=useId(),input=useRef<HTMLInputElement>(null),[dragging,setDragging]=useState(false);
  const blocked=disabled||uploading;
  function select(file?:File|null){if(file&&!blocked)void onFileSelect(file);}
  function drop(event:DragEvent<HTMLElement>){event.preventDefault();setDragging(false);select(event.dataTransfer.files?.[0]);}
  return <div className={s.root} role="group" aria-labelledby={`${id}-label`}><span className={s.label} id={`${id}-label`}>{label}</span>
    <input ref={input} className={s.file} id={id} type="file" accept={accept} aria-label={label} disabled={blocked} onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';select(file);}}/>
    {image?<div className={s.preview}><OptionalImage src={image} alt={`${label} 선택한 이미지`} fallback={<p>이미지를 불러오지 못했어요. 다른 파일로 변경하거나 삭제해주세요.</p>}/><div className={s.actions}><Button type="button" tone="secondary" disabled={blocked} onClick={()=>input.current?.click()}>{uploading?'이미지 확인 중…':'이미지 변경'}</Button><Button type="button" tone="quiet" disabled={blocked} onClick={onRemove}>이미지 삭제</Button></div></div>
    :<button type="button" className={s.dropzone} data-dragging={dragging||undefined} disabled={blocked} aria-describedby={hint?`${id}-hint`:undefined} onClick={()=>input.current?.click()} onDragOver={event=>{event.preventDefault();if(!blocked)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={drop}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-8 8"/></svg>
      <strong>{uploading?'이미지 확인 중…':'이미지를 끌어다 놓거나 클릭해서 선택'}</strong>
      {hint&&<small id={`${id}-hint`}>{hint}</small>}
    </button>}
    {image&&hint&&<small className={s.hint}>{hint}</small>}{error&&<p className={s.error} role="alert">{error}</p>}</div>;
}
