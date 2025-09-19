import axios from "axios";
import { getApiUrl } from "@/utils/env";
import {
  PreparePaymentRequest,
  ConfirmPaymentRequest,
  GetPaymentHistoryRequest,
  PreparePaymentResponse,
  ConfirmPaymentResponse,
  PaymentHistoryResponse
} from '@/types/payment';

// Legacy interfaces for backward compatibility
export interface PaymentPrepareRequest extends PreparePaymentRequest {}
export interface PaymentConfirmRequest extends ConfirmPaymentRequest {}

// 결제 관련 API 함수들
export const paymentAPI = {
  // 결제 준비 (TossPayments 통합)
  preparePayment: async (data: PreparePaymentRequest): Promise<PreparePaymentResponse> => {
    const response = await axios.post(
      `${getApiUrl()}/payment/prepare`,
      data,
      { withCredentials: true }
    );
    return response.data;
  },

  // 결제 확인 (TossPayments 통합)
  confirmPayment: async (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
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
  getPaymentHistory: async (params?: GetPaymentHistoryRequest): Promise<PaymentHistoryResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const response = await axios.get(
      `${getApiUrl()}/payment/history?${searchParams}`,
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
