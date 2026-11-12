import type {FoundingBadgeActions} from './crefans-events';
import type {Dispatch,SetStateAction} from 'react';
import type {AccountModel} from './crefans-account';
import type {SocialModel} from './crefans-social';
/** Proposed API envelope. A failure never supplies stale success data. */
export type ApiResult<T> =
  | {success:true;data:T;errorMessage:null;errorCode:null}
  | {success:false;data:null;errorMessage:string;errorCode:string};
/** External profiles the creator manages in the studio; shown on the fan profile's 소개 tab. */
export type CreatorLinks={youtube?:string;instagram?:string;facebook?:string};
/** `bio` is the one-line tagline under the name; `about` is the long 소개 text. `promoted` is the paid placement: shown as a full card at the top of explore; everyone else is a one-line row. */
export type Creator={id:string;name:string;handle:string;tags:string[];image:string;cover?:string;position:string;bio:string;about?:string;links?:CreatorLinks;followers:string;followerCount?:number;followingCount?:number;followersPublic?:boolean;followingPublic?:boolean;promoted?:boolean;isCreator?:boolean;/** Assigned only by an administrator, independently of PASS. */isVerified?:boolean;isFoundingMember?:boolean;searchable?:boolean;postCount?:number};
export type Viewer={name:string;handle:string;bio:string;image:string;cover?:string;isVerified?:boolean;isFoundingMember?:boolean};
export type Plan={id:string;name:string;price:number;rank:number;benefits:string[];description?:string;recommended?:boolean;image?:string;version?:number;available?:boolean;entitlementMode?:'tier'|'exact'};
/** `processing`: a video still being optimized or a photo still being watermarked on the server; viewers see a notice instead (photos since 2026-11-13). */
export type PostMediaItem={type:'image'|'video';url:string;processing?:boolean;/** Made with the studio AI photo editor (AI 기본법 표시, 2026-11-08). */aiGenerated?:boolean};
/** `image` stays the cover for cards; `media` carries the full gallery (images and videos, up to 10) when present. */
export type Post={id:string;creatorId:string;title:string;body:string;image:string;position:string;likes:number;comments:number;/** Stored cumulative views; absent when the source does not supply a count. */views?:number;supporterCount?:number;tipsEnabled?:boolean;requiredRank:number;requiredPlanId?:string;time:string;media?:PostMediaItem[];/** Effective flag after the studio-wide switch; undefined means open. */commentsEnabled?:boolean;canAccess?:boolean};
export type Subscription={id?:string;renewalPending?:boolean;billingIssue?:'action_required'|'retrying';retryAt?:string;orderId?:string;paidAt?:string;paymentStatus?:'paid'|'refunding'|'refunded';creatorId:string;planId:string;status:'active'|'cancelled'|'expired';renewAt:string;price:number;planSnapshot?:Plan};
export type Notification={id:string;creatorId:string|null;type:string;text:string;time:string;href:string};
/** `read`: on my own message, the other side has opened it (2026-11-01). */
export type Message={id:string|number;body:string;mine:boolean;time:string;unread?:boolean;read?:boolean};
export type Faq={question:string;answer:string};
/** Someone following the signed-in fan; listed under 항목 모아보기 > 팔로워 목록. */
export type Follower={id:string;name:string;handle:string;image:string;isVerified?:boolean;isFoundingMember?:boolean};
export type ServiceData={creators:Creator[];newCreatorIds?:string[];plans:Plan[];creatorPlans?:Record<string,Plan[]>;posts:Post[];notifications:Notification[];paymentHistory:Subscription[];messages:Record<string,Message[]>;faqs:Faq[];categories:string[];categoryIcons?:Record<string,string|null>;followers?:Follower[]};
/** Presentation inputs. Containers may back these with fixtures or API/model adapters. */
export type ServiceViewModel=AccountModel&SocialModel&{
  beanSupport?:boolean;
  foundingBadge?:FoundingBadgeActions;
  data:ServiceData;mode:'mock'|'live';today:string;basePath:string;nextRenewAt?:string;
  /** Creators this account manages; their posts get the 수정 menu item. */
  ownCreatorIds?:string[];
  signedIn:boolean;setSignedIn:Dispatch<SetStateAction<boolean>>;
  /** 로그인이 필요한 동작을 비로그인 상태에서 눌렀을 때 공용 로그인 필요 창을 띄운다(실제 서비스). 없으면 로그인 화면으로 이동. */
  requireSignIn?:()=>void;
  viewer:Viewer;setViewer:Dispatch<SetStateAction<Viewer>>;
  following:string[];toggleFollow:(id:string)=>void;
  liked:string[];toggleLike:(id:string)=>void;saved:string[];toggleSave:(id:string)=>void;
  read:string[];markRead:(ids:string[])=>void;
  subscriptions:Subscription[];subscribe:(creatorId:string,planId:string)=>Promise<ApiResult<{message:string;nextPath?:string}>>;cancelSubscription:(creatorId:string)=>Promise<ApiResult<{message:string}>>;
  resumeSubscription:(subscription:Subscription,paymentTerms:string)=>Promise<ApiResult<{message:string}>>;
  refundOrder?:(orderId:string)=>Promise<ApiResult<{message:string}>>;
  directory?:{creators:Creator[];newCreators?:Creator[];search:(query:string,category:string)=>void;hasMore:boolean;loading:boolean;loadMore:()=>Promise<void>};
  /** Explore post search (2026-11-08): `query` is the term the shown posts belong to. */
  postSearch?:{query:string;posts:Post[];search:(query:string)=>void;hasMore:boolean;loading:boolean;loadMore:()=>Promise<void>};
  feedPaging?:{hasMore:boolean;loading:boolean;loadMore:()=>Promise<void>};
  feedCategory?:{value:string;select:(category:string)=>void};
  canAccess:(creatorId:string,rank:number,requiredPlanId?:string)=>boolean;
};

export type Connections={profile:Creator;people:Creator[];nextOffset:number|null};
export type ConnectionsLoader=(id:string,kind:'followers'|'following',offset:number)=>Promise<ApiResult<Connections>>;
