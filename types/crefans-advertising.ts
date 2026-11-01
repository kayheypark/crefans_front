import type {ApiResult} from './crefans';
export type AdProduct={id:string;name:string;description:string;terms:string;placement:'featured_creator';amount:number;durationDays:number;visible:boolean;onSale:boolean;sortOrder:number;version:number};
export type AdPurchase={id:string;name:string;amount:number;durationDays:number;createdAt:string;status:'paid'|'processing'|'failed'};
export type AdvertisingModel={products:AdProduct[];orders:AdPurchase[];loading:boolean;error:string;purchaseReady:boolean;guidance?:string;refresh:()=>Promise<void>;purchase:(product:AdProduct)=>Promise<ApiResult<AdPurchase>>};
