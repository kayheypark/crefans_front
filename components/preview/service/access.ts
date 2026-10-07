import type {Plan,Subscription} from '@/types/crefans';
/** Preview-only entitlement logic; production media access remains a server decision. */
export function hasPreviewAccess(subscriptions:Subscription[],creatorId:string,requiredRank:number,today:string,plans:Plan[],requiredPlanId?:string){
  if(requiredRank===0&&!requiredPlanId)return true;
  return subscriptions.some(subscription=>{
    if(subscription.creatorId!==creatorId||subscription.status==='expired'||subscription.renewAt<today)return false;
    if(requiredPlanId)return subscription.planId===requiredPlanId;
    const plan=subscription.planSnapshot??plans.find(plan=>plan.id===subscription.planId);
    return !!plan&&plan.entitlementMode!=='exact'&&plan.rank>=requiredRank;
  });
}
