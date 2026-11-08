import type {ApiResult} from './crefans';
import type {CreatorTerms} from '@/lib/crefans/creator-payout-policy';

export type StudioContentStatus='draft'|'published'|'scheduled';
/** `processing`: an iPhone .mov being converted to MP4 on the server; `failed`: conversion failed (not shown in the post).
 * `preview`: the creator's own local copy (object URL) used as the thumbnail until conversion ends. */
export type StudioMedia={id:string;type:'image'|'video';url:string;processing?:boolean;failed?:boolean;preview?:string;/** Made by the studio AI photo editor; shown with an 'AI 생성' mark. */aiGenerated?:boolean};
export type AiPhotoKind='outfit'|'pose'|'background';
export type AiPhotoStyle='photo'|'cosplay'|'daily';
/** `mask`: PNG the size of the source, transparent where the photo may change (outfit edits). `consent`: the creator confirmed the person is themselves or agreed. */
export type AiPhotoEditInput={source:StudioMedia;kind:AiPhotoKind;prompt:string;style:AiPhotoStyle;mask?:Blob;consent:true};
export type AiPhotoEditResult={images:StudioMedia[];remaining:number};
/** `media` holds images and videos in display order, at most `mediaUploadMaxItems` (10). */
export type StudioContent={id:string;title:string;body:string;/** Set when an operator hid the post (terms §8); only the author can still see it. */hiddenByOperator?:boolean;/** Set when the author or an operator unpublished the post (postings.is_public=false): only the author sees it until it is made public again. */unpublished?:boolean;media:StudioMedia[];/** Per-post switch; the studio-wide setting still takes precedence. */commentsEnabled:boolean;tipsEnabled?:boolean;accessPlanId:string|null;/** Minimum purchased rank; mutually exclusive with accessPlanId. */accessLevel?:number|null;status:StudioContentStatus;scheduledAt:string|null;updatedAt:string};
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
  /** Today's AI photo edits left; absent when the editor is not offered. */
  aiPhotoQuota?:{remaining:number;limit:number};
  /** The creator's own fee terms from the studio finance API; absent means the default rate. */
  creatorTerms?:CreatorTerms|null;
  actions:{
    saveContent:(input:ContentInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteContent:(id:string,confirmation:string)=>Promise<ApiResult<{message:string}>>;
    /** Unpublish (`false`) or publish again (`true`); operator hiding is not affected. */
    setContentPublic:(id:string,isPublic:boolean)=>Promise<ApiResult<{message:string}>>;
    saveMembership:(input:MembershipInput)=>Promise<ApiResult<{id:string;message:string}>>;
    deleteMembership:(id:string,confirmation:string)=>Promise<ApiResult<{message:string}>>;
    uploadMembershipImage:(file:File)=>Promise<ApiResult<{image:string}>>;
    discardMembershipImage:(image:string)=>void;
    uploadContentMedia:(file:File)=>Promise<ApiResult<StudioMedia>>;
    discardContentMedia:(url:string)=>void;
    /** Conversion state of an uploaded iPhone video; absent in the mock, where nothing converts. */
    mediaStatus?:(id:string)=>Promise<ApiResult<{status:'processing'|'completed'|'failed'}>>;
    setMembershipActive:(id:string,active:boolean)=>Promise<ApiResult<{message:string}>>;
    /** AI photo edit (outfit, pose, background). Absent until the server feature is connected: the editor button is hidden. */
    aiEditPhoto?:(input:AiPhotoEditInput)=>Promise<ApiResult<AiPhotoEditResult>>;
  };
};
