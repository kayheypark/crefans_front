"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import {
  MyBillingSubscription,
  subscriptionBillingAPI,
} from "@/lib/api/subscriptionBilling";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useMySubscriptionsPageModel({
  message,
}: {
  message: Feedback;
}) {
  const router = useRouter();

  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<MyBillingSubscription[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [canceling, setCanceling] = useState<string | null>(null);

  // 구독 목록 로드
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        const response =
          await subscriptionBillingAPI.getMyBillingSubscriptions();

        if (response.success && response.data) {
          setSubscriptions(response.data.subscriptions);
        } else {
          message.error(
            response.message || "구독 목록을 불러오는데 실패했습니다.",
          );
        }
      } catch (error: any) {
        console.error("Failed to load subscriptions:", error);
        message.error("구독 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const cancelSubscription = async (subscription: MyBillingSubscription) => {
    try {
      setCanceling(subscription.subscriptionId);

      const response = await subscriptionBillingAPI.cancelBillingSubscription(
        subscription.subscriptionId,
      );

      if (response.success) {
        message.success("구독이 취소되었습니다.");

        // 구독 목록 새로고침
        const updatedResponse =
          await subscriptionBillingAPI.getMyBillingSubscriptions();
        if (updatedResponse.success && updatedResponse.data) {
          setSubscriptions(updatedResponse.data.subscriptions);
        }
      } else {
        message.error(response.message || "구독 취소에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      message.error("구독 취소에 실패했습니다.");
    } finally {
      setCanceling(null);
    }
  };

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

  // 구독 상태별 필터링
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "ACTIVE",
  );

  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status === "CANCELLED",
  );

  const expiredSubscriptions = subscriptions.filter(
    (sub) => sub.status === "EXPIRED",
  );

  // 통계 계산
  const totalMonthlyAmount = activeSubscriptions.reduce(
    (sum, sub) => sum + sub.membershipItem.price,
    0,
  );

  return {
    router,
    subscriptions,
    loading,
    canceling,
    cancelSubscription,
    getBillingText,
    activeSubscriptions,
    cancelledSubscriptions,
    expiredSubscriptions,
    totalMonthlyAmount,
  };
}
