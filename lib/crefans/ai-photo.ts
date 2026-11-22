// 스튜디오 AI 사진 편집 규칙(2026-11-08 사용자 결정: 시안 A + 의상 영역 칠하기, 무료·하루 10회·한 번에 1장).
// 생성 동작은 서비스 모델이 주입하며 프리셋 탐색은 서버나 AI를 호출하지 않는다.
import {containsPersonalData} from './advisor';
import type {AiPhotoKind,AiPhotoStyle} from '@/types/crefans-studio-management';

export const AI_PHOTO_DAILY_LIMIT=10;
export const AI_PHOTO_IMAGES_PER_REQUEST=1;
export const aiPhotoGenerationMethods=[
// 2026-11-20 user decision: the fast method often misses the requested outfit/pose, so its name and the line below the choices say
// it is for a quick feel check. 2026-11-21 user decision: the default choice is standard (1 ticket), not fast.
 {value:'fast',label:'느낌만 빠르게',cost:0.5,hint:'분위기만 빠르게 확인해요. 의상·포즈가 다르게 나올 수 있어요.'},
 {value:'standard',label:'표준',cost:1,hint:'대부분 원하는 모습에 가깝게 나와요.'},
 {value:'precise',label:'디테일 정밀하게',cost:2,hint:'의상·얼굴을 가장 꼼꼼하게 맞춰요.'},
] as const;
export type AiPhotoGenerationMethod=(typeof aiPhotoGenerationMethods)[number]['value'];
export const AI_PHOTO_DEFAULT_METHOD=aiPhotoGenerationMethods.find(option=>option.value==='standard')!;
export const AI_PHOTO_PROMPT_MAX=2000;
export const aiPhotoPresetText=(value:string)=>value.replace(' 내 얼굴·나이·체형·피부색과 배경은 그대로 유지해줘.','').trim();
// 2026-11-20 user decision: the body correction tab is hidden until the clothing/neckline problem is solved (a bigger bust
// opened a V in a closed hoodie in dev tests). Set to true to reopen it; the body code stays in place.
export const AI_PHOTO_BODY_OPEN=false;
export const aiPhotoKinds:{value:AiPhotoKind;label:string;placeholder:string}[]=[
 {value:'outfit',label:'옷',placeholder:'옷을 흰색 세일러 교복 코스튬으로'},
 {value:'makeup',label:'메이크업',placeholder:'입술을 자연스러운 코랄 톤으로 바꿔줘.'},
 {value:'expression',label:'표정',placeholder:'치아가 살짝 보이게 밝게 웃어줘.'},
 {value:'pose',label:'포즈',placeholder:'벚꽃 아래 벤치에 앉아 카메라를 바라보는 포즈'},
 {value:'body',label:'신체 보정',placeholder:'가슴·힙 크기와 키 비율을 자연스럽게 보정해줘.'},
 {value:'camera',label:'구도',placeholder:'전신이 잘리지 않는 눈높이 구도로 바꿔줘.'},
 {value:'lens',label:'촬영컨셉',placeholder:'거울 앞에서 휴대폰을 들고 찍은 거울샷으로 바꿔줘.'},
 {value:'background',label:'배경',placeholder:'해 질 녘 벚꽃길, 부드러운 역광'},
];
export const aiPhotoStyles:{value:AiPhotoStyle;label:string}[]=[
 {value:'photo',label:'실사 사진 느낌'},{value:'cosplay',label:'코스프레 촬영'},{value:'daily',label:'일상 스냅'},
];
/** First problem with the request, or '' when it can be sent. The server repeats every check. */
export function aiPhotoProblem({prompt,consent,kind,hasMask,remaining,requireMask=false}:{prompt:string;consent:boolean;kind:import('@/types/crefans-studio-management').AiPhotoEditKind;hasMask:boolean;remaining:number;requireMask?:boolean}){
 const text=prompt.trim();
 if(remaining<=0)return '무료 횟수를 모두 썼어요. 매일 오전 9시에 다시 채워지고, AI 이용권을 구매하면 계속 만들 수 있어요.';
 if(kind==='outfit'&&requireMask&&!hasMask)return '바꿀 옷 부분을 사진 위에 칠해 주세요.';
 if(!text)return '원하는 모습을 적어 주세요.';
 if(text.length>AI_PHOTO_PROMPT_MAX)return `${AI_PHOTO_PROMPT_MAX}자 이내로 적어 주세요.`;
 if(containsPersonalData(text))return '이메일·전화번호 같은 개인정보는 빼고 적어 주세요.';
 if(!consent)return '사진 속 인물 확인에 동의해 주세요.';
 return '';
}

