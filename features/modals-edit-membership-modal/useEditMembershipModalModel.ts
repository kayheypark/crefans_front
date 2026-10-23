"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { EditMembershipModalProps } from "@/features/modals-edit-membership-modal/types";
import { membershipAPI } from "@/lib/api/membership";
import { UpdateMembershipRequest } from "@/types/membership";
import { useEffect, useState } from "react";

export function useEditMembershipModalModel(
  { open, onClose, membership, onMembershipUpdated }: EditMembershipModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previewBenefits, setPreviewBenefits] = useState<string[]>([]);

  const [inputValue, setInputValue] = useState("");

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (membership && open) {
      form.setFieldsValue({
        name: membership.name,
        level: membership.level,
        price: membership.price,
        description: membership.description,
        billing_unit: membership.billing_unit,
        billing_period: membership.billing_period,
        trial_unit: membership.trial_unit || "DAY",
        trial_period: membership.trial_period,
        benefits: membership.benefits,
      });
      // 혜택을 안전하게 배열로 변환하여 프리뷰에 표시
      if (membership.benefits) {
        const benefitsArray = Array.isArray(membership.benefits)
          ? membership.benefits.filter((b) => b)
          : membership.benefits
              .split(",")
              .map((b) => b.trim())
              .filter((b) => b);
        setPreviewBenefits(benefitsArray);
      } else {
        setPreviewBenefits([]);
      }
      setInputValue("");
    }
  }, [membership, open, form]);

  // 멤버십 수정
  const handleSubmit = async (values: any) => {
    if (!membership) return;

    setIsSubmitting(true);

    try {
      // 입력 중인 혜택이 있다면 마지막에 추가
      let finalBenefits = [...previewBenefits];
      if (inputValue.trim()) {
        finalBenefits.push(inputValue.trim());
      }

      const membershipData: UpdateMembershipRequest = {
        name: values.name,
        description: values.description,
        level: values.level,
        price: values.price,
        billing_unit: values.billing_unit,
        billing_period: values.billing_period,
        trial_unit: values.trial_unit,
        trial_period: values.trial_period,
        benefits: finalBenefits.join(","),
      };

      const response = await membershipAPI.updateMembership(
        membership.id,
        membershipData,
      );

      if (response.success) {
        onMembershipUpdated(response.data);
        message.success("멤버십이 수정되었습니다.");
        handleClose();
      } else {
        message.error(response.message || "멤버십 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("멤버십 수정 실패:", error);
      message.error("멤버십 수정에 실패했습니다.");
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
