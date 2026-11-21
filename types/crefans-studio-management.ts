export type AiHeartInput={action:'start'|'click'|'finish';id?:string;piece?:number;eventId?:string};
export type AiHeartResult={remaining?:number;id?:string;kinds?:('heart'|'candy'|'moon')[];score?:number;hearts?:number;credits?:number;earned?:number;converted?:number;/** 2026-11-21 guest: credit paid for this game (0 or 0.5) and whether today's cap stopped it. */ticket?:number;capped?:boolean};
import type {ShopModel} from './crefans-shop';
import type {ShareReport} from '@/lib/api/share-report';
export type {ShareReport};
// 2026-11-19 이탈 분석: AI 사진 퍼널 단계(편집창 열림·사진 결정·결과 공유 완료). actor는 모델이 붙인다.
<<<<<<< HEAD
// 2026-11-20 이탈 분석(생성 성공 9개 중 8개가 사진 결정 없이 이탈): 결과 화면의 닫기·원본으로·계속 보정도 단계로 남긴다(actor·mode만).
export type AiPhotoFunnelStep='ai_editor_opened'|'photo_decided'|'ai_result_shared'|'ai_result_closed'|'ai_result_original'|'ai_result_continue';
=======
// 2026-11-21: share button press and Coupang link click are funnel steps too (PostHog).
export type AiPhotoFunnelStep='ai_editor_opened'|'photo_decided'|'ai_result_share_clicked'|'ai_result_shared'|'costume_shop_clicked';
>>>>>>> 445dc41 (feat: PostHog 퍼널에 공유 버튼 누름·쿠팡 링크 클릭 이벤트 추가)
import type {ApiResult} from './crefans';
import type {CreatorTerms} from '@/lib/crefans/creator-payout-policy';

export type StudioContentStatus='draft'|'published'|'scheduled';
/** `processing`: an iPhone .mov being converted to MP4 on the server; `failed`: conversion failed (not shown in the post).
 * `preview`: the creator's own local copy (object URL) used as the thumbnail until conversion ends. */
export type StudioMedia={id:string;type:'image'|'video';url:string;processing?:boolean;failed?:boolean;preview?:string;/** Made by the studio AI photo editor; shown with an 'AI 생성' mark. */aiGenerated?:boolean;/** AI photo made with a game/anime costume (server metadata, 2026-11-18): the post stays fully public and takes no tips. */franchiseCostume?:boolean};
export type AiPhotoKind='outfit'|'makeup'|'expression'|'pose'|'background'|'camera'|'lens'|'body';
export type AiPhotoStyle='photo'|'cosplay'|'daily';
/** `mask`: PNG the size of the source, transparent where the photo may change (outfit edits). `consent`: the creator confirmed the person is themselves or agreed. */
export type AiPhotoCropInput={sourceId:string;left:number;top:number;width:number;height:number};
export type AiPhotoEditInput={/** 2026-11-20: the user's own uploaded photo used as the background reference. */backgroundMediaId?:string;generationMethod?:import('@/lib/crefans/ai-photo').AiPhotoGenerationMethod;/** 2026-11-17: titles of the chosen non-outfit/background presets, counted by the server for HOT stats (aggregate only). */presetKeys?:{kind:string;key:string}[];/** 2026-11-17: 네 after an image-server refusal regenerates with the improved wording. */retryImproved?:boolean;backgroundId?:string;libraryIds?:string[];aspectRatio?:import('@/lib/crefans/ai-photo-crop').AiPhotoRatio;heartGameId?:string;source:StudioMedia;mode?:'general'|'cosplay';kind:AiPhotoKind|'combined';editKinds?:AiPhotoKind[];costumeIds?:string[];targetGender?:'female'|'male';prompt:string;style:AiPhotoStyle;mask?:Blob;consent:true};
export type AiPhotoEditResult={images:StudioMedia[];remaining:number};
/** `media` holds images and videos in display order, at most `mediaUploadMaxItems` (10). */
export type StudioContent={id:string;title:string;body:string;/** Set when an operator hid the post (terms §8); only the author can still see it. */hiddenByOperator?:boolean;/** Set when the author or an operator unpublished the post (postings.is_public=false): only the author sees it until it is made public again. */unpublished?:boolean;media:StudioMedia[];/** Has a game/anime costume AI photo (server, 2026-11-18). */commercialRestricted?:boolean;/** Per-post switch; the studio-wide setting still takes precedence. */commentsEnabled:boolean;tipsEnabled?:boolean;accessPlanId:string|null;/** Minimum purchased rank; mutually exclusive with accessPlanId. */accessLevel?:number|null;status:StudioContentStatus;scheduledAt:string|null;updatedAt:string};
export type StudioMembership={id:string;name:string;rank?:number;price:number;benefits:string[];active:boolean;version:number;image?:string;canDelete?:boolean};
export type StudioSubscriber={id:string;name:string;handle:string;image?:string;planId:string;planSnapshot:{name:string;price:number;benefits:string[];version:number;image?:string};status:'active'|'cancelled'|'expired';joinedAt:string;renewAt:string};
export type ContentInput=Omit<StudioContent,'id'|'updatedAt'>&{id?:string};
export type MembershipInput={id?:string;name:string;rank?:number;price:number;benefits:string[];image?:string};
export type StudioManagementModel={
  photoLibrary?:import('./crefans-photo-library').PhotoLibraryModel;
  shop?:ShopModel;
  now:string;
  contents:StudioContent[];
  memberships:StudioMembership[];
  /** 2026-11-16: false when the creator has no partnership contract (verified badge); new memberships need it. Unknown = undefined. */
  membershipPartner?:boolean;
  subscribers:StudioSubscriber[];
  selectedContentStatus?:StudioContentStatus;
  selectedSubscriberPlanId?:string;
  selectedSubscriberId?:string;
  notice?:string;
  /** Today's AI photo edits left; absent when the editor is not offered. */
  aiPhotoQuota?:{hearts?:number;rewardRemaining?:number;paidRemaining?:number;remaining:number;limit:number;/** Storable reset tickets (2026-11-13): spend one to clear today's usage. */resetTickets?:{count:number;nextExpiresAt:string|null};/** Median seconds of recent real edits; null until one has finished. */typicalSeconds?:number|null};
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
    aiHeartGame?:(input:AiHeartInput)=>Promise<ApiResult<AiHeartResult>>;
    aiCropPhoto?:(input:AiPhotoCropInput)=>Promise<ApiResult<StudioMedia>>;
    aiEditPhoto?:(input:AiPhotoEditInput)=>Promise<ApiResult<AiPhotoEditResult>>;
    refreshAiPhotoQuota?:()=>Promise<void>;
    useAiPhotoTicket?:()=>Promise<ApiResult<AiPhotoTicketResult>>;
    // 2026-11-19: share-button report and AI photo funnel steps go through the model (components never call API/analytics directly).
    reportShare?:(report:ShareReport)=>void;
    trackAiPhoto?:(step:AiPhotoFunnelStep,props:{mode:string;kind?:string})=>void;
  };
};

/** POST /studio/ai-photo/reset-ticket (2026-11-13). */
export type AiPhotoTicketResult={remaining:number;limit:number;resetTickets:{count:number;nextExpiresAt:string|null};message:string};
