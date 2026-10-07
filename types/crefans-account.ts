import type {ApiResult} from './crefans';

/** `showFollowing` is a fan-level privacy choice (anyone, not only creators): off hides the 팔로잉 count/list from others and shows a lock instead. */
export type AccountPreferences={contentAlert:boolean;messageAlert:boolean;marketingAlert:boolean;showActivity:boolean;allowSearch:boolean;showFollowing:boolean};
export type AccountTicket={id:string;category:string;title:string;message:string;statusLabel:string;reply?:string};
export type AccountSettingsUpdate=
  | {section:'account';name:string}
  | {section:'password';currentPassword:string;newPassword:string}
  | {section:'email';email:string;code?:string}
  | {section:'notifications';contentAlert:boolean;messageAlert:boolean;marketingAlert:boolean}
  | {section:'privacy';showActivity:boolean;allowSearch:boolean;showFollowing:boolean};
export type AccountActionResult=ApiResult<{message:string}>;
export type AccountModel={
  account:{
    email:string;
    stats:{posts:number;followers:number};
    preferences:AccountPreferences;
    blockedCreatorIds:string[];
    paymentMethods:{id:string;label:string;description:string}[];
    tickets:AccountTicket[];
    inquiryCategories:string[];
    banner:{src:string;alt:string}|null;
    policies:{terms:string;privacy:string};
    guidance:Partial<Record<'signup'|'login'|'credentials'|'profile'|'preferences'|'payment'|'withdraw'|'support'|'ticket',string>>;
    route:{profileTab:'saved'|'liked'|null;supportTab:'faq'|'qna';settingsSection:'account'|'password'|'email'|'notifications'|'payment'|'privacy'|'blocked'|null};
  };
  accountActions:{
    signup:(input:{email:string;password:string;nickname:string;terms:boolean;privacy:boolean;marketing:boolean;emailVerified:boolean;identityVerified:boolean})=>Promise<AccountActionResult>;
    /** Email verification happens inside the signup step. */
    requestSignupCode:(email:string)=>Promise<AccountActionResult>;
    verifySignupCode:(input:{email:string;code:string})=>Promise<AccountActionResult>;
    /** PASS 본인인증. The mock resolves immediately; live wiring opens the PASS flow. */
    verifyIdentity:()=>Promise<AccountActionResult>;
    login:(input:{email:string;password:string;remember:boolean})=>Promise<AccountActionResult>;
    updateProfile:(input:{name:string;bio:string})=>Promise<AccountActionResult>;
    requestEmailChange?:(email:string)=>Promise<AccountActionResult>;
    updateSettings:(input:AccountSettingsUpdate)=>Promise<AccountActionResult>;
    unblockCreator:(id:string)=>Promise<AccountActionResult>;
    logout:()=>Promise<AccountActionResult>;
    withdraw:()=>Promise<AccountActionResult>;
    createInquiry:(input:{category:string;title:string;message:string})=>Promise<AccountActionResult>;
  };
};
