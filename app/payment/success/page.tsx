"use client";

import { usePaymentSuccessPageModel } from "@/features/payment-success/usePaymentSuccessPageModel";
import { Button, Result, Spin, Typography } from "antd";

const { Text } = Typography;

export default function PaymentSuccessPage() {
  const model = usePaymentSuccessPageModel();
  return <PaymentSuccessPageView model={model} />;
}

function PaymentSuccessPageView({
  model,
}: {
  model: ReturnType<typeof usePaymentSuccessPageModel>;
}) {
  const { isConfirming, confirmResult, handleGoHome, handleRetry } = model;

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
