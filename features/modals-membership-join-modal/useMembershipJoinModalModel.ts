"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import {
  Membership,
  MembershipJoinModalProps,
} from "@/features/modals-membership-join-modal/types";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
import { createBillingInstance } from "@/lib/tossPayments";
import { useEffect, useState } from "react";

export function useMembershipJoinModalModel(
  {
    open,
    onClose,
    creatorName,
    creatorHandle,
    creatorAvatar,
    memberships,
    defaultSelectedMembershipId,
    subscribedMembershipIds = [],
  }: MembershipJoinModalProps,
  { message }: { message: Feedback },
) {
  const { user } = useAuth();

  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때마다 내용 초기화
  useEffect(() => {
    if (open) {
      // defaultSelectedMembershipId가 있으면 해당 멤버십 선택, 없으면 첫 번째 멤버십 선택
      if (defaultSelectedMembershipId) {
        const defaultMembership = memberships.find(
          (m) => m.id === defaultSelectedMembershipId,
        );
        setSelectedMembership(
          defaultMembership || (memberships.length > 0 ? memberships[0] : null),
        );
      } else if (!selectedMembership && memberships.length > 0) {
        setSelectedMembership(memberships[0]);
      }
      setIsSubmitting(false);
    }
  }, [open, memberships, defaultSelectedMembershipId]);

  // 멤버십 가입 처리
  const handleJoin = async () => {
    if (!selectedMembership) {
      message.error("멤버십을 선택해주세요.");
      return;
    }

    if (!user?.attributes?.sub) {
      message.error("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 정기결제 (TossPayments 빌링)만 지원
      await handleRecurringPayment();
    } catch (error: any) {
      console.error("Membership join error:", error);
      message.error(
        error.message || "멤버십 가입 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 정기결제 처리
  const handleRecurringPayment = async () => {
    if (!selectedMembership || !user?.attributes?.sub) return;

    try {
      // 1. 빌링 준비 API 호출
      const prepareResponse = await subscriptionBillingAPI.prepareBilling({
        membershipItemId: selectedMembership.id,
      });

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(
          prepareResponse.message || "빌링 준비 중 오류가 발생했습니다.",
        );
      }

      const { clientKey, customerKey, successUrl, failUrl } =
        prepareResponse.data;

      // 2. TossPayments SDK를 사용한 정기결제 인증 요청
      const tossPayments = await createBillingInstance();
      const payment = tossPayments.payment({ customerKey });

      await payment.requestBillingAuth({
        method: "CARD", // 카드 자동결제 (테스트 환경에서 지원)
        successUrl: `${successUrl}?membershipItemId=${selectedMembership.id}&userId=${user.attributes.sub}`,
        failUrl: `${failUrl}?membershipItemId=${selectedMembership.id}&userId=${user.attributes.sub}`,
        customerEmail: user.attributes.email || "customer@example.com",
        customerName:
          user.attributes.name || user.attributes.nickname || "고객",
      });

      // TossPayments로 리다이렉트되므로 이 부분은 실행되지 않음
    } catch (error: any) {
      console.error("Recurring payment setup failed:", error);
      throw new Error(error.message || "정기결제 설정 중 오류가 발생했습니다.");
    }
  };

  // 모달 닫기
  const handleClose = () => {
    onClose();
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

  // 체험 기간 텍스트 변환
  const getTrialText = (membership: Membership) => {
    if (!membership.trial_period || !membership.trial_unit) return null;
    const unitMap: { [key: string]: string } = {
      DAY: "일",
      WEEK: "주",
      MONTH: "개월",
      YEAR: "년",
    };
    return `${membership.trial_period}${
      unitMap[membership.trial_unit] || membership.trial_unit
    } 무료 체험`;
  };

  return {
    selectedMembership,
    setSelectedMembership,
    isSubmitting,
    handleJoin,
    handleClose,
    getBillingText,
    getTrialText,
  };
}
