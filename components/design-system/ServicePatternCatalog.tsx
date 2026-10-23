'use client';
import {TextLink} from '@/components/ui/TextLink';
import {DialogActions} from '@/components/ui/DialogActions';
import {useState} from 'react';
import {CreatorCard} from '@/components/crefans/CreatorCard';
import {FollowButton} from '@/components/crefans/FollowButton';
import {MembershipPlanCard} from '@/components/crefans/MembershipPlanCard';
import {PostCard,type PostCardModel} from '@/components/crefans/SocialPages';
import {MetricCard} from '@/components/crefans/studio/OverviewPages';
import {LedgerRow,AmountRows} from '@/components/crefans/studio/FinancePages';
import {Action,Empty,Notice,PageTitle} from '@/components/crefans/ServiceUI';
import {ApiState} from '@/components/crefans/ApiState';
import {Dialog,SelectField} from '@/components/ui/Primitives';
import {mockServiceResponse} from '@/components/preview/service/fixtures';
import {screenLinks,studioLinks,commonLinks} from '@/components/preview/screen-catalog';
import {ChartMotionCatalog} from './ChartMotionCatalog';
import s from './custom.module.css';

const screens=[...screenLinks,...studioLinks,...commonLinks];
export function ServicePatternCatalog(){
 const [following,setFollowing]=useState(false),[plan,setPlan]=useState('standard'),[locked,setLocked]=useState(false),[liked,setLiked]=useState<string[]>([]),[saved,setSaved]=useState<string[]>([]),[dialog,setDialog]=useState(''),[screen,setScreen]=useState('messages');
 const [apiState,setApiState]=useState('loading');
 const data=mockServiceResponse.success?mockServiceResponse.data:null;
 if(!data)return null;
 const post=data.posts[0];
 const postModel:PostCardModel={data,basePath:'/preview',canAccess:()=>!locked,liked,saved,toggleLike:id=>setLiked(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id]),toggleSave:id=>setSaved(value=>value.includes(id)?value.filter(item=>item!==id):[...value,id]),likeCounts:{[post.id]:post.likes+(liked.includes(post.id)?1:0)},commentCounts:{}};
 return <>
  <section className={s.section}><div className={s.sectionHeading}><h2>서비스에서 사용하는 컴포넌트</h2><p>목업과 같은 컴포넌트에 예시 데이터를 주입했습니다. 여기서 확인한 디자인이 실제 목업 화면에도 적용됩니다.</p></div>
   <div className={s.patternGrid}><div className={s.patternExample}><h3>팔로우 버튼</h3><p className={s.muted}>탐색 카드·프로필·팔로잉 목록이 같은 컴포넌트를 씁니다. 팔로우 중일 때 누르면 해제 확인 모달이 먼저 뜹니다.</p><div className={s.row}><FollowButton following={following} name={data.creators[1].name} onToggle={()=>setFollowing(!following)}/><FollowButton following={false} name={data.creators[1].name} onToggle={()=>{}} disabled/></div></div><div className={s.patternExample}><h3>크리에이터 카드 · 탐색</h3><CreatorCard creator={data.creators[1]} href="/preview/creator/jiwoo" following={following} onFollow={()=>setFollowing(value=>!value)}/></div><div className={s.patternExample}><h3>멤버십 카드 · 구독</h3><MembershipPlanCard plan={data.plans.find(item=>item.id===plan)||data.plans[0]} selected onSelect={()=>setDialog('선택한 멤버십')}/><div style={{marginTop:20}}><SelectField label="멤버십 데이터 변경" options={data.plans.map(item=>({value:item.id,label:item.name}))} value={plan} onChange={setPlan}/></div></div></div>
  </section>
  <section className={s.section}><div className={s.sectionHeading}><h2>피드와 접근 권한</h2><p>게시물·프로필·좋아요·저장·접근 제한을 같은 피드 컴포넌트에서 확인합니다.</p></div><label className={s.check}><input type="checkbox" checked={locked} onChange={e=>setLocked(e.target.checked)}/>멤버십 전용으로 잠그기</label><div style={{maxWidth:600}}><PostCard post={{...post,requiredRank:locked?2:0}} model={postModel}/></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>크리에이터 스튜디오</h2><p>지표, 추이, 정산 내역과 금액 상세도 스튜디오에서 쓰는 그대로 표시합니다.</p></div><div className={s.patternGrid}><MetricCard metric={{id:'members',label:'함께하는 구독자',value:'128',description:'현재 유효한 멤버십',points:[12,21,18,28,25,34,40]}}/><div className={s.patternExample}><h3>금액 상세</h3><AmountRows gross={199000} reversals={19900} fees={17910} net={161190}/></div></div><div className={s.patternExample} style={{marginTop:24}}><h3>정산 내역 행</h3><LedgerRow title="9월 멤버십 정산" detail="2026.09.12" amount={161190} status={<span>정산 대기</span>} onClick={()=>setDialog('정산 상세')}/><LedgerRow title="금액을 불러오지 못한 내역" detail="금액 데이터 없음" amount={null} onClick={()=>setDialog('정산 상세')}/></div></section>
  <section className={s.section}><div className={s.sectionHeading}><h2>제목과 안내·데이터 상태</h2><p>데이터가 없거나 오류가 난 경우에도 예시 콘텐츠를 자동으로 채우지 않습니다.</p></div><div className={s.patternExample}><PageTitle action={<Action onClick={()=>setDialog('새 게시물')}>새 게시물</Action>}>콘텐츠 관리</PageTitle><Notice>받은 안내 문구가 있을 때만 표시합니다.</Notice><div className={s.row}><Action variant="primary">기본 행동</Action><Action variant="brand">주요 행동</Action><Action variant="secondary">보조 행동</Action><Action disabled>비활성</Action></div><Empty title="아직 콘텐츠가 없어요" description="첫 이야기를 작성해 보세요." action={<Action onClick={()=>setDialog('새 게시물')}>작성하기</Action>}/></div><div style={{marginTop:24}}><SelectField label="데이터 상태" value={apiState} onChange={setApiState} options={[{value:'loading',label:'불러오는 중'},{value:'error',label:'요청 실패'},{value:'success',label:'성공'}]}/><ApiState loading={apiState==='loading'} response={apiState==='error'?{success:false,data:null,errorMessage:'내용을 불러오지 못했습니다.',errorCode:'PREVIEW_ERROR'}:{success:true,data:'전달받은 내용입니다.',errorMessage:null,errorCode:null}} onRetry={()=>setApiState('success')}>{text=><p>{text}</p>}</ApiState></div></section>
  <ChartMotionCatalog/>
  <section className={s.section}><div className={s.sectionHeading}><h2>화면별 구성 미리보기</h2><p>헤더·탭·메시지·알림·목록 등 전체 구성을 실제 목업 페이지로 확인합니다. 아래 선택창에서 팬·스튜디오·공통 화면을 모두 열 수 있습니다.</p></div><SelectField label="확인할 화면" options={screens.map(([value,label])=>({value,label}))} searchable value={screen} onChange={setScreen}/><p className={s.muted}>{screens.find(item=>item[0]===screen)?.[2]} · <TextLink href={`/preview/${screen}`} target="_blank" rel="noreferrer">새 탭에서 확인</TextLink></p><iframe className={s.screenFrame} src={`/preview/${screen}`} title={`${screens.find(item=>item[0]===screen)?.[1]} 구성 미리보기`}/></section>
  <Dialog open={!!dialog} title={dialog} onClose={()=>setDialog('')}><p>컴포넌트에서 전달한 행동을 확인하는 예시입니다.</p><DialogActions><Action onClick={()=>setDialog('')}>확인</Action></DialogActions></Dialog>
 </>;
}