export const aiPhotoBodyControls=[{key:'chest',label:'가슴 크기'},{key:'hip',label:'힙 크기'},{key:'height',label:'키 비율'}] as const;
export const aiPhotoMaleBodyControls=[{key:'upper',label:'상체 근육'},{key:'lower',label:'하체 근육'},{key:'shoulder',label:'어깨 너비'},{key:'height',label:'키 비율'}] as const;
// Native range uses step=any; pointer values within 2% of the full track snap to five anchors.
export function aiPhotoBodySnap(value:number){const bounded=Math.max(-2,Math.min(2,value)),anchor=Math.round(bounded);return Math.abs(bounded-anchor)<=.08?anchor:bounded;}
export function aiPhotoBodyStrength(value:number){return Number((Math.abs(value)*50).toFixed(1));}
export function aiPhotoBodyPrompt(key:string,level:number){
 if(!level)return '';
 const amount=Math.abs(level)<=1?'조금':'좀 더',direction=level>0?'크게':'작게';
 const strength=Number.isInteger(level)?'':` 보정 강도는 최대 100 중 ${aiPhotoBodyStrength(level)}로 적용해줘.`;
 if(key==='upper'||key==='lower')return `${key==='upper'?'가슴·팔·등의 상체':'허벅지·종아리의 하체'} 근육 볼륨을 ${amount} ${level>0?'탄탄하게':'슬림하게'} 자연스럽게 보정해줘. 옷과 포즈는 유지해줘.`+strength;
 if(key==='shoulder')return `어깨 너비를 ${amount} ${level>0?'넓게':'좁게'} 자연스럽게 보정해줘. 옷과 포즈는 유지해줘.`+strength;
 return (key==='height'?`전신의 키 비율을 ${amount} ${level>0?'커':'작아'} 보이게 자연스럽게 보정해줘.`:`${key==='chest'?'가슴':'힙'} 크기를 ${amount} ${direction} 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.`)+strength;
}

export type AiPhotoPresetSelection={kind:AiPhotoKind;prompt:string};
/** A preset or a personal library reference (2026-11-22: library may add 'face'). */
export type AiPhotoPromptPart={kind:import('@/types/crefans-studio-management').AiPhotoEditKind;prompt:string};
const aiPhotoGenderPrompts={female:'생성 인물을 성인 여성으로 바꿔줘.',male:'생성 인물을 성인 남성으로 바꿔줘.'};
export function buildAiPhotoPrompt(presets:readonly {prompt:string}[],custom:string,gender:'original'|'female'|'male'){
 return [...presets.map(item=>item.prompt),...(gender==='original'?[]:[aiPhotoGenderPrompts[gender]]),custom.trim()].filter(Boolean).join('\n');
}

/** Update one body control while retaining the other controls and non-body presets. */
export function updateAiPhotoBodySelection(presets:readonly AiPhotoPresetSelection[],current:Readonly<Record<string,number>>,key:string,level:number){
 const values={...current,[key]:level};
 if(!level)delete values[key];
 return {values,presets:[...presets.filter(item=>item.kind!=='body'),...Object.entries(values).map(([key,value])=>({kind:'body' as const,prompt:aiPhotoBodyPrompt(key,value)}))]};
}
