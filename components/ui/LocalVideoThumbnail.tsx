'use client';

import {useEffect,useRef,useState} from 'react';
import s from './media-upload.module.css';

/** Use a still image for a chosen file, since a paused video may not paint its frame on iOS. */
export function LocalVideoThumbnail({src,label}:{src:string;label:string}){
 const player=useRef<HTMLVideoElement>(null);
 const [poster,setPoster]=useState<string|null>(null),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  const video=player.current;
  if(!video)return;
  // On WebKit, a frame reported as loaded can still paint blank until muted playback starts.
  video.muted=true;
  void video.play().catch(()=>{});
  const timeout=setTimeout(()=>setUnavailable(true),8000);
  return()=>{clearTimeout(timeout);video.pause();};
 },[poster,unavailable]);
 function capture(video:HTMLVideoElement){
  if(video.seeking||video.readyState<2||!video.videoWidth||!video.videoHeight)return;
  const scale=Math.min(1,240/Math.max(video.videoWidth,video.videoHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
  canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
  try{
   const context=canvas.getContext('2d');
   if(!context){setUnavailable(true);return;}
   context.drawImage(video,0,0,canvas.width,canvas.height);
   setPoster(canvas.toDataURL('image/jpeg',0.86));
  }catch{setUnavailable(true);}
 }
 // eslint-disable-next-line @next/next/no-img-element -- frame encoded from the user's local file
 if(poster)return <img className={s.media} src={poster} alt={label} draggable={false}/>;
 if(unavailable)return <span className={s.pending}>미리보기를 표시할 수 없어요</span>;
 return <>
  <video ref={player} className={s.thumbnailDecoder} src={src} muted playsInline preload="auto" aria-hidden="true"
   onTimeUpdate={event=>{
    const video=event.currentTarget;
    const position=Number.isFinite(video.duration)?Math.min(0.15,video.duration/2):0.15;
    if(video.currentTime>=position&&!video.paused)capture(video);
   }}
   onEnded={event=>capture(event.currentTarget)}
   onError={()=>setUnavailable(true)}/>
  <span className={s.pending}>미리보기 준비 중</span>
 </>;
}
