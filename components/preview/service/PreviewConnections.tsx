
'use client';
import {ProfileConnectionsPage} from '@/components/crefans/ProfileConnectionsPage';
import type {ConnectionsLoader} from '@/types/crefans';
import {creators} from './fixtures';
const load:ConnectionsLoader=async(id,kind,offset)=>{const profile=creators.find(c=>c.id===id||c.handle===id);if(!profile)return{success:false,data:null,errorCode:'NOT_FOUND',errorMessage:'프로필을 찾을 수 없습니다.'};if(kind==='followers'?profile.followersPublic===false:profile.followingPublic===false)return{success:false,data:null,errorCode:'CONNECTIONS_PRIVATE',errorMessage:'비공개 목록입니다.'};const people=creators.filter(c=>c.id!==profile.id);return{success:true,errorCode:null,errorMessage:null,data:{profile,people:people.slice(offset,offset+20),nextOffset:offset+20<people.length?offset+20:null}};};
export function PreviewConnections({id,kind}:{id:string;kind:'followers'|'following'}){return <ProfileConnectionsPage key={`${id}:${kind}`} id={id} kind={kind} basePath="/preview" load={load}/>;}
