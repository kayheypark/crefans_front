// 2026-11-21: show a shopping card for any catalog costume. Only general costumes with a registered Partners link earn commission.
import {aiPhotoCostumeCategories,aiPhotoCostumes,isFranchiseCostume} from './ai-photo-costumes';
import {aiPhotoPresetText} from './ai-photo';

export const COSTUME_SHOP_LINKS:Record<string,string>={'80974e':'https://link.coupang.com/a/iQzsLQwK6u'};
export const COSTUME_SHOP_NOTICE='이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

export function costumeShopLink(outfitPrompts:string[]){
 for(const prompt of outfitPrompts){
  const costume=aiPhotoCostumes.find(item=>aiPhotoPresetText(item.prompt)===prompt);
  if(!costume)continue;
  const franchise=isFranchiseCostume(costume);
  const affiliateUrl=franchise?undefined:COSTUME_SHOP_LINKS[costume.id];
  const category=franchise?aiPhotoCostumeCategories.find(item=>item.value===costume.category)?.label:undefined;
  const query=[category,costume.name,'코스프레 의상'].filter(Boolean).join(' ');
  const search=new URL('https://www.coupang.com/np/search');
  search.searchParams.set('q',query);
  return{name:costume.name,image:costume.image,url:affiliateUrl||search.href,affiliate:!!affiliateUrl};
 }
 return null;
}
