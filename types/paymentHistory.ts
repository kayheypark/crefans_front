export interface PaymentHistoryRecord {
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

export interface PaymentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    items: PaymentHistoryRecord[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
}
