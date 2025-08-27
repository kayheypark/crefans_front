"use client";

import React from "react";
import { Modal, Form, Input, message } from "antd";
import { userAPI } from "@/lib/api/user";
import { isValidNickname } from "@/lib/utils/validationUtils";

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
      await userAPI.updateNickname(values.nickname);
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
          rules={[
            { required: true, message: "닉네임을 입력해주세요" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (!isValidNickname(value)) {
                  return Promise.reject(
                    "한글, 영문, 숫자 2-10자로 입력해주세요."
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          initialValue={currentNickname}
        >
          <Input
            placeholder="한글, 영문, 숫자 2-10자"
            size="large"
            onChange={(e) => {
              // 공백 제거
              const value = e.target.value.replace(/\s/g, "");
              e.target.value = value;
              form.setFieldValue("nickname", value);
            }}
            onCompositionEnd={(e) => {
              // 한글 조합 완료 후 검증
              const target = e.target as HTMLInputElement;
              const value = target.value.replace(/[^가-힣a-zA-Z0-9]/g, "");
              target.value = value;
              form.setFieldValue("nickname", value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
