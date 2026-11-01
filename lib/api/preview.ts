import type {ApiResult} from '@/types/crefans';
/** Selects a preview persona only; never creates a member session. */
export async function requestPreviewLogin(input:{email:string;password:string}):Promise<ApiResult<{creatorId:string}>>{
 try{const response=await fetch('/api/preview/v1/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),cache:'no-store',credentials:'omit'});return await response.json();}
 catch{return{success:false,data:null,errorMessage:'목업 로그인을 확인할 수 없습니다. 다시 시도해주세요.',errorCode:'PREVIEW_LOGIN_UNAVAILABLE'};}
}
