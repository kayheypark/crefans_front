"use client";

import { demoAPI } from "@/lib/api/demo";

import { PaymentHistoryRecord } from "@/features/payment-history/types";
import { useResponsive } from "@/hooks/useResponsive";
import { useEffect, useState } from "react";

export function usePaymentHistoryPageModel() {
  const { isMobile } = useResponsive();

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filterValues, setFilterValues] = useState({
    type: undefined as string | undefined,
    dateRange: null as any,
    amountRange: undefined as string | undefined,
  });

  const [sortType, setSortType] = useState<
    "latest" | "oldest" | "amountHigh" | "amountLow"
  >("latest");

  // 정렬된 결제이력 데이터 생성
  const getSortedPaymentHistory = () => {
    const sorted = [...paymentHistory].sort((a, b) => {
      switch (sortType) {
        case "latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amountHigh":
          return b.amount - a.amount;
        case "amountLow":
          return a.amount - b.amount;
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return sorted;
  };

  useEffect(() => {
    fetchPaymentHistory(1);
  }, []);

  const fetchPaymentHistory = async (page: number) => {
    setLoading(true);
    try {
      // 실제 API 호출 시에는 페이지 번호를 쿼리 파라미터로 전달
      const apiResponse = await demoAPI.getFullPaymentHistory();

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || "결제 내역 조회에 실패했습니다.",
        );
      }

      // 페이징 처리 (실제 API에서는 서버에서 처리)
      const startIndex = (page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const pageData = apiResponse.data.items.slice(startIndex, endIndex);

      setPaymentHistory(pageData);
      setPagination({
        ...pagination,
        current: page,
        total: apiResponse.data.pagination.total,
      });
    } catch (error) {
      console.error("결제이력 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    fetchPaymentHistory(page);
  };

  return {
    isMobile,
    paymentHistory,
    loading,
    pagination,
    filterValues,
    setFilterValues,
    sortType,
    setSortType,
    getSortedPaymentHistory,
    handlePageChange,
  };
}
