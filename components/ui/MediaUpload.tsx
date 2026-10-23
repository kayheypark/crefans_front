'use client';
import {MediaVideo} from './MediaVideo';

import {useId,useLayoutEffect,useRef,useState,type CSSProperties,type DragEvent,type KeyboardEvent,type PointerEvent} from 'react';
import {indexAt,slotFor,type Box} from './media-order';
import {MediaTypeIcon} from './MediaTypeIcon';
import s from './media-upload.module.css';

export type MediaUploadItem={id:string;type:'image'|'video';url:string};
type Props={label:string;items:MediaUploadItem[];max:number;onFilesSelect:(files:File[])=>void|Promise<void>;onRemove:(id:string)=>void;onReorder?:(from:number,to:number)=>void;accept:string;disabled?:boolean;uploading?:boolean;error?:string;hint?:string};
type Drag={from:number;to:number;dx:number;dy:number;boxes:Box[]};
const DRAG_THRESHOLD=6;

export function MediaUpload({label,items,max,onFilesSelect,onRemove,onReorder,accept,disabled=false,uploading=false,error,hint}:Props){
  const id=useId(),input=useRef<HTMLInputElement>(null),list=useRef<HTMLUListElement>(null),[dragging,setDragging]=useState(false);
  const full=items.length>=max,blocked=disabled||uploading||full,canReorder=!!onReorder&&!disabled&&!uploading&&items.length>1;
  const [drag,setDrag]=useState<Drag|null>(null),[announce,setAnnounce]=useState('');
  const pointer=useRef<{pointerId:number;from:number;startX:number;startY:number;active:boolean;boxes:Box[]}|null>(null);
  const settle=useRef<{id:string;left:number;top:number}|null>(null);
  const tiles=()=>Array.from(list.current?.children||[]) as HTMLElement[];
  const measure=():Box[]=>tiles().map(tile=>{const rect=tile.getBoundingClientRect();return {left:rect.left,top:rect.top,width:rect.width,height:rect.height};});
  function finishDrag(commit:boolean){
    const state=pointer.current,current=drag;pointer.current=null;
    if(!state?.active||!current){setDrag(null);return;}
    if(commit&&current.to!==current.from&&onReorder){
      const box=current.boxes[current.from];
      settle.current={id:items[current.from].id,left:box.left+current.dx,top:box.top+current.dy};
      onReorder(current.from,current.to);
      setAnnounce(`${current.from+1}번째 항목을 ${current.to+1}번째로 옮겼어요.`);
    }
    setDrag(null);
  }
  function pointerDown(event:PointerEvent<HTMLLIElement>,index:number){
    if(!canReorder||event.button!==0||(event.target as HTMLElement).closest('button'))return;
    pointer.current={pointerId:event.pointerId,from:index,startX:event.clientX,startY:event.clientY,active:false,boxes:[]};
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function pointerMove(event:PointerEvent<HTMLLIElement>){
    const state=pointer.current;
    if(!state||state.pointerId!==event.pointerId)return;
    const dx=event.clientX-state.startX,dy=event.clientY-state.startY;
    if(!state.active){if(Math.hypot(dx,dy)<DRAG_THRESHOLD)return;state.active=true;state.boxes=measure();}
    event.preventDefault();
    const to=indexAt(state.boxes,event.clientX,event.clientY,drag?.to??state.from);
    setDrag({from:state.from,to,dx,dy,boxes:state.boxes});
  }
  function keyReorder(event:KeyboardEvent<HTMLLIElement>,index:number){
    if(!canReorder||!onReorder)return;
    const to=event.key==='ArrowLeft'||event.key==='ArrowUp'?index-1:event.key==='ArrowRight'||event.key==='ArrowDown'?index+1:null;
    if(to===null||to<0||to>=items.length)return;
    event.preventDefault();onReorder(index,to);setAnnounce(`${index+1}번째 항목을 ${to+1}번째로 옮겼어요.`);
    const focusTarget=()=>tiles()[to]?.focus();
    if(typeof requestAnimationFrame==='function')requestAnimationFrame(focusTarget);else focusTarget();
  }
  // FLIP: after the parent commits the new order, glide the dropped tile from where the pointer released it into its slot.
  useLayoutEffect(()=>{
    const target=settle.current;if(!target)return;settle.current=null;
    const tile=tiles().find(element=>element.dataset.mediaId===target.id);if(!tile)return;
    const rect=tile.getBoundingClientRect(),dx=target.left-rect.left,dy=target.top-rect.top;
    if(!dx&&!dy)return;
    tile.style.transition='none';tile.style.transform=`translate(${dx}px,${dy}px)`;
    void tile.offsetWidth;
    tile.style.transition='';tile.style.transform='';
  },[items]);
  const tileStyle=(index:number):CSSProperties|undefined=>{
    if(!drag)return undefined;
    if(index===drag.from)return {transform:`translate(${drag.dx}px,${drag.dy}px)`,transition:'none',zIndex:2};
    const slot=slotFor(index,drag.from,drag.to);
    if(slot===index)return undefined;
    const from=drag.boxes[index],to=drag.boxes[slot];
    return from&&to?{transform:`translate(${to.left-from.left}px,${to.top-from.top}px)`}:undefined;
  };
  function select(list?:FileList|null){const files=Array.from(list||[]);if(files.length&&!disabled&&!uploading)void onFilesSelect(files);}
  function drop(event:DragEvent<HTMLElement>){event.preventDefault();setDragging(false);if(!blocked)select(event.dataTransfer.files);}
  return <div className={s.root} role="group" aria-labelledby={`${id}-label`}>
    <div className={s.heading}><span className={s.label} id={`${id}-label`}>{label}</span><span className={s.count} aria-live="polite">{`${items.length}/${max}`}</span></div>
    <input ref={input} className={s.file} id={id} type="file" multiple accept={accept} aria-label={label} disabled={blocked} onChange={event=>{const list=event.currentTarget.files;select(list);event.currentTarget.value='';}}/>
    {items.length>0&&<ul ref={list} className={s.grid} aria-label={`${label} 목록`} data-reorderable={canReorder||undefined}>{items.map((item,index)=><li key={item.id} className={s.tile} data-media-id={item.id} data-dragging={drag?.from===index||undefined} style={tileStyle(index)} tabIndex={canReorder?0:undefined} aria-label={canReorder?`${index+1}번째 ${item.type==='video'?'동영상':'이미지'}, 끌거나 화살표 키로 순서 변경`:undefined} onPointerDown={event=>pointerDown(event,index)} onPointerMove={pointerMove} onPointerUp={()=>finishDrag(true)} onPointerCancel={()=>finishDrag(false)} onKeyDown={event=>keyReorder(event,index)}>
      {item.type==='video'?<MediaVideo className={s.media} src={item.url} muted playsInline preload="metadata" aria-label={`동영상 ${index+1}`}/>:<img className={s.media} src={item.url} alt={`이미지 ${index+1}`} draggable={false}/>}
      <span className={s.badge} aria-label={item.type==='video'?'동영상':'이미지'}><MediaTypeIcon type={item.type}/></span>
      <button type="button" className={s.remove} aria-label={`${index+1}번째 ${item.type==='video'?'동영상':'이미지'} 삭제`} disabled={disabled||uploading} onClick={()=>onRemove(item.id)}>×</button>
    </li>)}</ul>}
    <button type="button" className={s.dropzone} data-dragging={dragging||undefined} disabled={blocked} aria-describedby={hint?`${id}-hint`:undefined} onClick={()=>input.current?.click()} onDragOver={event=>{event.preventDefault();if(!blocked)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={drop}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      <span>{uploading?'미디어 확인 중…':full?`최대 ${max}개까지 추가할 수 있어요`:'이미지·동영상 추가'}</span>
    </button>
    {hint&&<small id={`${id}-hint`} className={s.hint}>{hint}</small>}
    {error&&<p className={s.error} role="alert">{error}</p>}
    <span className={s.srOnly} role="status" aria-live="polite">{announce}</span>
  </div>;
}
