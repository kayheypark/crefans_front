"use client";
import type { Feedback } from "@/types/presentation";

import { DeleteAccountModalProps } from "@/features/modals-delete-account-modal/types";
import { userAPI } from "@/lib/api/user";
import { useState } from "react";

export function useDeleteAccountModalModel(
  { open, onClose, onDelete }: DeleteAccountModalProps,
  { message }: { message: Feedback },
) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDelete = async () => {
    if (deleteConfirmText !== "삭제") {
      message.error("정확히 '삭제'를 입력해주세요.");
      return;
    }

    try {
      await userAPI.deleteAccount();
      onDelete();
      setDeleteConfirmText("");
    } catch (error) {
      message.error("계정 삭제에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    onClose();
    setDeleteConfirmText("");
  };

  return {
    deleteConfirmText,
    setDeleteConfirmText,
    handleDelete,
    handleCancel,
  };
}
