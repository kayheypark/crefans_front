"use client";
import type { Feedback } from "@/types/presentation";

import { DonationModalProps } from "@/features/modals-donation-modal/types";
import { useEffect, useState } from "react";

export function useDonationModalModel(
  {
    open,
    onClose,
    creatorName,
    creatorHandle,
    creatorAvatar,
    onSubmit,
  }: DonationModalProps,
  { message }: { message: Feedback },
) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  // 가장 작은 금액을 기본 선택
  const [customAmount, setCustomAmount] = useState<string>("");

  const [donationMessage, setDonationMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: 실제 지갑 API에서 가져올 예정
  const currentBalance = 1000;
  // 현재 보유콩

  // 모달이 열릴 때마다 내용 초기화
  useEffect(() => {
    if (open) {
      setSelectedAmount(10); // 가장 작은 금액으로 초기화
      setCustomAmount("");
      setDonationMessage("");
      setIsSubmitting(false);
    }
  }, [open]);

  // 후원 금액 계산 (선택된 금액 또는 직접 입력한 금액)
  const getFinalAmount = () => {
    if (selectedAmount !== null) {
      return selectedAmount;
    }
    const custom = parseInt(customAmount);
    return isNaN(custom) ? 0 : custom;
  };

  // 후원하기 처리
  const handleDonate = async () => {
    const amount = getFinalAmount();

    if (amount <= 0) {
      message.error("후원 금액을 선택하거나 입력해주세요.");
      return;
    }

    if (amount < 1) {
      message.error("최소 1콩 이상 후원해주세요.");
      return;
    }

    if (amount > currentBalance) {
      message.error(
        `보유콩이 부족합니다. (보유: ${currentBalance.toLocaleString()}콩)`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: 실제 후원 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이

      onSubmit?.(amount, donationMessage);
      message.success(`${amount}콩을 후원했습니다!`);
      handleClose();
    } catch (error) {
      message.error("후원 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    onClose();
  };

  // 금액 선택 시 커스텀 입력 초기화
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // 커스텀 입력 시 선택된 금액 초기화
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  return {
    selectedAmount,
    customAmount,
    donationMessage,
    setDonationMessage,
    isSubmitting,
    currentBalance,
    getFinalAmount,
    handleDonate,
    handleClose,
    handleAmountSelect,
    handleCustomAmountChange,
  };
}
