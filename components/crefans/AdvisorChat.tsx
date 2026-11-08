'use client';
// AI 가이드 채팅. 가이드 사이트(crefans_guide AdvisorChat.astro)의 화면을 서비스 공용 컴포넌트로 옮긴 것이다.
// 질문은 props 의 ask 콜백으로만 보낸다(실제 서비스: features/service → lib/api/advisor, 목업: 주입한 대역).
// 답변은 **굵게**와 표만 해석하고 나머지는 글자 그대로 표시한다(HTML 로 넣지 않는다).
import {useEffect,useLayoutEffect,useRef,useState,type FormEvent,type KeyboardEvent,type ReactNode} from 'react';
import Link from 'next/link';
import type {ApiResult} from '@/types/crefans';
import {
 ADVISOR_FINAL_ERRORS,ADVISOR_MAX_TURNS,ADVISOR_QUESTION_MAX,blockWordCount,clearAdvisorTurns,containsPersonalData,loadAdvisorTurns,parseAnswer,safeAdvisorUrl,saveAdvisorTurns,
 type AdvisorAnswer,type AdvisorInline,type AdvisorSource,type AdvisorTurn,
} from '@/lib/crefans/advisor';
import s from './advisor.module.css';

export type AdvisorAsk=(question:string)=>Promise<ApiResult<AdvisorAnswer>>;
const SUGGESTIONS=[['구독 해지','구독을 해지하면 바로 못 보나요?'],['멤버십 환불','멤버십 환불은 어떻게 요청하나요?'],['콩 충전','콩은 어디에서 충전하나요?'],['출금 PIN','출금 PIN을 잊어버렸어요']] as const;

type Budget={left:number}|null;
function cut(text:string,budget:Budget){
 if(!budget)return text;let out='';
 for(const part of text.split(/(\s+)/)){if(!part)continue;if(budget.left<=0)break;if(part.trim())budget.left--;out+=part;}
 return out;
}
function Inline({parts,budget}:{parts:AdvisorInline[];budget:Budget}){
 return <>{parts.map((part,i)=>{const text=cut(part.text,budget);return text?part.bold?<strong key={i}>{text}</strong>:<span key={i}>{text}</span>:null;})}</>;
}
/** Renders the parsed answer; with `shown` only that many words appear (typing reveal). */
export function AdvisorAnswerText({text,shown}:{text:string;shown?:number}){
 const blocks=parseAnswer(text),budget=shown===undefined?null:{left:shown};
 if(!blocks.length)return <p/>;
 return <>{blocks.map((block,i)=>block.type==='paragraph'?<p key={i}><Inline parts={block.lines} budget={budget}/></p>:
  <div key={i} className={s.table}><table><thead><tr>{block.head.map((cell,c)=><th key={c} scope="col"><Inline parts={cell} budget={budget}/></th>)}</tr></thead>
   <tbody>{block.rows.map((row,r)=><tr key={r}>{row.map((cell,c)=><td key={c}><Inline parts={cell} budget={budget}/></td>)}</tr>)}</tbody></table></div>)}</>;
}

function Sources({sources,found}:{sources:AdvisorSource[];found:boolean}){
 const list=sources.filter(source=>safeAdvisorUrl(source.url));
 if(!list.length)return null;
 return <details className={s.sources}>
  <summary><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.5C10.3 5.2 8 4.5 4 4.5v13c4 0 6.3.7 8 2 1.7-1.3 4-2 8-2v-13c-4 0-6.3.7-8 2Z"/><path d="M12 6.5v13"/></svg>{found?'참고한 가이드':'도움이 되는 곳'} {list.length}</summary>
  <ul>{list.map(source=>{const external=/^https:\/\/guide\.crefans\.com\//.test(source.url);return <li key={source.url+source.section}>
   <a href={source.url} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{source.section&&source.section!=='개요'?`${source.title} › ${source.section}`:source.title}{external&&<span className={s.srOnly}> (새 창)</span>}</a></li>;})}</ul>
 </details>;
}

