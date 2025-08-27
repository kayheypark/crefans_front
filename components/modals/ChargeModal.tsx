"use client";

import React, { useState } from "react";
import { Modal, Typography, message } from "antd";
const { Text } = Typography;

interface ChargeModalProps {
  open: boolean;
  onClose: () => void;
}

// 충전 상품 데이터
const chargeProducts = [
  { beans: 10, price: 1100 },
  { beans: 30, price: 3300 },
  { beans: 50, price: 5500 },
  { beans: 100, price: 11000 },
  { beans: 300, price: 33000 },
  { beans: 500, price: 55000 },
  { beans: 1000, price: 110000 },
  { beans: 5000, price: 550000 },
];

export default function ChargeModal({ open, onClose }: ChargeModalProps) {
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<
    number | null
  >(null);

  const handleCharge = () => {
    if (!selectedChargeAmount) {
      message.error("충전할 콩을 선택해주세요.");
      return;
    }
    // TODO: 결제 API 호출
    message.success("콩 충전이 완료되었습니다.");
    onClose();
    setSelectedChargeAmount(null);
  };

  const handleCancel = () => {
    onClose();
    setSelectedChargeAmount(null);
  };

  return (
    <Modal
      title="콩 충전"
      open={open}
      onOk={handleCharge}
      onCancel={handleCancel}
      okText="충전하기"
      cancelText="취소"
      width={600}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>충전할 콩을 선택해주세요:</Text>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {chargeProducts.map((product) => (
          <div
            key={product.beans}
            style={{
              border:
                selectedChargeAmount === product.beans
                  ? "2px solid #6a5af9"
                  : "1px solid #d9d9d9",
              borderRadius: 8,
              padding: 16,
              cursor: "pointer",
              background:
                selectedChargeAmount === product.beans ? "#f0f0ff" : "white",
              transition: "all 0.2s",
            }}
            onClick={() => setSelectedChargeAmount(product.beans)}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#6a5af9",
                  marginBottom: 4,
                }}
              >
                {product.beans.toLocaleString()} 콩
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>
                {product.price.toLocaleString()}원
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedChargeAmount && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f6f6f6",
            borderRadius: 8,
          }}
        >
          <Text strong>
            선택된 상품: {selectedChargeAmount.toLocaleString()} 콩
          </Text>
        </div>
      )}
    </Modal>
  );
}
