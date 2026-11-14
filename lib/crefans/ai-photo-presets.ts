import {aiPhotoMaleBodyControls,aiPhotoBodyPrompt} from './ai-photo';
import type {AiPhotoKind} from '@/types/crefans-studio-management';

// 편집 가능한 제안 문구. 탐색/선택만으로는 생성 요청을 보내지 않는다.
export const aiPhotoComicWorldPreset='배경을 높은 트러스 천장과 동인 부스가 있는 서코 실내 행사장 분위기로 바꿔줘.';
export const aiPhotoNeutralExpressionPreset='미소 없이 입을 자연스럽게 다물고 얼굴에 힘을 뺀 무표정으로 바꿔줘.';
export const AI_PHOTO_PRESET_PAGE_SIZE=6;
export const aiPhotoPresets:Record<AiPhotoKind,readonly string[]>={
"camera": ["카메라를 눈높이에 두고 정면에서 촬영한 구도로 바꿔줘.", "카메라를 낮게 두고 살짝 올려다보는 로우 앵글로 바꿔줘.", "카메라를 높게 두고 살짝 내려다보는 하이 앵글로 바꿔줘.", "얼굴과 어깨를 담는 클로즈업 구도로 바꿔줘.", "허리 위 상반신을 담는 구도로 바꿔줘.", "머리부터 발끝까지 잘리지 않는 전신 구도로 바꿔줘.", "카메라를 인물의 뒤쪽 45도 눈높이에 두고 머리부터 발끝까지 담는 전신 구도로 바꿔줘.", "카메라를 인물의 옆쪽 눈높이에 두고 옆모습을 머리부터 발끝까지 담는 전신 구도로 바꿔줘.", "카메라를 눈높이에 두고 얼굴과 양쪽 어깨가 중심이 되는 타이트한 상반신 구도로 바꿔줘."],
"lens": ["스마트폰 전면 카메라로 정면 셀카를 찍은 구도로 바꿔줘. 팔을 뻗어 촬영한 자연스러운 가까운 거리와 가벼운 광각 느낌을 표현하고 얼굴이 중심에 오게 해줘. 거울은 추가하지 마.", "거울 앞에서 휴대폰을 들고 찍은 거울 셀카로 바꿔줘. 휴대폰과 자연스러운 거울 반사가 보이게 하되 얼굴을 과도하게 가리지 말고 인물과 손이 중복되지 않게 해줘.", "다른 사람이 DSLR로 촬영한 자연스러운 인물 사진 느낌으로 바꿔줘. 눈높이의 자연스러운 원근감, 또렷한 인물과 적당한 배경 흐림을 표현해줘. 촬영 장비는 화면에 추가하지 마.", "다른 사람이 먼 거리에서 대형 망원렌즈로 촬영한 인물 사진 느낌으로 바꿔줘. 얼굴 비율은 자연스럽게 유지하고 망원 특유의 압축된 거리감과 크게 흐려진 배경을 표현해줘. 촬영 장비는 화면에 추가하지 마."],
"body": ["가슴 크기를 조금 작게 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.", "가슴 크기를 조금 크게 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.", "힙 크기를 조금 작게 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.", "힙 크기를 조금 크게 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.", "전신의 키 비율을 조금 작아 보이게 자연스럽게 보정해줘.", "전신의 키 비율을 조금 커 보이게 자연스럽게 보정해줘."],
 "outfit": [
  "상의 색을 차분한 하늘색으로 바꿔줘.",
  "상의에 작은 리본 장식을 더해줘.",
  "칠한 옷 부분을 흰 셔츠로 바꿔줘.",
  "상의에 은은한 체크무늬를 넣어줘.",
  "옷의 광택을 줄이고 무광 느낌으로 바꿔줘.",
  "칠한 소매를 단정한 긴소매로 바꿔줘.",
  "상의의 리본 색을 연한 분홍색으로 바꿔줘.",
  "칠한 옷 부분을 차분한 네이비 톤으로 바꿔줘.",
  "옷의 주름을 자연스럽게 정돈해줘.",
  "상의 장식을 줄여 깔끔하게 바꿔줘.",
  "칠한 부분을 부드러운 니트 소재로 바꿔줘.",
  "의상 색을 전체적으로 톤 다운해줘."
 ],
 "makeup": [
  "입술을 자연스러운 코랄 톤으로 바꿔줘.",
  "볼에 은은한 생기를 더해줘.",
  "눈화장은 부드러운 브라운 톤으로 해줘.",
  "입술 색을 은은한 장밋빛으로 바꿔줘.",
  "메이크업의 반짝임을 조금 줄여줘.",
  "아이라인을 얇고 자연스럽게 정리해줘.",
  "눈썹을 원래 모양에 맞게 자연스럽게 정리해줘.",
  "볼에 연한 복숭아색 블러셔를 더해줘.",
  "눈가에 과하지 않은 음영을 더해줘.",
  "립 메이크업을 부드러운 매트 톤으로 바꿔줘.",
  "진한 색조를 줄이고 일상 메이크업처럼 해줘.",
  "피부 결을 살리면서 메이크업 톤을 정돈해줘."
 ],
 "expression": [
  aiPhotoNeutralExpressionPreset,
  "치아가 살짝 보이게 밝게 웃어줘.",
  "입을 다문 은은한 미소로 바꿔줘.",
  "눈웃음이 자연스럽게 보이게 해줘.",
  "입꼬리를 살짝 올려 편안한 표정으로 바꿔줘.",
  "놀란 듯 눈을 살짝 크게 뜬 표정으로 바꿔줘.",
  "한쪽 눈을 자연스럽게 윙크해줘.",
  "활짝 웃되 눈을 너무 감지 않게 해줘.",
  "미소를 조금 줄여 차분한 표정으로 바꿔줘.",
  "카메라를 보며 반가워하는 표정으로 바꿔줘.",
  "수줍게 웃는 표정으로 바꿔줘.",
  "입술에 힘을 빼고 편안한 미소로 바꿔줘.",
  "장난스럽게 살짝 웃는 표정으로 바꿔줘.",
  "눈매에 살짝 힘을 주고 입을 다문 도도하고 자신감 있는 표정으로 바꿔줘.", "카메라를 바라보며 입꼬리 한쪽을 살짝 올린 자신감 있는 미소로 바꿔줘.", "턱을 살짝 들고 시선을 카메라에 둔 당당한 표정으로 바꿔줘."],
 "pose": [
  "한 손을 들어 가볍게 인사해줘.",
  "상체를 살짝 돌려 자연스럽게 서줘.",
  "두 손을 편하게 모아줘.",
  "한 손을 허리에 가볍게 올려줘.",
  "고개를 살짝 기울인 자연스러운 포즈로 바꿔줘.",
  "한 손으로 작은 브이 포즈를 해줘.",
  "어깨에 힘을 빼고 정면을 바라보게 해줘.",
  "손을 가슴 앞에서 작게 흔드는 포즈로 해줘.",
  "상체를 살짝 앞으로 기울여 편하게 기대줘.",
  "손끝을 턱 가까이에 가볍게 대줘.",
  "두 손으로 작은 하트 포즈를 만들어줘.",
  "몸은 살짝 옆으로 두고 얼굴은 카메라를 보게 해줘.",
  "의자에 편하게 앉아 두 손을 무릎 위에 올린 포즈로 바꿔줘.",
  "벤치에 앉아 다리를 자연스럽게 내려놓은 포즈로 바꿔줘.",
  "발을 바닥에 대고 자연스럽게 쪼그려 앉은 포즈로 바꿔줘.",
  "벽에 가볍게 기대어 쉬는 포즈로 바꿔줘.",
  "바닥에 편하게 앉아 쉬는 포즈로 바꿔줘.",
  "카메라를 의식하지 않고 옆을 바라보는 자연스러운 스냅 포즈로 바꿔줘.",
  "걷다가 살짝 돌아보는 자연스러운 스냅 포즈로 바꿔줘.",
  "벤치에 앉아 가볍게 대화하는 듯한 자연스러운 포즈로 바꿔줘.",
  "계단에 편하게 걸터앉은 포즈로 바꿔줘.",
  "난간에 팔을 살짝 기대고 먼 곳을 보는 포즈로 바꿔줘.",
  "서서 가볍게 기지개를 켜며 쉬는 포즈로 바꿔줘.",
  "카메라 옆의 풍경을 보며 천천히 걷는 포즈로 바꿔줘.",
  "몸을 뒤로 돌리고 어깨 너머로 카메라를 자연스럽게 돌아보는 전신 포즈로 바꿔줘.", "두 발을 어깨너비보다 조금 넓게 벌리고 당당하게 서 있는 전신 포즈로 바꿔줘.", "두 팔을 머리 위로 자연스럽게 올리고 편안하게 서 있는 전신 포즈로 바꿔줘.", "의자 등받이를 앞으로 두고 거꾸로 앉아 등받이에 두 팔을 편하게 얹은 포즈로 바꿔줘.", "의자에 앉아 한쪽 다리를 다른 쪽 무릎 위로 자연스럽게 꼬고 두 손을 무릎에 올린 포즈로 바꿔줘.", "바닥에 편하게 앉아 한쪽 무릎만 세우고 다른 다리는 옆으로 접은 포즈로 바꿔줘."],
 "background": [
  aiPhotoComicWorldPreset,
  "배경을 깔끔한 흰 스튜디오로 바꿔줘.",
  "부드러운 햇빛이 드는 창가로 바꿔줘.",
  "배경을 차분한 회색 벽으로 바꿔줘.",
  "배경을 햇살이 부드러운 공원으로 바꿔줘.",
  "멀리 벚꽃이 흐릿하게 보이는 길로 바꿔줘.",
  "배경을 따뜻한 베이지색 스튜디오로 바꿔줘.",
  "배경의 복잡한 물건을 줄여 깔끔하게 정리해줘.",
  "배경을 조용한 카페 창가로 바꿔줘.",
  "해 질 녘 바다가 보이는 배경으로 바꿔줘.",
  "밤의 도시 불빛이 흐릿하게 보이게 해줘.",
  "배경을 은은한 파스텔 블루 스튜디오로 바꿔줘.",
  "초록 식물이 있는 밝은 실내로 배경을 바꿔줘."
 ]
};

