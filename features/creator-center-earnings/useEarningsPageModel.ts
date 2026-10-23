"use client";

import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { useState } from "react";

// 목업 데이터
const mockEarningsData = [
  {
    key: "1",
    date: "2024-01-15",
    type: "membership",
    member: "김크리에이터",
    amount: 50000,
    status: "completed",
    description: "프리미엄 멤버십 구독",
  },
  {
    key: "2",
    date: "2024-01-14",
    type: "donation",
    member: "이후원자",
    amount: 25000,
    status: "completed",
    description: "후원",
  },
  {
    key: "3",
    date: "2024-01-13",
    type: "membership",
    member: "박구독자",
    amount: 30000,
    status: "completed",
    description: "베이직 멤버십 구독",
  },
  {
    key: "4",
    date: "2024-01-12",
    type: "donation",
    member: "최후원자",
    amount: 15000,
    status: "completed",
    description: "후원",
  },
  {
    key: "5",
    date: "2024-01-11",
    type: "membership",
    member: "정구독자",
    amount: 50000,
    status: "pending",
    description: "프리미엄 멤버십 구독",
  },
];

const mockMonthlyStats = {
  totalEarnings: 170000,
  membershipEarnings: 130000,
  donationEarnings: 40000,
  growthRate: 15.2,
  totalTransactions: 5,
};
export function useEarningsPageModel() {
  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: true,
  });

  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [selectedType, setSelectedType] = useState("all");

  return {
    mockEarningsData,
    mockMonthlyStats,
    isLoading,
    hasAccess,
    selectedPeriod,
    setSelectedPeriod,
    selectedType,
    setSelectedType,
  };
}
