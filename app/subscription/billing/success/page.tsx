"use client";

import { useSubscriptionBillingSuccessPageModel } from "@/features/subscription-billing-success/useSubscriptionBillingSuccessPageModel";
import { Button, Card, Result, Space, Spin, Tag, Typography } from "antd";

const { Text } = Typography;

export default function SubscriptionBillingSuccessPage() {
  const model = useSubscriptionBillingSuccessPageModel();
  return <SubscriptionBillingSuccessPageView model={model} />;
}

function SubscriptionBillingSuccessPageView({
  model,
}: {
  model: ReturnType<typeof useSubscriptionBillingSuccessPageModel>;
}) {
  const {
    isConfirming,
    confirmResult,
    handleGoHome,
    handleViewSubscriptions,
    handleRetry,
  } = model;

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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">멤버십:</Text>
                      <Text strong>
                        {confirmResult.subscription.membershipName}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">월 구독료:</Text>
                      <Text strong style={{ color: "#faad14" }}>
                        {confirmResult.subscription.price.toLocaleString()}원
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">결제 주기:</Text>
                      <Text>{confirmResult.subscription.billingPeriod}</Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">다음 결제일:</Text>
                      <Tag color="blue">
                        {new Date(
                          confirmResult.subscription.nextBillingDate,
                        ).toLocaleDateString()}
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
