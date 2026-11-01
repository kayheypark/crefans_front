'use client';
import {useEffect,useState,type RefObject} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import Icon from './Icon';
import s from './pull-to-refresh.module.css';

const threshold=96;
const editable='input,textarea,select,[contenteditable]:not([contenteditable="false"])';

/** Refresh read/list routes; payment, withdrawal and authentication flows retain their state. */
export function isPullRefreshPage(routeKey:string){
  const [screen,detail]=routeKey.split('/');
  if(screen==='beans')return !detail||['charges','history','tips','referral','referral-history'].includes(detail);
  return ['feed','explore','me','creator','member','post','messages','notifications','subscriptions','settings','support','following','followers','payment-methods','notices','events','legal','guide','screens'].includes(screen);
}

/** The mobile shell scrolls internally, so browser-level pull-to-refresh cannot reach it. */
export function PullToRefresh({scrollRef,enabled,routeKey}:{scrollRef:RefObject<HTMLDivElement|null>;enabled:boolean;routeKey:string}){
  const [pull,setPull]=useState({distance:0,top:0,refreshing:false});
  useEffect(()=>{
    const scroll=scrollRef.current;
    if(!enabled||!scroll)return;
    let start:{x:number;y:number;id:number}|null=null,distance=0,refreshing=false;
    const reset=()=>{start=null;distance=0;if(!refreshing)setPull({distance:0,top:0,refreshing:false});};
    const blocked=()=>!window.matchMedia('(max-width:767px) and (pointer:coarse)').matches||scroll.scrollTop>0||
      (window.visualViewport?.scale??1)!==1||!!document.querySelector('dialog[open],[aria-modal="true"]')||
      !!scroll.querySelector('[data-pull-refresh-block="true"]')||
      Array.from(scroll.querySelectorAll('[data-pull-refresh-scroll]')).some(node=>node.scrollTop>0)||
      !!document.activeElement?.matches(editable)||
      Array.from(document.querySelectorAll<HTMLInputElement>('[data-comment-dock] input')).some(input=>input.value.trim());
    function begin(event:TouchEvent){
      reset();
      if(refreshing||event.touches.length!==1||blocked()||!(event.target instanceof Element)||event.target.closest(editable))return;
      // Only an explicitly opted-in vertical list (inbox) shares its top boundary.
      for(let node=event.target;node&&node!==scroll;node=node.parentElement!){
        const style=getComputedStyle(node);
        if((/(auto|scroll)/.test(style.overflowY)&&node.scrollHeight>node.clientHeight&&!node.hasAttribute('data-pull-refresh-scroll'))||
          (/(auto|scroll)/.test(style.overflowX)&&node.scrollWidth>node.clientWidth))return;
      }
      const touch=event.touches[0];start={x:touch.clientX,y:touch.clientY,id:touch.identifier};
    }
    function move(event:TouchEvent){
      if(!start||refreshing)return;
      if(event.touches.length!==1||event.defaultPrevented||blocked()){reset();return;}
      const touch=event.touches[0];
      if(touch.identifier!==start.id){reset();return;}
      const dx=Math.abs(touch.clientX-start.x),dy=touch.clientY-start.y;
      if(dy<0||dx>Math.max(10,dy)){reset();return;}
      if(dy<8){distance=0;setPull({distance:0,top:0,refreshing:false});return;}
      if(!event.cancelable){reset();return;}
      event.preventDefault();distance=Math.min(dy,160);
      setPull({distance,top:Math.max(0,scroll!.getBoundingClientRect().top)+12,refreshing:false});
    }
    function end(event:TouchEvent){
      if(!start||refreshing)return;
      const ready=event.touches.length===0&&distance>=threshold&&!blocked();
      if(distance>0&&event.cancelable)event.preventDefault();
      if(!ready){reset();return;}
      refreshing=true;start=null;
      setPull(current=>({...current,refreshing:true}));
      // Reload the current route so both the page and its live API state are fetched again.
      window.location.reload();
    }
    scroll.addEventListener('touchstart',begin,{passive:true});
    scroll.addEventListener('touchmove',move,{passive:false});
    scroll.addEventListener('touchend',end,{passive:false});
    scroll.addEventListener('touchcancel',reset,{passive:true});
    const restore=()=>{refreshing=false;reset();};
    window.addEventListener('pageshow',restore);
    return()=>{
      scroll.removeEventListener('touchstart',begin);scroll.removeEventListener('touchmove',move);
      scroll.removeEventListener('touchend',end);scroll.removeEventListener('touchcancel',reset);
      window.removeEventListener('pageshow',restore);reset();
    };
  },[enabled,routeKey,scrollRef]);
  if(!enabled||pull.distance===0)return null;
  const ready=pull.distance>=threshold;
  return <div className={s.indicator} style={{top:pull.top,transform:`translate(-50%,${Math.min(pull.distance*.25,32)}px)`}} data-ready={ready||undefined}>
    {pull.refreshing?<LoadingSpinner inline/>:<><Icon name={ready?'arrowUp':'arrow'} width={22} height={22} style={{transform:ready?'none':'rotate(90deg)'}}/><span role="status" aria-live="polite">{ready?'놓으면 새로고침':'당겨서 새로고침'}</span></>}
  </div>;
}
