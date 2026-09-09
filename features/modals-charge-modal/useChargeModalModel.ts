"use client";
import type { Feedback } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { ChargeModalProps } from "@/features/modals-charge-modal/types";
import { paymentAPI, PaymentPrepareRequest } from "@/lib/api/payment";
import { CHARGE_PRODUCTS } from "@/lib/constants/chargeProducts";
import { createPaymentInstance } from "@/lib/tossPayments";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useChargeModalModel(
  { open, onClose }: ChargeModalProps,
  { message }: { message: Feedback },
) {
  const [selectedChargeAmount, setSelectedChargeAmount] = useState<
    number | null
  >(null);

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
        console.error("Payment instance initialization failed:", error);
        message.error("결제 시스템 초기화에 실패했습니다.");
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
      const selectedProduct = CHARGE_PRODUCTS.find(
        (p) => p.beans === selectedChargeAmount,
      );
      const prepareData: PaymentPrepareRequest = {
        amount: selectedPrice,
        orderName: `콩 ${selectedChargeAmount.toLocaleString()}개 충전`,
        customerEmail: user.attributes.email,
        customerName: user.attributes.name || user.attributes.nickname,
      };

      const prepareResponse = await paymentAPI.preparePayment(prepareData);

      if (!prepareResponse.success || !prepareResponse.data?.orderId) {
        throw new Error("결제 준비 실패");
      }

      const { orderId } = prepareResponse.data;

      // 2. TossPayments 결제창으로 결제 요청
      const successUrl = `${window.location.origin}/payment/success`;
      const failUrl = `${window.location.origin}/payment/fail`;

      await paymentInstance.requestPayment({
        method: "CARD", // 카드 결제
        amount: {
          currency: "KRW",
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
      console.error("Payment failed:", error);

      // 사용자에게 친화적인 에러 메시지
      if (error.code === "USER_CANCEL") {
        message.info("결제가 취소되었습니다.");
      } else if (error.message?.includes("결제 준비 실패")) {
        message.error("결제 준비 중 오류가 발생했습니다. 다시 시도해주세요.");
      } else {
        message.error("결제 처리 중 오류가 발생했습니다.");
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

  return {
    selectedChargeAmount,
    selectedPrice,
    isPaymentLoading,
    paymentInstance,
    handleProductSelect,
    handleCharge,
    handleCancel,
  };
}
