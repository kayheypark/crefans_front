"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal, Typography, message, Spin } from "antd";
import { paymentAPI, PaymentPrepareRequest } from "@/lib/api/payment";
import { CHARGE_PRODUCTS } from "@/lib/constants/chargeProducts";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { createPaymentInstance } from "@/lib/tossPayments";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
const { Text } = Typography;

interface ChargeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChargeModal({ open, onClose }: ChargeModalProps) {
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentInstance, setPaymentInstance] = useState<any>(null);

  const { user, refreshUser } = useAuth();
  const router = useRouter();

  // TossPayments 결제창 초기화
  useEffect(() => {
    const initializePaymentInstance = async () => {
      if (!open || !user) return;

      try {
        const payment = await createPaymentInstance(user.attributes.sub);
        setPaymentInstance(payment);
      } catch (error) {
        console.error('Payment instance initialization failed:', error);
        message.error('결제 시스템 초기화에 실패했습니다.');
      }
    };

    initializePaymentInstance();
  }, [open, user]);

  // 결제창 API는 렌더링이 필요하지 않음

  const handleProductSelect = (beans: number, price: number) => {
    setSelectedChargeAmount(beans);
    setSelectedPrice(price);
  };

  const handleCharge = async () => {
    if (!selectedChargeAmount || !selectedPrice || !user || !paymentInstance) {
      message.error("충전할 콩을 선택해주세요.");
      return;
    }

    setIsPaymentLoading(true);

    try {
      // 1. 백엔드에서 결제 준비 및 orderId 생성
      const selectedProduct = CHARGE_PRODUCTS.find(p => p.beans === selectedChargeAmount);
      const prepareData: PaymentPrepareRequest = {
        amount: selectedPrice,
        orderName: `콩 ${selectedChargeAmount.toLocaleString()}개 충전`,
        customerEmail: user.attributes.email,
        customerName: user.attributes.name || user.attributes.nickname,
      };

      const prepareResponse = await paymentAPI.preparePayment(prepareData);

      if (!prepareResponse.success || !prepareResponse.data?.orderId) {
        throw new Error('결제 준비 실패');
      }

      const { orderId } = prepareResponse.data;

      // 2. TossPayments 결제창으로 결제 요청
      const successUrl = `${window.location.origin}/payment/success`;
      const failUrl = `${window.location.origin}/payment/fail`;

      await paymentInstance.requestPayment({
        method: 'CARD', // 카드 결제
        amount: {
          currency: 'KRW',
          value: selectedPrice,
        },
        orderId: orderId,
        orderName: prepareData.orderName,
        successUrl: successUrl,
        failUrl: failUrl,
        customerEmail: prepareData.customerEmail,
        customerName: prepareData.customerName,
      });

    } catch (error: any) {
      console.error('Payment failed:', error);

      // 사용자에게 친화적인 에러 메시지
      if (error.code === 'USER_CANCEL') {
        message.info('결제가 취소되었습니다.');
      } else if (error.message?.includes('결제 준비 실패')) {
        message.error('결제 준비 중 오류가 발생했습니다. 다시 시도해주세요.');
      } else {
        message.error('결제 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedChargeAmount(null);
    setSelectedPrice(null);
    setPaymentInstance(null);
  };

  return (
    <Modal
      title="콩 충전"
      open={open}
      onOk={handleCharge}
      onCancel={handleCancel}
      okText={isPaymentLoading ? "결제 처리 중..." : "결제하기"}
      cancelText="취소"
      okButtonProps={{
        disabled: !selectedChargeAmount || !paymentInstance || isPaymentLoading,
        loading: isPaymentLoading
      }}
      width={800}
      zIndex={1002}
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>충전할 콩을 선택해주세요:</Text>
      </div>

      {/* 상품 선택 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {CHARGE_PRODUCTS.map((product) => (
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
            onClick={() => handleProductSelect(product.beans, product.price)}
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

      {/* 선택된 상품 정보 */}
      {selectedChargeAmount && selectedPrice && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            background: "#f6f6f6",
            borderRadius: 8,
          }}
        >
          <Text strong>
            선택된 상품: {selectedChargeAmount.toLocaleString()} 콩 ({selectedPrice.toLocaleString()}원)
          </Text>
        </div>
      )}

      {/* 결제 안내 */}
      {selectedPrice && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            padding: 16,
            background: '#f9f9f9',
            borderRadius: 8,
            border: '1px solid #e0e0e0'
          }}>
            <Text>
              '결제하기' 버튼을 누르면 토스페이먼츠 결제창이 열립니다.
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              카드, 계좌이체, 간편결제 등 다양한 결제수단을 사용할 수 있습니다.
            </Text>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isPaymentLoading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 10 }}>
            <Text>결제를 처리하고 있습니다...</Text>
          </div>
        </div>
      )}
    </Modal>
  );
}
