export const aiPhotoBackgrounds=[
 {id:'b7a101',title:'차분한 침실',prompt:'배경을 차분한 침실 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a102',title:'그레이 전시장',prompt:'배경을 그레이 전시장 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a103',title:'핑크 네온 스튜디오',prompt:'배경을 핑크 네온 스튜디오 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a104',title:'민트 테이블 스튜디오',prompt:'배경을 민트 테이블 스튜디오 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a105',title:'웜톤 행사장',prompt:'배경을 웜톤 행사장 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a106',title:'형광등 로비',prompt:'배경을 형광등 로비 참고 사진의 공간과 조명으로 바꿔줘.'},
 {id:'b7a107',title:'퍼플 파티션',prompt:'배경을 퍼플 파티션 참고 사진의 공간과 조명으로 바꿔줘.'}
] as const;
export function aiPhotoBackgroundId(prompt:string|undefined){return aiPhotoBackgrounds.find(item=>item.prompt===prompt)?.id;}
