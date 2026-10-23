"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import EmailAutoComplete from "@/components/common/EmailAutoComplete";
import { SignUpModalProps } from "@/features/home-sign-up-modal/types";
import { useSignUpModalModel } from "@/features/home-sign-up-modal/useSignUpModalModel";
import { sanitizePhoneInput } from "@/lib/utils/phoneUtils";
import {
  NICKNAME_VALIDATION_MESSAGE,
  filterNicknameInput,
  validateNickname,
} from "@/lib/utils/validation";
import { isValidKoreanName } from "@/lib/utils/validationUtils";
import { CloseOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Spin, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

const phonePrefix = "+82";

export default function SignUpModal(props: SignUpModalProps) {
  const [form] = UiForm.useForm();
  const model = useSignUpModalModel(props, { message: uiMessage, form });
  return <SignUpModalView {...props} model={model} />;
}

function SignUpModalView({
  open,
  onClose,
  isEarlybird = false,
  model,
}: SignUpModalProps & { model: ReturnType<typeof useSignUpModalModel> }) {
  const {
    step,
    setStep,
    loading,
    form,
    email,
    setEmail,
    agreements,
    isCheckingEmail,
    emailError,
    setEmailError,
    handleAgreementChange,
    handleAllAgree,
    validateEmail,
    handleEmailBlur,
    handleEmailNext,
    handleInfoNext,
    handleSignUp,
    handleClose,
  } = model;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined style={{ fontSize: 20, color: "#bbb" }} />}
      width={400}
      centered
      maskClosable={false}
      zIndex={1002}
    >
      {/* 단계별 경로 표시 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          marginBottom: 24,
          marginTop: 4,
          fontWeight: 500,
          justifyContent: "flex-start",
        }}
      >
        {["회원가입", "정보 입력", "약관 동의", "완료"].map(
          (label, idx, arr) => (
            <React.Fragment key={label}>
              <span
                style={{
                  color: idx === step ? "#1677ff" : "#222",
                  opacity: idx === step ? 1 : 0.4,
                  transition: "opacity 0.2s",
                  cursor: idx < step && idx < 3 ? "pointer" : "default",
                  textDecoration: idx < step && idx < 3 ? "underline" : "none",
                }}
                onClick={() => {
                  // 완료 화면(step 3)이 아니고, 현재 단계보다 이전 단계인 경우에만 이동 가능
                  if (idx < step && idx < 3) {
                    setStep(idx);
                  }
                }}
              >
                {label}
              </span>
              {idx < arr.length - 1 && (
                <span style={{ opacity: 0.2, color: "#222" }}>{">"}</span>
              )}
            </React.Fragment>
          ),
        )}
      </div>
      {/* 단계별 UI */}
      {step === 0 && (
        <div>
          <Title level={4} style={{ marginBottom: 32, marginTop: 8 }}>
            별도의 설치과정 없이
            <br />
            특별한 이야기를 시작해보세요
          </Title>
          <div>
            <EmailAutoComplete
              value={email}
              onChange={(value) => {
                setEmail(value);
                if (value) {
                  validateEmail(value);
                } else {
                  setEmailError("");
                }
              }}
              placeholder="이메일을 입력하세요"
              size="large"
              style={{
                marginBottom: 8,
                borderRadius: 12,
                border: emailError
                  ? emailError.includes("사용 가능")
                    ? "2px solid #52c41a"
                    : "2px solid #ff4d4f"
                  : "2px solid #bcbcff",
              }}
              onBlur={handleEmailBlur}
              suffix={isCheckingEmail ? <Spin size="small" /> : null}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleEmailNext();
                }
              }}
            />
            {emailError && (
              <div
                style={{
                  color: emailError.includes("사용 가능")
                    ? "#52c41a"
                    : "#ff4d4f",
                  fontSize: 14,
                  marginBottom: 24,
                  marginLeft: 4,
                }}
              >
                {emailError}
              </div>
            )}
          </div>
          <Button
            type="primary"
            size="large"
            block
            style={{ borderRadius: 16, fontWeight: 600, fontSize: 18 }}
            onClick={handleEmailNext}
          >
            {isEarlybird ? "얼리버드로 시작하기" : "시작하기"}
          </Button>
        </div>
      )}
      {step === 1 && (
        <div>
          <Title level={4} style={{ marginBottom: 32, marginTop: 8 }}>
            크레팬스에 로그인할 정보를 입력해주세요.
          </Title>
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              label="이메일"
              name="email"
              initialValue={email}
              rules={[{ required: true, message: "이메일을 입력하세요." }]}
            >
              <Input disabled size="large" style={{ borderRadius: 12 }} />
            </Form.Item>
            <Form.Item
              label="이름(실명)"
              name="name"
              rules={[
                { required: true, message: "이름을 입력하세요." },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!isValidKoreanName(value)) {
                      return Promise.reject("한글 2-5자로 입력해주세요.");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                size="large"
                placeholder="실명을 입력하세요."
                style={{ borderRadius: 12 }}
                onChange={(e) => {
                  // 공백 제거
                  const value = e.target.value.replace(/\s/g, "");
                  e.target.value = value;
                  form.setFieldValue("name", value);
                }}
                onCompositionEnd={(e) => {
                  // 한글 조합 완료 후 검증
                  const target = e.target as HTMLInputElement;
                  const value = target.value.replace(/[^가-힣]/g, "");
                  target.value = value;
                  form.setFieldValue("name", value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="닉네임"
              name="nickname"
              rules={[
                { required: true, message: "닉네임을 입력하세요." },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!validateNickname(value)) {
                      return Promise.reject(NICKNAME_VALIDATION_MESSAGE);
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                size="large"
                placeholder="닉네임을 입력하세요."
                style={{ borderRadius: 12 }}
                onChange={(e) => {
                  const filteredValue = filterNicknameInput(e.target.value);
                  e.target.value = filteredValue;
                  form.setFieldValue("nickname", filteredValue);
                }}
                onCompositionEnd={(e) => {
                  const target = e.target as HTMLInputElement;
                  const filteredValue = filterNicknameInput(target.value);
                  target.value = filteredValue;
                  form.setFieldValue("nickname", filteredValue);
                }}
              />
            </Form.Item>
            <Form.Item
              label="비밀번호"
              name="password"
              rules={[
                { required: true, message: "비밀번호를 입력하세요." },
                { min: 8, message: "비밀번호는 8자 이상이어야 합니다." },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!/[0-9]/.test(value)) {
                      return Promise.reject("숫자를 1개 이상 포함해야 합니다.");
                    }
                    if (!/[!@#$%^&*(),.?":{}|<>\[\]\\/';`~_-]/.test(value)) {
                      return Promise.reject(
                        "특수문자를 1개 이상 포함해야 합니다.",
                      );
                    }
                    if (!/[A-Z]/.test(value)) {
                      return Promise.reject(
                        "대문자를 1개 이상 포함해야 합니다.",
                      );
                    }
                    if (!/[a-z]/.test(value)) {
                      return Promise.reject(
                        "소문자를 1개 이상 포함해야 합니다.",
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="문자, 숫자, 기호, 대/소문자 조합 8자 이상"
                style={{ borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item
              label="비밀번호 확인"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "비밀번호를 다시 입력하세요." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("비밀번호가 일치하지 않습니다.");
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="비밀번호를 다시 입력하세요"
                style={{ borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item
              label="휴대폰 번호"
              name="phoneNumber"
              rules={[
                { required: true, message: "휴대폰 번호를 입력하세요." },
                {
                  pattern: /^010\d{8}$/,
                  message: "올바른 휴대폰 번호 형식이 아닙니다.",
                },
              ]}
            >
              <Input
                size="large"
                addonBefore={phonePrefix}
                placeholder="010XXXXXXXX"
                style={{ borderRadius: 12 }}
                onChange={(e) => {
                  const sanitizedValue = sanitizePhoneInput(e.target.value);
                  e.target.value = sanitizedValue;
                  form.setFieldValue("phoneNumber", sanitizedValue);
                }}
              />
            </Form.Item>
          </Form>
          <Button
            type="primary"
            size="large"
            block
            style={{
              borderRadius: 16,
              fontWeight: 600,
              fontSize: 18,
              marginTop: 8,
            }}
            onClick={handleInfoNext}
          >
            다음 단계로
          </Button>
        </div>
      )}
      {step === 2 && (
        <div>
          <Title level={4} style={{ marginBottom: 32, marginTop: 8 }}>
            약관 동의
          </Title>
          <Checkbox
            checked={agreements.all}
            onChange={(e) => handleAllAgree(e.target.checked)}
            style={{ marginBottom: 16, fontWeight: 600 }}
          >
            모두 동의합니다.
          </Checkbox>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              checked={agreements.age}
              onChange={(e) => handleAgreementChange("age", e.target.checked)}
              style={{ fontWeight: 500 }}
            >
              만 14세 이상입니다. (필수)
            </Checkbox>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              checked={agreements.terms}
              onChange={(e) => handleAgreementChange("terms", e.target.checked)}
              style={{ fontWeight: 500 }}
            >
              이용약관에 동의 (필수)
            </Checkbox>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              checked={agreements.privacy}
              onChange={(e) =>
                handleAgreementChange("privacy", e.target.checked)
              }
              style={{ fontWeight: 500 }}
            >
              개인정보수집에 동의 (필수)
            </Checkbox>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Checkbox
              checked={agreements.marketing}
              onChange={(e) =>
                handleAgreementChange("marketing", e.target.checked)
              }
            >
              마케팅 정보 수신 동의 (선택)
            </Checkbox>
            <div style={{ marginLeft: 24, color: "#888", fontSize: 13 }}>
              세미나, 강연 소식 등 유용한 내용을 보내드려요.
            </div>
            <div style={{ marginLeft: 24, marginTop: 4 }}>
              <Checkbox
                checked={agreements.marketingMobile}
                onChange={(e) =>
                  handleAgreementChange("marketingMobile", e.target.checked)
                }
                style={{ marginRight: 8 }}
              >
                모바일(문자, 앱 푸시)
              </Checkbox>
              <Checkbox
                checked={agreements.marketingEmail}
                onChange={(e) =>
                  handleAgreementChange("marketingEmail", e.target.checked)
                }
              >
                이메일
              </Checkbox>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            block
            style={{
              borderRadius: 16,
              fontWeight: 600,
              fontSize: 18,
              marginTop: 16,
            }}
            loading={loading}
            onClick={handleSignUp}
          >
            가입하기
          </Button>
        </div>
      )}
      {step === 3 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 0 40px 0",
          }}
        >
          <MailOutlined
            style={{
              fontSize: 64,
              color: "#1677ff",
              marginBottom: 24,
            }}
          />
          <Title
            level={3}
            style={{ marginBottom: 20, marginTop: 0, textAlign: "center" }}
          >
            이메일을 확인해주세요!
          </Title>
          <Text
            style={{
              color: "#666",
              fontSize: 16,
              marginBottom: 12,
              textAlign: "center",
              display: "block",
              lineHeight: 1.5,
            }}
          >
            <strong>{email}</strong> 으로
            <br />
            인증 링크를 전송했습니다.
          </Text>
          <Text
            style={{
              color: "#999",
              fontSize: 14,
              marginBottom: 32,
              textAlign: "center",
              display: "block",
              lineHeight: 1.4,
            }}
          >
            이메일의 "이메일 인증하기" 버튼을 클릭하여
            <br />
            회원가입을 완료해주세요.
          </Text>

          <Button
            type="link"
            style={{
              marginTop: 0,
              color: "#888",
              fontWeight: 400,
              fontSize: 16,
            }}
            onClick={handleClose}
          >
            나중에 하기
          </Button>
        </div>
      )}
    </Modal>
  );
}
