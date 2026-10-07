import type {ApiResult} from '@/types/crefans';
let renewal:Promise<boolean>|null=null;
async function renew(){
 const request=()=>fetch('/api/v1/auth/refresh',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'}).then(async response=>response.ok&&(await response.json()).success===true).catch(()=>false);
 if(!renewal){const locks=typeof navigator!=='undefined'?navigator.locks:undefined;renewal=(locks?locks.request('crefans-session-refresh',async()=>{const session=await fetch('/api/v1/session',{credentials:'same-origin',cache:'no-store'});return session.ok?true:request();}):request()).catch(()=>false).finally(()=>{renewal=null;});}
 return renewal;
}
export async function platformRequest<T>(path:string,body?:unknown,method=body===undefined?'GET':'POST'):Promise<ApiResult<T>>{
 try{const options={method,credentials:'same-origin' as const,cache:'no-store' as const,headers:body instanceof FormData?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)};
   let response=await fetch(`/api/v1${path}`,options);
   if(response.status===401&&!path.startsWith('/auth/')){await renew();response=await fetch(`/api/v1${path}`,options);}
   const result=await response.json();if(typeof result.success!=='boolean'||!('data'in result))throw new Error('Invalid response');return result;
 }catch{return{success:false,data:null,errorMessage:'서버에 연결하지 못했습니다. 다시 시도해주세요.',errorCode:'NETWORK_ERROR'};}
}
