import {NextRequest} from 'next/server';
export async function proxyPlatform(request:NextRequest,{params}:{params:{path:string[]}}){
 const origin=process.env.PLATFORM_API_ORIGIN||'http://127.0.0.1:3001';
 const url=new URL(`/api/v1/${params.path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`,origin);
 const headers=new Headers();for(const name of['content-type','cookie','origin','range','x-pass-signature']){const value=request.headers.get(name);if(value)headers.set(name,value);}
 try{const body=['GET','HEAD'].includes(request.method)?undefined:request.body;const options:RequestInit&{duplex?:'half'}={method:request.method,headers,body,cache:'no-store',redirect:'manual',signal:request.signal,...(body?{duplex:'half'}:{})};const response=await fetch(url,options);
   const output=new Headers();for(const name of['content-type','content-length','content-range','accept-ranges','cache-control','location','x-content-type-options','x-request-id','vary','referrer-policy','cross-origin-resource-policy']){const value=response.headers.get(name);if(value)output.set(name,value);}
   for(const value of response.headers.getSetCookie())output.append('set-cookie',value);
   return new Response(response.body,{status:response.status,headers:output});
 }catch{return Response.json({success:false,data:null,errorMessage:'API 서버에 연결할 수 없습니다.',errorCode:'API_UNAVAILABLE'},{status:503});}
}
