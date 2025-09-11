import React from "react";
import { formatFullDate } from "@/lib/utils/dateUtils";

interface PaymentHistoryItemProps {
  id: string;
  type: "membership" | "tip" | "bean";
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string;
  date: string;
  merchant: string;
}

export default function PaymentHistoryItem({
  description,
  merchant,
  paymentMethod,
  amount,
  date,
}: PaymentHistoryItemProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
        marginBottom: "8px",
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "14px",
            color: "#222",
            fontWeight: 500,
            marginBottom: "4px",
          }}
        >
          {description}
        </div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          {merchant} • {paymentMethod}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: "16px",
            color: "#1890ff",
            fontWeight: "bold",
          }}
        >
          ₩{formatAmount(amount)}
        </div>
        <div style={{ fontSize: "11px", color: "#999" }}>
          {formatFullDate(date)}
        </div>
      </div>
    </div>
  );
}
