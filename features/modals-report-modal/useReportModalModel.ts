"use client";
import type { Feedback, FormController } from "@/types/presentation";

import { ReportModalProps } from "@/features/modals-report-modal/types";

export function useReportModalModel(
  { open, onClose, onSubmit }: ReportModalProps,
  { message, reportForm }: { message: Feedback; reportForm: FormController },
) {
  const handleReport = (values: any) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      message.success("신고가 접수되었습니다.");
    }
    onClose();
    reportForm.resetFields();
  };

  const handleCancel = () => {
    onClose();
    reportForm.resetFields();
  };

  return { reportForm, handleReport, handleCancel };
}
