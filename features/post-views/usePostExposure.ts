'use client';
import {useEffect,useRef} from 'react';
import {platformRequest} from '@/lib/api/platform';
import {postVisitor,viewSource,visibleFraction} from '@/lib/browser/post-views';

/** Count visible content, never fetches, prefetches, background tabs or hidden modal backgrounds. */
export function usePostExposure(id:string,enabled:boolean,kind:'feed'|'detail',internal=false){
 const ref=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const root=ref.current;if(!enabled||!id||!root)return;
  let since=0,videoSince=0,posting=false,videoPosting=false,stopped=false,next=0,videoNext=0;
  const source=kind==='feed'||internal?'internal':viewSource(window.location.href,document.referrer);
  const visible=(node:HTMLElement)=>{
   if(document.visibilityState!=='visible'||root.closest('[aria-hidden="true"], [inert]'))return false;
   const rect=node.getBoundingClientRect();if(visibleFraction(rect,innerWidth,innerHeight)<.5)return false;
   const x=(Math.max(0,rect.left)+Math.min(innerWidth,rect.right))/2,y=(Math.max(0,rect.top)+Math.min(innerHeight,rect.bottom))/2;
   const top=document.elementFromPoint(x,y);if(top?.closest('[role=dialog]')!==root.closest('[role=dialog]'))return false;return !!top&&(node===top||node.contains(top));
  };
  async function record(event:'feed'|'detail'|'video'){
   const visitor=postVisitor();if(!visitor)return;
   if(event==='video')videoPosting=true;else posting=true;
   const result=await platformRequest<{recorded:boolean;views?:number}>(`/posts/${encodeURIComponent(id)}/views`,{kind:event,source,visitor});
   if(stopped)return;
   const wait=result.success?30*60*1000:30000;
   if(event==='video'){videoPosting=false;videoNext=Date.now()+wait;}else{posting=false;next=Date.now()+wait;}
   if(result.success&&result.data.views!==undefined)window.dispatchEvent(new CustomEvent('crefans:post-views',{detail:{id,views:result.data.views}}));
  }
  const tick=()=>{
   const now=Date.now();if(!visible(root)){since=0;videoSince=0;return;}
   since=since||now;if(!posting&&now>=next&&now-since>=1000)void record(kind);
   const playing=Array.from(root.querySelectorAll('video')).find(v=>!v.paused&&!v.ended&&v.readyState>=2&&visible(v));
   if(playing){videoSince=videoSince||now;if(!videoPosting&&now>=videoNext&&now-videoSince>=1000)void record('video');}else videoSince=0;
  };
  const hidden=()=>{since=0;videoSince=0;};document.addEventListener('visibilitychange',hidden);
  const timer=setInterval(tick,250);return()=>{stopped=true;clearInterval(timer);document.removeEventListener('visibilitychange',hidden);};
 },[id,enabled,kind,internal]);
 return ref;
}
