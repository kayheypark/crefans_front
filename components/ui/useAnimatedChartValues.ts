'use client';
import {useEffect,useRef,useState} from 'react';
import {designTokens} from '@/lib/design/tokens';

type ChartValue={id:string;value:number};
export function useAnimatedChartValues<T extends Element>(items:ChartValue[]){
 const ref=useRef<T>(null),current=useRef<Record<string,number>>({}),target=useRef(items);
 const [values,setValues]=useState<Record<string,number>>({}),[entered,setEntered]=useState(false),[reduced,setReduced]=useState(false);
 const signature=JSON.stringify(items),hasItems=items.length>0;
 target.current=items;
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)'),update=()=>setReduced(media.matches);
  update();media.addEventListener('change',update);
  return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const node=ref.current;if(!node||!hasItems||entered)return;
  if(!('IntersectionObserver' in window)){setEntered(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setEntered(true);observer.disconnect();}},{threshold:0.15});
  observer.observe(node);return()=>observer.disconnect();
 },[hasItems,entered]);
 useEffect(()=>{
  const destination=Object.fromEntries(target.current.map(item=>[item.id,item.value]));
  if(reduced||!hasItems){current.current=destination;setValues(destination);return;}
  if(!entered)return;
  const from=current.current;
  if(Object.keys(from).length===target.current.length&&target.current.every(item=>from[item.id]===item.value))return;
  let frame=0,start:number|undefined;
  const tick=(time:number)=>{
   start??=time;
   const progress=Math.min(1,(time-start)/designTokens.motion.chart),eased=1-(1-progress)**3;
   const next=Object.fromEntries(Object.entries(destination).map(([id,value])=>[id,(from[id]??0)+(value-(from[id]??0))*eased]));
   current.current=next;setValues(next);
   if(progress<1)frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[signature,entered,reduced,hasItems]);
 return {ref,values,entered:entered||reduced};
}
