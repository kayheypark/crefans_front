'use client';

import {useRef,useState,type VideoHTMLAttributes} from 'react';

/**
 * Retry transient delivery failures through the authenticated API, preserving playback.
 * `firstFrame`: iOS Safari does not paint a paused video's first frame, so previews ask for t=0.001 (a fragment, after any retry query).
 */
export function MediaVideo({src,firstFrame=false,onError,onLoadedMetadata,onPlay,onPause,...props}:VideoHTMLAttributes<HTMLVideoElement>&{firstFrame?:boolean}){
 const [retry,setRetry]=useState(0),state=useRef({src,retries:[] as number[],position:0,playing:false});
 if(state.current.src!==src)state.current={src,retries:[],position:0,playing:false};
 const managed=typeof src==='string'&&/^\/api\/v1\/media\/[^/?]+\/file(?:\?|$)/.test(src);
 const source=managed&&retry?`${src}${src.includes('?')?'&':'?'}media_retry=${retry}`:src;
 return <video {...props} src={firstFrame&&typeof source==='string'&&!source.includes('#')?`${source}#t=0.001`:source}
  onPlay={event=>{state.current.playing=true;onPlay?.(event);}}
  onPause={event=>{if(!event.currentTarget.error)state.current.playing=false;onPause?.(event);}}
  onError={event=>{
   onError?.(event);if(!managed)return;
   const now=Date.now(),previous=state.current;previous.retries=previous.retries.filter(at=>now-at<60000);
   if(previous.retries.length>=2)return;
   previous.retries.push(now);previous.position=event.currentTarget.currentTime||previous.position;
   setRetry(value=>value+1);
  }}
  onLoadedMetadata={event=>{
   const video=event.currentTarget,previous=state.current;
   if(previous.position>0&&Number.isFinite(video.duration))video.currentTime=Math.min(previous.position,Math.max(0,video.duration-0.05));
   if(previous.playing)void video.play().catch(()=>{});
   onLoadedMetadata?.(event);
  }}/>
}
