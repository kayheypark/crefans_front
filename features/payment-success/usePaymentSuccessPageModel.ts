"use client";

import { useAuth } from "@/contexts/AuthContext";
import { paymentAPI, PaymentConfirmRequest } from "@/lib/api/payment";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function usePaymentSuccessPageModel() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { refreshUser } = useAuth();

  const [isConfirming, setIsConfirming] = useState(true);

  const [confirmResult, setConfirmResult] = useState<{
    success: boolean;
    message: string;
    token?: {
      symbol: string;
      amount: number;
    };
  } | null>(null);

  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    // 중복 호출 방지
    if (hasConfirmed) {
      return;
    }

    const confirmPayment = async () => {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setConfirmResult({
          success: false,
          message: "결제 정보가 올바르지 않습니다.",
        });
        setIsConfirming(false);
        return;
      }

      setHasConfirmed(true);

      try {
        console.log("Payment confirmation started for orderId:", orderId);

        const confirmData: PaymentConfirmRequest = {
          paymentKey,
          orderId,
          amount: parseInt(amount),
        };

        const response = await paymentAPI.confirmPayment(confirmData);

        if (response.success) {
          // 사용자 정보 새로고침 (포인트 업데이트를 위해)
          await refreshUser();

          setConfirmResult({
            success: true,
            message: "상품 결제가 완료되었습니다.",
            token: response.data?.token,
          });
        } else {
          setConfirmResult({
            success: false,
            message: response.message || "결제 확인 중 오류가 발생했습니다.",
          });
        }
      } catch (error: any) {
        console.error("Payment confirmation failed:", error);
        setConfirmResult({
          success: false,
          message: "결제 확인 중 오류가 발생했습니다.",
        });
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 빈 의존성 배열 - 컴포넌트 마운트 시 한 번만 실행

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    router.push("/");
  };

  return { isConfirming, confirmResult, handleGoHome, handleRetry };
}
