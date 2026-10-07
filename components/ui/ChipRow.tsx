'use client';
import {useRef,type MouseEvent,type PointerEvent,type ReactNode} from 'react';
import s from './chip-row.module.css';

const dragThreshold=6;
/** Keeps chips on one line: overflow scrolls sideways (touch natively, mouse by dragging). A drag never counts as a click. */
export function ChipRow({label,children,className=''}:{label:string;children:ReactNode;className?:string}){
  const ref=useRef<HTMLDivElement>(null),drag=useRef<{x:number;left:number;moved:boolean}|null>(null);
  function down(event:PointerEvent<HTMLDivElement>){if(event.pointerType!=='mouse'||event.button!==0||!ref.current)return;drag.current={x:event.clientX,left:ref.current.scrollLeft,moved:false};}
  function move(event:PointerEvent<HTMLDivElement>){const state=drag.current;if(!state||!ref.current)return;const delta=event.clientX-state.x;if(!state.moved&&Math.abs(delta)<dragThreshold)return;state.moved=true;ref.current.scrollLeft=state.left-delta;}
  function up(){const state=drag.current;drag.current=null;if(state?.moved)setTimeout(()=>{suppress.current=false;},0);suppress.current=!!state?.moved;}
  const suppress=useRef(false);
  function click(event:MouseEvent<HTMLDivElement>){if(suppress.current){event.preventDefault();event.stopPropagation();}}
  return <div ref={ref} className={`${s.row} ${className}`.trim()} role="group" aria-label={label} data-dragging={drag.current?.moved||undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} onClickCapture={click}>{children}</div>;
}
