import Link from 'next/link';
import type {ServiceEvent} from '@/types/crefans-events';
import {BackButton} from './BackButton';
import {Brand} from './Brand';
import {CommonNavigation} from './CommonPages';
import {Empty,PageTitle} from './ServiceUI';
import s from './events.module.css';

export function EventsPage({events,basePath}:{events:readonly ServiceEvent[];basePath:string}){
 return <section className={s.page}>
  <PageTitle>이벤트 안내</PageTitle>
  {events.length?<div className={s.list}>{events.map(event=><Link className={s.card} href={`${basePath}/events/${event.id}`} key={event.id} aria-label={event.title}>
   {event.banner?<div className={s.banner} data-theme={event.theme}><img src={event.image} alt="" width={event.imageWidth} height={event.imageHeight}/><div className={s.bannerCopy}><span>{event.campaignTitle}</span><h2>{event.banner.title}</h2><p>{event.banner.description}</p></div></div>:<img src={event.image} alt={event.title} width={event.imageWidth} height={event.imageHeight}/> }
  </Link>)}</div>:<Empty title="등록된 이벤트가 없습니다"/>}
  <CommonNavigation basePath={basePath}/>
 </section>;
}

export function EventDetailPage({event,basePath}:{event:ServiceEvent|undefined;basePath:string}){
 const back=<BackButton href={`${basePath}/events`} label="이벤트 목록으로"/>;
 if(!event)return <section className={s.page}>{back}<Empty title="이벤트를 찾을 수 없습니다"/></section>;
 return <article className={s.page}>
  <PageTitle back={back}>{event.title}</PageTitle>
  <section className={s.campaign} aria-label="이벤트 참여 혜택">
   <div className={s.campaignBody}>
    <header className={s.campaignHeader}>
     <Brand href={`${basePath}/feed`} className={s.campaignBrand}/>
     <h2>{event.campaignTitle}</h2><p>{event.campaignSubtitle}</p>
    </header>
    <ul className={s.rewardList}>{event.rewards.map(reward=><li className={s.reward} data-theme={event.theme} key={reward.audience}>
     <img className={s.rewardImage} src={reward.image} alt="" width={512} height={512} loading="lazy" decoding="async"/>
     <div className={s.rewardCopy}><h3 className={s.rewardTitle}>{reward.title}</h3><ul className={s.rewardDetails}>{reward.details.map(detail=><li key={detail}><span aria-hidden="true">* </span>{detail}</li>)}</ul></div>
     {reward.notice&&<p className={s.rewardNotice}><span aria-hidden="true">* </span>{reward.notice}</p>}
    </li>)}</ul>
    <p className={s.campaignSchedule}><span aria-hidden="true">* </span>{event.schedule}</p>
   </div>
  </section>
  <section className={s.notes} aria-labelledby="event-notes"><h2 id="event-notes">꼭 확인해 주세요</h2>{event.notes.map(note=><section className={s.noteGroup} key={note.title}><h3>{note.title}</h3><ul>{note.items.map(item=><li key={item}>{item}</li>)}</ul></section>)}</section>
  <CommonNavigation basePath={basePath}/>
 </article>;
}
