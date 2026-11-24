import {useEffect,useRef,useState} from 'react';
import s from './social.module.css';

export function CoupangFeedBanner(){
  const container=useRef<HTMLElement>(null);
  const [width,setWidth]=useState(0);
  useEffect(()=>{
    const element=container.current;
    if(!element)return;
    const observer=new ResizeObserver(([entry])=>setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);
  return <aside ref={container} aria-label="쿠팡 파트너스 광고" className={s.coupangBanner}>
    <small>광고 · 쿠팡 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.</small>
    {width>0&&<iframe title="쿠팡 파트너스 추천 상품" loading="lazy" width={width} height={140}
      src={`https://ads-partners.coupang.com/widgets.html?id=1058796&template=carousel&trackingCode=AF7950736&subId=&width=${width}&height=140&tsource=`}
      referrerPolicy="strict-origin-when-cross-origin"/>}
  </aside>;
}
