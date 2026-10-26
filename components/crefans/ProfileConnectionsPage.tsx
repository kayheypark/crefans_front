
'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {Connections,ConnectionsLoader} from '@/types/crefans';
import {Action,Avatar,Empty,PageTitle} from './ServiceUI';
import {BackButton} from './BackButton';
import {CreatorName} from './CreatorName';
import s from './creator.module.css';
export function ProfileConnectionsPage({id,kind,basePath,load}:{id:string;kind:'followers'|'following';basePath:string;load:ConnectionsLoader}){
 const [data,setData]=useState<Connections|null>(null),[error,setError]=useState(''),[privateList,setPrivate]=useState(false),[loading,setLoading]=useState(true),[offset,setOffset]=useState(0);
 useEffect(()=>{let alive=true;setLoading(true);setError('');load(id,kind,offset).then(r=>{if(!alive)return;if(r.success){setData(old=>({...r.data,people:offset&&old?[...old.people,...r.data.people]:r.data.people}));setPrivate(false);}else{setData(null);setPrivate(r.errorCode==='CONNECTIONS_PRIVATE'||r.errorCode==='FOLLOWING_PRIVATE');setError(r.errorMessage);}setLoading(false);}).catch(()=>{if(alive){setError('목록을 불러오지 못했습니다.');setLoading(false);}});return()=>{alive=false;};},[id,kind,offset,load]);
 const title=kind==='followers'?'팔로워':'팔로잉';
 return <section className={s.profile}><PageTitle back={<BackButton href={`${basePath}/creator/${encodeURIComponent(id)}`} label="프로필로 돌아가기"/>}>{title}</PageTitle>{privateList?<Empty title={`비공개 ${title} 목록입니다`} description="이 사용자가 목록을 공개하지 않았습니다."/>:error?<p role="alert">{error}</p>:<>{data&&<p><CreatorName person={data.profile}/></p>}<ul className={s.connectionList}>{data?.people.map(person=><li key={person.id}><Link href={`${basePath}/creator/${encodeURIComponent(person.id)}`}><Avatar creator={person} size={44}/><span><CreatorName person={person}/><small>@{person.handle}</small></span></Link></li>)}</ul>{!loading&&data?.people.length===0&&<Empty title={`${title}가 없습니다`}/>}</>}{loading&&<p role="status">불러오는 중…</p>}{!error&&data?.nextOffset!=null&&<Action variant="secondary" disabled={loading} onClick={()=>setOffset(data.nextOffset!)}>더 보기</Action>}</section>;
}
