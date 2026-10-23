import type {
  Notification,
  PaymentHistory,
  PaymentMethod,
} from "@/types/common";
import type { PaymentHistoryResponse } from "@/types/paymentHistory";

// Existing demo data only. These methods do not represent live payment/notification APIs.
async function readDemo<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error("데모 데이터를 불러오지 못했습니다.");
  return response.json();
}
export const demoAPI = {
  getNotifications: () =>
    readDemo<{ data: Notification[] }>("/mock/notifications.json"),
  getPaymentMethods: () =>
    readDemo<{ data: PaymentMethod[] }>("/mock/paymentMethods.json"),
  getPaymentHistory: () =>
    readDemo<{ data: PaymentHistory[] }>("/mock/paymentHistory.json"),
  getFullPaymentHistory: () =>
    readDemo<PaymentHistoryResponse>("/mock/paymentHistoryFull.json"),
};
