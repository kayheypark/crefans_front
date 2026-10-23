"use client";

import PaymentHistoryItem from "@/components/common/PaymentHistoryItem";
import { usePaymentHistoryPageModel } from "@/features/payment-history/usePaymentHistoryPageModel";
import { Card, DatePicker, Pagination, Select, Spin } from "antd";

export default function PaymentHistoryPage() {
  const model = usePaymentHistoryPageModel();
  return <PaymentHistoryPageView model={model} />;
}

function PaymentHistoryPageView({
  model,
}: {
  model: ReturnType<typeof usePaymentHistoryPageModel>;
}) {
  const {
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
  } = model;

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
