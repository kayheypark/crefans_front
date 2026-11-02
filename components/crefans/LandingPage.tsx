'use client';
import {useState,type CSSProperties,type FormEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import type {ServiceViewModel} from '@/types/crefans';
import type {LandingContent} from '@/types/crefans-landing';
import {designVariables} from '@/lib/design/tokens';
import {InfoTooltip} from '@/components/ui/InfoTooltip';
import {MarqueeMotionControl} from '@/components/ui/MarqueeText';
import {Brand} from './Brand';
import {CreatorName} from './CreatorName';
import Icon from './Icon';
import s from './landing.module.css';

export default function LandingPage({model,content,creatorBasePath=model.basePath}:{model:ServiceViewModel;content:LandingContent;creatorBasePath?:string}){
  const router=useRouter(),[search,setSearch]=useState('');
  const {basePath}=model,{creators,steps,hero}=content;
  const findCreators=(event:FormEvent)=>{event.preventDefault();router.push(`${creatorBasePath}/explore?q=${encodeURIComponent(search.trim())}`);};
  return <div className={s.page} style={designVariables as CSSProperties}>
    <a className={s.skip} href="#main">본문으로 이동</a>
    <header className={s.header}><div className={s.headerInner}>
      <Brand href={`${basePath}/feed`} className={s.brand}/>
      <nav aria-label="주요 메뉴"><a href="#creators">크리에이터</a><a href="#membership">이용안내</a><Link href={`${basePath}/notices`}>공지사항</Link></nav>
      <form className={s.search} onSubmit={findCreators} role="search"><Icon name="search" width={16} height={16}/><input aria-label="크리에이터 검색" placeholder="크리에이터 검색" value={search} onChange={event=>setSearch(event.target.value)}/></form>
      <div className={s.account}><Link href={`${basePath}/login`}>로그인</Link><Link className={s.primary} href={`${basePath}/signup`}>회원가입</Link></div>
    </div></header>
    <main id="main" className={s.container}>
      {hero&&<section className={s.hero} aria-labelledby="hero-heading">
        <img className={s.heroMark} src="/icon.svg" width={40} height={40} alt="" aria-hidden="true"/>
        <h1 id="hero-heading">{hero.title.map((line,index)=><span key={index}>{line}</span>)}</h1>
        <p>{hero.description.join(' ')}</p>
        <div className={s.actions}><Link className={s.primary} href={`${basePath}/signup`}>지금 시작하기</Link><a className={s.textAction} href="#creators">크리에이터 둘러보기 <Icon name="arrow"/></a></div>
      </section>}
      {creators.length>0&&<section id="creators" className={s.creators} aria-labelledby="creators-heading">
        <div className={s.sectionHeading}><div className={s.titleLine}><h2 id="creators-heading">크리에이터 둘러보기</h2>{content.creatorDisclosure&&<InfoTooltip label="크리에이터 안내" content={content.creatorDisclosure}/>}</div><p>프로필을 눌러 미리 만나보세요.</p></div>
        <div className={s.creatorGrid}>{creators.map(creator=><article key={creator.id} className={s.creatorCard}>
          <Link className={s.creatorPhoto} href={`${creatorBasePath}/creator/${creator.id}`} aria-label={`${creator.name} 프로필 보기`}>{creator.image&&<img src={creator.image} style={{objectPosition:creator.position}} alt="" loading="lazy"/>}</Link>
          <div className={s.creatorInfo}><Link href={`${creatorBasePath}/creator/${creator.id}`} className={s.creatorName}><CreatorName person={creator}/></Link><p className={s.tags}>{creator.tags.join(' · ')}</p><Link className={s.profileLink} href={`${creatorBasePath}/creator/${creator.id}`}>프로필 보기 <Icon name="arrow"/></Link></div>
        </article>)}</div>
        <Link className={s.browseLink} href={`${creatorBasePath}/explore`}>더 많은 크리에이터 둘러보기 <Icon name="arrow"/></Link>
      </section>}
      {steps.length>0&&<section id="membership" className={s.services} aria-label="크레팬스 이용안내">
        {steps.map(step=><article key={step.title}><Icon name={step.icon}/><div><h2>{step.title}</h2><p>{step.description.join(' ')}</p></div></article>)}
      </section>}
      <section className={s.closing} aria-labelledby="closing-heading"><h2 id="closing-heading">좋아하는 마음으로, 함께 시작해요.</h2><Link className={s.textAction} href={`${basePath}/signup`}>크레팬스 시작하기 <Icon name="arrow"/></Link></section>
    </main>
    <footer className={s.motionPreference}><MarqueeMotionControl/></footer>
  </div>;
}
