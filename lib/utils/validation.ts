// 유효성 검증 관련 유틸리티

// 핸들 유효성 검증 패턴 (한글, 영문, 숫자, 언더스코어만 허용)
export const HANDLE_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

// 핸들 유효성 검증 메시지
export const HANDLE_VALIDATION_MESSAGE = "한글, 영문, 숫자, 언더스코어만 사용 가능합니다";

// 핸들 유효성 검증 함수
export const validateHandle = (handle: string): boolean => {
  return HANDLE_PATTERN.test(handle.trim());
};

// Ant Design Form Rule 형태로 반환하는 함수
export const getHandleValidationRule = () => ({
  pattern: HANDLE_PATTERN,
  message: HANDLE_VALIDATION_MESSAGE,
});

// 닉네임 유효성 검증 패턴 (한글, 영문, 숫자만 허용, 2-10자)
export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,10}$/;

// 닉네임 유효성 검증 메시지
export const NICKNAME_VALIDATION_MESSAGE = "한글, 영문, 숫자 2-10자로 입력해주세요";

// 닉네임 유효성 검증 함수
export const validateNickname = (nickname: string): boolean => {
  return NICKNAME_PATTERN.test(nickname.trim());
};

// 닉네임 입력 시 실시간 필터링 (공백 및 특수문자 제거)
export const filterNicknameInput = (input: string): string => {
  return input.replace(/[^가-힣a-zA-Z0-9]/g, "");
};

// Ant Design Form Rule 형태로 반환하는 함수 (닉네임용)
export const getNicknameValidationRule = () => ({
  validator: (_: any, value: string) => {
    if (!value) return Promise.resolve();
    if (!validateNickname(value)) {
      return Promise.reject(NICKNAME_VALIDATION_MESSAGE);
    }
    return Promise.resolve();
  },
});

// 기타 유효성 검증 패턴들
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;