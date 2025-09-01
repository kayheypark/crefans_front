"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "@/lib/api";
import EmailAutoComplete from "../common/EmailAutoComplete";

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
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (loading) return; // 이미 로딩 중이면 중복 실행 방지

    setLoading(true);
    try {
      await authAPI.signin(values.email, values.password);
      // 로그인 성공 후 사용자 정보 요청
      const userRes = await authAPI.getMe();

      // idToken 구조에 맞게 사용자 정보 변환
      const user = userRes.data.user;

      login(user.attributes);
      message.success("로그인되었습니다!");
      onClose();
    } catch (error: any) {
      console.info(error);
      message.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    onClose();
    onSignUpClick?.();
  };

  // 엔터키 핸들러 - 다음 필드로 포커스 이동 또는 폼 제출
  const handleKeyPress = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (currentField === "email") {
        // 이메일 필드에서 엔터: 비밀번호 필드로 포커스
        const passwordInput = document.querySelector(
          'input[type="password"]'
        ) as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      } else if (currentField === "password") {
        // 비밀번호 필드에서 엔터: 폼 제출
        form.submit();
      }
    }
  };

  return (
    <Modal
      title="로그인"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      zIndex={1002}
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
          <EmailAutoComplete
            placeholder="이메일"
            disabled={loading}
            onKeyPress={(e) => handleKeyPress(e, "email")}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="비밀번호"
          rules={[{ required: true, message: "비밀번호를 입력해주세요" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="비밀번호"
            onKeyPress={(e) => handleKeyPress(e, "password")}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            style={{ marginTop: "20px" }}
            loading={loading}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button type="link" onClick={handleSignUp} disabled={loading}>
            팬, 크리에이터 회원가입
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
