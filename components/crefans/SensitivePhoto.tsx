'use client';
import {createContext,useContext,useState,type ReactNode} from 'react';
import s from './social.module.css';

export const SensitiveRoomConsent=createContext(false);

export function SensitivePhoto({url,children}:{url:string;children:ReactNode}){
 const [revealed,setRevealed]=useState('');
 const roomAccepted=useContext(SensitiveRoomConsent);
 if(roomAccepted||revealed===url)return <>{children}</>;
 return <div className={s.sensitiveCover}>
  <img src={url} alt="" aria-hidden="true" draggable={false}/>
  <div className={s.sensitiveNotice}>
   <p>AI가 민감할 수 있는 사진을 분류했어요.</p>
   <button type="button" onClick={event=>{event.stopPropagation();setRevealed(url);}}>사진 보기</button>
  </div>
 </div>;
}
