export const aiPhotoBackgrounds=[
 {id:'b7a101',category:'indoor',title:'차분한 침실',prompt:'배경을 차분한 침실 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a102',category:'indoor',title:'그레이 전시장',prompt:'배경을 그레이 전시장 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a103',category:'indoor',title:'핑크 네온 스튜디오',prompt:'배경을 핑크 네온 스튜디오 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a104',category:'indoor',title:'민트 테이블 스튜디오',prompt:'배경을 민트 테이블 스튜디오 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a105',category:'indoor',title:'웜톤 행사장',prompt:'배경을 웜톤 행사장 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a106',category:'indoor',title:'형광등 로비',prompt:'배경을 형광등 로비 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a107',category:'indoor',title:'퍼플 파티션',prompt:'배경을 퍼플 파티션 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b201',category:'indoor',title:'햇살 거울룸',prompt:'배경을 햇살 거울룸 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b202',category:'indoor',title:'화이트 벤치룸',prompt:'배경을 화이트 벤치룸 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b203',category:'indoor',title:'세이지 스파룸',prompt:'배경을 세이지 스파룸 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b204',category:'indoor',title:'버건디 벨벳 세트',prompt:'배경을 버건디 벨벳 세트 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b205',category:'indoor',title:'핑크 오간자 세트',prompt:'배경을 핑크 오간자 세트 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b206',category:'indoor',title:'옐로 팝업 무대',prompt:'배경을 옐로 팝업 무대 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b207',category:'indoor',title:'쿨톤 행사장 복도',prompt:'배경을 쿨톤 행사장 복도 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b208',category:'outdoor',title:'도심 광장 야경',prompt:'배경을 도심 광장 야경 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'c8b209',category:'outdoor',title:'야경 테라스 난간',prompt:'배경을 야경 테라스 난간 참고 사진의 공간과 조명으로 바꿔줘.'}
] as const;
export function aiPhotoBackgroundId(prompt:string|undefined){return aiPhotoBackgrounds.find(item=>item.prompt===prompt)?.id;}
