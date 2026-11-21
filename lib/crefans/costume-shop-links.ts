/** 2026-11-21 user decision: Coupang Partners links on the result screen, only for non-franchise (general) costumes. */
import {aiPhotoCostumes} from './ai-photo-costumes';
import {aiPhotoPresetText} from './ai-photo';
// Costume id → Coupang Partners link (made by hand in the Partners dashboard).
export const COSTUME_SHOP_LINKS:Record<string,string>={'80974e':'https://link.coupang.com/a/iQzsLQwK6u'};// 세일러 코스튬 → 쿠팡 '세일러 코스튬' 검색
// Wording required by Coupang Partners (link creation page, 2026-11-21), shown right next to the link.
export const COSTUME_SHOP_NOTICE='이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
export function costumeShopLink(outfitPrompts:string[]){
 for(const prompt of outfitPrompts){
  const costume=aiPhotoCostumes.find(item=>aiPhotoPresetText(item.prompt)===prompt);
  if(costume&&costume.category==='general'&&COSTUME_SHOP_LINKS[costume.id])return{name:costume.name,image:costume.image,url:COSTUME_SHOP_LINKS[costume.id]};
 }
 return null;
}
