"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { authAPI } from "@/lib/api/auth";
import { isAuthTokenExpired, getAuthTimeUntilExpiry, getAuthTimeUntilExpiryFormatted, shouldRefreshToken } from "@/utils/auth";
import { LogoutModal } from "@/components/auth/LogoutModal";

interface User {
  username: string;
  attributes: {
    email: string;
    email_verified: boolean;
    preferred_username: string;
    name: string;
    sub: string;
    picture?: string;
    nickname: string;
    phone_number: string;
  };
  points: number;
  isCreator: boolean;
  profile?: {
    bio?: string;
    created_at?: string;
    updated_at?: string;
  };
}

interface AuthContextType {
  user: User | null | undefined;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// id_token에서 사용자 정보를 파싱하는 함수
const parseIdToken = (): User | null => {
  try {
    const cookies = document.cookie.split(";");
    const idTokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("id_token=")
    );

    if (!idTokenCookie) return null;

    const idToken = idTokenCookie.split("=")[1];
    const base64Url = idToken.split(".")[1];
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

    return {
      username: tokenData.preferred_username,
      attributes: {
        email: tokenData.email || "",
        email_verified: tokenData.email_verified || false,
        preferred_username: tokenData.preferred_username || "",
        name: tokenData.name || "",
        sub: tokenData.sub || "",
        picture: tokenData.picture || undefined,
        nickname: tokenData.nickname || "",
        phone_number: tokenData.phone_number || "",
      },
      points: 0,
      isCreator: false,
      profile: undefined,
    };
  } catch (error) {
    console.error("Error parsing idToken:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // null: 로그아웃, User: 로그인, undefined: 아직 파싱 전(로딩)
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const tokenCheckIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 초기 로딩 시 서버에서 최신 사용자 정보를 가져오려고 시도
    const initializeUser = async () => {
      try {
        const response = await authAPI.getMe();
        if (
          response.success &&
          response.data?.user &&
          response.data.user.attributes
        ) {
          setUser(response.data.user);
          return;
        }
      } catch (error) {
        console.log(
          "Server user info fetch failed, falling back to token parsing"
        );
      }

      // 서버 요청 실패 시 토큰에서 파싱
      const userData = parseIdToken();
      setUser(userData);
    };

    initializeUser();
  }, []);

  // 토큰 만료 체크를 위한 useEffect
  useEffect(() => {
    // 사용자가 로그인되어 있을 때만 토큰 체크 시작
    if (user) {
      const checkTokenExpiry = async () => {
        if (isAuthTokenExpired()) {
          // 페이지가 보이고 있는 경우에만 토큰 갱신 시도
          if (document.visibilityState === 'visible') {
            console.log('Token expired, attempting refresh...');
            try {
              await authAPI.refreshToken();
              console.log('Token refreshed successfully');
              // 토큰 갱신 성공 시 사용자 정보도 갱신
              await refreshUser();
              return;
            } catch (error) {
              console.error('Token refresh failed:', error);
              // 리프레시 실패 시 로그아웃 처리
            }
          }

          // 페이지가 숨겨져 있거나 리프레시 실패 시 로그아웃
          setShowLogoutModal(true);
          logout();
          return;
        }

        // 토큰이 4분 50초 이하로 남은 경우 리프레시 시도
        if (shouldRefreshToken()) {
          if (document.visibilityState === 'visible') {
            const timeFormatted = getAuthTimeUntilExpiryFormatted();
            console.log(`Token expires in ${timeFormatted}, attempting refresh...`);
            try {
              await authAPI.refreshToken();
              console.log('Token refreshed successfully');
              await refreshUser();
              return;
            } catch (error) {
              console.error('Token refresh failed:', error);
            }
          }
        }

        // 토큰 만료까지 남은 시간 확인 (분:초 형태로 로깅)
        const timeFormatted = getAuthTimeUntilExpiryFormatted();
        console.log("Token expires in:", timeFormatted);
      };

      // 즉시 한 번 체크
      checkTokenExpiry();

      // 30초마다 토큰 만료 체크
      tokenCheckIntervalRef.current = setInterval(checkTokenExpiry, 30000);

      // Page Visibility 이벤트 리스너 추가
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('Page became visible, checking token status...');
          checkTokenExpiry();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 컴포넌트 언마운트시 정리
      return () => {
        if (tokenCheckIntervalRef.current) {
          clearInterval(tokenCheckIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // 사용자가 로그아웃되면 인터벌 정리
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
      }
    }
  }, [user]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청하여 쿠키 삭제
      await authAPI.signout();
    } catch (error) {
      console.error("Logout API failed:", error);
      // API 실패해도 로컬 상태는 초기화
    }

    setUser(null);
    // 토큰 체크 인터벌 정리
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
    }
  };

  const refreshUser = async () => {
    try {
      console.log("=== refreshUser Debug ===");
      // 서버에서 최신 사용자 정보를 가져옴
      const response = await authAPI.getMe();
      console.log("API Response:", response);

      if (
        response.success &&
        response.data?.user &&
        response.data.user.attributes
      ) {
        console.log("Setting new user data:", {
          nickname: response.data.user.attributes?.nickname,
          preferred_username: response.data.user.attributes?.preferred_username,
        });
        setUser(response.data.user);
      }
      console.log("========================");
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      // 실패하면 토큰에서 파싱
      const userData = parseIdToken();
      setUser(userData);
    }
  };

  const handleLogoutModalClose = () => {
    setShowLogoutModal(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
      <LogoutModal
        isVisible={showLogoutModal}
        onClose={handleLogoutModalClose}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
