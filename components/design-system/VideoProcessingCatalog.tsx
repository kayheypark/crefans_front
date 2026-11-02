'use client';
import {useState} from 'react';
import {MediaUpload} from '@/components/ui/MediaUpload';
import {SelectField} from '@/components/ui/Primitives';
import {ContentManagementPage} from '@/components/crefans/studio/ManagementPages';
import {PostCard,type PostCardModel} from '@/components/crefans/SocialPages';
import {useMockManagement} from '@/components/preview/studio/useMockManagement';
import {mockServiceResponse} from '@/components/preview/service/fixtures';
import {mediaUploadAccept} from '@/lib/design/image-upload';
import type {StudioMedia} from '@/types/crefans-studio-management';
import s from './custom.module.css';

export function VideoProcessingCatalog(){
 const [state,setState]=useState('processing'),[removed,setRemoved]=useState(false),management=useMockManagement();
 const data=mockServiceResponse.success?mockServiceResponse.data:null;if(!data)return null;
 const processing=state==='processing'||state==='preview';
 const media:StudioMedia={id:'catalog-video',type:'video',url:processing?'/api/v1/media/catalog-unfinished/file':'/video_1.mp4',processing,failed:state==='failed',preview:state==='preview'?'/video_1.mp4':undefined};
 const items=state==='empty'||removed?[]:[media];
 const post={...data.posts[0],title:'오늘의 촬영 이야기',image:'',media:items.filter(item=>!item.failed)};
 const postModel:PostCardModel={data,basePath:'/preview',canAccess:()=>true,liked:[],saved:[],toggleLike:()=>{},toggleSave:()=>{},likeCounts:{},commentCounts:{}};
 return <section className={s.section} id="video-processing"><div className={s.sectionHeading}><h2>영상 최적화 표시</h2><p>작성 1안 · 목록 2안 · 피드 1안. 상태는 예시이며 실제 파일을 업로드하거나 변환하지 않습니다.</p></div>
  <SelectField label="영상 처리 상태" value={state} onChange={value=>{setState(value);setRemoved(false);}} options={[{value:'processing',label:'최적화 중'},{value:'preview',label:'최적화 중 · 로컬 미리보기 있음'},{value:'ready',label:'완료'},{value:'failed',label:'실패'},{value:'empty',label:'미디어 없음'}]}/>
  <div data-processing-example="upload" style={{maxWidth:600,marginTop:24}}><h3>작성 화면</h3><MediaUpload label="파일 업로드" accept={mediaUploadAccept} items={items} max={10} onFilesSelect={()=>{}} onRemove={()=>setRemoved(true)} hint="JPG·PNG·WebP 5MB 이하 · MP4·WebM·MOV 300MB 이하"/></div>
  <div data-processing-example="list" style={{marginTop:32}}><ContentManagementPage model={{...management,contents:[{...management.contents[0],title:post.title,media:items}]}} basePath="/preview/studio"/></div>
  <div data-processing-example="feed" style={{maxWidth:600,marginTop:32}}><h3>팬 피드</h3><PostCard post={post} model={postModel}/></div>
 </section>;
}
