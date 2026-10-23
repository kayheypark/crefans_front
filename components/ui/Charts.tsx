'use client';
import {useAnimatedChartValues} from './useAnimatedChartValues';
import s from './charts.module.css';

export function Trend({points,label,className=''}:{points:number[];label:string;className?:string}){
 const min=Math.min(...points),range=Math.max(...points)-min||1;
 const targets=points.map((value,index)=>({id:String(index),value:(value-min)*40/range}));
 const {ref,values,entered}=useAnimatedChartValues<SVGSVGElement>(targets);
 if(!points.length)return null;
 const line=points.map((_,index)=>`${8+index*284/Math.max(1,points.length-1)},${54-(values[index]??0)}`).join(' ');
 return <svg ref={ref} viewBox="0 0 300 62" role="img" aria-label={label} className={`${s.trend} ${className}`} data-entered={entered}><polyline points={line} pathLength="1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export type BarChartItem={id:string;label:string;value:number;valueLabel?:string};
export function BarChart({items,label}:{items:BarChartItem[];label:string}){
 const max=Math.max(...items.map(item=>item.value),1);
 const {ref,values}=useAnimatedChartValues<HTMLDivElement>(items.map(item=>({id:item.id,value:Math.max(0,item.value)/max*100})));
 if(!items.length)return null;
 return <div ref={ref} className={s.bars} role="img" aria-label={`${label}. ${items.map(item=>`${item.label}: ${item.valueLabel??item.value.toLocaleString()}`).join(', ')}`}>
  {items.map(item=><div key={item.id}><strong>{item.valueLabel??item.value.toLocaleString()}</strong><div className={s.barTrack}><span style={{height:`${values[item.id]??0}%`}}/></div><small>{item.label}</small></div>)}
 </div>;
}
