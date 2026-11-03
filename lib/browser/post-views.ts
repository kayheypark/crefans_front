const KEY='cf_post_visitor';
/** Browser-enforced 30-minute expiry; no IP, fingerprint or advertising identifier. */
export function postVisitor(){
 try{
  const current=document.cookie.split('; ').find(row=>row.startsWith(KEY+'='))?.slice(KEY.length+1);
  if(current&&/^[a-f0-9-]{36}$/i.test(current))return current;
  const id=crypto.randomUUID();document.cookie=`${KEY}=${id}; Max-Age=1800; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
  return document.cookie.split('; ').some(row=>row===KEY+'='+id)?id:null;
 }catch{return null;}
}
export function viewSource(href:string,referrer:string){
 const url=new URL(href),source=url.searchParams.get('share');
 if(source&&['kakao','copy','native'].includes(source))return source;
 if(!referrer)return'direct';
 try{return new URL(referrer).origin===url.origin?'internal':'external';}catch{return'direct';}
}
/** Tall posts are measured against one viewport-sized reading area so long text can qualify. */
export function visibleFraction(r:{top:number;left:number;right:number;bottom:number;width:number;height:number},width:number,height:number){
 const area=Math.min(r.width,width)*Math.min(r.height,height);if(area<=0)return 0;
 return Math.max(0,Math.min(r.right,width)-Math.max(0,r.left))*Math.max(0,Math.min(r.bottom,height)-Math.max(0,r.top))/area;
}
