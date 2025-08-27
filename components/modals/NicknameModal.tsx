"use client";

import React from "react";
import { Modal, Form, Input, message } from "antd";

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // TODO: API 호출로 닉네임 업데이트
      message.success("닉네임이 성공적으로 변경되었습니다.");
      onClose();
      form.resetFields();
    } catch (error) {
      message.error("닉네임 변경에 실패했습니다.");
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
      okText="변경"
      cancelText="취소"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="새 닉네임"
          name="nickname"
          rules={[{ required: true, message: "닉네임을 입력해주세요" }]}
          initialValue={currentNickname}
        >
          <Input placeholder="새 닉네임을 입력하세요" size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
