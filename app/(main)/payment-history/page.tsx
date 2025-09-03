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
  data: PaymentHistoryItem[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
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
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    type: "all",
    dateRange: null as any,
    amountRange: "all",
  });
  const [sortType, setSortType] = useState<
    "latest" | "oldest" | "amountHigh" | "amountLow"
  >("latest");

  // 필터 요약 텍스트 생성
  const getFilterSummary = () => {
    const filters = [];

    if (filterValues.type !== "all") {
      const typeLabel =
        {
          membership: "멤버십",
          tip: "팁",
          bean: "콩 구매",
        }[filterValues.type] || filterValues.type;
      filters.push(typeLabel);
    }

    if (
      filterValues.dateRange &&
      filterValues.dateRange[0] &&
      filterValues.dateRange[1]
    ) {
      const startDate =
        filterValues.dateRange[0]?.format?.("YYYY. MM. DD") ||
        new Date(filterValues.dateRange[0]).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      const endDate =
        filterValues.dateRange[1]?.format?.("YYYY. MM. DD") ||
        new Date(filterValues.dateRange[1]).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      filters.push(`${startDate} ~ ${endDate}`);
    }

    if (filterValues.amountRange !== "all") {
      const amountLabel = {
        "0-10000": "1만원 이하",
        "10000-50000": "1만원~5만원",
        "50000+": "5만원 이상",
      }[filterValues.amountRange];
      filters.push(amountLabel);
    }

    return filters.length > 0 ? filters.join(" • ") : "전체보기";
  };

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
      const data: PaymentHistoryResponse = await response.json();

      // 페이징 처리 (실제 API에서는 서버에서 처리)
      const startIndex = (page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const pageData = data.data.slice(startIndex, endIndex);

      setPaymentHistory(pageData);
      setPagination({
        ...pagination,
        current: page,
        total: data.pagination.total,
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
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      {/* 필터 */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: showFilters ? "16px" : "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FilterOutlined style={{ color: "#666" }} />
            <span style={{ fontSize: "14px", color: "#666" }}>
              {showFilters ? "필터" : getFilterSummary()}
            </span>
          </div>
          <Button
            type="text"
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            style={{ fontSize: "12px" }}
          >
            {showFilters ? "필터 숨기기" : "필터 보기"}
          </Button>
        </div>

        {showFilters && (
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "16px",
              alignItems: isMobile ? "stretch" : "center",
            }}
          >
            {/* 결제 타입 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "120px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                결제 타입
              </div>
              <Select
                value={filterValues.type}
                onChange={(value) =>
                  setFilterValues({ ...filterValues, type: value })
                }
                style={{ width: "100%" }}
                size="small"
                options={[
                  { value: "all", label: "전체" },
                  { value: "membership", label: "멤버십" },
                  { value: "tip", label: "팁" },
                  { value: "bean", label: "콩 구매" },
                ]}
              />
            </div>

            {/* 날짜 범위 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "200px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                날짜 범위
              </div>
              <DatePicker.RangePicker
                value={filterValues.dateRange}
                onChange={(dates: any) =>
                  setFilterValues({ ...filterValues, dateRange: dates })
                }
                style={{ width: "100%" }}
                size="small"
                placeholder={["시작일", "종료일"]}
              />
            </div>

            {/* 금액 범위 필터 */}
            <div style={{ minWidth: isMobile ? "auto" : "120px" }}>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}
              >
                금액 범위
              </div>
              <Select
                value={filterValues.amountRange}
                onChange={(value) =>
                  setFilterValues({ ...filterValues, amountRange: value })
                }
                style={{ width: "100%" }}
                size="small"
                options={[
                  { value: "all", label: "전체" },
                  { value: "0-10000", label: "1만원 이하" },
                  { value: "10000-50000", label: "1만원~5만원" },
                  { value: "50000+", label: "5만원 이상" },
                ]}
              />
            </div>

            {/* 필터 적용/초기화 버튼 */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: isMobile ? "8px" : "0",
              }}
            >
              <Button type="primary" size="small" style={{ fontSize: "12px" }}>
                필터 적용
              </Button>
              <Button
                size="small"
                style={{ fontSize: "12px" }}
                onClick={() =>
                  setFilterValues({
                    type: "all",
                    dateRange: null as any,
                    amountRange: "all",
                  })
                }
              >
                초기화
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 정렬 옵션 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#666" }}>
          총 {paymentHistory.length}건
        </div>

        {/* 정렬 셀렉트 박스 */}
        <Select
          value={sortType}
          onChange={(value) => setSortType(value)}
          style={{ width: "120px" }}
          size="large"
          options={[
            { value: "latest", label: "최신순" },
            { value: "oldest", label: "오래된순" },
            { value: "amountHigh", label: "금액높은순" },
            { value: "amountLow", label: "금액낮은순" },
          ]}
        />
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
          showQuickJumper
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} / 총 ${total}건`
          }
        />
      </div>
    </div>
  );
}
