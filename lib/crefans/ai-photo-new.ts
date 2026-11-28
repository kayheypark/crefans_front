import {aiPhotoPresetReleases} from './ai-photo-releases';

export const AI_PHOTO_NEW_MS=7*24*60*60*1000;
export function aiPhotoAddedIsNew(addedAt:string|null|undefined,now=Date.now()){
 const added=Date.parse(addedAt||'');
 return Number.isFinite(added)&&now>=added&&now-added<AI_PHOTO_NEW_MS;
}
export function aiPhotoRelease(kind:string,key:string){return aiPhotoPresetReleases.find(item=>item.kind===kind&&item.key===key);}
export function aiPhotoReleaseIsNew(kind:string,key:string,now=Date.now()){return aiPhotoAddedIsNew(aiPhotoRelease(kind,key)?.addedAt,now);}
export function aiPhotoGroupIsNew(kind:string,category?:string,now=Date.now()){
 return aiPhotoPresetReleases.some(item=>item.active!==false&&(item.kind===kind||(kind==='outfit'&&item.kind==='costume'))&&(!category||item.category===category)&&aiPhotoAddedIsNew(item.addedAt,now));
}
export function aiPhotoNewOptions<T extends {value:string}>(kind:string,options:readonly T[],now=Date.now()){
 return options.map(option=>({...option,badge:aiPhotoGroupIsNew(kind,option.value,now)?'NEW':undefined})).sort((a,b)=>Number(!!b.badge)-Number(!!a.badge));
}
