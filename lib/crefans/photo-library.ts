import type {PhotoAssetCategory} from '@/types/crefans-photo-library';
export const photoAssetCategories:{value:PhotoAssetCategory;label:string}[]=[{value:'pose',label:'포즈'},{value:'background',label:'배경'},{value:'camera',label:'구도'},{value:'lens',label:'촬영 컨셉'},{value:'outfit',label:'의상'},{value:'makeup',label:'메이크업'},{value:'expression',label:'표정'}];
export const photoAssetLabel=(category:PhotoAssetCategory)=>photoAssetCategories.find(item=>item.value===category)!.label;
