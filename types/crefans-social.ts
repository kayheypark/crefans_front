import type {ApiResult,Message,Viewer} from './crefans';

export type CommentMention={id:string;name:string};
/** Replies are one level deep (2뎁스) and are fetched on demand via `loadReplies`; the list only carries `replyCount`. `mentions` can hold up to 100 tagged people. */
/** `fromCreator` marks the post author's own comment or reply so the view can highlight it. */
export type SocialComment={id:string;author:Pick<Viewer,'name'|'image'>;body:string;time:string;mentions?:CommentMention[];fromCreator?:boolean;replyCount?:number};
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
  addComment:(postId:string,body:string)=>Promise<SocialActionResult>;
  loadReplies:(postId:string,commentId:string)=>Promise<ApiResult<SocialReply[]>>;
  reportPost:(postId:string)=>Promise<SocialActionResult>;
  sendMessage:(creatorId:string,body:string)=>Promise<SocialActionResult>;
  setConversationBlocked:(creatorId:string,blocked:boolean)=>Promise<SocialActionResult>;
  reportConversation:(creatorId:string)=>Promise<SocialActionResult>;
};

/** The same inbox supports creator contacts in the fan app and fan contacts in the studio. */
export type InboxContact={id:string;name:string;image:string;position?:string};
export type MessagesViewModel=Pick<SocialModel,'messagesByCreator'|'blockedCreatorIds'|'conversationLabels'|'socialCopy'|'sendMessage'|'setConversationBlocked'|'reportConversation'>&{
  data:{creators:InboxContact[]};
  basePath:string;
  contactHref?:(id:string)=>string;
  contactRoleLabel?:string;
};
