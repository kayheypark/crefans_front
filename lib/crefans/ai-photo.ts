// 스튜디오 AI 사진 편집 규칙(2026-11-08 사용자 결정: 시안 A + 의상 영역 칠하기, 무료·하루 10회·한 번에 1장).
// 생성 동작은 서비스 모델이 주입하며 프리셋 탐색은 서버나 AI를 호출하지 않는다.
import {containsPersonalData} from './advisor';
import type {AiPhotoKind,AiPhotoStyle} from '@/types/crefans-studio-management';

export const AI_PHOTO_DAILY_LIMIT=10;
export const AI_PHOTO_IMAGES_PER_REQUEST=1;
export const AI_PHOTO_PROMPT_MAX=2000;
export const aiPhotoPresetText=(value:string)=>value.replace(' 내 얼굴·나이·체형·피부색과 배경은 그대로 유지해줘.','').trim();
export function appendAiPhotoPrompt(current:string,value:string){const next=aiPhotoPresetText(value);return current.includes(next)?current:[current.trim(),next].filter(Boolean).join('\n');}
export function selectedAiPhotoPresetIndex(prompt:string,values:readonly string[]){let selected=-1,position=-1;values.forEach((value,index)=>{const found=prompt.lastIndexOf(aiPhotoPresetText(value));if(found>position){position=found;selected=index;}});return selected;}
export const aiPhotoKinds:{value:AiPhotoKind;label:string;placeholder:string}[]=[
 {value:'outfit',label:'옷',placeholder:'칠한 부분의 옷을 흰색 세일러 교복 코스튬으로'},
 {value:'makeup',label:'메이크업',placeholder:'입술을 자연스러운 코랄 톤으로 바꿔줘.'},
 {value:'expression',label:'표정',placeholder:'치아가 살짝 보이게 밝게 웃어줘.'},
 {value:'pose',label:'포즈',placeholder:'벚꽃 아래 벤치에 앉아 카메라를 바라보는 포즈'},
 {value:'body',label:'신체 보정',placeholder:'가슴·힙 크기와 키 비율을 자연스럽게 보정해줘.'},
 {value:'camera',label:'구도',placeholder:'전신이 잘리지 않는 눈높이 구도로 바꿔줘.'},
 {value:'lens',label:'렌즈',placeholder:'캐논 85mm 렌즈로 담은 얕은 심도 느낌'},
 {value:'background',label:'배경',placeholder:'해 질 녘 벚꽃길, 부드러운 역광'},
];
export const aiPhotoStyles:{value:AiPhotoStyle;label:string}[]=[
 {value:'photo',label:'실사 사진 느낌'},{value:'cosplay',label:'코스프레 촬영'},{value:'daily',label:'일상 스냅'},
];
/** First problem with the request, or '' when it can be sent. The server repeats every check. */
export function aiPhotoProblem({prompt,consent,kind,hasMask,remaining}:{prompt:string;consent:boolean;kind:AiPhotoKind;hasMask:boolean;remaining:number}){
 const text=prompt.trim();
 if(remaining<=0)return '오늘 만들 수 있는 횟수를 모두 썼어요. 내일 다시 이용해 주세요.';
 if(kind==='outfit'&&!hasMask)return '바꿀 옷 부분을 사진 위에 칠해 주세요.';
 if(!text)return '원하는 모습을 적어 주세요.';
 if(text.length>AI_PHOTO_PROMPT_MAX)return `${AI_PHOTO_PROMPT_MAX}자 이내로 적어 주세요.`;
 if(containsPersonalData(text))return '이메일·전화번호 같은 개인정보는 빼고 적어 주세요.';
 if(!consent)return '사진 속 인물 확인에 동의해 주세요.';
 return '';
}

export const aiPhotoBodyControls=[{key:'chest',label:'가슴 크기'},{key:'hip',label:'힙 크기'},{key:'height',label:'키 비율'}] as const;
export function aiPhotoBodyPrompt(key:string,level:number){
 if(!level)return '';
 const amount=Math.abs(level)===1?'조금':'좀 더',direction=level>0?'크게':'작게';
 return key==='height'?`전신의 키 비율을 ${amount} ${level>0?'커':'작아'} 보이게 자연스럽게 보정해줘.`:`${key==='chest'?'가슴':'힙'} 크기를 ${amount} ${direction} 자연스럽게 보정해줘. 옷은 입은 상태로 유지해줘.`;
}
