"use client";

import { AuthGuardProps } from "@/features/auth-auth-guard/types";
import { useAuthGuardModel } from "@/features/auth-auth-guard/useAuthGuardModel";
import { Spin } from "antd";

export default function AuthGuard(props: AuthGuardProps) {
  const model = useAuthGuardModel(props);
  return <AuthGuardView {...props} model={model} />;
}

function AuthGuardView({
  children,
  fallback,
  redirectTo = "/",
  requireAuth = true,
  model,
}: AuthGuardProps & { model: ReturnType<typeof useAuthGuardModel> }) {
  const { user, isRedirecting } = model;

  // 로딩 중
  if (user === undefined) {
    return (
      fallback || (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Spin size="large" />
          <div>인증 확인 중...</div>
        </div>
      )
    );
  }

  // 인증이 필요하지 않은 페이지
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 로그아웃 상태 (리디렉트 중)
  if (user === null || isRedirecting) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Spin size="large" />
        <div>로그인이 필요합니다. 로그인 페이지로 이동 중...</div>
      </div>
    );
  }

  // 로그인 상태 - 정상 렌더링
  return <>{children}</>;
}
