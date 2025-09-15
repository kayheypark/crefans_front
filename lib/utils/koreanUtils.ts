/**
 * 한국어 조사 처리 유틸리티 함수들
 */

/**
 * 한국어 조사 처리 함수 (을/를)
 * @param word 조사를 붙일 단어
 * @returns 받침이 있으면 "을", 없으면 "를"
 */
export const getParticle = (word: string): string => {
  if (!word || word.length === 0) return "을";

  const lastChar = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? "을" : "를";
};

/**
 * 한국어 조사 처리 함수 (이/가)
 * @param word 조사를 붙일 단어
 * @returns 받침이 있으면 "이", 없으면 "가"
 */
export const getSubjectParticle = (word: string): string => {
  if (!word || word.length === 0) return "이";

  const lastChar = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? "이" : "가";
};

/**
 * 한국어 조사 처리 함수 (은/는)
 * @param word 조사를 붙일 단어
 * @returns 받침이 있으면 "은", 없으면 "는"
 */
export const getTopicParticle = (word: string): string => {
  if (!word || word.length === 0) return "은";

  const lastChar = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? "은" : "는";
};

/**
 * 한국어 조사 처리 함수 (와/과)
 * @param word 조사를 붙일 단어
 * @returns 받침이 있으면 "과", 없으면 "와"
 */
export const getConjunctionParticle = (word: string): string => {
  if (!word || word.length === 0) return "과";

  const lastChar = word.charCodeAt(word.length - 1);
  const hasFinalConsonant = (lastChar - 0xac00) % 28 !== 0;
  return hasFinalConsonant ? "과" : "와";
};
