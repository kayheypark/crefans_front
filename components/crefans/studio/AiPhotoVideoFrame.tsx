'use client';

import {useEffect,useRef,useState} from 'react';
import {fitWithin} from '@/lib/design/image-optimize';
import {LibraryVideoStatus} from './LibraryVideoStatus';
import {Action} from '../ServiceUI';
import s from './photo-library.module.css';

const timeLabel=(seconds:number)=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
const loadError='이 기기에서 동영상을 열 수 없어요. 다른 파일을 선택해 주세요.';
type FrameRequest={position:number;timer?:number;callback?:number};

export function AiPhotoVideoFrame({src,name,onSelect}:{src:string;name:string;onSelect:(frame:File)=>void}){
 const player=useRef<HTMLVideoElement>(null),preview=useRef<HTMLCanvasElement>(null),request=useRef<FrameRequest|null>(null);
 const [duration,setDuration]=useState(0),[position,setPosition]=useState(0);
 const [ready,setReady]=useState(false),[hasFrame,setHasFrame]=useState(false),[capturing,setCapturing]=useState(false);
 const [retry,setRetry]=useState(false),[error,setError]=useState('');
 const lastPosition=Math.max(0,duration-0.05);

 function stop(video:HTMLVideoElement){
  const current=request.current;
  request.current=null;
  window.clearTimeout(current?.timer);
  if(current?.callback!==undefined)video.cancelVideoFrameCallback(current.callback);
  video.pause();
 }

 function draw(video:HTMLVideoElement,mediaTime:number){
  const current=request.current,canvas=preview.current;
  if(!current||!canvas||video.seeking||mediaTime<current.position-0.01||video.readyState<2||!video.videoWidth||!video.videoHeight)return false;
  try{
   const {width,height}=fitWithin(video.videoWidth,video.videoHeight);
   canvas.width=width;
   canvas.height=height;
   const context=canvas.getContext('2d');
   if(!context)throw new Error('No canvas context');
   context.drawImage(video,0,0,width,height);
   setHasFrame(true);
   setReady(true);
  }catch{
   setError('장면을 표시하지 못했어요. 다시 시도해 주세요.');
   setRetry(true);
  }
  stop(video);
  return true;
 }

 function showFrame(video:HTMLVideoElement,next:number){
  stop(video);
  setReady(false);
  setRetry(false);
  setError('');
  const current:FrameRequest={position:next};
  request.current=current;
  const needsTap=()=>{
   if(request.current!==current)return;
   stop(video);
   setRetry(true);
  };
  current.timer=window.setTimeout(needsTap,8000);
  try{
   if(Math.abs(video.currentTime-next)>=0.01)video.currentTime=next;
   if(typeof video.requestVideoFrameCallback==='function'){
    const onFrame:VideoFrameRequestCallback=(_,frame)=>{
     if(request.current!==current)return;
     if(!draw(video,frame.mediaTime))current.callback=video.requestVideoFrameCallback(onFrame);
    };
    current.callback=video.requestVideoFrameCallback(onFrame);
   }
   // WebKit may have metadata and a seek position without presenting a frame until muted playback starts.
   video.muted=true;
   void video.play().catch(needsTap);
  }catch{
   needsTap();
  }
 }

 useEffect(()=>{
  const video=player.current;
  if(!video)return;
  showFrame(video,0);
  return()=>stop(video);
 // A new file remounts this picker and starts a fresh decoder.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[src]);

 async function capture(){
  const canvas=preview.current;
  if(!canvas||!ready||capturing)return;
  setCapturing(true);setError('');
  try{
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));
   if(!blob)throw new Error('No frame image');
   if(preview.current!==canvas)return;
   onSelect(new File([blob],`${name.replace(/\.[^.]+$/,'')||'video'}-thumbnail.jpg`,{type:'image/jpeg'}));
  }catch{
   setError('장면을 가져오지 못했어요. 다른 위치에서 다시 선택해 주세요.');
  }finally{setCapturing(false);}
 }

 return <section className={s.videoFrame} aria-label="썸네일 선택">
  <strong>썸네일 선택</strong>
  <div className={s.framePreview}>
   <video ref={player} className={s.preview} src={src} muted playsInline preload="auto" aria-hidden="true"
    onLoadedMetadata={event=>{
     const video=event.currentTarget;
     if(Number.isFinite(video.duration)&&video.duration>0&&video.videoWidth)setDuration(video.duration);
     else{stop(video);setError(loadError);}
    }}
    onSeeked={event=>draw(event.currentTarget,event.currentTarget.currentTime)}
    onTimeUpdate={event=>{
     const video=event.currentTarget,current=request.current;
     if(current&&!video.paused&&video.currentTime>=current.position+0.1)draw(video,video.currentTime);
    }}
    onEnded={event=>draw(event.currentTarget,event.currentTarget.currentTime)}
    onError={event=>{stop(event.currentTarget);setReady(false);setRetry(false);setError(loadError);}}/>
   <canvas ref={preview} className={s.frameStill} hidden={!hasFrame} role="img" aria-label="동영상 장면 미리보기"/>
   {(!ready||capturing)&&!retry&&!error&&<LibraryVideoStatus label={capturing?'사진 추출 중':hasFrame?'장면 불러오는 중':'동영상 준비 중'}/>}
  </div>
  {retry&&<Action type="button" variant="secondary" onClick={()=>{if(player.current)showFrame(player.current,position);}}>미리보기 시작</Action>}
  <label className={s.videoTimeline}>장면 위치
   <input type="range" min={0} max={lastPosition} step="0.01" value={position} aria-valuetext={timeLabel(position)} disabled={!duration||capturing} onChange={event=>{
    const next=event.currentTarget.valueAsNumber;
    setPosition(next);
    if(player.current)showFrame(player.current,next);
   }}/>
   <span aria-hidden="true">{timeLabel(position)} / {timeLabel(duration)}</span>
  </label>
  {error&&<p className={s.note} role="alert">{error}</p>}
  <Action type="button" variant="secondary" disabled={!ready||!duration||capturing} onClick={()=>void capture()}>이 장면으로 활용할래요</Action>
 </section>;
}
