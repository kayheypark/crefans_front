"use client";

import { usePaymentFailPageModel } from "@/features/payment-fail/usePaymentFailPageModel";
import { Button, Result } from "antd";

export default function PaymentFailPage() {
  const model = usePaymentFailPageModel();
  return <PaymentFailPageView model={model} />;
}

function PaymentFailPageView({
  model,
}: {
  model: ReturnType<typeof usePaymentFailPageModel>;
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
      }}
    >
      <Result
        status={isUserCanceled ? "info" : "error"}
        title={isUserCanceled ? "결제 취소" : "결제 실패"}
        subTitle={
          <div>
            <div>{displayMessage}</div>
            {errorCode && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
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
  );
}
