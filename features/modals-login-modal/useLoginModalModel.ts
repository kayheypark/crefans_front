"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { LoginModalProps } from "@/features/modals-login-modal/types";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function useLoginModalModel(
  { isOpen, onClose, onSignUpClick }: LoginModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const router = useRouter();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [showTestOverlay, setShowTestOverlay] = useState(true);

  // 테스트 계정 기간 계산 (일주일씩 자동 연장)
  const getTestPeriod = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // 7일 후

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };

    return {
      start: formatDate(today),
      end: formatDate(endDate),
    };
  };

  const onFinish = async (values: any) => {
    if (loading) return; // 이미 로딩 중이면 중복 실행 방지

    setLoading(true);
    try {
      await authAPI.signin(values.email, values.password);
      // 로그인 성공 후 사용자 정보 요청
      const userRes = await authAPI.getMe();

      // API 응답 구조에 맞게 사용자 정보 변환
      // Server returns { success: true, data: { user: {...} } }
      const serverUser = userRes.data?.user;

      // 사용자 정보가 올바르게 파싱되었는지 확인
      if (!serverUser) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      // Server always returns Cognito format
      const authUser = {
        username: serverUser.username || serverUser.attributes.email,
        points: serverUser.points || 0,
        isCreator: serverUser.isCreator || false,
        attributes: {
          email: serverUser.attributes.email || "",
          email_verified: serverUser.attributes.email_verified || true,
          preferred_username:
            serverUser.attributes.preferred_username ||
            serverUser.attributes.email,
          name: serverUser.attributes.name || "",
          sub: serverUser.attributes.sub || "",
          picture: serverUser.attributes.picture || undefined,
          nickname: serverUser.attributes.nickname || "",
          phone_number: serverUser.attributes.phone_number || "",
        },
        profile: serverUser.profile,
      };

      login(authUser);
      message.success("로그인되었습니다!");
      onClose();

      // redirect 쿼리스트링이 있으면 해당 경로로 이동
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect");
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.info(error);
      message.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    onClose();
    onSignUpClick?.();
  };

  // 엔터키 핸들러 - 다음 필드로 포커스 이동 또는 폼 제출
  const handleKeyPress = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (currentField === "email") {
        // 이메일 필드에서 엔터: 비밀번호 필드로 포커스
        const passwordInput = document.querySelector(
          'input[type="password"]',
        ) as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      } else if (currentField === "password") {
        // 비밀번호 필드에서 엔터: 폼 제출
        form.submit();
      }
    }
  };

  return {
    form,
    loading,
    showTestOverlay,
    setShowTestOverlay,
    getTestPeriod,
    onFinish,
    handleSignUp,
    handleKeyPress,
  };
}