type Pending={question:string;state:'loading'}|{question:string;state:'error';message:string;retry:boolean};
const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AdvisorChat({ask,basePath,onClose,headerless}:{ask:AdvisorAsk;basePath:string;onClose?:()=>void;headerless?:boolean}){
 const [turns,setTurns]=useState<AdvisorTurn[]>([]),[pending,setPending]=useState<Pending|null>(null),[typing,setTyping]=useState<{index:number;shown:number;total:number}|null>(null);
 const [value,setValue]=useState(''),[inputError,setInputError]=useState('');
 const log=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),alive=useRef(true);
 useEffect(()=>{setTurns(loadAdvisorTurns());alive.current=true;return()=>{alive.current=false;};},[]);
 const busy=pending?.state==='loading'||!!typing,started=turns.length>0||!!pending;
 // Keep the newest message in view when a question is sent or the chat is restored.
 useLayoutEffect(()=>{const node=log.current;if(node)node.scrollTop=node.scrollHeight;},[turns.length,pending]);
 useEffect(()=>{
  if(!typing)return;
  if(typing.shown>=typing.total){setTyping(null);return;}
  const step=Math.max(8,Math.min(45,2500/typing.total));// the whole reveal stays under ~2.5s
  const timer=setTimeout(()=>setTyping(t=>t&&{...t,shown:t.shown+1}),step);return()=>clearTimeout(timer);
 },[typing]);
 useLayoutEffect(()=>{const node=input.current;if(!node)return;node.style.height='auto';node.style.height=Math.min(node.scrollHeight,160)+'px';},[value]);

 async function send(raw:string){
  const question=raw.trim();setInputError('');
  if(!question||busy)return;
  if(question.length>ADVISOR_QUESTION_MAX){setInputError(`질문은 ${ADVISOR_QUESTION_MAX}자 이내로 입력해 주세요.`);return;}
  if(containsPersonalData(question)){setInputError('이메일·전화번호·카드·계좌번호 같은 개인정보는 빼고 질문해 주세요.');return;}
  setValue('');setPending({question,state:'loading'});
  const result=await ask(question);
  if(!alive.current)return;
  if(!result.success){
   const retry=!ADVISOR_FINAL_ERRORS.includes(result.errorCode),message=result.errorMessage||'답변을 가져오지 못했어요.';
   setPending({question,state:'error',retry,message:!retry||message.includes('고객센터')?message:message+' 계속되면 문의하기로 남겨 주세요.'});return;
  }
  const answer={answer:result.data.answer,found:result.data.found,sources:result.data.sources.filter(source=>safeAdvisorUrl(source.url))};
  // Nothing else changes the turns while a question is pending (send and 새 대화 are disabled), so `turns` is current.
  const next=[...turns,{q:question,a:answer}].slice(-ADVISOR_MAX_TURNS),total=blockWordCount(parseAnswer(answer.answer));
  saveAdvisorTurns(next);setPending(null);setTurns(next);
  if(!reduced()&&total>1)setTyping({index:next.length-1,shown:0,total});
 }
 function reset(){clearAdvisorTurns();setTurns([]);setPending(null);setTyping(null);setInputError('');setValue('');input.current?.focus({preventScroll:true});}
 function submit(event:FormEvent){event.preventDefault();void send(value);}
 function keyDown(event:KeyboardEvent<HTMLTextAreaElement>){if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();void send(value);}}

 const bubble=(question:string,key:string,answer:ReactNode)=>[<div key={key+'q'} className={`${s.msg} ${s.user}`}><span className={s.srOnly}>내 질문: </span><p>{question}</p></div>,answer];
 return <div className={s.advisor} data-started={started||undefined} data-headerless={headerless||undefined}>
  {!headerless&&<div className={s.toolbar}>
   <p>AI 가이드</p>
   <div className={s.toolbarActions}>
    {started&&<button type="button" className={s.reset} onClick={reset} disabled={busy}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>새 대화</button>}
    {onClose&&<button type="button" className={s.close} onClick={onClose} aria-label="닫기" title="닫기"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>}
   </div>
  </div>}
  <div className={s.stage}>
   {!started&&<section className={s.welcome} aria-labelledby="advisor-welcome-title">
    {/* eslint-disable-next-line @next/next/no-img-element -- small fixed decorative illustration */}
    <img src="/illustrations/advisor-chat-search.png" alt="" width={96} height={96}/>
    <h2 id="advisor-welcome-title">크레팬스,<br/> 무엇이 궁금하세요?</h2>
    <p>이용 방법과 정책을 가이드에서 찾아드려요.</p>
   </section>}
   {started&&<div ref={log} className={s.log} role="log" aria-label="AI 가이드 대화" aria-busy={busy} tabIndex={0}>
    {turns.map((turn,i)=>bubble(turn.q,'t'+i,<div key={'t'+i+'a'} className={`${s.msg} ${s.assistant}`} data-typing={typing?.index===i||undefined}>
     <span className={s.srOnly}>AI 가이드</span>
     <AdvisorAnswerText text={turn.a.answer} shown={typing?.index===i?typing.shown:undefined}/>
     {typing?.index!==i&&<Sources sources={turn.a.sources} found={turn.a.found}/>}
    </div>))}
    {pending&&bubble(pending.question,'p',pending.state==='loading'?
     <div key="pa" className={`${s.msg} ${s.pending}`}><p><span className={s.srOnly}>답변을 작성하고 있어요</span><span className={s.dot} aria-hidden="true"/><span className={s.dot} aria-hidden="true"/><span className={s.dot} aria-hidden="true"/></p></div>:
     <div key="pa" className={`${s.msg} ${s.assistant} ${s.error}`}><p role="alert">{pending.message}</p>{pending.retry&&<button type="button" className={s.retry} onClick={()=>{const q=pending.question;setPending(null);void send(q);}}>다시 시도</button>}</div>)}
   </div>}
   <div className={s.composer}>
    <form className={s.form} onSubmit={submit} noValidate>
     <label htmlFor="advisor-input" className={s.srOnly}>질문 입력</label>
     <textarea ref={input} id="advisor-input" rows={1} maxLength={ADVISOR_QUESTION_MAX} value={value} onChange={event=>setValue(event.target.value)} onKeyDown={keyDown} placeholder="크레팬스 이용에 대해 물어보세요" aria-describedby="advisor-privacy" autoComplete="off"/>
     <div className={s.actions}>
      {value.length?<span className={s.count}>{value.length}/{ADVISOR_QUESTION_MAX}</span>:<span className={s.hint} aria-hidden="true">이용 방법 · 정책 · 가이드</span>}
      <button type="submit" className={s.send} aria-label="보내기" title="보내기" disabled={busy||!value.trim()}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button>
     </div>
     {inputError&&<p className={s.inputError} role="alert">{inputError}</p>}
    </form>
    <p id="advisor-privacy" className={s.privacy}>질문은 답변 생성을 위해 외부 AI에 전달돼요. 대화는 이 브라우저에 남아요. 개인정보는 입력하지 마세요. <Link href={`${basePath}/legal/privacy`} onClick={onClose}>개인정보처리방침</Link></p>
   </div>
   {!started&&<ul className={s.suggestions} aria-label="이런 질문으로 시작해 보세요">{SUGGESTIONS.map(([topic,question])=><li key={topic}><button type="button" aria-label={`${topic}: ${question}`} title={question} onClick={()=>void send(question)}>{topic}</button></li>)}</ul>}
  </div>
  <p className={s.note}>답변은 틀릴 수 있어요. 정확한 기준은 <Link href={`${basePath}/legal/terms`} onClick={onClose}>약관</Link>과 자주 묻는 질문에서 확인하거나 <Link href={`${basePath}/support?tab=qna`} onClick={onClose}>문의하기</Link>로 남겨 주세요.</p>
 </div>;
}

