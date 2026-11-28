// 2026-11-21 user request: the ops console lists every AI photo preset (category, image, label, prompt, Coupang link).
// The catalog lives in this app, so it is served from here as JSON; prompts are already public in the browser bundle.
import {aiPhotoKinds,aiPhotoPresetText} from './ai-photo';
import {aiPhotoPresets,aiPhotoPresetImage,aiPhotoPresetTitles,aiPhotoBackgroundCategory,aiPhotoPosePosture,aiPhotoMakeupGender} from './ai-photo-presets';
import {aiPhotoCostumes,aiPhotoCostumeCategories} from './ai-photo-costumes';
import {aiPhotoBackgroundId} from './ai-photo-backgrounds';
import {costumeShopOffer,COSTUME_SHOP_LINKS} from './costume-shop-links';
import {aiPhotoOutfitByPrompt} from './ai-photo-outfits';

export type CatalogItem={id:string;category:string;accessPrompt?:string;referenceId?:string;title:string;detail?:string;prompt:string;image:string;shopUrl?:string|null;shopOffer?:ReturnType<typeof costumeShopOffer>};
export type CatalogGroup={key:string;label:string;categories:{value:string;label:string}[];items:CatalogItem[]};

const sub:Record<string,{value:string;label:string}[]>={
 background:[{value:'indoor',label:'실내'},{value:'outdoor',label:'야외'}],
 pose:[{value:'standing',label:'서기'},{value:'sitting',label:'앉기'}],
 makeup:[{value:'female',label:'여성'},{value:'male',label:'남성'}],
 outfit:[{value:'female-top',label:'여성 상의'},{value:'female-bottom',label:'여성 하의'},{value:'male-top',label:'남성 상의'},{value:'male-bottom',label:'남성 하의'}],
};
function category(kind:string,prompt:string){
 if(kind==='background')return aiPhotoBackgroundCategory(prompt);
 if(kind==='pose')return aiPhotoPosePosture(prompt);
 if(kind==='makeup')return aiPhotoMakeupGender(prompt)||'female';
 if(kind==='outfit'){const o=aiPhotoOutfitByPrompt(prompt);return o?`${o.gender}-${o.part}`:'';}
 return '';
}

export function aiPhotoCatalog():{groups:CatalogGroup[]}{
 const costumes:CatalogGroup={key:'costume',label:'코스튬',categories:aiPhotoCostumeCategories.map(c=>({value:c.value,label:c.label})),
  items:aiPhotoCostumes.map(c=>({id:c.id,referenceId:c.id,category:c.category,title:c.name,detail:c.detail,prompt:aiPhotoPresetText(c.prompt),image:c.image,shopOffer:costumeShopOffer(c),shopUrl:COSTUME_SHOP_LINKS[c.id]||null}))};
 const kinds=aiPhotoKinds.filter(k=>k.value!=='body').map(k=>({key:k.value,label:k.label,categories:sub[k.value]||[],
  items:aiPhotoPresets[k.value].map((prompt,i)=>({id:`${k.value}-${i+1}`,accessPrompt:aiPhotoPresetText(prompt),referenceId:k.value==='background'?aiPhotoBackgroundId(prompt):undefined,category:category(k.value,prompt),title:aiPhotoPresetTitles[k.value][i]||'',prompt,image:aiPhotoPresetImage(k.value,prompt)}))}));
 return{groups:[costumes,...kinds]};
}
