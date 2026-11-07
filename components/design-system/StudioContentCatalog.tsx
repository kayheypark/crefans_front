'use client';
import {useState} from 'react';
import {ContentManagementPage} from '@/components/crefans/studio/ManagementPages';
import {useMockManagement} from '@/components/preview/studio/useMockManagement';
import {SelectField} from '@/components/ui/SelectField';
import s from './custom.module.css';

export function StudioContentCatalog(){
  const [state,setState]=useState('normal'),model=useMockManagement();
  const contents=state==='empty'?[]:model.contents.map((item,index)=>state==='long'?{...item,title:'긴 게시물 제목에서도 썸네일과 상태를 확인하고 미리보기·수정·삭제할 수 있어요 '.repeat(3),hiddenByOperator:true,commentsEnabled:false}:state==='unpublished'&&index<2?{...item,unpublished:true,...(index===1?{hiddenByOperator:true}:{})}:state==='processing'&&index===0?{...item,media:[{id:'processing-example',type:'video' as const,url:'',processing:true}]}:item);
  const actions=state==='error'?{...model.actions,deleteContent:async()=>({success:false as const,data:null,errorMessage:'게시물을 삭제하지 못했어요. 다시 시도해주세요.',errorCode:'CATALOG_ERROR'})}:state==='pending'?{...model.actions,deleteContent:()=>new Promise<never>(()=>{})}:model.actions;
  return <section className={s.section} id="studio-content-catalog"><div className={s.sectionHeading}><h2>스튜디오 게시물 통합 카드</h2><p>모바일은 상세를 펼치는 카드, PC는 기존 표로 표시합니다. 아래는 예시 데이터입니다.</p></div><SelectField label="게시물 목록 상태" value={state} onChange={setState} options={[{value:'normal',label:'일반'},{value:'empty',label:'빈 목록'},{value:'long',label:'긴 제목·숨김·댓글 닫힘'},{value:'unpublished',label:'미공개·운영 숨김'},{value:'processing',label:'영상 최적화 중'},{value:'error',label:'삭제 실패'},{value:'pending',label:'삭제 처리 중'}]}/><div style={{marginTop:24}}><ContentManagementPage key={state} model={{...model,contents,actions}} basePath="/preview/studio"/></div></section>;
}
