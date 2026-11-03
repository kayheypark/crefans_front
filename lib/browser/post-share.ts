export type PostShareData={title:string;url:string};

export function postShareData(origin:string,basePath:string,id:string,title:string):PostShareData{
  return {title:`${title} | 크레팬스`,url:new URL(`${basePath}/post/${encodeURIComponent(id)}`,origin).href};
}

/** Public endpoint rechecks access without the sender's cookies; never share an authenticated media URL. */
export function postShareImage(origin:string,basePath:string,id:string,previewImage?:string){
 const path=basePath==='/service'?`/api/v1/media/posts/${encodeURIComponent(id)}/share-image`:
  previewImage&&/^\/(?:brand|illustrations)\//.test(previewImage)?previewImage:'/brand/share/default-post-v1.jpg';
 return new URL(path,origin).href;
}
export function kakaoShareTemplate(data:PostShareData,imageUrl=new URL('/brand/share/default-post-v1.jpg',data.url).href){
 const link={webUrl:data.url,mobileWebUrl:data.url};
 return {objectType:'feed' as const,content:{title:Array.from(data.title).slice(0,200).join(''),imageUrl,imageWidth:1200,imageHeight:630,link},buttons:[{title:'게시물 보기',link}]};
}

type KakaoSDK={init:(key:string)=>void;isInitialized:()=>boolean;Share:{sendDefault:(data:ReturnType<typeof kakaoShareTemplate>)=>void|Promise<unknown>}};
declare global {interface Window {Kakao?:KakaoSDK}}
export const kakaoJavaScriptKey=process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim()||'';
// Official SDK release and SRI published on 2026-10-19. Load only when a share layer opens.
export const kakaoSdkUrl='https://t1.kakaocdn.net/kakao_js_sdk/2.8.4/kakao.min.js';
export const kakaoSdkIntegrity='sha384-BGX7Wb16GmRFagri4bLJV2DgipVZaU2AI812GZtHtHzzDQJnfHasDXN5houxv45w';
let loading:Promise<void>|null=null;
export function prepareKakaoShare(key=kakaoJavaScriptKey):Promise<void>{
  if(!key)return Promise.reject(new Error('KAKAO_NOT_CONFIGURED'));
  const initialize=()=>{if(!window.Kakao)throw new Error('KAKAO_UNAVAILABLE');if(!window.Kakao.isInitialized())window.Kakao.init(key);if(!window.Kakao.Share)throw new Error('KAKAO_UNAVAILABLE');};
  if(window.Kakao){try{initialize();return Promise.resolve();}catch(error){return Promise.reject(error);}}
  if(!loading){
    loading=new Promise<void>((resolve,reject)=>{
      const script=document.createElement('script');script.src=kakaoSdkUrl;script.integrity=kakaoSdkIntegrity;script.crossOrigin='anonymous';script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
      const finish=(error?:unknown)=>{clearTimeout(timeout);script.onload=null;script.onerror=null;if(error){script.remove();reject(error);}else resolve();};
      const timeout=setTimeout(()=>finish(new Error('KAKAO_TIMEOUT')),10000);
      script.onload=()=>{try{initialize();finish();}catch(error){finish(error);}};
      script.onerror=()=>finish(new Error('KAKAO_LOAD_FAILED'));document.head.appendChild(script);
    }).catch(error=>{loading=null;throw error;});
  }
  return loading;
}

/** Called synchronously from the button click after preloading, retaining user activation. */
export function shareToKakao(data:PostShareData,imageUrl?:string){
  if(!window.Kakao?.isInitialized())throw new Error('KAKAO_UNAVAILABLE');
  return window.Kakao.Share.sendDefault(kakaoShareTemplate(data,imageUrl));
}
