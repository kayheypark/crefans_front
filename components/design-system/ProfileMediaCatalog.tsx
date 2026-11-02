'use client';
import {useState} from 'react';
import {SelectField} from '@/components/ui/SelectField';
import {PostMediaTile} from '@/components/crefans/PostMediaTile';
import {Empty} from '@/components/crefans/ServiceUI';
import {mockServiceResponse} from '@/components/preview/service/fixtures';
import type {PostMediaItem} from '@/types/crefans';
import grid from '@/components/crefans/creator.module.css';
import s from './custom.module.css';

export function ProfileMediaCatalog(){
 const [state,setState]=useState('normal');
 const data=mockServiceResponse.success?mockServiceResponse.data:null;if(!data)return null;
 const photo:PostMediaItem={type:'image',url:state==='error'?'/missing-profile-thumbnail.jpg':'/illustrations/creators/jiwoo/coastal-walk-v2.png'};
 const video:PostMediaItem={type:'video',url:'/video_1.mp4',processing:state==='processing'};
 const groups=[[photo,photo],[video],[video,photo,video]];
 return <section className={s.section} id="profile-media"><div className={s.sectionHeading}><h2>프로필 미디어 탭</h2><p>사진·동영상이 있는 게시물만 표시합니다. 첫 미디어 썸네일과 유형별 개수를 보여주며 누르면 게시물로 이동합니다.</p></div>
  <SelectField label="미디어 상태" value={state} onChange={setState} options={[{value:'normal',label:'사진·동영상·혼합'},{value:'empty',label:'미디어 없음'},{value:'processing',label:'영상 최적화 중'},{value:'locked',label:'접근 제한'},{value:'error',label:'썸네일 오류'}]}/>
  <div style={{maxWidth:600,marginTop:20}}>{state==='empty'?<Empty title="아직 미디어가 없어요"/>:<div className={grid.postGrid}>{groups.map((media,index)=><PostMediaTile key={`${state}-${index}`} post={{...data.posts[0],title:['사진 게시물','동영상 게시물','혼합 게시물'][index],image:'',media,canAccess:state!=='locked'}} model={{data,basePath:'/preview',canAccess:()=>state!=='locked'}}/>)}</div>}</div>
 </section>;
}
