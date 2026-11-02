'use client';
import {useMockFoundingBadge} from './useMockFoundingBadge';
import {previewViewer} from '../founding-members';
import {BeanContext} from '@/components/crefans/BeanContext';
import {useMockBeans} from './useMockBeans';
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
const basePath='/preview',today='2026-09-12',nextRenewAt='2026-10-12',signedInKey='crefans-preview-signed-in',personaKey='crefans-preview-creator';
function usePreviewState(data:ServiceData,creatorId:string,onCreatorLogin:(id:string)=>void,onProfileChange:(id:string,patch:Partial<Creator>)=>void):ServiceViewModel{
  const profileCreator=data.creators.find(item=>item.id===creatorId);
  const creator=creatorId==='moka'?data.creators.find(item=>item.id===creatorId):undefined;
  // Mock persona starts signed in; 로그아웃 is remembered for the tab (sessionStorage) so guest screens can be tested after a reload.
  const [signedIn,setSignedIn]=useState(true),restored=useRef(false);
  useEffect(()=>{try{if(sessionStorage.getItem(signedInKey)==='false')setSignedIn(false);}catch{}restored.current=true;},[]);
  useEffect(()=>{if(!restored.current)return;try{sessionStorage.setItem(signedInKey,String(signedIn));}catch{}},[signedIn]);
  const [localViewer,setLocalViewer]=useState<Viewer>(creator?{name:creator.name,handle:creator.handle,bio:creator.bio,image:creator.image}:{...previewViewer,isFoundingMember:false});
  const viewer={...localViewer,bio:profileCreator?.bio??localViewer.bio};
  const setViewer:ServiceViewModel['setViewer']=value=>{const next=typeof value==='function'?value(viewer):value;setLocalViewer(next);if(profileCreator&&next.bio!==viewer.bio)onProfileChange(profileCreator.id,{bio:next.bio});};
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
  const canAccess:ServiceViewModel['canAccess']=(creatorId,rank,requiredPlanId)=>creatorId===creator?.id||hasPreviewAccess(subscriptions,creatorId,rank,today,getCreatorPlans(data,creatorId),requiredPlanId);
  const account=useMockAccount({viewer,setViewer,setSignedIn,basePath,creators:data.creators,onCreatorLogin,initialEmail:creator?'moka@gmail.com':undefined});
  const foundingBadge=useMockFoundingBadge(setViewer);
  const social=useMockSocial({data,viewer,canAccess,today,initialComments,initialReplies,liked});
  return{data,foundingBadge,mode:'mock',basePath,ownCreatorIds:[creatorId],today,nextRenewAt,signedIn,setSignedIn,viewer,setViewer,following,toggleFollow,liked,toggleLike,saved,toggleSave,subscriptions,subscribe,cancelSubscription,canAccess,...account,...social};
}
const Context=createContext<ServiceViewModel|null>(null);
const CommonContext=createContext<CommonModel|null>(null);
const Controls=createContext<((id:string,patch:Partial<Creator>)=>void)|null>(null);
const ManagementContext=createContext<StudioManagementModel|null>(null);
// UI-only preview persona switch; never authenticates a service member.
const MokaLoginContext=createContext<(()=>void)|null>(null);
function StateProvider({data,children,creatorId,onCreatorLogin}:{data:ServiceData;children:ReactNode;creatorId:string;onCreatorLogin:(id:string)=>void}){
  const [currentData,setData]=useState(()=>({...data,paymentHistory:data.paymentHistory.map(item=>{const plan=item.planSnapshot??getCreatorPlans(data,item.creatorId).find(plan=>plan.id===item.planId);return {...item,planSnapshot:plan?{...plan,benefits:[...plan.benefits]}:undefined};})}));
  const protectedPlans=useRef<string[]>([]);
  const management=useMockManagement({getProtectedPlanIds:()=>protectedPlans.current,...(creatorId==='moka'?{
    initialContents:data.posts.filter(post=>post.creatorId===creatorId).map(post=>({id:post.id,title:post.title,body:post.body,media:(post.media||[{type:'image' as const,url:post.image}]).map((media,index)=>({...media,id:`${post.id}-${index}`})),commentsEnabled:post.commentsEnabled!==false,tipsEnabled:post.tipsEnabled!==false,accessPlanId:post.requiredPlanId||null,accessLevel:post.requiredPlanId?null:post.requiredRank||null,status:'published' as const,scheduledAt:null,updatedAt:'2026-09-12T09:00:00.000Z'})),
    initialMemberships:getCreatorPlans(data,creatorId).map(plan=>({...plan,active:plan.available!==false,version:plan.version||1})),initialSubscribers:[],
  }: {})});
  const serviceData={...currentData,posts:currentData.posts.map(post=>({...post,tipsEnabled:management.contents.find(item=>post.creatorId===creatorId&&item.id===post.id)?.tipsEnabled??post.tipsEnabled??true})),creatorPlans:{...currentData.creatorPlans,[creatorId]:studioMembershipPlans(management.memberships,getCreatorPlans(currentData,creatorId))}};
  const updateCreator=(id:string,patch:Partial<Creator>)=>setData(previous=>({...previous,creators:previous.creators.map(creator=>creator.id===id?{...creator,...patch}:creator)}));
  const state=usePreviewState(serviceData,creatorId,onCreatorLogin,updateCreator);
  const beans=useMockBeans(state.signedIn,data.creators,serviceData.posts,[creatorId]);
  protectedPlans.current=state.subscriptions.filter(item=>item.creatorId===creatorId&&item.status!=='expired'&&item.renewAt>=today).map(item=>item.planId);
  const sharedManagement={...management,memberships:management.memberships.map(item=>({...item,canDelete:canDeleteMembership(item.id,management.subscribers,today)&&!protectedPlans.current.includes(item.id)}))};
  const common=useMockCommon({email:state.account.email});
  const model:ServiceViewModel={...state,account:{...state.account,paymentMethods:common.paymentMethods},accountActions:state.accountActions};
  return <MokaLoginContext.Provider value={()=>{state.setSignedIn(true);onCreatorLogin('moka');}}><Context.Provider value={model}><BeanContext.Provider value={beans}><CommonContext.Provider value={common}><Controls.Provider value={updateCreator}><ManagementContext.Provider value={sharedManagement}>{children}</ManagementContext.Provider></Controls.Provider></CommonContext.Provider></BeanContext.Provider></Context.Provider></MokaLoginContext.Provider>;
}
export function PreviewProvider({children,response=mockServiceResponse}:{children:ReactNode;response?:ApiResult<ServiceData>}){const [creatorId,setCreatorId]=useState('haneul');
  useEffect(()=>{try{if(sessionStorage.getItem(personaKey)==='moka')setCreatorId('moka');}catch{}},[]);
  const selectCreator=(id:string)=>{try{sessionStorage.setItem(personaKey,id);sessionStorage.setItem(signedInKey,'true');}catch{}setCreatorId(id);};
  return <ApiState response={response}>{data=><StateProvider key={creatorId} creatorId={creatorId} onCreatorLogin={selectCreator} data={data}>{children}</StateProvider>}</ApiState>;}
export function usePreview(){const value=useContext(Context);if(!value)throw new Error('PreviewProvider is required');return value;}

export function usePreviewCreatorUpdate(){const value=useContext(Controls);if(!value)throw new Error('PreviewProvider is required');return value;}

export function usePreviewCommon(){const value=useContext(CommonContext);if(!value)throw new Error('PreviewProvider is required');return value;}
export function usePreviewManagement(){const value=useContext(ManagementContext);if(!value)throw new Error('PreviewProvider is required');return value;}

export function usePreviewMokaLogin(){const value=useContext(MokaLoginContext);if(!value)throw new Error('PreviewProvider is required');return value;}
