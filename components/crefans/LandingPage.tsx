'use client';

import {TextLink} from '@/components/ui/TextLink';
import {useState,type CSSProperties,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import type {ServiceViewModel} from '@/types/crefans';
import type {LandingContent} from '@/types/crefans-landing';
import {Brand} from './Brand';
import {designVariables} from '@/lib/design/tokens';
import {Dialog} from '@/components/ui/Primitives';
import Icon from './Icon';
import s from './landing.module.css';

export default function LandingPage({model,content,creatorBasePath=model.basePath}:{model:ServiceViewModel;content:LandingContent;creatorBasePath?:string}){
  const router=useRouter();
  const [search,setSearch]=useState(''),[notice,setNotice]=useState(false);
  const {following,toggleFollow:follow,basePath}=model;
  const {creators:results,steps:gettingStarted,hero,collage}=content;
  const open=(type:'login'|'signup'|'notice')=>{if(type==='notice')setNotice(true);else router.push(`${basePath}/${type}`);};
  const findCreators=(event:FormEvent)=>{event.preventDefault();router.push(`${basePath}/explore?q=${encodeURIComponent(search.trim())}`);};
  return <div className={s.page} style={designVariables as CSSProperties}>
    <a className={s.skip} href="#main">본문으로 이동</a>
    <header className={s.header}><div className={s.headerInner}>
      <Brand href={`${basePath}/feed`} className={s.brand}/>
      <nav aria-label="주요 메뉴"><a href="#creators">크리에이터</a><a href="#creators">둘러보기</a><a href="#membership">멤버십</a><a href={`${basePath}/notices`}>공지사항</a></nav>
      <form className={s.search} onSubmit={findCreators} role="search"><Icon name="search" width="15" height="15"/><input aria-label="크리에이터 검색" placeholder="크리에이터를 검색해보세요" value={search} onChange={e=>setSearch(e.target.value)}/></form>
      <div className={s.account}><button onClick={()=>open('login')}>로그인</button><button className={s.primary} onClick={()=>open('signup')}>회원가입</button></div>
    </div></header>
    <main id="main">
      {hero&&<section className={s.hero} aria-labelledby="hero-heading">
        {hero.image&&<img className={s.heroImage} src={hero.image} alt={hero.imageAlt} fetchPriority="high"/>}
        <div className={s.heroShade}/>
        <div className={s.heroInner}><div className={s.heroCopy}>
          <h1 id="hero-heading">{hero.title.map((line,index)=><span key={index}>{index>0&&<br/>}{line}</span>)}</h1>
          <p>{hero.description.map((line,index)=><span key={index}>{index>0&&<br/>}{line}</span>)}</p>
          <div className={s.actions}><button className={s.primary} onClick={()=>open('signup')}>지금 시작하기 <Icon name="arrow"/></button><a className={s.secondary} href="#creators">크리에이터 둘러보기</a></div>
          <div className={s.heroBenefits}>
            <div><span><Icon name="users"/></span><p>크리에이터와<br/>더 가까운 소통</p></div>
            <div><span><Icon name="lock"/></span><p>멤버십 전용<br/>콘텐츠</p></div>
            <div><span><Icon name="check"/></span><p>팬을 위한<br/>특별한 경험</p></div>
          </div>
        </div><div className={s.heroSignature} aria-hidden="true"><span>More<br/><i>Than</i><br/>Fans</span><p>좋아하는 마음이<br/>특별한 일상이 되는 곳<br/>crefans</p></div></div>
      </section>}
      {gettingStarted.length>0&&<section id="membership" className={s.steps} aria-labelledby="steps-heading"><div className={s.container}>
        <h2 id="steps-heading">이렇게 시작하세요</h2><p>간단한 3단계로 크리에이터와 더 가까워질 수 있어요</p>
        <div className={s.stepGrid}>{gettingStarted.map((step,index)=><article key={step.title}><span className={s.stepIcon}><Icon name={step.icon}/></span><h3>{step.title}</h3><p>{step.description[0]}<br/>{step.description[1]}</p>{index<2&&<Icon className={s.stepArrow} name="chevron"/>}</article>)}</div>
      </div></section>}
      {results.length>0&&<section id="creators" className={s.creators} aria-labelledby="creators-heading"><div className={s.container}>
        <div className={s.sectionHeading}><h2 id="creators-heading">지금 주목할 크리에이터</h2><button onClick={()=>router.push(`${basePath}/explore`)}>더보기 <Icon name="arrow"/></button></div>
        <div className={s.creatorGrid}>{results.map(c=><article key={c.name} className={s.creatorCard}>
          <button className={s.creatorPhoto} aria-label={`${c.name} 프로필 보기`} onClick={()=>router.push(`${creatorBasePath}/creator/${c.id}`)}>{c.image&&<img src={c.image} style={{objectPosition:c.position}} alt={`${c.name} 크리에이터`} loading="lazy"/>}<span className={s.tags}>{c.tags.map(tag=><span key={tag}>{tag}</span>)}</span></button>
          <div className={s.creatorInfo}><button onClick={()=>router.push(`${creatorBasePath}/creator/${c.id}`)} className={s.creatorName}>{c.name}</button>{c.bio&&<p>{c.bio}</p>}<button className={s.follow} aria-label={`${c.name} ${following.includes(c.id)?'팔로우 취소':'팔로우'}`} aria-pressed={following.includes(c.id)} onClick={()=>follow(c.id)}><Icon name={following.includes(c.id)?'check':'plus'}/>{following.includes(c.id)?'팔로잉':'팔로우'}</button></div>
        </article>)}</div>

      </div></section>}
      <section className={s.closing} aria-labelledby="closing-heading"><div className={s.closingInner}>
        <div className={s.collage} aria-hidden="true">{collage.filter(c=>c.image).map((c,i)=><img key={c.name} className={s['collage'+i]} src={c.image} alt="" style={{objectPosition:c.position}} loading="lazy"/>)}<span>Good<br/>Vibes ♡</span></div>
        <div className={s.closingCopy}><h2 id="closing-heading">지금, 특별한 이야기에 함께하세요</h2><p>크리에이터와 팬이 만들어가는 더 특별한 공간, crefans<br/>지금 시작하고, 잊지 못할 순간들을 함께하세요.</p><button className={s.secondary} onClick={()=>open('signup')}>지금 시작하기 <Icon name="arrow"/></button></div>
        <span className={s.closingSignature} aria-hidden="true">For<br/>a Bigger<br/><i>Connection ♡</i></span>
      </div></section>
    </main>
    <Dialog open={notice} onClose={()=>setNotice(false)} title="공지사항" sheet><p className={s.dialogNote}>{content.notice} <TextLink href={`${basePath}/support`}>고객센터 및 Q&A로 이동</TextLink></p></Dialog>
  </div>;
}
