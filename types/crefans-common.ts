import type {ApiResult} from './crefans';

export type CommonActionResult=ApiResult<{message:string}>;
export type ServiceNotice={id:string;title:string;category:string;date:string;pinned:boolean;paragraphs:string[]};
export type LegalKind='terms'|'privacy'|'policy';
export type LegalDocument={title:string;updatedAt:string;notice?:string;sections:{title:string;body:string}[]};
export type CommonModel={
  notices:ServiceNotice[];
  legal:Record<LegalKind,LegalDocument>;
  auth:{email:string;guidance:string;codeHint?:string};
  paymentMethods:{id:string;label:string;description:string;isDefault:boolean}[];
  paymentGuidance:string;
  registrationPreview?:{cards:{value:'shinhan'|'samsung'|'kb';label:string;number:string}[];expiry:string;code:string};
  actions:{
    requestPasswordReset:(email:string)=>Promise<CommonActionResult>;
    resetPassword:(input:{email:string;code:string;password:string})=>Promise<CommonActionResult>;
    addPaymentMethod:(input?:{returnPath?:string;previewCard?:'shinhan'|'samsung'|'kb'})=>Promise<CommonActionResult>;
    removePaymentMethod:(id:string)=>Promise<CommonActionResult>;
    setDefaultPaymentMethod:(id:string)=>Promise<CommonActionResult>;
  };
};