/** 고객센터의 떠 있는 버튼. PC 는 오른쪽 아래 창, 모바일은 전체 화면으로 연다. */
export function AdvisorLauncher({ask,basePath}:{ask:AdvisorAsk;basePath:string}){
 const [open,setOpen]=useState(false),launcher=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null),opened=useRef(false);
 useEffect(()=>{
  if(!open){if(opened.current)launcher.current?.focus({preventScroll:true});return;}
  opened.current=true;
  // Keep mobile keyboards closed until the user taps the input.
  const node=panel.current,target=matchMedia('(max-width:767px), (pointer:coarse)').matches?node:node?.querySelector('textarea');
  target?.focus({preventScroll:true});
  // The visual viewport shrinks when a mobile keyboard opens; ignore pinch zoom.
  const resize=()=>{const view=window.visualViewport;if(node&&view?.scale===1)node.style.setProperty('--advisor-viewport-height',`${view.height}px`);};
  resize();window.visualViewport?.addEventListener('resize',resize);return()=>window.visualViewport?.removeEventListener('resize',resize);
 },[open]);
 return <div className={s.float}>
  {!open&&<button ref={launcher} type="button" className={s.launcher} aria-haspopup="dialog" aria-expanded={false} aria-controls="advisor-panel" onClick={()=>setOpen(true)}>
   <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/></svg><span>AI 가이드</span>
  </button>}
  {open&&<div ref={panel} id="advisor-panel" className={s.panel} role="dialog" aria-label="AI 가이드" tabIndex={-1} data-pull-refresh-block="true"
   onKeyDown={event=>{if(event.key==='Escape'&&!event.nativeEvent.isComposing)setOpen(false);}}>
   <AdvisorChat ask={ask} basePath={basePath} onClose={()=>setOpen(false)}/>
  </div>}
 </div>;
}
