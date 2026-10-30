import type {ApiResult} from '@/types/crefans';
import type {CommonModel} from '@/types/crefans-common';
/** Published terms/privacy/policy from the public common API, without the session cookie (used by the preview). */
export async function requestPublishedLegal():Promise<ApiResult<CommonModel['legal']>>{
 try{const response=await fetch('/api/v1/common',{credentials:'omit',cache:'no-store'});const body=await response.json();
  return body?.success&&body.data?.legal?{success:true,data:body.data.legal,errorMessage:null,errorCode:null}:{success:false,data:null,errorMessage:body?.errorMessage||'약관을 불러오지 못했습니다.',errorCode:body?.errorCode||'LEGAL_UNAVAILABLE'};}
 catch{return{success:false,data:null,errorMessage:'서버에 연결하지 못했습니다. 다시 시도해주세요.',errorCode:'NETWORK_ERROR'};}
}
