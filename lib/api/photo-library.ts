import {platformRequest as api} from './platform';
import {imageUploadMaxBytes,imageUploadMaxLabel} from '@/lib/design/image-upload';
import {optimizeImage} from '@/lib/design/image-optimize';
import type {PhotoLibraryModel} from '@/types/crefans-photo-library';
import type {StudioMedia} from '@/types/crefans-studio-management';

export async function uploadStudioMedia(original:File){
 const image=original.type.startsWith('image/');
 if(image&&original.size>imageUploadMaxBytes)return {success:false as const,data:null,errorMessage:`사진은 한 장에 ${imageUploadMaxLabel}까지 올릴 수 있어요.`,errorCode:'INVALID_IMAGE_SIZE'};
 const body=new FormData();
 body.append('file',image?await optimizeImage(original):original);
 return api<StudioMedia>('/media',body);
}

const path='/studio/ai-photo/library';
export const servicePhotoLibrary:PhotoLibraryModel={
 upload:uploadStudioMedia,
 list:({q,category,page})=>api(path+'?'+new URLSearchParams({q,category,page:String(page)})),
 save:input=>api(path,input),
 remove:id=>api(path,{id,remove:true}),
 recentSource:()=>api(path+'/source'),
 rememberSource:id=>api(path+'/source',{id}),
};
