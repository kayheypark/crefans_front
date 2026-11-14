import type {ApiResult} from './crefans';
import type {StudioMedia} from './crefans-studio-management';
export type PhotoAssetCategory='pose'|'background'|'camera'|'lens'|'outfit'|'makeup'|'expression';
export type PhotoAsset=StudioMedia&{title:string;category:PhotoAssetCategory};
export type PhotoLibraryModel={
 list:(query:{q:string;category:string;page:number})=>Promise<ApiResult<{items:PhotoAsset[];hasMore:boolean}>>;
 save:(input:{id:string;title:string;category:PhotoAssetCategory})=>Promise<ApiResult<PhotoAsset>>;
 remove:(id:string)=>Promise<ApiResult<{removed:true}>>;
 upload:(file:File)=>Promise<ApiResult<StudioMedia>>;
};
