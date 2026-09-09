"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function useSubscriptionBillingFailPageModel() {
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // 구독 실패 정보를 로그로 기록
    const handleBillingFailure = async () => {
      const code = searchParams.get("code");
      const message = searchParams.get("message");
      const customerKey = searchParams.get("customerKey");
      const userId = searchParams.get("userId");
      const membershipItemId = searchParams.get("membershipItemId");

      console.error("Subscription billing failed:", {
        code,
        message,
        customerKey,
        userId,
        membershipItemId,
      });

      // TODO: 실패 정보를 백엔드에 전송하여 로그 기록
      // await subscriptionBillingAPI.handleBillingFailure({...});
    };

    handleBillingFailure();
  }, [searchParams]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetry = () => {
    // 원래 구독하려던 페이지로 돌아가기
    const membershipItemId = searchParams.get("membershipItemId");
    const creatorId = searchParams.get("creatorId");

    if (creatorId) {
      router.push(`/subscription/${creatorId}`);
    } else {
      router.push("/");
    }
  };

  // URL 파라미터에서 에러 정보 추출
  const errorCode = searchParams.get("code");

  const errorMessage = searchParams.get("message");

  // 에러 코드에 따른 사용자 친화적 메시지
  const getErrorMessage = (code: string | null, message: string | null) => {
    switch (code) {
      case "PAY_PROCESS_CANCELED":
        return "자동결제 등록이 취소되었습니다.";
      case "PAY_PROCESS_ABORTED":
        return "자동결제 등록이 중단되었습니다.";
      case "REJECT_CARD_COMPANY":
        return "카드사에서 자동결제 등록을 거절했습니다.";
      case "INVALID_CARD_COMPANY":
        return "유효하지 않은 카드입니다.";
      case "NOT_ENOUGH_BALANCE":
        return "계좌 잔액이 부족합니다.";
      case "EXCEED_MAX_DAILY_PAYMENT_COUNT":
        return "일일 결제 한도를 초과했습니다.";
      case "EXCEED_MAX_MONTHLY_PAYMENT_COUNT":
        return "월간 결제 한도를 초과했습니다.";
      case "INVALID_ACCOUNT_INFO":
        return "계좌 정보가 올바르지 않습니다.";
      case "UNAUTHORIZED_KEY":
        return "인증되지 않은 키입니다.";
      case "REJECT_ACCOUNT_PAYMENT":
        return "계좌 자동결제가 거절되었습니다.";
      case "ALREADY_PROCESSED_PAYMENT":
        return "이미 처리된 요청입니다.";
      default:
        return message || "멤버십 구독 등록 중 오류가 발생했습니다.";
    }
  };

  const displayMessage = getErrorMessage(errorCode, errorMessage);

  const isUserCanceled = errorCode === "PAY_PROCESS_CANCELED";

  return {
    handleGoHome,
    handleRetry,
    errorCode,
    displayMessage,
    isUserCanceled,
  };
}
