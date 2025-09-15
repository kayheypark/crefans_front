// 쿠키 관련 유틸리티 함수들

/**
 * 쿠키에서 특정 값을 가져오는 함수
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const cookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${name}=`)
  );

  return cookie ? cookie.split("=")[1] : null;
};

/**
 * JWT 토큰의 만료 시간을 확인하는 함수
 */
export const getTokenExpiry = (token: string): Date | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const tokenData = JSON.parse(jsonPayload);

    if (tokenData.exp) {
      return new Date(tokenData.exp * 1000); // exp는 초 단위이므로 밀리초로 변환
    }

    return null;
  } catch (error) {
    console.error("Error parsing token expiry:", error);
    return null;
  }
};

/**
 * 토큰이 만료되었는지 확인하는 함수
 */
export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;

  return new Date() >= expiry;
};

/**
 * 현재 쿠키의 토큰이 만료되었는지 확인하는 함수
 */
export const isAuthTokenExpired = (): boolean => {
  const idToken = getCookie("id_token");
  const accessToken = getCookie("access_token");

  // 쿠키가 없으면 만료된 것으로 간주
  if (!idToken && !accessToken) return true;

  // id_token이 있으면 id_token으로 확인
  if (idToken) {
    return isTokenExpired(idToken);
  }

  // access_token이 있으면 access_token으로 확인
  if (accessToken) {
    return isTokenExpired(accessToken);
  }

  return true;
};

/**
 * 토큰 만료까지 남은 시간(밀리초)을 반환하는 함수
 */
export const getTimeUntilExpiry = (token: string): number => {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;

  const now = new Date().getTime();
  const expiryTime = expiry.getTime();

  return Math.max(0, expiryTime - now);
};

/**
 * 현재 쿠키의 토큰 만료까지 남은 시간을 반환하는 함수
 */
export const getAuthTimeUntilExpiry = (): number => {
  const idToken = getCookie("id_token");
  const accessToken = getCookie("access_token");

  if (idToken) {
    return getTimeUntilExpiry(idToken);
  }

  if (accessToken) {
    return getTimeUntilExpiry(accessToken);
  }

  return 0;
};