import type {Creator} from '@/types/crefans';
export type TipRecipient=Pick<Creator,'id'|'name'|'image'|'position'|'isVerified'>&{postId?:string};
// Display/navigation context only. Never used to authorize a payment or transfer.
export function rememberTipRecipient(base:string,creator:TipRecipient){try{sessionStorage.setItem(`bean-tip:${base}:creator:${creator.id}`,JSON.stringify(creator));}catch{}}
export function readTipRecipient(base:string,key:string):TipRecipient|null{try{const v=JSON.parse(sessionStorage.getItem(`bean-tip:${base}:${key}`)||'null');return v&&typeof v.id==='string'&&typeof v.name==='string'?v:null;}catch{return null;}}
export function bindTipCharge(base:string,id:string){if(typeof location==='undefined')return;const creatorId=new URLSearchParams(location.search).get('tipCreator');if(!creatorId)return;const recipient=readTipRecipient(base,`creator:${creatorId}`);if(recipient)try{sessionStorage.setItem(`bean-tip:${base}:order:${id}`,JSON.stringify(recipient));}catch{}}
