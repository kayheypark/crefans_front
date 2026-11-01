import type {Plan,Post,ServiceData,Subscription} from '@/types/crefans';
import type {StudioMembership,StudioSubscriber} from '@/types/crefans-studio-management';

export const getCreatorPlans=(data:Pick<ServiceData,'plans'|'creatorPlans'>,creatorId:string)=>data.creatorPlans?.[creatorId]??data.plans;
export const getSubscriptionPlan=(data:Pick<ServiceData,'plans'|'creatorPlans'>,subscription:Subscription)=>subscription.planSnapshot??getCreatorPlans(data,subscription.creatorId).find(plan=>plan.id===subscription.planId);
/** Display current offers only. Access remains decided by the server/subscription snapshot. */
export function getPostMembershipOffer(data:Pick<ServiceData,'plans'|'creatorPlans'>,post:Pick<Post,'creatorId'|'requiredRank'|'requiredPlanId'>){
  const eligible=getCreatorPlans(data,post.creatorId).filter(plan=>post.requiredPlanId?plan.id===post.requiredPlanId:plan.rank>=post.requiredRank).sort((a,b)=>a.rank-b.rank);
  const required=eligible[0];
  return {
    label:required?`${required.name}${post.requiredPlanId?' 전용':' 이상'}`:'멤버십 전용',
    description:required?(post.requiredPlanId?`${required.name} 멤버십 전용입니다.`:`${required.name} 이상의 멤버십으로 볼 수 있습니다.`):'크리에이터의 멤버십 구독이 필요합니다.',
    plans:eligible.filter(plan=>plan.available!==false),
  };
}
export function canDeleteMembership(id:string,subscribers:StudioSubscriber[],today:string){
  return !subscribers.some(item=>item.planId===id&&item.status!=='expired'&&item.joinedAt<=today.slice(0,10)&&item.renewAt>=today.slice(0,10));
}
export function studioMembershipPlans(memberships:StudioMembership[],original:Plan[]):Plan[]{
  return memberships.map(item=>{
    const previous=original.find(plan=>plan.id===item.id);
    return {...previous,id:item.id,name:item.name,price:item.price,benefits:[...item.benefits],rank:item.rank??previous?.rank??1,entitlementMode:'tier',image:item.image,version:item.version,available:item.active};
  });
}
