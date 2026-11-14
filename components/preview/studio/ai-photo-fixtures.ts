// 목업 AI 사진 편집 대역: 서버·OpenAI 를 호출하지 않는다. 결과는 서비스 소개용 가상 크리에이터(모카) 사진이다.
import type {ApiResult} from '@/types/crefans';
import type {AiPhotoCropInput,StudioMedia,AiPhotoEditInput,AiPhotoEditResult} from '@/types/crefans-studio-management';
import {AI_PHOTO_DAILY_LIMIT,AI_PHOTO_IMAGES_PER_REQUEST} from '@/lib/crefans/ai-photo';

export const mockAiPhotoResults=['/illustrations/creators/moka/editorial-v1.png','/illustrations/creators/moka/backstage-v1.png','/illustrations/creators/moka/cover-v1.png','/illustrations/creators/moka/avatar-v1.png'];
export type MockAiPhotoMode='normal'|'error'|'blocked';
let sequence=0;
const previewPhotos=new Map<string,string>();
/** Returns a function that answers like the server would, counting today's remaining edits from `start`. */
export function mockAiPhotoEdit({start=AI_PHOTO_DAILY_LIMIT,mode='normal' as MockAiPhotoMode,delay=900,onRemaining}:{start?:number;mode?:MockAiPhotoMode;delay?:number;onRemaining?:(remaining:number)=>void}={}){
 let remaining=start;
 return async(input:AiPhotoEditInput):Promise<ApiResult<AiPhotoEditResult>>=>{
  await new Promise(resolve=>setTimeout(resolve,delay));
  if(!input.consent)return {success:false,data:null,errorMessage:'사진 속 인물 확인에 동의해 주세요.',errorCode:'CONSENT_REQUIRED'};
  if(remaining<=0)return {success:false,data:null,errorMessage:'오늘 만들 수 있는 횟수를 모두 썼어요. 내일 다시 이용해 주세요.',errorCode:'DAILY_LIMIT'};
  if(mode==='error')return {success:false,data:null,errorMessage:'사진을 만들지 못했어요. 잠시 후 다시 시도해 주세요.',errorCode:'PROVIDER_ERROR'};
  if(mode==='blocked')return {success:false,data:null,errorMessage:'안전 기준에 맞지 않는 요청이라 만들 수 없어요. 다른 표현으로 다시 적어 주세요.',errorCode:'UNSAFE_INPUT'};
  remaining-=1;onRemaining?.(remaining);
  const images=Array.from({length:AI_PHOTO_IMAGES_PER_REQUEST},(_,i)=>({id:`ai-${++sequence}`,type:'image' as const,url:mockAiPhotoResults[(sequence+i)%mockAiPhotoResults.length],aiGenerated:true}));
  images.forEach(item=>previewPhotos.set(item.id,item.url));
  return {success:true,data:{images,remaining},errorMessage:null,errorCode:null};
 };
}

/** Preview-only canvas: production uses the authenticated server crop endpoint. */
export async function mockAiPhotoCrop(input:AiPhotoCropInput):Promise<ApiResult<StudioMedia>>{
 const url=previewPhotos.get(input.sourceId);
 if(!url)return {success:false,data:null,errorMessage:'예시 사진을 다시 만들어 주세요.',errorCode:'PREVIEW_IMAGE_MISSING'};
 const image=new Image();image.src=url;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=input.width;canvas.height=input.height;
 canvas.getContext('2d')!.drawImage(image,input.left,input.top,input.width,input.height,0,0,input.width,input.height);
 const item:StudioMedia={id:`ai-${++sequence}`,type:'image',url:canvas.toDataURL('image/webp'),aiGenerated:true};previewPhotos.set(item.id,item.url);
 return {success:true,data:item,errorMessage:null,errorCode:null};
}
