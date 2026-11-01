import type {Viewer} from '@/types/crefans';
import type {InboxContact} from '@/types/crefans-social';
import {landingCreators} from '@/lib/content/landing';

/** Preview recipients only; this never grants a badge to a service account. */
export const foundingCreatorIds=['haneul','jiwoo'];
export const previewViewer:Viewer={name:'팬지민',handle:'fanjimin',bio:'좋아하는 순간들을 모으고 있어요.',image:'/illustrations/redesign/yerin.png',isFoundingMember:true};
const jiwoo=landingCreators.find(person=>person.id==='jiwoo')!;
export const foundingCommentAuthors:InboxContact[]=[{id:'fan-jimin',...previewViewer},{id:jiwoo.id,name:jiwoo.name,image:jiwoo.image,isVerified:jiwoo.isVerified,isFoundingMember:true}];
