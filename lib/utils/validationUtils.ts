/**
 * 한국 이름 검증 (한글만 허용, 2-5자)
 * @param name 이름
 * @returns 유효성 여부
 */
export const isValidKoreanName = (name: string): boolean => {
  return /^[가-힣]{2,5}$/.test(name);
};

/**
 * 닉네임 검증 (한글, 영문, 숫자만 허용, 2-10자)
 * SQL 인젝션 방지를 위해 특수문자 제한
 * @param nickname 닉네임
 * @returns 유효성 여부
 */
export const isValidNickname = (nickname: string): boolean => {
  return /^[가-힣a-zA-Z0-9]{2,10}$/.test(nickname);
};

/**
 * SQL 인젝션 위험 문자가 포함되어 있는지 검사
 * @param text 검사할 텍스트
 * @returns 위험 여부
 */
export const hasSqlInjectionRisk = (text: string): boolean => {
  const dangerousPatterns = [
    /['";]/g, // 따옴표, 세미콜론
    /--/g, // SQL 주석
    /\/\*/g, // SQL 주석 시작
    /\*\//g, // SQL 주석 끝
    /union\s+select/gi, // UNION SELECT
    /drop\s+table/gi, // DROP TABLE
    /delete\s+from/gi, // DELETE FROM
    /insert\s+into/gi, // INSERT INTO
    /update\s+set/gi, // UPDATE SET
    /create\s+table/gi, // CREATE TABLE
    /alter\s+table/gi, // ALTER TABLE
    /exec\s*\(/gi, // EXEC 함수
    /xp_/gi, // 확장 저장 프로시저
    /sp_/gi, // 시스템 저장 프로시저
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
};

/**
 * 안전한 텍스트인지 검증 (SQL 인젝션 방지)
 * @param text 검사할 텍스트
 * @returns 안전 여부
 */
export const isSafeText = (text: string): boolean => {
  return !hasSqlInjectionRisk(text);
};
