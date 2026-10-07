'use client';
import StudioShell from '@/components/crefans/studio/StudioShell';
import {DashboardPage,AnalyticsPage,CreatorStartPage,CreatorSettingsPage} from '@/components/crefans/studio/OverviewPages';
import {ContentManagementPage,ContentEditorPage,MembershipManagementPage,SubscriberManagementPage} from '@/components/crefans/studio/ManagementPages';
import {EarningsPage,SettlementsPage,WithdrawalPage,WithdrawalsPage,SettlementAccountsPage} from '@/components/crefans/studio/FinancePages';
import {CreatorMessagesPage,CreatorCommentsPage} from '@/components/crefans/studio/CommunityPages';
import {useStudio} from './StudioProvider';
import {usePreview} from '../service/PreviewProvider';
import {ReportPage} from '@/components/crefans/studio/ReportPage';
import type {StudioReportId} from '@/types/crefans-studio-reports';
import {WithdrawalSecurityPage} from '@/components/crefans/studio/WithdrawalSecurityPage';
const basePath='/preview/studio';
export default function StudioRouter({segments}:{segments:string[]}){
 const [screen='',id]=segments,{overview,management,finance,community,reports}=useStudio(),fan=usePreview();
 const page=screen==='reports'?<ReportPage model={reports[(id||'revenue') as StudioReportId]} basePath={basePath}/>:screen==='start'?<CreatorStartPage model={overview} basePath={basePath}/>:screen==='content'?(id?<ContentEditorPage id={id==='new'?undefined:id} model={management} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id} basePath={basePath} commentsGloballyEnabled={overview.profile.commentsEnabled}/>:<ContentManagementPage model={management} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id} basePath={basePath} commentsGloballyEnabled={overview.profile.commentsEnabled}/>):screen==='memberships'?<MembershipManagementPage model={management} basePath={basePath}/>:screen==='subscribers'?<SubscriberManagementPage model={management} basePath={basePath}/>:screen==='messages'?<CreatorMessagesPage model={community} basePath={basePath}/>:screen==='comments'?<CreatorCommentsPage model={community} basePath={basePath}/>:screen==='analytics'?<AnalyticsPage model={overview} basePath={basePath}/>:screen==='earnings'?<EarningsPage model={finance} basePath={basePath}/>:screen==='settlements'?<SettlementsPage model={finance} basePath={basePath}/>:screen==='withdraw'?<WithdrawalPage model={finance} basePath={basePath}/>:screen==='withdrawals'?<WithdrawalsPage model={finance} basePath={basePath}/>:screen==='accounts'?<SettlementAccountsPage model={finance} basePath={basePath}/>:screen==='settings'?<CreatorSettingsPage model={overview} basePath={basePath} previewModel={fan} previewCreatorId={fan.data.creators.find(creator=>creator.handle===overview.profile.handle)?.id}/>:<DashboardPage model={overview} basePath={basePath}/>;
 return <StudioShell active={screen==='dashboard'?'':screen==='reports'?`reports/${id||'revenue'}`:screen} basePath={basePath} fanPath="/preview" profile={overview.profile} mock>{screen==='security'?<WithdrawalSecurityPage model={finance} basePath={basePath}/>:page}</StudioShell>;
}
