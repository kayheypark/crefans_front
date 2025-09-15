import axios from "axios";
import { getApiUrl } from "@/utils/env";

// 결제 요청 데이터 타입
export interface PaymentPrepareRequest {
  amount: number;
  orderName: string;
  customerEmail?: string;
  customerName?: string;
}

// 결제 확인 데이터 타입
export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// 결제 관련 API 함수들
export const paymentAPI = {
  // 결제 준비 (TossPayments 통합)
  preparePayment: async (data: PaymentPrepareRequest) => {
    const response = await axios.post(
      `${getApiUrl()}/payment/prepare`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  // 결제 확인 (TossPayments 통합)
  confirmPayment: async (data: PaymentConfirmRequest) => {
    const response = await axios.post(
      `${getApiUrl()}/payment/confirm`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  // 콩 충전 (레거시 - 호환성 유지)
  chargeBeans: async (amount: number) => {
    const response = await axios.post(
      `${getApiUrl()}/payment/charge`,
      { amount },
      { withCredentials: true }
    );
    return response.data;
  },

  // 결제 내역 조회
  getPaymentHistory: async (page: number = 1, limit: number = 10) => {
    const response = await axios.get(
      `${getApiUrl()}/payment/history?page=${page}&limit=${limit}`,
      { withCredentials: true }
    );
    return response.data;
  },

  // 충전 상품 목록 조회
  getChargeProducts: async () => {
    const response = await axios.get(`${getApiUrl()}/payment/products`);
    return response.data;
  },

  // 결제 실패 처리
  handlePaymentFailure: async (orderId: string, errorCode?: string, errorMessage?: string) => {
    const response = await axios.post(
      `${getApiUrl()}/payment/failure`,
      { orderId, errorCode, errorMessage },
      { withCredentials: true }
    );
    return response.data;
  },
};
