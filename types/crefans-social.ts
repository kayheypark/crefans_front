import type {ReportReason} from '@/lib/crefans/report-reasons';
import type {ApiResult,Message,Viewer} from './crefans';

export type CommentMention={id:string;name:string};
/** Replies are one level deep (2뎁스); answering a reply stays in that thread and starts with "@이름 " and are fetched on demand via `loadReplies`; the list only carries `replyCount`. `mentions` are the people the server found tagged as "@이름" in the body (at most 10). */
/** `fromCreator` marks the post author's own comment or reply so the view can highlight it. */
/** `own`: written by the viewer (edit/delete shown). `edited`: shows "수정됨". `deleted`: placeholder kept for remaining replies (no author/body). */
/** Someone who can be tagged in a comment of a post: its creator and its commenters. */
export type MentionCandidate={name:string;image:string};
export type SocialComment={id:string;author:Pick<Viewer,'name'|'image'|'isVerified'|'isFoundingMember'>;body:string;time:string;mentions?:CommentMention[];fromCreator?:boolean;replyCount?:number;own?:boolean;edited?:boolean;deleted?:boolean};
export type SocialReply=Omit<SocialComment,'replyCount'>;
export type SocialMessage=Message&{statusLabel?:string};
export type SocialActionResult=ApiResult<{message:string}>;
export type SocialModel={
  commentsByPost:Record<string,SocialComment[]>;
  commentCounts:Record<string,number>;
  likeCounts:Record<string,number>;
  messagesByCreator:Record<string,SocialMessage[]>;
  blockedCreatorIds:string[];
  conversationLabels:Record<string,string>;
  socialCopy:{reportDescription:string;blockDescription:string};
  read:string[];
  markRead:(ids:string[])=>void;
  commentPaging?:Record<string,{hasMore:boolean;loading:boolean;loadMore:()=>Promise<void>}>;
  loadComments?:(postId:string)=>Promise<void>;
  /** `parentId` makes it a reply to that top-level comment (replies are one level deep). */
  addComment:(postId:string,body:string,parentId?:string)=>Promise<SocialActionResult>;
  loadReplies:(postId:string,commentId:string)=>Promise<ApiResult<SocialReply[]>>;
  editComment?:(postId:string,commentId:string,body:string)=>Promise<SocialActionResult>;
  deleteComment?:(postId:string,commentId:string)=>Promise<SocialActionResult>;
  reportPost:(postId:string,reason:ReportReason)=>Promise<SocialActionResult>;
  reportComment?:(commentId:string,reason:ReportReason)=>Promise<SocialActionResult>;
  mentionCandidates?:(postId:string)=>Promise<MentionCandidate[]>;
  markConversationRead?:(creatorId:string,ids:Message['id'][])=>Promise<SocialActionResult>;
  sendMessage:(creatorId:string,body:string)=>Promise<SocialActionResult>;
  setConversationBlocked:(creatorId:string,blocked:boolean)=>Promise<SocialActionResult>;
  reportConversation:(creatorId:string)=>Promise<SocialActionResult>;
};

/** The same inbox supports creator contacts in the fan app and fan contacts in the studio. */
export type InboxContact={id:string;name:string;image:string;position?:string;isVerified?:boolean;isFoundingMember?:boolean};
export type MessagesViewModel=Pick<SocialModel,'messagesByCreator'|'blockedCreatorIds'|'conversationLabels'|'socialCopy'|'sendMessage'|'setConversationBlocked'|'reportConversation'|'markConversationRead'>&{
  data:{creators:InboxContact[]};
  basePath:string;
  contactHref?:(id:string)=>string;
  contactRoleLabel?:string;
};
