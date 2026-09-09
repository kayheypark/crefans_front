"use client";
import type { Feedback } from "@/types/presentation";

import { demoAPI } from "@/lib/api/demo";

import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import {
  PaymentHistory,
  PaymentMethod,
  PaymentMethodFormValues,
} from "@/types/common";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export function useSettingsModel({ message }: { message: Feedback }) {
  const { user, logout } = useAuth();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showNicknameModal, setShowNicknameModal] = useState(false);

  const [showHandleModal, setShowHandleModal] = useState(false);

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);

  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);

  // 디버깅용: 모달 상태 변화 모니터링
  React.useEffect(() => {
    console.log("결제수단 모달 상태 변경:", showPaymentMethodModal);
  }, [showPaymentMethodModal]);

  // 결제수단 데이터 로드
  React.useEffect(() => {
    setLoadingPaymentMethods(true);
    demoAPI
      .getPaymentMethods()
      .then((apiResponse) => {
        setPaymentMethods(apiResponse.data);
        setLoadingPaymentMethods(false);
      })
      .catch((error) => {
        console.error("결제수단 데이터 로드 실패:", error);
        setLoadingPaymentMethods(false);
      });
  }, []);

  // 결제이력 데이터 로드
  React.useEffect(() => {
    setLoadingPaymentHistory(true);
    demoAPI
      .getPaymentHistory()
      .then((apiResponse) => {
        setPaymentHistory(apiResponse.data);
        setLoadingPaymentHistory(false);
      })
      .catch((error) => {
        console.error("결제이력 데이터 로드 실패:", error);
        setLoadingPaymentHistory(false);
      });
  }, []);

  // 쿼리스트링에서 탭 정보 가져오기, 기본값은 "basic"
  const selectedMenu = searchParams.get("tab") || "basic";

  const handleLogout = () => {
    logout();
    message.success("로그아웃 되었습니다.");
    router.push("/home");
  };

  const handleDeleteAccount = () => {
    // TODO: 계정 삭제 API 호출
    message.success("계정이 삭제되었습니다.");
    setShowDeleteModal(false);
    logout();
    router.push("/home");
  };

  const handleAddPaymentMethod = (values: PaymentMethodFormValues) => {
    // TODO: 결제수단 추가 API 호출
    console.log("결제수단 추가:", values);

    // 기본 결제수단으로 설정하는 경우, 기존 기본 결제수단을 false로 변경
    if (values.isDefault) {
      setPaymentMethods((prev) =>
        prev.map((method) => ({ ...method, isDefault: false })),
      );
    }

    // 새 결제수단 추가 (목업데이터에 추가)
    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(), // 임시 ID 생성
      type: values.type,
      name: values.cardAlias || "새 카드",
      lastFour: values.cardNumber?.slice(-4),
      expiryDate: values.expiryDate,
      isDefault: values.isDefault || false,
    };

    setPaymentMethods((prev) => [...prev, newPaymentMethod]);
    message.success("결제수단이 추가되었습니다.");
    setShowPaymentMethodModal(false);
  };

  return {
    user,
    router,
    searchParams,
    isMobile,
    isTablet,
    showDeleteModal,
    setShowDeleteModal,
    showNicknameModal,
    setShowNicknameModal,
    showHandleModal,
    setShowHandleModal,
    showPaymentMethodModal,
    setShowPaymentMethodModal,
    paymentMethods,
    loadingPaymentMethods,
    paymentHistory,
    loadingPaymentHistory,
    selectedMenu,
    handleLogout,
    handleDeleteAccount,
    handleAddPaymentMethod,
  };
}
