import type {ApiResult} from './crefans';
export type ShopProduct={id:string;name:string;description:string;benefit:string;amount:number;validityLabel:string;terms:string;onSale:boolean;version:number;termsVersion:string};
export type ShopOrder={id:string;name:string;amount:number;benefit:string;createdAt:string;quantity:number;remaining:number;expiresAt?:string|null;refundAmount?:number|null;status:'pending'|'processing'|'paid'|'failed'|'refunding'|'refunded';statusLabel:string};
export type ShopModel={products:ShopProduct[];orders:ShopOrder[];loading:boolean;error:string;refresh:()=>Promise<void>;refund:(order:ShopOrder)=>Promise<ApiResult<ShopOrder>>;purchase:(product:ShopProduct)=>Promise<ApiResult<{message:string}>>};
