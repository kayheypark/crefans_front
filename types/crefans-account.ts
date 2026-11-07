import type {ApiResult} from './crefans';
import type {LegalDocument} from './crefans-common';

/** `showFollowing` is a fan-level privacy choice (anyone, not only creators): off hides the 팔로잉 count/list from others and shows a lock instead. */
export type AccountPreferences={contentAlert:boolean;messageAlert:boolean;marketingAlert:boolean;showActivity:boolean;allowSearch:boolean;showFollowers?:boolean;showFollowing:boolean};
export type AccountTicket={id:string;category:string;title:string;message:string;statusLabel:string;reply?:string};
export type AccountSettingsUpdate=
  | {section:'account';name:string}
  | {section:'password';currentPassword:string;newPassword:string}
  | {section:'email';email:string;code?:string}
  | {section:'notifications';contentAlert:boolean;messageAlert:boolean;marketingAlert:boolean;marketingVersion?:string}
  | {section:'privacy';showActivity:boolean;allowSearch:boolean;showFollowers?:boolean;showFollowing:boolean};
export type AccountActionResult=ApiResult<{message:string}>;
/** File = new photo, null = remove, omitted = keep. */
export type ProfilePhotoChange={avatar?:File|null;cover?:File|null};
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
    signupRequirements?:{identityRequired:boolean;inviteOnly:boolean};
    agreements?:{published:boolean;documentsPublished?:boolean;signupReady?:boolean;blockingMessage?:string|null;documents:Record<'terms'|'privacy'|'marketing',LegalDocument>;collection:LegalDocument;versions:Record<string,string>};
    guidance:Partial<Record<'signup'|'login'|'credentials'|'profile'|'preferences'|'payment'|'withdraw'|'support'|'ticket',string>>;
    route:{profileTab:'saved'|'liked'|null;supportTab:'faq'|'qna'|'history';settingsSection:'account'|'password'|'email'|'notifications'|'payment'|'privacy'|'blocked'|null};
  };
  accountActions:{
    signup:(input:{email:string;password:string;nickname:string;terms:boolean;privacy:boolean;marketing:boolean;emailVerified:boolean;identityVerified:boolean;ageAcknowledged?:boolean;referralDisclosure?:boolean;policyVersions?:Record<string,string>})=>Promise<AccountActionResult>;
    /** Email verification happens inside the signup step. */
    requestSignupCode:(email:string)=>Promise<AccountActionResult>;
    verifySignupCode:(input:{email:string;code:string})=>Promise<AccountActionResult>;
    /** PASS 본인인증. The mock resolves immediately; live wiring opens the PASS flow. */
    verifyIdentity:()=>Promise<AccountActionResult>;
    login:(input:{email:string;password:string;remember:boolean})=>Promise<AccountActionResult>;
    /** handle: the one public user name (2026-10-31) — also the creator profile address. */
    updateProfile:(input:{name:string;bio:string;handle?:string})=>Promise<AccountActionResult>;
    checkHandle:(handle:string)=>Promise<ApiResult<{handle:string;available:boolean}>>;
    /** Profile and background photo of the own profile page; a creator profile uses the same photos. */
    updatePhotos?:(input:ProfilePhotoChange)=>Promise<AccountActionResult>;
    requestEmailChange?:(email:string,currentPassword:string)=>Promise<AccountActionResult>;
    updateSettings:(input:AccountSettingsUpdate)=>Promise<AccountActionResult>;
    unblockCreator:(id:string)=>Promise<AccountActionResult>;
    logout:()=>Promise<AccountActionResult>;
    withdraw:()=>Promise<AccountActionResult>;
    createInquiry:(input:{category:string;title:string;message:string})=>Promise<AccountActionResult>;
  };
};
