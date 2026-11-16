import {aiPhotoPresetText,type AiPhotoPresetSelection} from './ai-photo';
import {aiPhotoPresetTitle,aiPhotoPresets} from './ai-photo-presets';
import {aiPhotoCostumes} from './ai-photo-costumes';
import {aiPhotoOutfitByPrompt} from './ai-photo-outfits';

/** What the guest trial sends to write a post title/body (2026-11-16): the chosen item names and the visitor's own request text. */
export type AiPhotoCaptionContext={labels:string[];prompt:string};

/** Display names of the chosen presets (costume, outfit part, catalog preset) and photo-library assets; unknown ones are skipped. */
export function aiPhotoSelectionLabels(selections:AiPhotoPresetSelection[],assets:{title:string}[]=[],gender:'original'|'female'|'male'='original'){
 const names=selections.map(item=>{
  const costume=aiPhotoCostumes.find(entry=>aiPhotoPresetText(entry.prompt)===item.prompt);if(costume)return costume.name;
  if(item.kind==='outfit'){const outfit=aiPhotoOutfitByPrompt(item.prompt);if(outfit)return outfit.name;}
  const example=aiPhotoPresets[item.kind]?.find(value=>aiPhotoPresetText(value)===item.prompt);
  return example?aiPhotoPresetTitle(item.kind,example,gender):aiPhotoPresetTitle(item.kind,item.prompt,gender);
 });
 return Array.from(new Set([...names,...assets.map(asset=>asset.title)].filter((name):name is string=>!!name&&!!name.trim()))).slice(0,12);
}
