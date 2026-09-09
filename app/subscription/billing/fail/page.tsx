"use client";

import { useSubscriptionBillingFailPageModel } from "@/features/subscription-billing-fail/useSubscriptionBillingFailPageModel";
import { Button, Result } from "antd";

export default function SubscriptionBillingFailPage() {
  const model = useSubscriptionBillingFailPageModel();
  return <SubscriptionBillingFailPageView model={model} />;
}

function SubscriptionBillingFailPageView({
  model,
}: {
  model: ReturnType<typeof useSubscriptionBillingFailPageModel>;
}) {
  const {
    handleGoHome,
    handleRetry,
    errorCode,
    displayMessage,
    isUserCanceled,
  } = model;

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
          status={isUserCanceled ? "info" : "error"}
          title={isUserCanceled ? "구독 등록 취소" : "구독 등록 실패"}
          subTitle={
            <div>
              <div style={{ marginBottom: 10 }}>{displayMessage}</div>
              <div style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
                멤버십 구독을 위한 자동결제 등록이 완료되지 않았습니다.
              </div>
              {errorCode && (
                <div style={{ fontSize: 12, color: "#999" }}>
                  오류 코드: {errorCode}
                </div>
              )}
            </div>
          }
          extra={[
            <Button type="primary" key="home" onClick={handleGoHome}>
              홈으로 가기
            </Button>,
            <Button key="retry" onClick={handleRetry}>
              다시 시도
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
