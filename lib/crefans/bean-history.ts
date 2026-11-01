import type {BeanCharge,BeanHistoryQuery,BeanTip,BeanWallet} from '@/types/crefans-beans';

export type BeanHistoryFilters={period:string;status:string;direction:string;sourceType:string;search:string};
export const emptyBeanHistoryFilters:BeanHistoryFilters={period:'all',status:'all',direction:'all',sourceType:'all',search:''};
/** Display reference only. Payment and ownership checks always use the internal order ID. */
export function beanOrderNumber(createdAt?:string|null){
 const timestamp=createdAt?Date.parse(createdAt):NaN;
 return Number.isFinite(timestamp)?'CF-'+new Date(timestamp+9*3600000).toISOString().slice(0,19).replace(/[-T:]/g,''):'확인 불가';
}
export function beanHistoryQuery(filters:BeanHistoryFilters,now=new Date()):BeanHistoryQuery{
 const query:BeanHistoryQuery={};
 if(filters.period!=='all'){
  const today=new Date(now.getTime()+9*3600000),year=today.getUTCFullYear(),month=today.getUTCMonth(),day=today.getUTCDate();
  const start=new Date(Date.UTC(year,month-Number(filters.period),1));
  const lastDay=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate();
  start.setUTCDate(Math.min(day,lastDay));
  query.from=start.toISOString().slice(0,10);query.to=today.toISOString().slice(0,10);
 }
 if(filters.status!=='all')query.status=filters.status;
 if(filters.direction==='in'||filters.direction==='out')query.direction=filters.direction;
 if(filters.sourceType==='post'||filters.sourceType==='profile')query.sourceType=filters.sourceType;
 if(filters.search.trim())query.q=filters.search.trim();
 return query;
}
export function beanHistoryParams(page:number,query:BeanHistoryQuery={},tips=false){
 const params=new URLSearchParams({page:String(page)});
 for(const key of (tips?['from','to','q','sourceType']:['from','to','status','direction']) as (keyof BeanHistoryQuery)[])if(query[key])params.set(key,query[key]!);
 return params.toString();
}
/** The preview and catalog filter the complete fixtures before pagination, just as the API does. */
export function filterBeanHistory(charges:BeanCharge[],entries:BeanWallet['entries'],tips:BeanTip[],query:BeanHistoryQuery={}){
 const inRange=(value?:string|null)=>{
  if(!query.from&&!query.to)return true;
  const time=value?Date.parse(value):NaN;
  return Number.isFinite(time)&&(!query.from||time>=Date.parse(query.from+'T00:00:00+09:00'))&&(!query.to||time<Date.parse(query.to+'T00:00:00+09:00')+86400000);
 };
 return {
  charges:charges.filter(item=>inRange(item.createdAt)&&(!query.status||item.status===query.status)),
  entries:entries.filter(item=>inRange(item.created_at)&&(!query.direction||(query.direction==='in'?Number(item.delta)>0:Number(item.delta)<0))),
  tips:tips.filter(item=>inRange(item.created_at)&&(!query.sourceType||(item.sourceType==='post'||!!item.post_id?'post':'profile')===query.sourceType)&&(!query.q||[item.creatorName||'',item.postTitle||'',item.message].some(text=>text.toLocaleLowerCase().includes(query.q!.toLocaleLowerCase()))))
 };
}
