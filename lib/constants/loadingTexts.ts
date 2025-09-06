// HTTP 통신 중 버튼에 표시할 로딩 텍스트 상수
export const LOADING_TEXTS = {
  // 일반적인 로딩
  LOADING: "연결중...",
  
  // 구체적인 액션별 로딩 텍스트
  SAVING: "저장중...",
  UPDATING: "업데이트중...",
  DELETING: "삭제중...",
  SENDING: "전송중...",
  UPLOADING: "업로드중...",
  PROCESSING: "처리중...",
  
  // 인증 관련
  SIGNING_IN: "로그인중...",
  SIGNING_UP: "가입중...",
  SIGNING_OUT: "로그아웃중...",
  
  // 결제 관련
  PAYMENT_PROCESSING: "결제중...",
  
  // 기타
  LOADING_DATA: "데이터 로딩중...",
} as const;

export type LoadingTextType = typeof LOADING_TEXTS[keyof typeof LOADING_TEXTS];