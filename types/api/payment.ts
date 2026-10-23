import { ConfirmPaymentRequest, PreparePaymentRequest } from "@/types/payment";
export interface PaymentPrepareRequest extends PreparePaymentRequest {}

export interface PaymentConfirmRequest extends ConfirmPaymentRequest {}
