"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { Creator } from "@/features/subscription-creator-id/types";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
import { loadTossPaymentsInstance } from "@/lib/tossPayments";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useMembershipSubscriptionPageModel({
  message,
}: {
  message: Feedback;
}) {
  const params = useParams();

  const router = useRouter();

  const { user } = useAuth();

  const creatorId = params.creatorId as string;

  const [creator, setCreator] = useState<Creator | null>(null);

  const [memberships, setMemberships] = useState<MembershipItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [subscribing, setSubscribing] = useState<string | null>(null);

  // 크리에이터와 멤버십 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // TODO: 실제 크리에이터 정보 API 호출
        // 현재는 mock 데이터 사용
        const mockCreator: Creator = {
          id: creatorId,
          name: "크리에이터 이름",
          handle: "creator_handle",
          avatar: undefined,
          bio: "안녕하세요! 다양한 콘텐츠를 만들고 있는 크리에이터입니다.",
        };

        // 멤버십 아이템 로드 (실제 API 호출 - 크리에이터별 멤버십)
        try {
          const membershipResponse =
            await membershipAPI.getMembershipsByCreatorId(creatorId);

          if (membershipResponse.success && membershipResponse.data) {
            // 활성화된 멤버십만 필터링
            const memberships = membershipResponse.data.memberships || [];
            const activeMemberships = memberships.filter(
              (membership) => membership.isActive !== false,
            );

            setMemberships(activeMemberships);
            mockCreator.membershipItems = activeMemberships;
          }
        } catch (membershipError) {
          console.error("Failed to load creator memberships:", membershipError);
          // Fallback to empty array if membership loading fails
          setMemberships([]);
        }

        setCreator(mockCreator);
      } catch (error) {
        console.error("Failed to load creator and membership data:", error);
        message.error("크리에이터 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      loadData();
    }
  }, [creatorId]);

  // 구독 시작 처리
  const handleSubscribe = async (membershipItem: MembershipItem) => {
    if (!user) {
      message.error("로그인이 필요합니다.");
      router.push("/auth/signin");
      return;
    }

    try {
      setSubscribing(membershipItem.id);

      // 1. 구독 청구 준비 API 호출
      const prepareResponse = await subscriptionBillingAPI.prepareBilling({
        membershipItemId: membershipItem.id,
      });

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(prepareResponse.message || "구독 준비에 실패했습니다.");
      }

      const { clientKey, customerKey, successUrl, failUrl } =
        prepareResponse.data;

      // 2. TossPayments SDK 로드 및 자동결제 등록
      const tossPayments = await loadTossPaymentsInstance();

      // requestBillingAuth를 사용하여 자동결제 등록 (임시로 any 타입 사용)
      await (tossPayments as any).requestBillingAuth({
        method: "TRANSFER", // 계좌 자동결제
        customerKey,
        successUrl,
        failUrl,
      });
    } catch (error: any) {
      console.error("Subscription failed:", error);
      message.error(error.message || "구독 처리 중 오류가 발생했습니다.");
    } finally {
      setSubscribing(null);
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

  return {
    router,
    creator,
    memberships,
    loading,
    subscribing,
    handleSubscribe,
    getBillingText,
  };
}
