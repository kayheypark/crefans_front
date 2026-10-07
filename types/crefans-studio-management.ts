import type {ApiResult} from './crefans';

export type StudioContentStatus='draft'|'published'|'scheduled';
export type StudioMedia={id:string;type:'image'|'video';url:string};
/** `media` holds images and videos in display order, at most `mediaUploadMaxItems` (10). */
export type StudioContent={id:string;title:string;body:string;media:StudioMedia[];/** Per-post switch; the studio-wide setting still takes precedence. */commentsEnabled:boolean;accessPlanId:string|null;status:StudioContentStatus;scheduledAt:string|null;updatedAt:string};
export type StudioMembership={id:string;name:string;price:number;benefits:string[];active:boolean;version:number;image?:string;canDelete?:boolean};
export type StudioSubscriber={id:string;name:string;handle:string;image?:string;planId:string;planSnapshot:{name:string;price:number;benefits:string[];version:number;image?:string};status:'active'|'cancelled'|'expired';joinedAt:string;renewAt:string};
export type ContentInput=Omit<StudioContent,'id'|'updatedAt'>&{id?:string};
export type MembershipInput={id?:string;name:string;price:number;benefits:string[];image?:string};
export type StudioManagementModel={
  now:string;
  contents:StudioContent[];
  memberships:StudioMembership[];
  subscribers:StudioSubscriber[];
  selectedContentStatus?:StudioContentStatus;
  selectedSubscriberPlanId?:string;
  selectedSubscriberId?:string;
  notice?:string;
  actions:{
    saveContent:(input:ContentInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteContent:(id:string)=>Promise<ApiResult<{message:string}>>;
    saveMembership:(input:MembershipInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteMembership:(id:string)=>Promise<ApiResult<{message:string}>>;
    uploadMembershipImage:(file:File)=>Promise<ApiResult<{image:string}>>;
    discardMembershipImage:(image:string)=>void;
    uploadContentMedia:(file:File)=>Promise<ApiResult<StudioMedia>>;
    discardContentMedia:(url:string)=>void;
    setMembershipActive:(id:string,active:boolean)=>Promise<ApiResult<{message:string}>>;
  };
};
