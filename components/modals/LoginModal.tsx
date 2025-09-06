"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "@/lib/api";
import EmailAutoComplete from "../common/EmailAutoComplete";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";

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
  const [showTestOverlay, setShowTestOverlay] = useState(true);

  // 테스트 계정 기간 계산 (일주일씩 자동 연장)
  const getTestPeriod = () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // 7일 후

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };

    return {
      start: formatDate(today),
      end: formatDate(endDate),
    };
  };

  const onFinish = async (values: any) => {
    if (loading) return; // 이미 로딩 중이면 중복 실행 방지

    setLoading(true);
    try {
      await authAPI.signin(values.email, values.password);
      // 로그인 성공 후 사용자 정보 요청
      const userRes = await authAPI.getMe();

      // API 응답 구조에 맞게 사용자 정보 변환
      const user = userRes.data.user;

      login(user.attributes);
      message.success("로그인되었습니다!");
      onClose();

      // redirect 쿼리스트링이 있으면 해당 경로로 이동
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect");
      if (redirectPath) {
        router.push(redirectPath);
      }
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
      style={MODAL_STYLES.mobile.style}
      styles={MODAL_STYLES.mobile.styles}
    >
      {/* 테스트 계정 로그인 오버레이 */}
      {showTestOverlay && (
        <div
          style={{
            position: "absolute",
            top: "55px", // 헤더 높이만큼 아래로 이동
            left: "24px", // 좌측 패딩만큼 이동
            right: "24px", // 우측 패딩만큼 이동
            bottom: "24px", // 하단 패딩만큼 이동
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#1a1a1a",
              marginBottom: "16px",
              lineHeight: "1.4",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            🚀 사이트 둘러보기
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "24px",
              lineHeight: "1.4",
              textAlign: "center",
              maxWidth: "260px",
            }}
          >
            회원가입하기 전이더라도 일정기간 둘러볼 수 있도록 고민 했어요. (
            {getTestPeriod().start} ~ {getTestPeriod().end})
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Button
              type="primary"
              size="large"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                form.setFieldsValue({
                  email: "test@test.com",
                  password: "Test1234!@#$",
                });
                setShowTestOverlay(false); // 오버레이 닫기
              }}
              style={{
                minWidth: "90px",
                height: "40px",
              }}
            >
              테스트 로그인
            </Button>
            <Button
              size="large"
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                form.resetFields();
                setShowTestOverlay(false); // 오버레이 닫기
              }}
              style={{
                minWidth: "90px",
                height: "40px",
              }}
            >
              일반 로그인
            </Button>
          </div>

          {/* 오버레이 닫기 버튼 */}
          <Button
            type="text"
            size="small"
            onClick={() => setShowTestOverlay(false)}
            style={{
              marginTop: "20px",
              color: "#999",
              fontSize: "12px",
              height: "auto",
              padding: "4px 8px",
            }}
          >
            닫기
          </Button>
        </div>
      )}

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
