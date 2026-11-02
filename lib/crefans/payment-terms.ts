// Same version as server src/platform/payment-terms.ts; the server refuses a payment sent with any other version.
// 2026-11-02 user decision: the conditions sit right above the payment button behind a required check box (전자상거래법 제13조·제17조).
export const PAYMENT_TERMS={version:'2026-11-02.1',agreement:'위 결제 조건과 이용약관을 확인했으며 결제에 동의합니다.'} as const;
