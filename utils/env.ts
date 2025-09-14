export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL;
};

export const getBaseUrl = () => {
  // 개발 환경
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // 프로덕션 환경
  return "https://crefans.com";
};

export const getPostUrl = (postId: string) => {
  return `${getBaseUrl()}/post/${postId}`;
};
