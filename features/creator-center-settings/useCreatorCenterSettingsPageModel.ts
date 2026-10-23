"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useCreatorGuard } from "@/hooks/useCreatorGuard";
import { useState } from "react";

export function useCreatorCenterSettingsPageModel({
  message,
  form,
}: {
  message: Feedback;
  form: FormController;
}) {
  const [loading, setLoading] = useState(false);

  // 로그인 및 크리에이터 권한 필수
  const { isLoading, hasAccess } = useCreatorGuard({
    requiresLogin: true,
    requiresCreator: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("설정이 저장되었습니다.");
    } catch (error) {
      console.error("설정 저장 실패:", error);
      message.error("설정 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info("설정이 초기화되었습니다.");
  };

  return { form, loading, isLoading, hasAccess, handleSave, handleReset };
}
