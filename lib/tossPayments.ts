import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

// TossPayments 클라이언트 키
export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

if (!TOSS_CLIENT_KEY) {
  throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY is required');
}

// TossPayments 인스턴스를 로드하는 함수
export const loadTossPaymentsInstance = async () => {
  try {
    const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
    return tossPayments;
  } catch (error) {
    console.error('Failed to load TossPayments:', error);
    throw error;
  }
};

// 결제창 인스턴스를 생성하는 함수 (API 개별 연동 키용)
export const createPaymentInstance = async (customerKey: string) => {
  try {
    const tossPayments = await loadTossPaymentsInstance();
    const payment = tossPayments.payment({
      customerKey: customerKey,
    });

    return payment;
  } catch (error) {
    console.error('Failed to create payment instance:', error);
    throw error;
  }
};

// 결제 요청을 위한 타입 정의
export interface PaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  successUrl: string;
  failUrl: string;
}

// 결제 확인을 위한 타입 정의
export interface PaymentConfirmation {
  paymentKey: string;
  orderId: string;
  amount: number;
}