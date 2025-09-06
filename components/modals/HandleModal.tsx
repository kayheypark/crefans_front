"use client";

import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { userAPI } from "@/lib/api/user";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { useAuth } from "@/contexts/AuthContext";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";

interface HandleModalProps {
  open: boolean;
  onClose: () => void;
  currentHandle: string;
}

export default function HandleModal({
  open,
  onClose,
  currentHandle,
}: HandleModalProps) {
  const [form] = Form.useForm();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const values = await form.validateFields();
      await userAPI.updateHandle(values.preferred_username);
      message.success("핸들이 성공적으로 변경되었습니다.");
      await refreshUser(); // 사용자 정보 새로고침
      onClose();
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || "핸들 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title="핸들 변경"
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      okText={isLoading ? LOADING_TEXTS.SAVING : "변경"}
      cancelText="취소"
      confirmLoading={isLoading}
      zIndex={1002}
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="새 핸들"
          name="preferred_username"
          rules={[
            { required: true, message: "핸들을 입력해주세요" },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: "영문, 숫자, 언더스코어만 사용 가능합니다",
            },
          ]}
          initialValue={currentHandle}
        >
          <Input
            placeholder="새 핸들을 입력하세요"
            size="large"
            addonBefore="@"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
