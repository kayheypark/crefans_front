"use client";

import React from "react";
import { Modal, Form, Input, message } from "antd";
import { userAPI } from "@/lib/api/user";

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await userAPI.updateHandle(values.preferred_username);
      message.success("핸들이 성공적으로 변경되었습니다.");
      onClose();
      form.resetFields();
    } catch (error) {
      message.error("핸들 변경에 실패했습니다.");
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
      okText="변경"
      cancelText="취소"
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
