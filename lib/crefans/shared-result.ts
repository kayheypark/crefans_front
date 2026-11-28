import {aiPhotoCatalog} from './ai-photo-catalog';
import {aiPhotoPresetText,type AiPhotoPresetSelection} from './ai-photo';
import type {AiPhotoKind} from '@/types/crefans-studio-management';

export const shareTitle='나 이런 옷도 잘 어울려? 👀';
export const shareDescription='사진으로 옷도 바꿔 입고 메이크업도 해볼 수 있는 사이트 찾았어. 너라면 어떤 스타일 고를래?';
export function sharedCatalog(){
 return aiPhotoCatalog().groups.flatMap(group=>group.items.map(item=>({
  kind:(group.key==='costume'?'outfit':group.key) as AiPhotoKind,
  description:item.detail,shopOffer:item.shopOffer,label:group.label,title:item.title,image:item.image,prompt:aiPhotoPresetText(item.prompt)
 })));
}
export function sharePresetImages(selection:AiPhotoPresetSelection[]){
 const catalog=sharedCatalog();
 return selection.flatMap(p=>{const found=catalog.find(item=>item.kind===p.kind&&item.prompt===aiPhotoPresetText(p.prompt));return found?[found.image]:[];});
}
