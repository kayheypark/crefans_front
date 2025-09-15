"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Result, Button, Spin, Typography, Card, Space, Tag } from "antd";
import { subscriptionBillingAPI, SubscriptionBillingConfirmRequest } from "@/lib/api/subscriptionBilling";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function SubscriptionBillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmResult, setConfirmResult] = useState<{
    success: boolean;
    message: string;
    subscription?: {
      subscriptionId: string;
      membershipName: string;
      price: number;
      billingPeriod: string;
      nextBillingDate: string;
    };
  } | null>(null);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    // 중복 호출 방지
    if (hasConfirmed) {
      return;
    }

    const confirmBilling = async () => {
      const authKey = searchParams.get("authKey");
      const customerKey = searchParams.get("customerKey");
      const userId = searchParams.get("userId");
      const membershipItemId = searchParams.get("membershipItemId");

      if (!authKey || !customerKey || !userId || !membershipItemId) {
        setConfirmResult({
          success: false,
          message: "결제 인증 정보가 올바르지 않습니다.",
        });
        setIsConfirming(false);
        return;
      }

      setHasConfirmed(true);

      try {
        console.log("Subscription billing confirmation started:", {
          authKey,
          customerKey,
          userId,
          membershipItemId,
        });

        const confirmData: SubscriptionBillingConfirmRequest = {
          authKey,
          customerKey,
          userId,
          membershipItemId: membershipItemId, // Keep as string since API now expects string
        };

        const response = await subscriptionBillingAPI.confirmBilling(confirmData);

        if (response.success && response.data) {
          // 사용자 정보 새로고침
          await refreshUser();

          // 결제 주기 텍스트 변환
          const getBillingText = (unit: string, period: number) => {
            const unitMap: { [key: string]: string } = {
              DAY: "일",
              WEEK: "주",
              MONTH: "개월",
              YEAR: "년",
            };
            return `${period}${unitMap[unit] || unit}`;
          };

          setConfirmResult({
            success: true,
            message: "멤버십 구독이 성공적으로 등록되었습니다!",
            subscription: {
              subscriptionId: response.data.subscriptionId,
              membershipName: response.data.membershipItem.name,
              price: response.data.membershipItem.price,
              billingPeriod: getBillingText(
                response.data.membershipItem.billing_unit,
                response.data.membershipItem.billing_period
              ),
              nextBillingDate: response.data.nextBillingDate,
            },
          });
        } else {
          setConfirmResult({
            success: false,
            message: response.message || "구독 등록 확인 중 오류가 발생했습니다.",
          });
        }
      } catch (error: any) {
        console.error("Subscription billing confirmation failed:", error);

        // authKey 관련 에러인 경우 더 구체적인 메시지 제공
        const errorMessage = error.response?.data?.message || error.message || "";
        let userMessage = "구독 등록 확인 중 오류가 발생했습니다.";

        if (errorMessage.includes("NOT_FOUND") || errorMessage.includes("존재하지 않는 정보")) {
          userMessage = "결제 인증 정보가 만료되었습니다. 다시 멤버십 가입을 시도해주세요.";
        }

        setConfirmResult({
          success: false,
          message: userMessage,
        });
      } finally {
        setIsConfirming(false);
      }
    };

    confirmBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열 - 컴포넌트 마운트 시 한 번만 실행

  const handleGoHome = () => {
    router.push("/");
  };

  const handleViewSubscriptions = () => {
    router.push("/subscription/manage");
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
          <Text>멤버십 구독을 확인하고 있습니다...</Text>
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
          title="구독 처리 오류"
          subTitle="구독 정보를 확인할 수 없습니다."
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
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 500, width: "100%" }}>
        <Result
          status={confirmResult.success ? "success" : "error"}
          title={confirmResult.success ? "구독 완료!" : "구독 실패"}
          subTitle={
            <div>
              <div style={{ marginBottom: 16 }}>{confirmResult.message}</div>
              {confirmResult.success && confirmResult.subscription && (
                <Card size="small" style={{ textAlign: "left" }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text type="secondary">멤버십:</Text>
                      <Text strong>{confirmResult.subscription.membershipName}</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text type="secondary">월 구독료:</Text>
                      <Text strong style={{ color: "#faad14" }}>
                        {confirmResult.subscription.price.toLocaleString()}원
                      </Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text type="secondary">결제 주기:</Text>
                      <Text>{confirmResult.subscription.billingPeriod}</Text>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <Text type="secondary">다음 결제일:</Text>
                      <Tag color="blue">
                        {new Date(confirmResult.subscription.nextBillingDate).toLocaleDateString()}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              )}
            </div>
          }
          extra={[
            <Button type="primary" key="home" onClick={handleGoHome}>
              홈으로 가기
            </Button>,
            ...(confirmResult.success
              ? [
                  <Button key="subscriptions" onClick={handleViewSubscriptions}>
                    구독 관리
                  </Button>,
                ]
              : [
                  <Button key="retry" onClick={handleRetry}>
                    다시 시도
                  </Button>,
                ]),
          ]}
        />
      </div>
    </div>
  );
}