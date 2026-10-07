'use client';
import StudioShell from '@/components/crefans/studio/StudioShell';
import {DashboardPage,AnalyticsPage,CreatorStartPage,CreatorSettingsPage} from '@/components/crefans/studio/OverviewPages';
import {ContentManagementPage,ContentEditorPage,MembershipManagementPage,SubscriberManagementPage} from '@/components/crefans/studio/ManagementPages';
import {EarningsPage,SettlementsPage,WithdrawalPage,WithdrawalsPage,SettlementAccountsPage} from '@/components/crefans/studio/FinancePages';
import {CreatorMessagesPage,CreatorCommentsPage} from '@/components/crefans/studio/CommunityPages';
import {useStudioModel} from '@/features/service/useStudioModel';
import {SignInPrompt} from '@/components/crefans/AccountPages';
import ServiceShell from '@/components/crefans/ServiceShell';
import {useService} from './ServiceProvider';
import {ReportPage} from '@/components/crefans/studio/ReportPage';
import type {StudioReportId} from '@/types/crefans-studio-reports';
import {WithdrawalSecurityPage} from '@/components/crefans/studio/WithdrawalSecurityPage';
const basePath='/service/studio';
export default function StudioRouter({segments}:{segments:string[]}){
 const [screen='',id]=segments,{model:fan}=useService(),{overview,management,finance,community,reports,error,loading,refresh}=useStudioModel(fan.signedIn);
 if(!fan.signedIn)return <ServiceShell model={fan} active="studio" auth><SignInPrompt basePath="/service" description="크리에이터 스튜디오를 이용하려면 로그인해주세요."/></ServiceShell>;
 if(loading)return <p role="status">불러오는 중…</p>;
 if(!overview||!management||!finance||!community)return <div role="alert"><p>{error||'화면을 불러오지 못했습니다.'}</p><button onClick={()=>void refresh()}>다시 불러오기</button></div>;
 const page=screen==='reports'?<ReportPage model={reports[(id||'revenue') as StudioReportId]} basePath={basePath}/>:screen==='start'?<CreatorStartPage model={overview} basePath={basePath}/>:screen==='content'?(id?<ContentEditorPage id={id==='new'?undefined:id} model={management} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id} basePath={basePath} commentsGloballyEnabled={overview.profile.commentsEnabled}/>:<ContentManagementPage model={management} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id} basePath={basePath} commentsGloballyEnabled={overview.profile.commentsEnabled}/>):screen==='memberships'?<MembershipManagementPage model={management} basePath={basePath}/>:screen==='subscribers'?<SubscriberManagementPage model={management} basePath={basePath}/>:screen==='messages'?<CreatorMessagesPage model={community} basePath={basePath}/>:screen==='comments'?<CreatorCommentsPage model={community} basePath={basePath}/>:screen==='analytics'?<AnalyticsPage model={overview} basePath={basePath}/>:screen==='earnings'?<EarningsPage model={finance} basePath={basePath}/>:screen==='settlements'?<SettlementsPage model={finance} basePath={basePath}/>:screen==='withdraw'?<WithdrawalPage model={finance} basePath={basePath}/>:screen==='withdrawals'?<WithdrawalsPage model={finance} basePath={basePath}/>:screen==='accounts'?<SettlementAccountsPage model={finance} basePath={basePath}/>:screen==='settings'?<CreatorSettingsPage model={overview} basePath={basePath} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id}/>:<DashboardPage model={overview} basePath={basePath}/>;
 return <StudioShell active={screen==='dashboard'?'':screen==='reports'?`reports/${id||'revenue'}`:screen} basePath={basePath} fanPath="/service" profile={overview.profile}>{!overview.started?<CreatorStartPage model={overview} basePath={basePath}/>:screen==='security'?<WithdrawalSecurityPage model={finance} basePath={basePath}/>:page}</StudioShell>;
}
