"use client";

import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSignUpClick,
}: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await axios.post(
        "http://localhost:3001/auth/signin",
        {
          email: values.email,
          password: values.password,
        },
        { withCredentials: true }
      );
      // 로그인 성공 후 사용자 정보 요청
      const userRes = await axios.get("http://localhost:3001/auth/me", {
        withCredentials: true,
      });

      // idToken 구조에 맞게 사용자 정보 변환
      const user = {
        username: userRes.data.user.attributes.preferred_username,
        attributes: {
          email: userRes.data.user.attributes.email,
          email_verified: userRes.data.user.attributes.email_verified,
          preferred_username: userRes.data.user.attributes.preferred_username,
          name: userRes.data.user.attributes.name,
          sub: userRes.data.user.attributes.sub,
          picture: userRes.data.user.attributes.picture,
          nickname: userRes.data.user.attributes.nickname,
        },
        points: 0,
      };

      login(user);
      message.success("로그인되었습니다!");
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || "로그인 중 오류가 발생했습니다."
      );
    }
  };

  const handleSignUp = () => {
    onClose();
    onSignUpClick?.();
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
