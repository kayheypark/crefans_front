import type {ApiResult} from './crefans';
export type PromotionClaimStatus={status:'available'|'claimed'|'ineligible'|'unavailable';quantity:100;claimedAt:string|null;expiresAt?:string|null;/** 2026-11-16: OCTOMO phone-number check before the 100콩 (present only while the server has it on). */phoneRequired?:boolean;phoneVerified?:boolean};
export type PhoneCheckStart={code:string;receiver:string;smsUri:string;expiresAt:string;/** PC only (qr:true): PNG data URL from OCTOMO. */qrCode?:string};
export type PhoneCheckModel={start:(phone:string,options?:{qr?:boolean})=>Promise<ApiResult<PhoneCheckStart>>;confirm:(phone:string)=>Promise<ApiResult<{verified:boolean}>>};
export type PromotionClaimModel={status:PromotionClaimStatus['status']|'signed-out'|'loading'|'error';expiresAt?:string|null;busy:boolean;error:string;onClaim:()=>void;onReload:()=>void;/** Set when the 100콩 needs a verified phone number first. */phone?:PhoneCheckModel&{verified:boolean;onVerified:()=>void}};
export type ServiceEvent={
 id:string;
 title:string;
 summary:string;
 campaignTitle:string;
 campaignSubtitle:string;
 schedule:string;
 theme?:'gift'|'advertising'|'beans'|'badge';
 banner?:{title:string;description:string;label?:string};
 image:string;
 imageWidth:number;
 imageHeight:number;
 submission?:{title:string;description:string;steps:readonly string[];email:string;subject:string;body:string;hint:string};
 rewards:ReadonlyArray<{audience:string;title:string;image:string;details:readonly string[];notice?:string}>;
 notes:ReadonlyArray<{title:string;items:readonly string[]}>;
};

export type FoundingBadgeStatus={status:'available'|'claimed'|'ineligible'|'unavailable';claimedAt:string|null;visible:boolean};
export type FoundingBadgeActions={load:()=>Promise<ApiResult<FoundingBadgeStatus>>;claim:()=>Promise<ApiResult<FoundingBadgeStatus>>;setVisible:(visible:boolean)=>Promise<ApiResult<FoundingBadgeStatus>>};
export type FoundingBadgeModel={status:FoundingBadgeStatus['status']|'signed-out'|'loading'|'error';visible:boolean;busy:boolean;error:string;onClaim:()=>void;onReload:()=>void;onVisible:(visible:boolean)=>void};
