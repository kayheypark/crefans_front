// 스튜디오 SNS 링크: 화면은 아이디만 입력받고, 서버에는 전체 주소(https://…/아이디)를 저장한다.
import type {CreatorLinks} from '@/types/crefans';

export type SocialKind=keyof CreatorLinks;
export const SOCIAL_PREFIX:Record<SocialKind,string>={youtube:'https://youtube.com/@',instagram:'https://instagram.com/',facebook:'https://facebook.com/'};
const HOST:Record<SocialKind,RegExp>={
 youtube:/^https?:\/\/(?:www\.|m\.)?youtube\.com\/@([^/?#]*)\/?$/i,
 instagram:/^https?:\/\/(?:www\.)?instagram\.com\/([^/?#]*)\/?$/i,
 facebook:/^https?:\/\/(?:www\.|m\.)?facebook\.com\/([^/?#]*)\/?$/i,
};
const HANDLE=/^[A-Za-z0-9._-]{1,100}$/;

/** 저장된 주소에서 아이디만 꺼낸다. 다른 형식(예: 유튜브 /channel/…)의 기존 주소는 null. */
export function socialHandle(kind:SocialKind,url:string|undefined):string|null{
 const value=(url||'').trim();if(!value)return '';
 if(value.startsWith(SOCIAL_PREFIX[kind]))return value.slice(SOCIAL_PREFIX[kind].length);
 const match=HOST[kind].exec(value);return match?match[1]:null;
}

/** 입력값(아이디, @아이디 또는 같은 서비스의 전체 주소)을 저장할 전체 주소로 바꾼다. */
export function socialUrl(kind:SocialKind,input:string):string{
 const value=input.trim();if(!value)return '';
 if(/^https?:\/\//i.test(value)){const handle=socialHandle(kind,value);return handle===null?value:SOCIAL_PREFIX[kind]+handle;}
 return SOCIAL_PREFIX[kind]+value.replace(/^@+/,'').replace(/\/+$/,'');
}

/** 비어 있거나, 올바른 아이디로 만든 주소이거나, 기존 다른 형식의 http(s) 주소면 저장할 수 있다. */
export function socialLinkValid(kind:SocialKind,url:string|undefined):boolean{
 const value=(url||'').trim();if(!value)return true;
 const handle=socialHandle(kind,value);
 return handle===null?/^https?:\/\/\S+$/i.test(value):HANDLE.test(handle);
}
