// 2026-11-23 user request: within each preset tab / costume franchise, show the most-used presets first.
// Snapshot of the production table ai_preset_usage_daily (successful generations, 2026-11-17~2026-11-23),
// SUM(count) per kind·preset_key, read 2026-11-23. Keys: costume/background-catalog id (6 hex) or the card title.
// Missing keys count as 0; ties and 0s keep the catalog order (stable sort). Refresh by re-running the query.
import type {AiPhotoKind} from '@/types/crefans-studio-management';

export const aiPhotoPresetUsage:Record<AiPhotoKind,Readonly<Record<string,number>>>={
 outfit:{"ce1f18":12,"4a0c8f":11,"e614f6":8,"090a1c":8,"70219a":8,"60e1ae":7,"773106":5,"df51ea":5,"80974e":4,"173f1e":4,"d63f76":4,"0c643c":4,"eaeaf8":4,"0ffbe3":4,"7281fe":3,"0ed2b0":3,"8658e9":3,"232522":3,"b25a15":3,"cbe05e":3,"4f8bc3":3,"7a16e3":3,"9eca04":3,"a1dd79":3,"248f61":3,"4ce772":3,"ab36e8":2,"871d4a":2,"bb2296":2,"cab1ff":2,"a1338d":2,"fa610d":2,"106efc":2,"25a4ca":2,"449db3":2,"f350a0":2,"ffb58f":2,"0d0a26":2,"29581e":2,"83ce97":2,"a4fb5f":2,"0a952f":1,"8971c9":1,"eef222":1,"f3a1a1":1,"17d4c0":1,"282978":1,"318dba":1,"6ee320":1,"761c54":1,"9a01b2":1,"b7c01e":1,"bbb90a":1,"190513":1,"3fc667":1,"6960d5":1,"87ad51":1,"a305ae":1,"ad67a7":1,"adb726":1,"be80aa":1,"d2d3b1":1,"da6901":1,"e62219":1,"e69f63":1,"243fa8":1,"3ae52a":1,"46ce6a":1,"666147":1,"814f47":1,"85a86e":1,"8aa6e2":1,"976ae8":1,"b158d4":1,"b4bf5d":1,"d32edc":1,"d9810c":1,"7f8d0d":1,"841c2c":1},
 contacts:{},
 skin:{},
 makeup:{"코스프레 베이스":29,"인형 메이크업":25,"지뢰계 메이크업":18,"코랄 립":11,"데일리 메이크업":10,"은은한 음영":7,"펄 줄이기":7,"숙취 블러셔":7,"눈 밑 점":5,"애교살 글리터":5,"자연스러운 눈썹":4,"하얀 피부 베이스":4,"브라운 아이":3,"피부 톤 정돈":2},
 expression:{"무표정":20,"잔잔한 미소":14,"윙크":6,"눈웃음":6,"도도한 시선":6,"수줍은 미소":4,"환한 미소":4,"힘 뺀 미소":2,"활짝 웃기":1},
 pose:{"다리 꼬아 앉기":13,"의자에 앉기":10,"쪼그려 앉기":9,"다리 모아 옆앉기":8,"벤치에 앉기":7,"소품 어깨에 메기":6,"무릎 꿇고 앉기":6,"뒤로 손 짚고 기대기":4,"옆으로 기대 눕기":4,"거울 셀카":3,"고양이 손 포즈":3,"카메라로 손 뻗기":3,"한 발 뒤로 접기":3,"계단에 앉기":3,"앉아서 팔 올리기":3,"시선 밖 스냅":2,"뒤돌아보기":2,"벽에 다리 올려 눕기":2,"캐리어에 앉기":2,"무릎 안고 앉기":2,"손하트":2,"난간에 기대기":2,"의자 거꾸로 앉기":2,"의자 위 무릎 세워 앉기":2,"걷다 돌아보기":1,"허리에 손":1,"대화하는 스냅":1,"벽에 기대 쉬기":1,"하이킥":1,"산책 스냅":1},
 background:{"촬영스튜디오(흰배경)":9,"b7a103":7,"촬영스튜디오(검정배경)":5,"b7a104":5,"b7a101":5,"코믹월드":3,"b7a102":2,"b7a107":2,"d9c301":2,"ead412":2,"c8b201":1,"c8b208":1,"벚꽃길":1,"fb5082":1,"ead401":1,"fb5051":1,"fb5053":1,"fb5077":1,"내 방(낮 형광등 끔)":1,"내 방(밤 형광등)":1,"d9c306":1,"fb5087":1},
 camera:{"하이 앵글":32,"전신":16,"눈높이 정면":14,"로우 앵글":9,"얼굴 클로즈업":4,"뒤쪽 45도":2,"상반신":2,"어깨 중심":1},
 lens:{"거울샷":28,"DSLR":21,"대포카메라":19,"셀카 폰카(정면)":11},
 body:{"가슴 조금 크게":2,"키 조금 크게":1,"힙 조금 크게":1},
};

/** Most-used first; unused and tied items keep their given order. */
export function aiPhotoSortByUsage<T>(kind:AiPhotoKind,items:readonly T[],key:(item:T)=>string|undefined):T[]{
 const usage=aiPhotoPresetUsage[kind],count=(item:T)=>usage[key(item)??'']??0;
 return [...items].sort((a,b)=>count(b)-count(a));
}
