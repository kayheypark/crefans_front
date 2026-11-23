import type {ApiResult} from './crefans';
import type {StudioMedia} from './crefans-studio-management';
export type PhotoAssetCategory='face'|'pose'|'background'|'outfit'|'mirror'|'selfie'|'back_view'|'camera'|'lens'|'makeup'|'expression';
export type PhotoAsset=StudioMedia&{title:string;category:PhotoAssetCategory};
export type PhotoLibraryModel={
 list:(query:{q:string;category:string;page:number})=>Promise<ApiResult<{items:PhotoAsset[];hasMore:boolean;/** 조건에 맞는 전체 사진 수(2026-11-15 추가, 이전 서버는 없음) */total?:number}>>;
 save:(input:{id:string;title:string;category:PhotoAssetCategory})=>Promise<ApiResult<PhotoAsset>>;
 remove:(id:string)=>Promise<ApiResult<{removed:true}>>;
 upload:(file:File)=>Promise<ApiResult<StudioMedia>>;
 /** 2026-11-22: the library photo last chosen with "편집하기", opened as the edit target next time (per member, server-side). */
 recentSource?:()=>Promise<ApiResult<{item:PhotoAsset|null}>>;
 rememberSource?:(id:string|null)=>Promise<ApiResult<{item:PhotoAsset|null}>>;
};
