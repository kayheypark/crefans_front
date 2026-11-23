import type {PhotoAssetCategory} from '@/types/crefans-photo-library';
import type {AiPhotoEditKind} from '@/types/crefans-studio-management';
// 2026-11-24 user request: 내 얼굴·포즈·배경·옷·카메라 뒷면(후면 카메라 구도)·거울샷·셀카·뒷모습. 구도·촬영 컨셉·메이크업·표정(legacy)은
// 이미 저장한 사진이 계속 보이고 쓰이도록 남기되 새로 저장할 때는 고르지 않는다(그 분류 사진의 정보 수정 때만 보임).
export const photoAssetCategories:{value:PhotoAssetCategory;label:string;legacy?:true}[]=[{value:'face',label:'내 얼굴'},{value:'pose',label:'포즈'},{value:'background',label:'배경'},{value:'outfit',label:'옷'},{value:'rear_camera',label:'카메라 뒷면'},{value:'mirror',label:'거울샷'},{value:'selfie',label:'셀카'},{value:'back_view',label:'뒷모습'},{value:'camera',label:'구도',legacy:true},{value:'lens',label:'촬영 컨셉',legacy:true},{value:'makeup',label:'메이크업',legacy:true},{value:'expression',label:'표정',legacy:true}];
export const photoAssetLabel=(category:PhotoAssetCategory)=>photoAssetCategories.find(item=>item.value===category)!.label;
/** Categories offered when saving: the current ones plus the photo's own legacy category. */
export const photoAssetSaveOptions=(current?:PhotoAssetCategory)=>photoAssetCategories.filter(item=>!item.legacy||item.value===current);
// The AI edit kind a library photo applies to (same map as server ai-photo-library.ts LIBRARY_KIND). One photo per kind:
// 카메라 뒷면·거울샷·셀카 are shooting concepts (lens) and 뒷모습 is a pose.
const KIND:Record<PhotoAssetCategory,AiPhotoEditKind>={face:'face',pose:'pose',background:'background',outfit:'outfit',rear_camera:'lens',mirror:'lens',selfie:'lens',back_view:'pose',camera:'camera',lens:'lens',makeup:'makeup',expression:'expression'};
export const photoAssetKind=(category:PhotoAssetCategory)=>KIND[category];
/** Library photos per generation (server LIBRARY_REFERENCE_MAX, 2026-11-24: 4 → 6). */
export const PHOTO_LIBRARY_REFERENCE_MAX=6;
