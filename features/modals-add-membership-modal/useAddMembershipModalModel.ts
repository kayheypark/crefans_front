"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { AddMembershipModalProps } from "@/features/modals-add-membership-modal/types";
import { membershipAPI } from "@/lib/api/membership";
import { CreateMembershipRequest } from "@/types/membership";
import { useState } from "react";

export function useAddMembershipModalModel(
  { open, onClose, onMembershipAdded }: AddMembershipModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewBenefits, setPreviewBenefits] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState("");

  const [hasChanges, setHasChanges] = useState(false);

  // 멤버십 추가
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    try {
      // 입력 중인 혜택이 있다면 마지막에 추가
      let finalBenefits = [...previewBenefits];
      if (inputValue.trim()) {
        finalBenefits.push(inputValue.trim());
      }

      // CreateMembershipRequest 형식으로 데이터 변환
      const membershipData: CreateMembershipRequest = {
        name: values.name,
        description: values.description,
        level: values.level,
        price: values.price,
        billing_unit: values.billing_unit || "MONTH",
        billing_period: values.billing_period || 1,
        trial_unit: values.trial_unit || "DAY",
        trial_period: values.trial_period || 0,
        benefits: finalBenefits.join(","),
      };

      const response = await membershipAPI.createMembership(membershipData);

      if (response.success) {
        onMembershipAdded(); // Signal to refresh the membership list
        message.success("멤버십이 추가되었습니다.");
        closeModal(); // handleClose 대신 closeModal 직접 호출
      } else {
        message.error(response.message || "멤버십 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("멤버십 추가 실패:", error);
      message.error("멤버십 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 변경 감지
  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      // Popconfirm이 자동으로 처리하므로 여기서는 아무것도 하지 않음
      return;
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    form.resetFields();
    setPreviewBenefits([]);
    setInputValue("");
    setHasChanges(false);
    onClose();
  };

  return {
    form,
    isSubmitting,
    previewBenefits,
    setPreviewBenefits,
    inputValue,
    setInputValue,
    handleSubmit,
    handleFormChange,
    handleClose,
    closeModal,
  };
}
