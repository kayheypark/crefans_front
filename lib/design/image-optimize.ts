// 2026-11-13 user decision: photos are shrunk in the browser before upload so large phone/camera photos go through.
// The server re-encodes every image to WebP anyway (media.controller, sharp, 40MP input limit), so a long edge of 4096px
// at quality 0.9 loses nothing visible on the service. Anything that cannot be decoded here is sent as is.
export const optimizeMaxEdge=4096;
const keepBelowBytes=4*1024*1024;
const optimizable=new Set(['image/jpeg','image/png','image/webp']);

export function fitWithin(width:number,height:number,maxEdge=optimizeMaxEdge){
  const scale=Math.min(1,maxEdge/Math.max(width,height));
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale)),resized:scale<1};
}

export async function optimizeImage(file:File):Promise<File>{
  if(!optimizable.has(file.type)||typeof createImageBitmap!=='function'||typeof document==='undefined')return file;
  let bitmap:ImageBitmap;
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{return file;}
  try{
    const size=fitWithin(bitmap.width,bitmap.height);
    if(!size.resized&&file.size<=keepBelowBytes)return file;
    const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
    const context=canvas.getContext('2d');if(!context)return file;
    context.drawImage(bitmap,0,0,size.width,size.height);
    const encode=(type:string)=>new Promise<Blob|null>(done=>canvas.toBlob(done,type,0.9));
    // Older Safari cannot encode WebP and falls back to PNG; JPEG keeps the file small there.
    let blob=await encode('image/webp');if(!blob||blob.type!=='image/webp')blob=await encode('image/jpeg');
    if(!blob||(!size.resized&&blob.size>=file.size))return file;
    const extension=blob.type==='image/webp'?'webp':'jpg';
    return new File([blob],`${file.name.replace(/\.[^.]+$/,'')||'photo'}.${extension}`,{type:blob.type,lastModified:file.lastModified});
  }finally{bitmap.close();}
}
