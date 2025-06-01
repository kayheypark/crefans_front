"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

//AWS Cognito 기본 구조 사용 (points 속성만 추가하였음)
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
  };
  points: number;
}

interface AuthContextType {
  user: User | null | undefined;
  login: (userData: User) => void;
  logout: () => void;
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
    const userData = parseIdToken();
    setUser(userData);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
