'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {designVariables} from '@/lib/design/tokens';
import {platformRequest} from '@/lib/api/platform';
import {saveAiPhotoHandoff} from '@/lib/crefans/ai-photo-handoff';
import {reportFunnelStep,rememberEntrySource} from '@/lib/api/funnel';
import type {sharedCatalog} from '@/lib/crefans/shared-result';
import {AiResultViewer,PhotoZoomButton} from '@/components/crefans/studio/AiResultViewer';
import {CostumeShopCard} from '@/components/crefans/studio/CostumeShopCard';
import {CoupangFeedBanner} from '@/components/crefans/CoupangFeedBanner';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import landingStyles from '@/components/service/ai-photo-landing.module.css';
import s from './shared-result.module.css';
import editor from '@/components/crefans/studio/ai-photo.module.css';

export default function SharedResult({image,presets,campaign,hasSessionCookie}:{hasSessionCookie:boolean;image:string;presets:ReturnType<typeof sharedCatalog>;campaign:string}){
 const zoomDialog=useRef<HTMLDialogElement>(null);
 const [zoomOpen,setZoomOpen]=useState(false);
 const [remaining,setRemaining]=useState<number|null>(null);
 useEffect(()=>{
  let active=true;
  async function load(){
   let result=await platformRequest<{remaining:number}>(hasSessionCookie?'/studio/ai-photo/quota':'/guest/session');
   if(hasSessionCookie&&!result.success&&result.errorCode==='UNAUTHORIZED')result=await platformRequest<{remaining:number}>('/guest/session');
   if(active&&result.success)setRemaining(result.data.remaining);
  }
  void load();
  return ()=>{active=false;};
 },[hasSessionCookie]);
 const [notice,setNotice]=useState('');
 const [picked,setPicked]=useState(()=>presets.map(item=>item.image));
 const [detail,setDetail]=useState<(typeof presets)[number]|null>(null);
 const source={utmSource:'crefans_share',utmMedium:'share',utmCampaign:campaign,utmContent:'result'};
 const query=new URLSearchParams({utm_source:source.utmSource,utm_medium:source.utmMedium,utm_campaign:campaign,utm_content:source.utmContent});
 useEffect(()=>{rememberEntrySource({...source,landingPath:'/r/result'});reportFunnelStep('shared_result_view');},[campaign]); // eslint-disable-line react-hooks/exhaustive-deps
 async function reshare(){
  const url=window.location.href;
  try{
   if(navigator.share){await navigator.share({url});return;}
   await navigator.clipboard.writeText(url);setNotice('링크를 복사했어요.');
  }catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setNotice('공유하지 못했어요. 다시 시도해 주세요.');}
 }
 const landing='/service/landing-ai-image-generation?'+query;
 function startTrial(){
  saveAiPhotoHandoff(presets.filter(item=>picked.includes(item.image)));
  reportFunnelStep('shared_result_create');
 }
 return <main className={s.page} style={designVariables as CSSProperties}><header><a href="/service/feed" aria-label="크레팬스 홈"><img src="/brand/crefans-logo.svg" alt="크레팬스"/></a></header>
 <div className={s.heroFrame}>
  <img className={s.hero} src={image} alt="공유된 AI 사진 편집 결과"/>
  <PhotoZoomButton label="결과 사진 크게 보기" onClick={()=>{zoomDialog.current?.showModal();setZoomOpen(true);}}/>
 </div>
 <dialog ref={zoomDialog} aria-label="결과 사진 크게 보기" onClose={()=>setZoomOpen(false)}>
  {zoomOpen&&<AiResultViewer items={[{id:image,type:'image',url:image,aiGenerated:true}]} index={0} selected={[]} onIndex={()=>{}} onClose={()=>zoomDialog.current?.close()}/>}
 </dialog>
 <aside className={s.invite}><div><h1>AI 코스프레, <em>0원</em>으로 생성</h1><p>내 사진이 없어도 샘플 사진으로<br/>바로 시작할 수 있어요.</p><a className={landingStyles.primary} href={landing} onClick={startTrial}>0원으로 체험하기</a></div>
 <div className={s.looks} aria-hidden="true">{['gothic','idol'].map(name=><img key={name} src={'/illustrations/landing/ai-photo/thumb-'+name+'-v1.webp'} alt=""/>)}</div></aside>
 {!!presets.length&&<section><h2>사용한 프리셋 <small>{picked.length}개 선택</small></h2><div className={s.row}>{presets.map(item=><button key={item.image} type="button" aria-haspopup="dialog" aria-label={item.title+' 자세히 보기'} data-selected={picked.includes(item.image)} onClick={()=>setDetail(item)}>
 <img src={item.image} alt=""/><span className={editor.presetCaption}><small>{item.label}</small><b>{item.title}</b></span></button>)}</div></section>}
 <Dialog open={!!detail} onClose={()=>setDetail(null)} title={detail?.title||''}>
  {detail&&<>
   <div className={landingStyles.presetDetail}><img src={detail.image} alt="" width={200} height={200} data-illustrated={['expression','pose','camera','lens'].includes(detail.kind)||undefined}/><span>{detail.label}</span><p className={s.description}>{detail.description||detail.prompt}</p></div>
   <DialogActions>
    <button type="button" className={landingStyles.secondary} onClick={()=>{setPicked(prev=>prev.includes(detail.image)?prev.filter(src=>src!==detail.image):[...prev,detail.image]);setDetail(null);}}>{picked.includes(detail.image)?'선택 해제':'프리셋 선택'}</button>
    <a className={landingStyles.primary} href={landing} onClick={startTrial}>이 조합으로 0원 체험</a>
   </DialogActions>
  </>}
 </Dialog>
 {presets.some(item=>item.shopUrl)?<aside aria-label="쿠팡 파트너스 광고" className={s.shop}>
  {presets.map(item=>item.shopUrl&&<CostumeShopCard key={item.image}
   shopLink={{name:item.title,image:item.image,url:item.shopUrl,affiliate:true}}
   bubble="혹시 진짜로 입어볼 생각도 있어요?"/>)}
 </aside>:<CoupangFeedBanner/>}
 <footer><a href={landing} onClick={startTrial}>0원으로 만들기{remaining!==null&&<span className={s.balance}>남은 이용권 {remaining}장</span>}</a><button type="button" onClick={reshare}>결과 공유하기</button><small role="status">{notice}</small></footer></main>;
}
