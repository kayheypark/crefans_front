/** 2026-11-21 user decision: Coupang Partners links on the result screen, only for non-franchise (general) costumes. */
import {aiPhotoCostumes} from './ai-photo-costumes';
import {aiPhotoPresetText} from './ai-photo';
// Costume id → Coupang Partners link (made by hand in the Partners dashboard).
export const COSTUME_SHOP_LINKS:Record<string,string>={};
// Fair Trade Commission endorsement guideline: state plainly that a commission is paid, right next to the link.
export const COSTUME_SHOP_NOTICE='쿠팡 파트너스 활동의 일환으로, 이 링크로 구매하면 크레팬스가 일정액의 수수료를 받습니다.';
export function costumeShopLink(outfitPrompts:string[]){
 for(const prompt of outfitPrompts){
  const costume=aiPhotoCostumes.find(item=>aiPhotoPresetText(item.prompt)===prompt);
  if(costume&&costume.category==='general'&&COSTUME_SHOP_LINKS[costume.id])return{name:costume.name,url:COSTUME_SHOP_LINKS[costume.id]};
 }
 return null;
}
