// Payment Request DTOs (matching server exactly)
export interface PreparePaymentRequest {
  amount: number;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
}

export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentWebhookRequest {
  eventType: string;
  createdAt: string;
  data: any;
}

export interface GetPaymentHistoryRequest {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

// Payment Status enum (matching server)
export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIAL_REFUNDED';

// Payment Response interfaces
export interface TokenType {
  symbol: string;
  name: string;
  price: number;
}

export interface PaymentTransactionResponse {
  id: string;
  orderId: string;
  paymentKey?: string;
  amount: number;
  tokenAmount: number;
  tokenType: TokenType;
  status: PaymentStatus;
  method?: string;
  approvedAt?: string;
  cancelledAt?: string;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreparePaymentResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    tokenAmount: number;
    clientKey: string;
    customerName?: string;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data: PaymentTransactionResponse & {
    token?: {
      symbol: string;
      amount: number;
    };
  };
  message?: string; // Optional message field for frontend use
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    transactions: PaymentTransactionResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentWebhookResponse {
  success: boolean;
  message: string;
}

// Legacy DTOs for backwards compatibility
export type PreparePaymentDto = PreparePaymentRequest;
export type ConfirmPaymentDto = ConfirmPaymentRequest;
export type PaymentWebhookDto = PaymentWebhookRequest;
export type GetPaymentHistoryDto = GetPaymentHistoryRequest;