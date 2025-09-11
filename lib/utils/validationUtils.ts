/**
 * 한국 이름 검증 (한글만 허용, 2-5자)
 * @param name 이름
 * @returns 유효성 여부
 */
export const isValidKoreanName = (name: string): boolean => {
  return /^[가-힣]{2,5}$/.test(name);
};


