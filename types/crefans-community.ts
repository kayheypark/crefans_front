import type {ApiResult} from './crefans';
import type {InboxContact,MessagesViewModel} from './crefans-social';

/** A reply without `author` is the creator's own answer. */
export type CommunityReply={id:string;body:string;time:string;author?:InboxContact;mentions?:InboxContact[]};
export type CommunityComment={id:string;postId:string;author:InboxContact;body:string;time:string;hidden:boolean;replies:CommunityReply[];mentions?:InboxContact[]};
export type CommunityPost={id:string;title:string};
export type StudioCommunityModel={
  inbox:Omit<MessagesViewModel,'basePath'>;
  posts:CommunityPost[];
  comments:CommunityComment[];
  visibilityGuidance:string;
  replyToComment:(commentId:string,body:string)=>Promise<ApiResult<{message:string}>>;
  setCommentHidden:(commentId:string,hidden:boolean)=>Promise<ApiResult<{message:string}>>;
};
