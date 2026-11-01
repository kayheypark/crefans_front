'use client';
import {useEffect,useRef} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {StudioMedia} from '@/types/crefans-studio-management';
import {imageUploadAccept,imageUploadMaxBytes,videoUploadAccept,videoUploadMaxBytes} from '@/lib/design/image-upload';

export function createLocalImageStore(){
  const owned=new Set<string>(),retained=new Set<string>();
  let sequence=0;
  const register=(file:File)=>{const url=URL.createObjectURL(file);owned.add(url);return url;};
  return {
    upload:async(file:File):Promise<ApiResult<{image:string}>>=>{
      if(!imageUploadAccept.split(',').includes(file.type))return {success:false,data:null,errorMessage:'JPG, PNG, WebP 이미지를 선택해주세요.',errorCode:'INVALID_IMAGE_TYPE'};
      if(!file.size||file.size>imageUploadMaxBytes)return {success:false,data:null,errorMessage:'5MB 이하의 이미지 파일을 선택해주세요.',errorCode:'INVALID_IMAGE_SIZE'};
      return {success:true,data:{image:register(file)},errorMessage:null,errorCode:null};
    },
    /** Post media accepts images and videos with separate size limits. */
    uploadMedia:async(file:File):Promise<ApiResult<StudioMedia>>=>{
      const image=imageUploadAccept.split(',').includes(file.type),video=videoUploadAccept.split(',').includes(file.type);
      if(!image&&!video)return {success:false,data:null,errorMessage:'JPG·PNG·WebP 이미지 또는 MP4·WebM·MOV 동영상을 선택해주세요.',errorCode:'INVALID_MEDIA_TYPE'};
      if(!file.size||file.size>(image?imageUploadMaxBytes:videoUploadMaxBytes))return {success:false,data:null,errorMessage:image?'이미지는 5MB 이하만 올릴 수 있어요.':'동영상은 300MB 이하만 올릴 수 있어요.',errorCode:'INVALID_MEDIA_SIZE'};
      return {success:true,data:{id:`media-${++sequence}`,type:image?'image':'video',url:register(file)},errorMessage:null,errorCode:null};
    },
    owns:(image:string)=>owned.has(image),
    retain:(image?:string)=>{if(image&&owned.has(image))retained.add(image);},
    discard:(image:string)=>{if(owned.has(image)&&!retained.has(image)){URL.revokeObjectURL(image);owned.delete(image);}},
    dispose:()=>{owned.forEach(image=>URL.revokeObjectURL(image));owned.clear();retained.clear();},
  };
}
export function useLocalImages(){
  const store=useRef<ReturnType<typeof createLocalImageStore>|null>(null);
  if(!store.current)store.current=createLocalImageStore();
  useEffect(()=>()=>store.current?.dispose(),[]);
  return store.current;
}
