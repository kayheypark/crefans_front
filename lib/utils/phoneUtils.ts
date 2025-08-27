/**
 * 휴대폰 번호에서 하이픈과 공백을 제거합니다.
 * @param phoneNumber 휴대폰 번호
 * @returns 정리된 휴대폰 번호
 */
export const cleanPhoneNumber = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^0-9]/g, "");
};

/**
 * 휴대폰 번호가 유효한 한국 휴대폰 번호 형식인지 검증합니다.
 * @param phoneNumber 휴대폰 번호
 * @returns 유효성 여부
 */
export const isValidKoreanPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  return /^010\d{8}$/.test(cleaned);
};

/**
 * 휴대폰 번호를 하이픈이 포함된 형식으로 포맷팅합니다.
 * @param phoneNumber 휴대폰 번호
 * @returns 포맷팅된 휴대폰 번호
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  if (cleaned.length === 11 && cleaned.startsWith("010")) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phoneNumber;
};

/**
 * 휴대폰 번호 입력 시 실시간으로 정리하는 함수
 * @param value 입력된 값
 * @returns 정리된 값
 */
export const sanitizePhoneInput = (value: string): string => {
  const cleaned = cleanPhoneNumber(value);
  return cleaned.slice(0, 11); // 최대 11자리까지만 허용
};
