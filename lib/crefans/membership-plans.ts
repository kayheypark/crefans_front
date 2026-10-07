import type {Plan,ServiceData,Subscription} from '@/types/crefans';
import type {StudioMembership,StudioSubscriber} from '@/types/crefans-studio-management';

export const getCreatorPlans=(data:Pick<ServiceData,'plans'|'creatorPlans'>,creatorId:string)=>data.creatorPlans?.[creatorId]??data.plans;
export const getSubscriptionPlan=(data:Pick<ServiceData,'plans'|'creatorPlans'>,subscription:Subscription)=>subscription.planSnapshot??getCreatorPlans(data,subscription.creatorId).find(plan=>plan.id===subscription.planId);
export function canDeleteMembership(id:string,subscribers:StudioSubscriber[],today:string){
  return !subscribers.some(item=>item.planId===id&&item.status!=='expired'&&item.joinedAt<=today.slice(0,10)&&item.renewAt>=today.slice(0,10));
}
export function studioMembershipPlans(memberships:StudioMembership[],original:Plan[]):Plan[]{
  return memberships.map(item=>{
    const previous=original.find(plan=>plan.id===item.id);
    return {...previous,id:item.id,name:item.name,price:item.price,benefits:[...item.benefits],rank:previous?.rank??1,entitlementMode:previous?.entitlementMode??(previous?'tier':'exact'),image:item.image,version:item.version,available:item.active};
  });
}
