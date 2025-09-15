"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Result, Button, Spin, Typography } from "antd";
import { paymentAPI, PaymentConfirmRequest } from "@/lib/api/payment";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function PaymentSuccessPage() {
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
  }, []); // 빈 의존성 배열 - 컴포넌트 마운트 시 한 번만 실행

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    router.push("/");
  };

  if (isConfirming) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: 20,
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>
          <Text>결제를 확인하고 있습니다...</Text>
        </div>
      </div>
    );
  }

  if (!confirmResult) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Result
          status="error"
          title="결제 처리 오류"
          subTitle="결제 정보를 확인할 수 없습니다."
          extra={
            <Button type="primary" onClick={handleGoHome}>
              홈으로 가기
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status={confirmResult.success ? "success" : "error"}
        title={confirmResult.success ? "결제 완료" : "결제 실패"}
        subTitle={
          <div>
            <div>{confirmResult.message}</div>
            {confirmResult.success && confirmResult.token && (
              <div
                style={{ marginTop: 10, color: "#6a5af9", fontWeight: "bold" }}
              >
                {confirmResult.token.amount} {confirmResult.token.symbol}이
                충전되었습니다.
              </div>
            )}
          </div>
        }
        extra={[
          <Button type="primary" key="home" onClick={handleGoHome}>
            홈으로 가기
          </Button>,
          ...(confirmResult.success
            ? []
            : [
                <Button key="retry" onClick={handleRetry}>
                  다시 시도
                </Button>,
              ]),
        ]}
      />
    </div>
  );
}
