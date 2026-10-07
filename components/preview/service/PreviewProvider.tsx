'use client';
import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import type {ApiResult,ServiceData,ServiceViewModel,Subscription,Viewer,Creator} from '@/types/crefans';
import {ApiState} from '@/components/crefans/ApiState';
import {hasPreviewAccess} from './access';
import {initialSubscriptions,initialComments,initialReplies,mockServiceResponse} from './fixtures';
import {useMockAccount} from './useMockAccount';
import {useMockSocial} from './useMockSocial';
import {useMockCommon} from './useMockCommon';
import type {CommonModel} from '@/types/crefans-common';
import type {StudioManagementModel} from '@/types/crefans-studio-management';
import {useMockManagement} from '../studio/useMockManagement';
import {canDeleteMembership,getCreatorPlans,studioMembershipPlans} from '@/lib/crefans/membership-plans';
const basePath='/preview',today='2026-09-12',nextRenewAt='2026-10-12',signedInKey='crefans-preview-signed-in';
function usePreviewState(data:ServiceData):ServiceViewModel{
  // Mock persona starts signed in; 로그아웃 is remembered for the tab (sessionStorage) so guest screens can be tested after a reload.
  const [signedIn,setSignedIn]=useState(true),restored=useRef(false);
  useEffect(()=>{try{if(sessionStorage.getItem(signedInKey)==='false')setSignedIn(false);}catch{}restored.current=true;},[]);
  useEffect(()=>{if(!restored.current)return;try{sessionStorage.setItem(signedInKey,String(signedIn));}catch{}},[signedIn]);
  const [viewer,setViewer]=useState<Viewer>({name:'팬지민',handle:'fanjimin',bio:'좋아하는 순간들을 모으고 있어요.',image:'/illustrations/redesign/yerin.png'});
  const [following,setFollowing]=useState<string[]>(['haneul','jiwoo']);
  const [liked,setLiked]=useState<string[]>([]),[saved,setSaved]=useState<string[]>([]);
  const [subscriptions,setSubscriptions]=useState<Subscription[]>(()=>initialSubscriptions.map(item=>{const plan=item.planSnapshot??getCreatorPlans(data,item.creatorId).find(plan=>plan.id===item.planId);return {...item,planSnapshot:plan?{...plan,benefits:[...plan.benefits]}:undefined};}));
  const toggleFollow=(id:string)=>setFollowing(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);
  const toggleLike=(id:string)=>setLiked(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);
  const toggleSave=(id:string)=>setSaved(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);
  const subscribe:ServiceViewModel['subscribe']=async(creatorId,planId)=>{
    const plan=getCreatorPlans(data,creatorId).find(p=>p.id===planId);
    if(!plan||plan.available===false||!data.creators.some(c=>c.id===creatorId))return{success:false,data:null,errorMessage:'선택한 멤버십을 확인해주세요.',errorCode:'MEMBERSHIP_NOT_FOUND'};
    setSubscriptions(p=>[{creatorId,planId,status:'active',renewAt:nextRenewAt,price:plan.price,planSnapshot:{...plan,benefits:[...plan.benefits]}},...p.filter(s=>s.creatorId!==creatorId)]);
    return{success:true,data:{message:'멤버십 가입이 완료되었습니다.'},errorMessage:null,errorCode:null};
  };
  const cancelSubscription:ServiceViewModel['cancelSubscription']=async(creatorId)=>{
    if(!subscriptions.some(s=>s.creatorId===creatorId&&s.status==='active'))return{success:false,data:null,errorMessage:'갱신을 해지할 구독이 없어요.',errorCode:'SUBSCRIPTION_NOT_FOUND'};
    setSubscriptions(p=>p.map(s=>s.creatorId===creatorId?{...s,status:'cancelled'}:s));
    return{success:true,data:{message:'자동 갱신을 해지했습니다. 안내된 이용 기간까지 멤버십을 이용할 수 있습니다.'},errorMessage:null,errorCode:null};
  };
  const canAccess:ServiceViewModel['canAccess']=(creatorId,rank,requiredPlanId)=>hasPreviewAccess(subscriptions,creatorId,rank,today,getCreatorPlans(data,creatorId),requiredPlanId);
  const account=useMockAccount({viewer,setViewer,setSignedIn,basePath,creators:data.creators});
  const social=useMockSocial({data,viewer,canAccess,today,initialComments,initialReplies,liked});
  return{data,mode:'mock',basePath,ownCreatorIds:['haneul'],today,nextRenewAt,signedIn,setSignedIn,viewer,setViewer,following,toggleFollow,liked,toggleLike,saved,toggleSave,subscriptions,subscribe,cancelSubscription,canAccess,...account,...social};
}
const Context=createContext<ServiceViewModel|null>(null);
const CommonContext=createContext<CommonModel|null>(null);
const Controls=createContext<((id:string,patch:Partial<Creator>)=>void)|null>(null);
const ManagementContext=createContext<StudioManagementModel|null>(null);
function StateProvider({data,children}:{data:ServiceData;children:ReactNode}){
  const [currentData,setData]=useState(()=>({...data,paymentHistory:data.paymentHistory.map(item=>{const plan=item.planSnapshot??getCreatorPlans(data,item.creatorId).find(plan=>plan.id===item.planId);return {...item,planSnapshot:plan?{...plan,benefits:[...plan.benefits]}:undefined};})}));
  const protectedPlans=useRef<string[]>([]);
  const management=useMockManagement({getProtectedPlanIds:()=>protectedPlans.current});
  const serviceData={...currentData,creatorPlans:{...currentData.creatorPlans,haneul:studioMembershipPlans(management.memberships,currentData.plans)}};
  const state=usePreviewState(serviceData);
  protectedPlans.current=state.subscriptions.filter(item=>item.creatorId==='haneul'&&item.status!=='expired'&&item.renewAt>=today).map(item=>item.planId);
  const sharedManagement={...management,memberships:management.memberships.map(item=>({...item,canDelete:canDeleteMembership(item.id,management.subscribers,today)&&!protectedPlans.current.includes(item.id)}))};
  const common=useMockCommon({email:state.account.email});
  const model:ServiceViewModel={...state,account:{...state.account,paymentMethods:common.paymentMethods},accountActions:state.accountActions};
  const updateCreator=(id:string,patch:Partial<Creator>)=>setData(previous=>({...previous,creators:previous.creators.map(creator=>creator.id===id?{...creator,...patch}:creator)}));
  return <Context.Provider value={model}><CommonContext.Provider value={common}><Controls.Provider value={updateCreator}><ManagementContext.Provider value={sharedManagement}>{children}</ManagementContext.Provider></Controls.Provider></CommonContext.Provider></Context.Provider>;
}
export function PreviewProvider({children,response=mockServiceResponse}:{children:ReactNode;response?:ApiResult<ServiceData>}){return <ApiState response={response}>{data=><StateProvider data={data}>{children}</StateProvider>}</ApiState>;}
export function usePreview(){const value=useContext(Context);if(!value)throw new Error('PreviewProvider is required');return value;}

export function usePreviewCreatorUpdate(){const value=useContext(Controls);if(!value)throw new Error('PreviewProvider is required');return value;}

export function usePreviewCommon(){const value=useContext(CommonContext);if(!value)throw new Error('PreviewProvider is required');return value;}
export function usePreviewManagement(){const value=useContext(ManagementContext);if(!value)throw new Error('PreviewProvider is required');return value;}
