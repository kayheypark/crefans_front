import {scrypt,timingSafeEqual} from 'node:crypto';
export const runtime='nodejs';
let windowStart=0,attempts=0;
function reply(status:number,errorMessage:string|null,creatorId?:string){return Response.json({success:status===200,data:creatorId?{creatorId}:null,errorMessage,errorCode:status===200?null:'PREVIEW_LOGIN_REJECTED'},{status,headers:{'Cache-Control':'no-store'}});}
/** No member cookies, tokens, database access or production permissions. */
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 try{if(!origin||new URL(origin).host!==request.headers.get('host'))return reply(403,'요청을 확인해주세요.');}catch{return reply(403,'요청을 확인해주세요.');}
 const now=Date.now();if(now-windowStart>=60000){windowStart=now;attempts=0;}
 if(++attempts>20)return reply(429,'잠시 후 다시 시도해주세요.');
 const configured=process.env.CREFANS_PREVIEW_LOGIN_HASH||'';
 if(!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(configured))return reply(503,'목업 로그인 설정이 준비되지 않았습니다.');
 let input;try{const body=await request.text();if(body.length>2048)return reply(400,'입력값을 확인해주세요.');input=JSON.parse(body);}catch{return reply(400,'입력값을 확인해주세요.');}
 if(typeof input?.email!=='string'||typeof input?.password!=='string'||input.email.trim().toLowerCase()!=='moka@gmail.com'||input.password.length>128)return reply(401,'이메일 또는 비밀번호를 확인해주세요.');
 const [salt,hash]=configured.split(':');
 const actual=await new Promise<Buffer>((resolve,reject)=>scrypt(input.password,salt,64,(error,key)=>error?reject(error):resolve(key)));
 return timingSafeEqual(actual,Buffer.from(hash,'hex'))?reply(200,null,'moka'):reply(401,'이메일 또는 비밀번호를 확인해주세요.');
}
