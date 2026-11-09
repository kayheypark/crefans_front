// Mirrors server beanPolicy (2026-10-30, D6): unused purchased beans refund in full within 7 days of payment, 10% is kept after;
// purchased and ordinary promotion beans expire 1 year after payment/grant (5 years until fef0a50, 2026-11-06; server bean-policy.ts validityYears:1); event lots use their explicit expiry with a notice 30 days ahead. Promotion beans are never refunded.
export const beanRefundPolicy=Object.freeze({fullDays:7,deductionBps:1000,validityYears:1,expiryNoticeDays:30});
const day=86400000;
export const beanValidUntil=(from:string|Date)=>{const d=new Date(from);d.setFullYear(d.getFullYear()+beanRefundPolicy.validityYears);return d;};
export function beanRefundTerms(charge:{amount:number;quantity:number;paidAt?:string|null},unused:number,now=new Date()){
 const q=charge.paidAt&&beanValidUntil(charge.paidAt)>now?Math.max(0,unused):0,gross=Math.floor(charge.amount*q/charge.quantity),full=!!charge.paidAt&&now.getTime()-new Date(charge.paidAt).getTime()<=beanRefundPolicy.fullDays*day,deduction=full?0:Math.floor(gross*beanRefundPolicy.deductionBps/10000);
 return{quantity:q,gross,deduction,amount:gross-deduction,fullRefundWindow:full,waived:false};
}
// Spending uses the oldest purchased lot first, so the purchased balance left belongs to the newest paid charges.
export function unusedPurchasedBeans(charges:{id:string;quantity:number;status:string;paidAt?:string|null;refundedQuantity?:number}[],purchasedBalance:number){
 const left=new Map<string,number>();let rest=Math.max(0,purchasedBalance);
 for(const c of charges.filter(c=>c.status==='paid'&&c.paidAt).sort((a,b)=>b.paidAt!.localeCompare(a.paidAt!))){const n=Math.min(rest,c.quantity-(c.refundedQuantity||0));left.set(c.id,n);rest-=n;}
 return left;
}
export function expiringSoonBeans(lots:{quantity:number;from:string;expiresAt?:string}[],now=new Date()){
 const until=now.getTime()+beanRefundPolicy.expiryNoticeDays*day,soon=lots.map(l=>({quantity:l.quantity,expiresAt:l.expiresAt?new Date(l.expiresAt):beanValidUntil(l.from)})).filter(l=>l.quantity>0&&l.expiresAt>now&&l.expiresAt.getTime()<=until).sort((a,b)=>a.expiresAt.getTime()-b.expiresAt.getTime());
 return soon.length?{quantity:soon.reduce((n,l)=>n+l.quantity,0),expiresAt:soon[0].expiresAt.toISOString()}:null;
}
export const beanExpiryDate=(value:string)=>new Date(value).toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}).replaceAll('-','.');
// After a refund request: only 'done' is a refund; 'processing' is still being confirmed with the PG (the server retries it).
// A definite refusal needs a new request id; an unknown result keeps the same one so a retry cannot refund twice.
export function beanRefundOutcome(result:{success:boolean;data?:{status:string}|null;errorCode?:string|null},requestId:string,newRequestId:()=>string){
 if(!result.success)return{kind:'error' as const,requestId:result.errorCode==='PAYMENT_UNCERTAIN'?requestId:newRequestId()};
 return{kind:result.data?.status==='done'?'done' as const:'processing' as const,requestId};
}
