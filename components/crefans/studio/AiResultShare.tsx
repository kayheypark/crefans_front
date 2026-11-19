'use client';
import {useEffect,useId,useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import type {StudioMedia,ShareReport} from '@/types/crefans-studio-management';
import s from './ai-photo.module.css';

export function AiResultShare({item,eligible,prepare,onReport,onClose}:{item:StudioMedia;eligible:boolean;prepare:(item:StudioMedia)=>Promise<File>;onReport:(report:ShareReport)=>void;onClose:()=>void}){
 const [file,setFile]=useState<File>();
 const [link,setLink]=useState('');
 const [notice,setNotice]=useState('');
 const [busy,setBusy]=useState(false);
 const rewardId=useId(),termsId=useId();
 useEffect(()=>{
  let alive=true;
  void prepare(item).then(png=>{if(alive)setFile(png);},()=>{if(alive)setNotice('사진을 불러오지 못했어요. 링크는 복사할 수 있어요.');});
  // 2026-11-20: the link carries no code (the reward is paid at the share); /s redirects to the landing with share tags.
  setLink(new URL('/s',window.location.origin).href);
  return()=>{alive=false;};
  // The parent mounts a fresh sheet for each selected result; its file cache survives.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[item,eligible]);

 async function copy(){
  try{await navigator.clipboard.writeText(link);setNotice('링크를 복사했어요.');onReport({where:'ai_result',method:'copy',outcome:'done'});}
  catch{setNotice('아래 링크를 선택해 복사해 주세요.');onReport({where:'ai_result',method:'copy',outcome:'failed'});}
 }

 async function send(){
  if(!file||!link||busy)return;
  const data={files:[file],title:'크레팬스 AI 사진',text:`AI로 만든 코스프레 사진이에요. 나도 해 보기 → ${link}`};
  const native=typeof navigator.share==='function'&&navigator.canShare?.(data);
  const method=native?'native':'download';
  setBusy(true);
  try{
   if(native){await navigator.share(data);}
   else{
    const url=URL.createObjectURL(file);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download=file.name;
    document.body.append(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    setNotice('사진을 저장했어요. 함께 보낼 체험 링크를 복사해 주세요.');
   }
   onReport({where:'ai_result',method,outcome:'done'});
  }catch(error){
   const cancelled=error instanceof Error&&error.name==='AbortError';
   onReport({where:'ai_result',method,outcome:cancelled?'cancelled':'failed'});
   if(!cancelled)setNotice('사진을 공유하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }finally{setBusy(false);}
 }

 return <Dialog open onClose={onClose} title="이 결과 공유하기" sheet className={s.resultShareSheet}>
  <div className={s.resultShareCard}>
   {/* eslint-disable-next-line @next/next/no-img-element -- private result preview, loaded with the viewer's session */}
   <img src={item.url} alt="공유할 AI 결과 사진"/>
   <div><strong>AI로 만든 코스프레 사진</strong><small>선택한 결과 사진 1장과 체험 링크</small></div>
  </div>
  <div className={s.resultShareActions}>
   {eligible&&<span id={rewardId} className={s.resultShareBubble}>공유하고 이용권 3장 받기</span>}
   <button type="button" className={s.resultSharePrimary} disabled={!file||!link||busy} aria-describedby={eligible?`${rewardId} ${termsId}`:undefined} onClick={()=>void send()}>{busy?'공유하는 중…':'사진과 링크 공유'}</button>
   <button type="button" className={s.resultShareCopy} disabled={!link} onClick={()=>void copy()}>링크 복사</button>
  </div>
  {eligible&&<p className={s.resultShareTerms} id={termsId}>사진과 링크를 공유하거나 링크를 복사하면 이용권 3장을 바로 받을 수 있어요(한 번).</p>}
  {notice&&<p className={s.resultShareTerms} role="status">{notice}</p>}
  {notice.startsWith('아래 링크')&&<input aria-label="복사할 체험 링크" className={s.resultShareLink} readOnly value={link} onFocus={event=>event.currentTarget.select()}/>}
 </Dialog>;
}
