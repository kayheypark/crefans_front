import axios from "axios";
import { getApiUrl } from "@/utils/env";

// 결제 관련 API 함수들
export const paymentAPI = {
  // 콩 충전
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
};
