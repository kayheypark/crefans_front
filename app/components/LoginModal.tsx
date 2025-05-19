"use client";

import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      if (values.password === "1") {
        message.error("아이디 혹은 비밀번호가 일치하지 않습니다.");
        return;
      }

      // TODO: API 연동
      // 임시 로그인 처리
      login({
        nickname: "밥먹는 판다 28391",
        points: 1000,
      });
      message.success("로그인되었습니다!");
      onClose();
    } catch (error) {
      message.error("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSignUp = () => {
    onClose();
    router.push("/signup");
  };

  return (
    <Modal
      title="로그인"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="이메일"
          rules={[
            { required: true, message: "이메일을 입력해주세요" },
            { type: "email", message: "올바른 이메일 형식이 아닙니다" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="이메일" />
        </Form.Item>

        <Form.Item
          name="password"
          label="비밀번호"
          rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ marginTop: "20px" }}
          >
            로그인
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={handleSignUp}>
            팬, 크리에이터 회원가입
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
