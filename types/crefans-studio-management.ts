import type {ApiResult} from './crefans';
import type {CreatorTerms} from '@/lib/crefans/creator-payout-policy';

export type StudioContentStatus='draft'|'published'|'scheduled';
/** `processing`: an iPhone .mov being converted to MP4 on the server; `failed`: conversion failed (not shown in the post).
 * `preview`: the creator's own local copy (object URL) used as the thumbnail until conversion ends. */
export type StudioMedia={id:string;type:'image'|'video';url:string;processing?:boolean;failed?:boolean;preview?:string};
/** `media` holds images and videos in display order, at most `mediaUploadMaxItems` (10). */
export type StudioContent={id:string;title:string;body:string;/** Set when an operator hid the post (terms §8); only the author can still see it. */hiddenByOperator?:boolean;media:StudioMedia[];/** Per-post switch; the studio-wide setting still takes precedence. */commentsEnabled:boolean;tipsEnabled?:boolean;accessPlanId:string|null;/** Minimum purchased rank; mutually exclusive with accessPlanId. */accessLevel?:number|null;status:StudioContentStatus;scheduledAt:string|null;updatedAt:string};
export type StudioMembership={id:string;name:string;rank?:number;price:number;benefits:string[];active:boolean;version:number;image?:string;canDelete?:boolean};
export type StudioSubscriber={id:string;name:string;handle:string;image?:string;planId:string;planSnapshot:{name:string;price:number;benefits:string[];version:number;image?:string};status:'active'|'cancelled'|'expired';joinedAt:string;renewAt:string};
export type ContentInput=Omit<StudioContent,'id'|'updatedAt'>&{id?:string};
export type MembershipInput={id?:string;name:string;rank?:number;price:number;benefits:string[];image?:string};
export type StudioManagementModel={
  now:string;
  contents:StudioContent[];
  memberships:StudioMembership[];
  subscribers:StudioSubscriber[];
  selectedContentStatus?:StudioContentStatus;
  selectedSubscriberPlanId?:string;
  selectedSubscriberId?:string;
  notice?:string;
  /** The creator's own fee terms from the studio finance API; absent means the default rate. */
  creatorTerms?:CreatorTerms|null;
  actions:{
    saveContent:(input:ContentInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteContent:(id:string)=>Promise<ApiResult<{message:string}>>;
    saveMembership:(input:MembershipInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteMembership:(id:string,confirmation:string)=>Promise<ApiResult<{message:string}>>;
    uploadMembershipImage:(file:File)=>Promise<ApiResult<{image:string}>>;
    discardMembershipImage:(image:string)=>void;
    uploadContentMedia:(file:File)=>Promise<ApiResult<StudioMedia>>;
    discardContentMedia:(url:string)=>void;
    /** Conversion state of an uploaded iPhone video; absent in the mock, where nothing converts. */
    mediaStatus?:(id:string)=>Promise<ApiResult<{status:'processing'|'completed'|'failed'}>>;
    setMembershipActive:(id:string,active:boolean)=>Promise<ApiResult<{message:string}>>;
  };
};
