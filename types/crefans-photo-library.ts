import type {ApiResult} from './crefans';
import type {StudioMedia} from './crefans-studio-management';
export type PhotoAssetCategory='face'|'pose'|'background'|'outfit'|'mirror'|'selfie'|'back_view'|'camera'|'lens'|'makeup'|'expression';
export type PhotoAsset=StudioMedia&{title:string;category:PhotoAssetCategory};
export type LibraryVideo=StudioMedia&{type:'video';title:string;category:'video'};
export type LibraryAsset=PhotoAsset|LibraryVideo;
export type PhotoLibraryModel={
 list:(query:{q:string;category:string;page:number})=>Promise<ApiResult<{items:LibraryAsset[];hasMore:boolean;/** 조건에 맞는 전체 파일 수(이전 서버는 없음) */total?:number}>>;
 save:(input:{id:string;title:string;category:LibraryAsset['category'];sourceVideoId?:string})=>Promise<ApiResult<LibraryAsset>>;
 remove:(id:string)=>Promise<ApiResult<{removed:true}>>;
 upload:(file:File)=>Promise<ApiResult<StudioMedia>>;
 /** 2026-11-22: the library photo last chosen with "편집하기", opened as the edit target next time (per member, server-side). */
 recentSource?:()=>Promise<ApiResult<{item:PhotoAsset|null}>>;
 rememberSource?:(id:string|null)=>Promise<ApiResult<{item:PhotoAsset|null}>>;
};
