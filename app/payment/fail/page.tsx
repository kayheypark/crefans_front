"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Result, Button, Typography } from 'antd';
import { paymentAPI } from '@/lib/api/payment';

const { Text } = Typography;

export default function PaymentFailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 결제 실패 정보를 백엔드에 전송
    const handlePaymentFailure = async () => {
      const orderId = searchParams.get('orderId');
      const code = searchParams.get('code');
      const message = searchParams.get('message');

      if (orderId) {
        try {
          await paymentAPI.handlePaymentFailure(orderId, code || undefined, message || undefined);
        } catch (error) {
          console.error('Failed to handle payment failure:', error);
        }
      }
    };

    handlePaymentFailure();
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.push('/');
  };

  // URL 파라미터에서 에러 정보 추출
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  // 에러 코드에 따른 사용자 친화적 메시지
  const getErrorMessage = (code: string | null, message: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다.';
      case 'INVALID_CARD_COMPANY':
        return '유효하지 않은 카드입니다.';
      case 'NOT_ENOUGH_BALANCE':
        return '계좌 잔액이 부족합니다.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.';
      case 'EXCEED_MAX_MONTHLY_PAYMENT_COUNT':
        return '월간 결제 한도를 초과했습니다.';
      default:
        return message || '결제 처리 중 오류가 발생했습니다.';
    }
  };

  const displayMessage = getErrorMessage(errorCode, errorMessage);
  const isUserCanceled = errorCode === 'PAY_PROCESS_CANCELED';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Result
        status={isUserCanceled ? "info" : "error"}
        title={isUserCanceled ? "결제 취소" : "결제 실패"}
        subTitle={
          <div>
            <div>{displayMessage}</div>
            {errorCode && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
                오류 코드: {errorCode}
              </div>
            )}
          </div>
        }
        extra={[
          <Button type="primary" key="home" onClick={handleGoHome}>
            홈으로 가기
          </Button>,
          <Button key="retry" onClick={handleRetry}>
            다시 시도
          </Button>
        ]}
      />
    </div>
  );
}