"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import EmailAutoComplete from "@/components/common/EmailAutoComplete";
import { LoginModalProps } from "@/features/modals-login-modal/types";
import { useLoginModalModel } from "@/features/modals-login-modal/useLoginModalModel";
import { MODAL_STYLES } from "@/lib/constants/modalStyles";
import { LockOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";

export default function LoginModal(props: LoginModalProps) {
  const [form] = UiForm.useForm();
  const model = useLoginModalModel(props, { message: uiMessage, form });
  return <LoginModalView {...props} model={model} />;
}

function LoginModalView({
  isOpen,
  onClose,
  onSignUpClick,
  model,
}: LoginModalProps & { model: ReturnType<typeof useLoginModalModel> }) {
  const {
    form,
    loading,
    showTestOverlay,
    setShowTestOverlay,
    getTestPeriod,
    onFinish,
    handleSignUp,
    handleKeyPress,
  } = model;

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
