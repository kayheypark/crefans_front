"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { NicknameModalProps } from "@/features/modals-nickname-modal/types";
import { userAPI } from "@/lib/api/user";
import { validateNickname } from "@/lib/utils/validation";
import { useState } from "react";

export function useNicknameModalModel(
  { open, onClose, currentNickname }: NicknameModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const values = await form.validateFields();

      // 클라이언트 측 추가 검증
      if (!validateNickname(values.nickname)) {
        message.error("한글, 영문, 숫자 2-10자로 입력해주세요");
        return;
      }

      await userAPI.updateNickname(values.nickname);
      message.success("닉네임이 성공적으로 변경되었습니다.");
      await refreshUser(); // 사용자 정보 새로고침
      onClose();
      form.resetFields();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "닉네임 변경에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return { form, isLoading, handleSave, handleCancel };
}
