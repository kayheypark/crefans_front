"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { useAuth } from "@/contexts/AuthContext";
import { HandleModalProps } from "@/features/modals-handle-modal/types";
import { userAPI } from "@/lib/api/user";
import { validateHandle } from "@/lib/utils/validation";
import { useState } from "react";

export function useHandleModalModel(
  { open, onClose, currentHandle }: HandleModalProps,
  { message, form }: { message: Feedback; form: FormController },
) {
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    let values: any = null;

    try {
      values = await form.validateFields();

      // 클라이언트 측 추가 검증
      const clientValidation = validateHandle(values.preferred_username);
      if (!clientValidation.isValid) {
        message.error(clientValidation.errors[0]);
        return;
      }

      await userAPI.updateHandle(values.preferred_username);
      message.success("핸들이 성공적으로 변경되었습니다.");
      await refreshUser(); // 사용자 정보 새로고침
      onClose();
      form.resetFields();
    } catch (error: any) {
      // 에러 코드와 메시지에 따른 구체적인 안내
      const errorMessage = getHandleErrorMessage(
        error,
        values?.preferred_username,
      );
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 핸들 변경 에러에 대한 구체적인 메시지 제공
  const getHandleErrorMessage = (error: any, handle?: string) => {
    // 백엔드에서 온 구체적인 에러 메시지가 있으면 우선 사용
    const serverMessage = error.response?.data?.message;
    const statusCode = error.response?.status;

    // 400 Bad Request - 유효성 검증 실패
    if (statusCode === 400) {
      if (serverMessage?.includes("언더스코어")) {
        return "핸들은 언더스코어(_)만으로 구성될 수 없습니다.";
      }
      if (serverMessage?.includes("최소")) {
        return "핸들은 최소 3자 이상이어야 합니다.";
      }
      if (serverMessage?.includes("최대")) {
        return "핸들은 최대 30자까지 가능합니다.";
      }
      if (serverMessage?.includes("사용 가능")) {
        return "핸들은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.";
      }
      return serverMessage || "입력하신 핸들이 올바르지 않습니다.";
    }

    // 401 Unauthorized - 인증 실패
    if (statusCode === 401) {
      return "로그인이 필요합니다. 다시 로그인해주세요.";
    }

    // 409 Conflict - 중복된 핸들
    if (statusCode === 409) {
      return `'@${handle}'은 이미 사용 중인 핸들입니다. 다른 핸들을 입력해주세요.`;
    }

    // 429 Too Many Requests - 요청 제한
    if (statusCode === 429) {
      return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.";
    }

    // 500 Internal Server Error - 서버 오류
    if (statusCode >= 500) {
      return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    // 네트워크 에러
    if (!error.response) {
      return "네트워크 연결을 확인하고 다시 시도해주세요.";
    }

    // 기타 에러
    return serverMessage || "핸들 변경에 실패했습니다. 다시 시도해주세요.";
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return { form, isLoading, handleSave, handleCancel };
}
