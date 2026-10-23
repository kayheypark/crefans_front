'use client';
import {createContext,useContext,type ReactNode} from 'react';
import {usePreview,usePreviewCreatorUpdate,usePreviewManagement} from '../service/PreviewProvider';
import {useMockOverview} from './useMockOverview';
import {useMockFinance} from './useMockFinance';
import {useMockCommunity} from './useMockCommunity';
import {useMockReports,currentActiveSubscribers} from './useMockReports';
import type {StudioOverviewModel} from '@/types/crefans-studio';
function useStudioState(){
 const fan=usePreview(),updateCreator=usePreviewCreatorUpdate();
 const management=usePreviewManagement(),finance=useMockFinance();
 const rawOverview=useMockOverview(fan.data.creators.find(creator=>creator.id==='haneul'),updateCreator);
 const community=useMockCommunity({today:fan.today,creatorName:rawOverview.profile.name,posts:management.contents.filter(item=>item.status==='published').map(item=>({id:item.id,title:item.title})),fans:management.subscribers.map(item=>({id:item.id,name:item.name,image:item.image||''}))});
 const activeSubscribers=currentActiveSubscribers(management.subscribers,fan.today);
 const followers=fan.data.creators.find(creator=>creator.id==='haneul')?.followerCount??0;
 const {reports}=useMockReports({finance,management,followers,today:fan.today});
 const overview:StudioOverviewModel={...rawOverview,
  series:rawOverview.series.map((point,index,points)=>{
    const current=`2026-${point.label.split('/').map(part=>part.padStart(2,'0')).join('-')}`;
    const previous=index?`2026-${points[index-1].label.split('/').map(part=>part.padStart(2,'0')).join('-')}`:'2026-08-31';
    return{...point,subscribers:management.subscribers.filter(member=>member.joinedAt<=current&&member.renewAt>=current).length,revenue:finance.data.earnings.filter(earning=>earning.date>previous&&earning.date<=current).reduce((sum,earning)=>sum+earning.gross,0)};
  }),
  metrics:rawOverview.metrics.map(metric=>metric.id==='revenue'?{...metric,label:'누적 순수익',value:finance.data.summary.net.toLocaleString('ko-KR'),description:'환불·수수료를 반영한 금액 · 원'}:metric.id==='subscribers'?{...metric,value:String(activeSubscribers),description:'갱신 해지 후 이용 기간이 남은 팬 포함'}:metric).map(metric=>{
    const response=reports[metric.id as keyof typeof reports]?.response;
    return response?.success?{...metric,points:response.data.chart.items.map(item=>item.value)}:metric;
  }),
  contentPerformance:management.contents.filter(item=>item.status==='published').map(content=>{const original=rawOverview.contentPerformance.find(item=>item.id===content.id);return{id:content.id,title:content.title,image:content.media.find(item=>item.type==='image')?.url||'',views:original?.views||0,likes:original?.likes||0,comments:original?.comments||0};}),
  tasks:[{id:'draft',title:`작성 중인 이야기 ${management.contents.filter(item=>item.status==='draft').length}개`,description:'준비된 이야기를 팬들에게 전해보세요.',path:'content?status=draft'},{id:'account',title:finance.data.accounts.some(account=>account.isDefault&&account.verified)?'출금 가능 금액을 확인해 보세요':'정산 계좌 확인이 필요해요',description:'정산부터 출금 요청까지 한곳에서 관리하세요.',path:finance.data.accounts.some(account=>account.isDefault&&account.verified)?'withdraw':'accounts'}],
 };
 return{overview,management,finance,community,reports};
}
type StudioState=ReturnType<typeof useStudioState>;
const Context=createContext<StudioState|null>(null);
export function StudioProvider({children}:{children:ReactNode}){const state=useStudioState();return <Context.Provider value={state}>{children}</Context.Provider>;}
export function useStudio(){const value=useContext(Context);if(!value)throw new Error('StudioProvider is required');return value;}