export function aiPhotoPresetMatches(query:string,...values:string[]){
 const normalize=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'');
 const terms=query.trim().split(/\s+/).filter(Boolean).map(normalize),text=normalize(values.join(' '));
 return terms.every(term=>text.includes(term));
}

export type AiPhotoPosePosture='sitting'|'standing';
const sittingPoseIndexes=new Set([12,13,14,16,19,20,27,28,29]);
export function aiPhotoPosePosture(example:string):AiPhotoPosePosture{return sittingPoseIndexes.has(aiPhotoPresets.pose.indexOf(example))?'sitting':'standing';}

export function aiPhotoPresetPage(kind:AiPhotoKind,page:number,gender:'original'|'female'|'male'='original',query='',posture?:AiPhotoPosePosture){
 const available=kind==='body'&&gender==='male'?aiPhotoMaleBodyControls.map(control=>aiPhotoBodyPrompt(control.key,1)):kind==='makeup'&&gender!=='original'?aiPhotoPresets.makeup.filter((_,index)=>(index%2===0?'female':'male')===gender):aiPhotoPresets[kind];
 const ordered=kind==='pose'?[...aiPhotoPresets.pose.slice(12),...aiPhotoPresets.pose.slice(0,12)]:available;
 const examples=ordered.filter(example=>(kind!=='pose'||!posture||aiPhotoPosePosture(example)===posture)&&aiPhotoPresetMatches(query,aiPhotoPresetTitle(kind,example,gender),example)),pages=Math.max(1,Math.ceil(examples.length/AI_PHOTO_PRESET_PAGE_SIZE));
 const index=((page%pages)+pages)%pages;
 return {examples:examples.slice(index*AI_PHOTO_PRESET_PAGE_SIZE,(index+1)*AI_PHOTO_PRESET_PAGE_SIZE),index,pages,total:examples.length};
}

