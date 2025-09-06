"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/lib/api/auth";

//AWS Cognito 기본 구조 사용 (points, phone_number 속성만 추가하였음)
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
}

interface AuthContextType {
  user: User | null | undefined;
  login: (userData: User["attributes"]) => void;
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
        email: tokenData.email,
        email_verified: tokenData.email_verified,
        preferred_username: tokenData.preferred_username,
        name: tokenData.name,
        sub: tokenData.sub,
        picture: tokenData.picture,
        nickname: tokenData.nickname,
        phone_number: tokenData.phone_number,
      },
      points: 0,
    };
  } catch (error) {
    console.error("Error parsing idToken:", error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // null: 로그아웃, User: 로그인, undefined: 아직 파싱 전(로딩)
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // 초기 로딩 시 서버에서 최신 사용자 정보를 가져오려고 시도
    const initializeUser = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success && response.data?.user) {
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

  const login = (userData: User["attributes"]) => {
    setUser({
      username: userData.preferred_username,
      attributes: userData,
      points: 0,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log("=== refreshUser Debug ===");
      // 서버에서 최신 사용자 정보를 가져옴
      const response = await authAPI.getMe();
      console.log("API Response:", response);

      if (response.success && response.data?.user) {
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

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
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
