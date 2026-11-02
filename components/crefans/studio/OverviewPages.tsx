'use client';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {MarqueeText} from '@/components/ui/MarqueeText';

import {DialogActions} from '@/components/ui/DialogActions';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {SelectField} from '@/components/ui/SelectField';
import {BarChart,Trend} from '@/components/ui/Charts';
export {Trend} from '@/components/ui/Charts';
import {BackButton} from '../BackButton';
import {Action,ActionLink,Avatar,Empty,Notice,PageTitle} from '../ServiceUI';
import {Field,Dialog,TextAreaField} from '@/components/ui/Primitives';
import {Toggle} from '@/components/ui/Toggle';
import {Checkbox} from '@/components/ui/Choice';
import type {StudioOverviewModel,StudioProfile,StudioMetric} from '@/types/crefans-studio';
import type {ServiceViewModel} from '@/types/crefans';
import {CreatorProfilePage} from '../CreatorPages';
import {PhoneFrame} from './PhoneFrame';
import s from './overview.module.css';
type Props={model:StudioOverviewModel;basePath:string};
export function MetricCard({metric,href}:{metric:StudioMetric;href?:string}){
 return <article className={s.metric}><span>{metric.label}</span><div className={s.metricValue}><strong>{metric.value}</strong></div><small>{metric.description}</small><Trend points={metric.points} label={`${metric.label} 추이`} className={s.trend}/>{href&&<ActionLink variant="secondary" href={href} className={s.moreButton} aria-label={`${metric.label} 리포트 보기`}>리포트 보기</ActionLink>}</article>;
}
export {DashboardPage} from './DashboardPage';
export function AnalyticsPage({model,basePath}:Props){
 const [metric,setMetric]=useState<'subscribers'|'followers'|'revenue'>('subscribers');
 const labels={subscribers:'구독자',followers:'팔로워',revenue:'매출'};
 return <div className={s.page}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>}>통계 요약</PageTitle><p className={s.lead}>{model.period}</p><div className={s.tabs} aria-label="통계 항목">{(Object.keys(labels) as (keyof typeof labels)[]).map(key=><button key={key} aria-pressed={metric===key} onClick={()=>setMetric(key)}>{labels[key]} 추이</button>)}</div><section className={s.chart}><h2>{labels[metric]}의 변화</h2>{model.series.length?<><BarChart label={`${labels[metric]}의 변화`} items={model.series.map(item=>({id:item.label,label:/^\d{4}-\d{2}-\d{2}$/.test(item.label)?item.label.slice(5).replace('-','.'):item.label,value:item[metric],valueLabel:`${item[metric].toLocaleString()}${metric==='revenue'?'원':''}`}))}/><p className={s.chartCaption}>선택 기간의 각 시점별 {labels[metric]} {metric==='revenue'?'발생 금액':'수'}입니다.</p></>:<Empty title="집계된 통계가 없어요"/>}</section><section className={s.performance}><h2>콘텐츠 성과</h2>{model.contentPerformance.map(post=><div className={s.performanceRow} key={post.id}>{post.image?<img src={post.image} alt=""/>:<span className={s.textThumbnail} aria-label="텍스트 게시물">Aa</span>}<strong>{post.title}</strong><span>조회 <b>{post.views.toLocaleString()}</b></span><span>좋아요 <b>{post.likes.toLocaleString()}</b></span><span>댓글 <b>{post.comments.toLocaleString()}</b></span></div>)}</section>{model.guidance&&<Notice>{model.guidance}</Notice>}</div>;
}
const linkFields=[['youtube','유튜브','https://youtube.com/@채널'],['instagram','인스타그램','https://instagram.com/계정'],['facebook','페이스북','https://facebook.com/페이지']] as const;
/** Settings-only: the long 소개 and SNS links shown on the fan profile's 소개 tab. Empty links are simply not shown. */
function AboutFields({value,onChange}:{value:Pick<StudioProfile,'about'|'links'>;onChange:(value:Pick<StudioProfile,'about'|'links'>)=>void}){
 const links=value.links||{};
 return <><TextAreaField label="소개 글" tooltip="프로필의 소개 탭에 표시되는 상세 소개입니다. 상단의 짧은 소개와 별도로 저장됩니다." rows={6} maxLength={1000} value={value.about||''} onChange={e=>onChange({about:e.target.value,links})} hint="프로필의 소개 탭에 그대로 보여요. 줄바꿈을 유지합니다." placeholder="팬들에게 나를 소개해 주세요"/><fieldset className={s.linkFields}><legend>SNS 링크</legend>{linkFields.map(([key,label,placeholder])=><Field key={key} label={label} type="url" inputMode="url" placeholder={placeholder} value={links[key]||''} onChange={e=>onChange({about:value.about,links:{...links,[key]:e.target.value}})}/>)}</fieldset></>;
}
function ProfileFields({value,onChange,categories}:{value:Pick<StudioProfile,'name'|'handle'|'bio'|'category'>;onChange:(value:Pick<StudioProfile,'name'|'handle'|'bio'|'category'>)=>void;categories:string[]}){
 return <><Field label="크리에이터 활동명" tooltip="크리에이터 전환 시 프로필에 일반 사용자명보다 우선 표시됩니다." value={value.name} required maxLength={24} onChange={e=>onChange({...value,name:e.target.value})}/><Field label="핸들" value={`@${value.handle}`} readOnly hint="일반 회원과 크리에이터가 같은 핸들을 사용해요. 변경은 설정 > 프로필 수정에서 할 수 있어요."/><SelectField label="주요 활동 분야" value={value.category} onChange={category=>onChange({...value,category})} options={categories.map(item=>({value:item,label:item}))} placeholder="분야를 선택해주세요" required/><TextAreaField label="소개" tooltip="내 프로필과 크리에이터 프로필에서 같은 소개를 사용합니다. 어느 화면에서 수정해도 함께 반영됩니다." rows={4} maxLength={120} value={value.bio} onChange={e=>onChange({...value,bio:e.target.value})} placeholder="팬들에게 어떤 이야기를 전하고 싶나요?"/></>;
}
export function CreatorStartPage({model,basePath}:Props){
 const [step,setStep]=useState(1),[profile,setProfile]=useState({...model.profile}),[agreed,setAgreed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState(''),[done,setDone]=useState('');
 const profileReady=!!profile.name.trim()&&!!profile.category;// the profile address is the account user name (2026-10-31), not entered here
 function next(event:FormEvent){event.preventDefault();setError('');if(!profileReady){setError('활동명과 분야를 확인해주세요.');return;}setStep(2);}
 async function complete(){if(pending||!agreed)return;setPending(true);setError('');try{const result=await model.completeOnboarding(profile);if(result.success)setDone(result.data.message);else setError(result.errorMessage);}catch{setError('설정을 완료하지 못했습니다. 다시 시도해주세요.');}finally{setPending(false);}}
 if(done)return <section className={s.start}><div className={s.successMark}>✓</div><h1>크리에이터 설정 완료</h1><Link className={s.primaryLink} href={basePath}>스튜디오 시작하기 →</Link></section>;
 return <section className={s.start}><h1>크리에이터 시작하기</h1><div className={s.stepper}><span data-current={step===1}>01 기본 정보</span><span data-current={step===2}>02 공개 프로필 확인</span><span>03 완료</span></div>{step===1?<form className={s.form} onSubmit={next}><ProfileFields value={profile} onChange={value=>setProfile(previous=>({...previous,...value}))} categories={model.categories}/>{error&&<p role="alert" className={s.error}>{error}</p>}<Action type="submit" variant="brand" disabled={!profileReady}>다음 단계 →</Action></form>:<div className={s.form}><div className={s.publicProfile}><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={76}/><h2><MarqueeText text={profile.name}/></h2><MarqueeText text={`@${profile.handle}`}/><span>{profile.category}</span>{profile.bio&&<p>{profile.bio}</p>}</div><Checkbox className={s.consent} label="위 정보가 공개 프로필에 표시되는 것을 확인했습니다." checked={agreed} onChange={setAgreed}/>{error&&<p role="alert" className={s.error}>{error}</p>}<div className={s.formActions}><Action variant="secondary" disabled={pending} onClick={()=>setStep(1)}>이전</Action><Action variant="brand" disabled={!agreed||pending} onClick={complete}>{pending?'설정 중...':'설정 완료하기'}</Action></div></div>}{model.guidance&&<Notice>{model.guidance}</Notice>}</section>;
}
/** Fan-side profile rendered from the unsaved draft so creators see exactly what fans will. */
function ProfilePreview({profile,previewModel,creatorId}:{profile:StudioProfile;previewModel:ServiceViewModel;creatorId:string}){
 const data={...previewModel.data,creators:previewModel.data.creators.map(creator=>creator.id===creatorId?{...creator,name:profile.name||creator.name,handle:profile.handle||creator.handle,bio:profile.bio,about:profile.about,links:profile.links,tags:profile.category?[profile.category]:creator.tags}:creator)};
 return <PhoneFrame inert><CreatorProfilePage id={creatorId} model={{...previewModel,data,toggleFollow:()=>{}}}/></PhoneFrame>;
}
export function CreatorSettingsPage({model,basePath,previewModel,previewCreatorId}:Props&{previewModel?:ServiceViewModel;previewCreatorId?:string}){
 const [profile,setProfile]=useState({...model.profile}),[message,setMessage]=useSnackbarMessage(),[error,setError]=useState(''),[pending,setPending]=useState(false),[confirmPause,setConfirmPause]=useState(false);
 const linksValid=Object.values(profile.links||{}).every(url=>!url||!url.trim()||/^https?:\/\//.test(url.trim()));
 const profileReady=!!profile.name.trim()&&!!profile.category&&linksValid;
 async function save(event:FormEvent){event.preventDefault();if(pending||!profileReady)return;setPending(true);setError('');setMessage('');try{const result=await model.updateProfile(profile);if(result.success)setMessage(result.data.message);else setError(result.errorMessage);}catch{setError('변경사항을 저장하지 못했어요.');}finally{setPending(false);}}
 async function comments(enabled:boolean){if(pending)return;setPending(true);setError('');setMessage('');try{const result=await model.setCommentsEnabled(enabled);if(result.success)setMessage(result.data.message);else setError(result.errorMessage);}catch{setError('댓글 설정을 변경하지 못했어요.');}finally{setPending(false);}}
 async function activity(){if(pending)return;setPending(true);setError('');try{const result=await model.setActivity(!model.profile.active);if(result.success){setMessage(result.data.message);setConfirmPause(false);}else setError(result.errorMessage);}catch{setError('활동 상태를 변경하지 못했어요.');}finally{setPending(false);}}
 return <section className={s.settings}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>}>크리에이터 설정</PageTitle><p className={s.lead}>팬들에게 보이는 프로필과 활동 상태를 관리하세요.</p><div className={s.settingsLayout}><div className={s.settingsColumn}><form className={s.form} onSubmit={save}><Avatar creator={{name:profile.name,image:profile.avatar,position:profile.avatarPosition}} size={72}/><ProfileFields value={profile} onChange={value=>setProfile(previous=>({...previous,...value}))} categories={model.categories}/><AboutFields value={profile} onChange={value=>setProfile(previous=>({...previous,...value}))}/><Action type="submit" variant="brand" disabled={pending||!profileReady}>{pending?'저장 중...':'공개 프로필 저장'}</Action></form><section className={s.activitySettings}><div><h2>크리에이터 활동</h2><p>{model.profile.active?'계정이 활성화되어 있어요. 프로필과 게시물이 팬에게 공개됩니다.':'계정이 비활성화되어 있어요. 프로필 공개와 신규 가입이 중단됩니다.'}</p></div><Action variant="secondary" disabled={pending} onClick={()=>model.profile.active?setConfirmPause(true):void activity()}>{model.profile.active?'계정 비활성화':'계정 활성화'}</Action></section><section className={s.commentSettings}><h2>댓글 기능</h2><Toggle label="모든 게시물의 댓글 허용" description="끄면 게시물별 설정과 관계없이 모든 게시물의 댓글이 닫힙니다. 켜면 게시물별 댓글 허용 설정이 적용됩니다." checked={model.profile.commentsEnabled} disabled={pending} onChange={value=>void comments(value)}/></section><Toast message={message} onClose={()=>setMessage('')}/>{error&&<p className={s.error} role="alert">{error}</p>}<Dialog open={confirmPause} onClose={()=>{if(!pending)setConfirmPause(false);}} title="계정을 비활성화할까요?"><p>프로필 공개, 신규 가입, 새 게시물 발행이 중단됩니다. 이미 가입한 팬의 이용 권한과 정산 내역은 유지됩니다.</p><DialogActions style={{marginTop:16}}><Action variant="secondary" disabled={pending} onClick={()=>setConfirmPause(false)}>취소</Action><Action variant="brand" disabled={pending} onClick={activity}>비활성화</Action></DialogActions></Dialog></div>{previewModel&&previewCreatorId&&<aside className={s.previewPane} aria-label="팬 화면 미리보기"><h2 className={s.previewTitle}>팬 화면 미리보기</h2><ProfilePreview profile={profile} previewModel={previewModel} creatorId={previewCreatorId}/></aside>}</div></section>;
}