export function aiPhotoPresetImage(kind:AiPhotoKind,example:string,gender:'original'|'female'|'male'='original'){
 if(kind==='pose'){const index=aiPhotoPresets.pose.indexOf(example);return `/brand/ai-photo/pose-mascot/pose-${String(index+1).padStart(2,'0')}-${index===19?'v2':'v1'}.webp`;}
 if(kind==='lens')return `/brand/ai-photo/shoot-concept/shoot-${String(aiPhotoPresets.lens.indexOf(example)+1).padStart(2,'0')}-v1.webp`;
 if(kind==='camera')return `/brand/ai-photo/camera-mascot/camera-${String(aiPhotoPresets.camera.indexOf(example)+1).padStart(2,'0')}-v1.webp`;
 if(kind==='expression')return `/brand/ai-photo/expression-mascot/expression-${String(aiPhotoPresets.expression.indexOf(example)+1).padStart(2,'0')}-v1.webp`;
 if(kind==='body'&&gender==='male'){const control=aiPhotoMaleBodyControls.find(item=>aiPhotoBodyPrompt(item.key,1)===example);if(control)return `/brand/ai-photo/presets/body-male-${control.key}-v1.webp`;}
 const index=aiPhotoPresets[kind].filter(value=>value!==aiPhotoComicWorldPreset&&value!==aiPhotoNeutralExpressionPreset).indexOf(example);
 const id=example===aiPhotoComicWorldPreset?'background-comicworld':`${kind}-${String(index+1).padStart(2,'0')}`;
 return `/brand/ai-photo/presets/${id}-v1.webp`;
}

