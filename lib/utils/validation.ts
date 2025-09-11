// 유효성 검증 관련 유틸리티

// 핸들 유효성 검증 패턴 (한글, 영문, 숫자, 언더스코어만 허용)
export const HANDLE_PATTERN = /^[가-힣a-zA-Z0-9_]+$/;

// 언더스코어만으로 구성된 핸들 금지 패턴 (백엔드와 동일한 패턴)
export const HANDLE_UNDERSCORE_ONLY_PATTERN = /^(?!_+$).*[가-힣a-zA-Z0-9].*$/;

// 핸들 길이 제한 (백엔드와 동일)
export const HANDLE_MIN_LENGTH = 2;
export const HANDLE_MAX_LENGTH = 15;

// 핸들 유효성 검증 메시지
export const HANDLE_VALIDATION_MESSAGE = "핸들은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다";
export const HANDLE_UNDERSCORE_ONLY_MESSAGE = "핸들은 언더스코어만으로 구성될 수 없습니다";
export const HANDLE_LENGTH_MESSAGE = `핸들은 ${HANDLE_MIN_LENGTH}자 이상 ${HANDLE_MAX_LENGTH}자 이하여야 합니다`;

// 핸들 유효성 검증 함수 (백엔드 정책과 완전히 동일)
export const validateHandle = (handle: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const trimmedHandle = handle.trim();
  const errors: string[] = [];

  // 길이 검증
  if (trimmedHandle.length < HANDLE_MIN_LENGTH || trimmedHandle.length > HANDLE_MAX_LENGTH) {
    errors.push(HANDLE_LENGTH_MESSAGE);
  }

  // 기본 패턴 검증 (한글, 영문, 숫자, 언더스코어만 허용)
  if (!HANDLE_PATTERN.test(trimmedHandle)) {
    errors.push(HANDLE_VALIDATION_MESSAGE);
  }

  // 언더스코어만으로 구성되지 않았는지 확인
  if (!HANDLE_UNDERSCORE_ONLY_PATTERN.test(trimmedHandle)) {
    errors.push(HANDLE_UNDERSCORE_ONLY_MESSAGE);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Ant Design Form Rule 형태로 반환하는 함수
export const getHandleValidationRule = () => ({
  validator: (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const validation = validateHandle(value);
    if (!validation.isValid) {
      return Promise.reject(validation.errors[0]); // 첫 번째 에러 메시지 반환
    }
    return Promise.resolve();
  },
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