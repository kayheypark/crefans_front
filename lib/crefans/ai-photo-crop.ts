export const aiPhotoRatios=['original','1:1','4:5','3:4','9:16','16:9'] as const;
export type AiPhotoRatio=typeof aiPhotoRatios[number];
export type PhotoCrop={left:number;top:number;width:number;height:number};
export function photoCrop(width:number,height:number,ratio:AiPhotoRatio,x:number,y:number,zoom=1):PhotoCrop{
 const [a,b]=ratio==='original'?[width,height]:ratio.split(':').map(Number),r=a/b;
 const w=Math.max(1,Math.floor(Math.min(width,height*r)/zoom)),h=Math.max(1,Math.floor(w/r));
 return {left:Math.round((width-w)*Math.max(0,Math.min(1,x))),top:Math.round((height-h)*Math.max(0,Math.min(1,y))),width:w,height:h};
}
