"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { useState } from "react";

// 목업 데이터
const mockDonations = [
  {
    id: 1,
    donorName: "김후원자",
    donorAvatar: null,
    amount: 50000,
    message: "항상 응원하고 있어요! 좋은 콘텐츠 감사합니다.",
    date: "2024-01-15",
    status: "completed",
    isAnonymous: false,
    tier: "gold",
  },
  {
    id: 2,
    donorName: "익명 후원자",
    donorAvatar: null,
    amount: 25000,
    message: "",
    date: "2024-01-14",
    status: "completed",
    isAnonymous: true,
    tier: "silver",
  },
  {
    id: 3,
    donorName: "이후원자",
    donorAvatar: null,
    amount: 100000,
    message: "크리에이터님의 열정이 느껴져요. 더 멋진 콘텐츠 기대합니다!",
    date: "2024-01-13",
    status: "completed",
    isAnonymous: false,
    tier: "platinum",
  },
  {
    id: 4,
    donorName: "박후원자",
    donorAvatar: null,
    amount: 15000,
    message: "응원합니다!",
    date: "2024-01-12",
    status: "pending",
    isAnonymous: false,
    tier: "bronze",
  },
];

const mockDonationStats = {
  totalDonations: 190000,
  monthlyDonations: 190000,
  totalDonors: 4,
  averageDonation: 47500,
  topDonor: "이후원자",
  topDonationAmount: 100000,
};
export function useDonationsPageModel({
  message,
  form,
}: {
  message: Feedback;
  form: FormController;
}) {
  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: true,
  });

  const [donations, setDonations] = useState(mockDonations);

  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);

  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  const handleThankYou = (donation: any) => {
    setSelectedDonation(donation);
    form.resetFields();
    setIsThankYouModalOpen(true);
  };

  const handleThankYouSubmit = async () => {
    try {
      const values = await form.validateFields();
      message.success("감사 메시지가 전송되었습니다.");
      setIsThankYouModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("폼 검증 실패:", error);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (selectedStatus !== "all" && donation.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  return {
    mockDonationStats,
    isLoading,
    hasAccess,
    selectedPeriod,
    setSelectedPeriod,
    selectedStatus,
    setSelectedStatus,
    isThankYouModalOpen,
    setIsThankYouModalOpen,
    selectedDonation,
    form,
    handleThankYou,
    handleThankYouSubmit,
    filteredDonations,
  };
}
