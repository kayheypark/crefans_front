"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Pagination,
  Spin,
  Button,
  Select,
  DatePicker,
} from "antd";
import { useResponsive } from "@/hooks/useResponsive";
import { FilterOutlined } from "@ant-design/icons";
import PaymentHistoryItem from "@/components/common/PaymentHistoryItem";

const { Title } = Typography;

interface PaymentHistoryItem {
  id: number;
  type: "membership" | "tip";
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string;
  date: string;
  merchant: string;
}

interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    items: PaymentHistoryItem[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
}

export default function PaymentHistoryPage() {
  const { isMobile } = useResponsive();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    []
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
      const response = await fetch("/mock/paymentHistoryFull.json");
      const apiResponse: PaymentHistoryResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "결제 내역 조회에 실패했습니다.");
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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "0" : "24px" }}>
      {/* 필터 및 정렬 */}
      <div>
        {/* 필터 영역 */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              marginBottom: "16px",
              //   border: isMobile ? "none" : "1px solid #e0e0e0",
              overflowX: isMobile ? "auto" : "visible",
              overflowY: "hidden",
              whiteSpace: "nowrap",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* 초기화 아이콘 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0",
                cursor: "pointer",
                flexShrink: 0,
                minWidth: "32px",
                minHeight: "32px",
              }}
              onClick={() =>
                setFilterValues({
                  type: undefined,
                  dateRange: null as any,
                  amountRange: undefined,
                })
              }
            >
              <span style={{ fontSize: "16px", color: "#666" }}>↻</span>
            </div>

            {/* 결제 타입 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "120px" }}>
              <Select
                allowClear
                value={filterValues.type}
                onChange={(value) =>
                  setFilterValues({ ...filterValues, type: value })
                }
                style={{ width: "100%", borderRadius: "20px" }}
                size="middle"
                placeholder="결제유형"
                options={[
                  { value: "membership", label: "멤버십" },
                  { value: "tip", label: "팁" },
                  { value: "bean", label: "콩 구매" },
                ]}
              />
            </div>

            {/* 날짜 범위 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "200px" }}>
              <DatePicker.RangePicker
                value={filterValues.dateRange}
                onChange={(dates: any) =>
                  setFilterValues({ ...filterValues, dateRange: dates })
                }
                style={{ width: "100%", borderRadius: "20px" }}
                size="middle"
                placeholder={["시작일", "종료일"]}
              />
            </div>

            {/* 금액 범위 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "120px" }}>
              <Select
                allowClear
                value={filterValues.amountRange}
                onChange={(value) =>
                  setFilterValues({ ...filterValues, amountRange: value })
                }
                style={{ width: "100%", borderRadius: "20px" }}
                size="middle"
                placeholder="금액구간"
                options={[
                  { value: "0-10000", label: "1만원 이하" },
                  { value: "10000-50000", label: "1만원~5만원" },
                  { value: "50000+", label: "5만원 이상" },
                ]}
              />
            </div>
          </div>
          {/* 오른쪽 그라디언트 오버레이 */}
          {isMobile && (
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "40px",
                height: "100%",
                background: "linear-gradient(to right, transparent, #ffffff)",
                pointerEvents: "none",
                zIndex: 1,
                borderRadius: "0 8px 8px 0",
              }}
            />
          )}
        </div>

        {/* 검색 결과 요약 및 정렬 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 0",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              paddingLeft: isMobile ? "16px" : 0,
            }}
          >
            총 {paymentHistory.length}건
          </div>

          {/* 정렬 셀렉트 박스 */}
          <Select
            value={sortType}
            onChange={(value) => setSortType(value)}
            style={{ width: "140px", borderRadius: "20px" }}
            size="middle"
            options={[
              { value: "latest", label: "최신순" },
              { value: "oldest", label: "오래된순" },
              { value: "amountHigh", label: "금액높은순" },
              { value: "amountLow", label: "금액낮은순" },
            ]}
          />
        </div>
      </div>

      {/* 결제이력 목록 */}
      <Card style={{ marginBottom: "24px" }}>
        <div>
          {getSortedPaymentHistory().map((item) => (
            <PaymentHistoryItem key={item.id} {...item} />
          ))}
        </div>
      </Card>

      {/* 페이지네이션 */}
      <div style={{ textAlign: "center" }}>
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} / 총 ${total}건`
          }
        />
      </div>
    </div>
  );
}
