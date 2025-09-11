"use client";

import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { userAPI } from "@/lib/api/user";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { useAuth } from "@/contexts/AuthContext";
import { LOADING_TEXTS } from "@/lib/constants/loadingTexts";
import { getNicknameValidationRule, validateNickname } from "@/lib/utils/validation";

interface NicknameModalProps {
  open: boolean;
  onClose: () => void;
  currentNickname: string;
}

export default function NicknameModal({
  open,
  onClose,
  currentNickname,
}: NicknameModalProps) {
  const [form] = Form.useForm();
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
      message.error(error.response?.data?.message || "닉네임 변경에 실패했습니다.");
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
      title="닉네임 변경"
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
          label="새 닉네임"
          name="nickname"
          rules={[
            { required: true, message: "닉네임을 입력해주세요" },
            getNicknameValidationRule(),
          ]}
          initialValue={currentNickname}
        >
          <Input
            placeholder="한글, 영문, 숫자 2-10자"
            size="large"
            maxLength={10}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