// 카드의 짧은 이름과 실제 생성 요청을 분리한다. 순서는 각 프리셋과 같다.
export const aiPhotoPresetTitles:Record<AiPhotoKind,readonly string[]>={
 "outfit":["하늘색 상의", "리본 포인트", "화이트 셔츠", "은은한 체크", "무광 소재", "단정한 긴소매", "핑크 리본", "네이비 톤", "주름 정돈", "장식 줄이기", "포근한 니트", "차분한 색감"],
 "makeup":["코랄 립", "생기 있는 볼", "브라운 아이", "로즈 립", "펄 줄이기", "얇은 아이라인", "자연스러운 눈썹", "피치 블러셔", "은은한 음영", "매트 립", "데일리 메이크업", "피부 톤 정돈"],
 "expression":["무표정", "환한 미소", "잔잔한 미소", "눈웃음", "편안한 표정", "놀란 표정", "윙크", "활짝 웃기", "차분한 표정", "반가운 표정", "수줍은 미소", "힘 뺀 미소", "장난스러운 미소", "도도한 시선", "자신감 있는 미소", "턱 살짝 들기"],
 "pose":["손인사", "살짝 돌아서기", "두 손 모으기", "허리에 손", "고개 기울이기", "브이", "정면 서기", "작은 손인사", "앞으로 기대기", "턱에 손", "손하트", "옆모습 시선", "의자에 앉기", "벤치에 앉기", "쪼그려 앉기", "벽에 기대 쉬기", "바닥에 앉기", "시선 밖 스냅", "걷다 돌아보기", "대화하는 스냅", "계단에 앉기", "난간에 기대기", "기지개", "산책 스냅", "뒤돌아보기", "다리 넓혀 서기", "양팔 머리 위로", "의자 거꾸로 앉기", "다리 꼬아 앉기", "한쪽 무릎 세우기"],
 "background":["서코 실내", "화이트 스튜디오", "햇살 드는 창가", "그레이 스튜디오", "햇살 공원", "벚꽃길", "베이지 스튜디오", "깔끔한 실내", "카페 창가", "노을 바다", "도시 야경", "블루 스튜디오", "식물 가득 실내"],
 "camera":["눈높이 정면", "로우 앵글", "하이 앵글", "얼굴 클로즈업", "상반신", "전신", "뒤쪽 45도", "측면 전신", "어깨 중심"],
 "lens":["셀카 폰카(정면)", "거울샷", "DSLR", "대포카메라"],
 "body":["가슴 조금 작게", "가슴 조금 크게", "힙 조금 작게", "힙 조금 크게", "키 조금 작게", "키 조금 크게"]
};
export function aiPhotoPresetTitle(kind:AiPhotoKind,example:string,gender:'original'|'female'|'male'='original'){if(kind==='body'&&gender==='male'){const control=aiPhotoMaleBodyControls.find(item=>aiPhotoBodyPrompt(item.key,1)===example);if(control)return control.label;}return aiPhotoPresetTitles[kind][aiPhotoPresets[kind].indexOf(example)];}
