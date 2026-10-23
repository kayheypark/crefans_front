import type {ApiResult,CreatorLinks} from './crefans';
export type StudioProfile={name:string;handle:string;bio:string;/** Long 소개 shown on the fan profile's 소개 tab. */about:string;links:CreatorLinks;avatar:string;avatarPosition?:string;cover:string;category:string;active:boolean;/** Studio-wide comment switch. Off closes comments on every post regardless of per-post settings. */commentsEnabled:boolean};
export type StudioMetric={id:string;label:string;value:string;description:string;points:number[]};
export type StudioOverviewModel={
  profile:StudioProfile;
  started:boolean;
  categories:string[];
  period:string;
  metrics:StudioMetric[];
  activities:{id:string;title:string;description:string;time:string;path?:string}[];
  tasks:{id:string;title:string;description:string;path:string}[];
  series:{label:string;subscribers:number;followers:number;revenue:number}[];
  contentPerformance:{id:string;title:string;image:string;views:number;likes:number;comments:number}[];
  guidance?:string;
  completeOnboarding:(profile:Pick<StudioProfile,'name'|'handle'|'bio'|'category'>)=>Promise<ApiResult<{message:string}>>;
  updateProfile:(profile:Pick<StudioProfile,'name'|'handle'|'bio'|'category'|'about'|'links'>)=>Promise<ApiResult<{message:string}>>;
  setActivity:(active:boolean)=>Promise<ApiResult<{message:string}>>;
  setCommentsEnabled:(enabled:boolean)=>Promise<ApiResult<{message:string}>>;
};
