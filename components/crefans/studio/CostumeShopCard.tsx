import Image from 'next/image';
import {useId} from 'react';
import {COSTUME_SHOP_NOTICE} from '@/lib/crefans/costume-shop-links';
import s from './ai-photo.module.css';

type Props={
 shopLink:{name:string;image:string;url:string;affiliate:boolean};
 bubble?:string;
 onClick?:()=>void;
};

export function CostumeShopCard({shopLink,bubble,onClick}:Props){
 const noticeId=useId();
 return <div className={s.shopLink}>
      {bubble&&<div className={s.shopRewardBubble}><span className={s.resultShareBubble}>{bubble}</span></div>}
      <div className={s.shopCard} data-testid="costume-shop-card">
       <span className={s.shopThumb}>
        <Image className={s.shopThumbImage} src={shopLink.image} width={56} height={56} alt=""/>
        <span className={s.shopThumbBadge} data-testid="costume-shop-badge"><Image src="/brand/coupang-app-icon-v1.jpg" width={25} height={25} alt="" unoptimized/></span>
       </span>
       <div className={s.shopLinkCopy}><span className={s.shopLinkTag}>{shopLink.affiliate?'제휴 링크':'의상 검색'}</span><strong>{shopLink.name}</strong></div>
       <a className={s.shopLinkAction} href={shopLink.url} target="_blank" rel={shopLink.affiliate?'sponsored noopener noreferrer':'noopener noreferrer'} data-testid="costume-shop-link" onClick={onClick} aria-label={`${shopLink.name} 쿠팡에서 ${shopLink.affiliate?'보기':'검색'}`} aria-describedby={shopLink.affiliate?noticeId:undefined}>
        쿠팡에서 {shopLink.affiliate?'보기':'검색'}<svg aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h7v7m0-7-9 9m7 0v7H4V6h7"/></svg>
       </a>
      </div>
      {shopLink.affiliate&&<p id={noticeId} className={s.shopLinkNotice}>{COSTUME_SHOP_NOTICE}</p>}
     </div>;
}
