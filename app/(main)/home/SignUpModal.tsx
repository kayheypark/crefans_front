import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Button,
  Typography,
  Form,
  Checkbox,
  Select,
  message,
  Spin,
} from "antd";
import { CloseOutlined, MailOutlined } from "@ant-design/icons";
import axios from "axios";
import { getApiUrl } from "@/utils/env";

const { Title, Text } = Typography;

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
}

const phonePrefix = "+82";

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [email, setEmail] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    password: "",
    phone: "",
    nickname: "",
  });
  const [agreements, setAgreements] = useState({
    all: true,
    age: true,
    terms: true,
    privacy: true,
    marketing: true,
    marketingMobile: true,
    marketingEmail: true,
  });
  const [otherPlatform, setOtherPlatform] = useState("");
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [isVerificationTimerRunning, setIsVerificationTimerRunning] =
    useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailExists, setIsEmailExists] = useState(false);
  const [emailError, setEmailError] = useState<string>("");

  // 약관 개별동의 핸들러
  const handleAgreementChange = (key: string, checked: boolean) => {
    if (key === "marketing") {
      // 마케팅 약관 동의 시 하위 약관 일괄 처리
      setAgreements((prev) => ({
        ...prev,
        marketing: checked,
        marketingMobile: checked,
        marketingEmail: checked,
      }));
      return;
    }

    if (key === "marketingMobile" || key === "marketingEmail") {
      // 하위 약관 체크/해제 시 마케팅 약관 상태 업데이트
      setAgreements((prev) => {
        const next = { ...prev, [key]: checked };
        // 하나라도 체크되어 있으면 마케팅 약관 체크
        next.marketing = next.marketingMobile || next.marketingEmail;
        return next;
      });
      return;
    }

    // 기타 약관 처리
    setAgreements((prev) => {
      const next = { ...prev, [key]: checked };
      next.all =
        next.age &&
        next.terms &&
        next.privacy &&
        next.marketing &&
        next.marketingMobile &&
        next.marketingEmail;
      return next;
    });
  };

  // 약관 전체동의 핸들러
  const handleAllAgree = (checked: boolean) => {
    setAgreements({
      all: checked,
      age: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
      marketingMobile: checked,
      marketingEmail: checked,
    });
  };

  // 모든 약관 동의 상태를 실시간으로 계산
  useEffect(() => {
    const allChecked =
      agreements.age &&
      agreements.terms &&
      agreements.privacy &&
      agreements.marketing &&
      agreements.marketingMobile &&
      agreements.marketingEmail;
    if (agreements.all !== allChecked) {
      setAgreements((prev) => ({ ...prev, all: allChecked }));
    }
    // eslint-disable-next-line
  }, [
    agreements.age,
    agreements.terms,
    agreements.privacy,
    agreements.marketing,
    agreements.marketingMobile,
    agreements.marketingEmail,
  ]);

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return false;
    }
    return true;
  };

  // 이메일 중복 체크 함수
  const checkEmailExists = async (email: string) => {
    if (!validateEmail(email)) return true;

    try {
      setIsCheckingEmail(true);
      setEmailError("");
      const response = await axios.get(
        `${getApiUrl()}/auth/check-email?email=${email}`,
        { withCredentials: true }
      );
      if (response.data.exists) {
        setEmailError("이미 사용 중인 이메일입니다.");
        setIsEmailExists(true);
        return true;
      }
      setEmailError("사용 가능한 이메일입니다.");
      setIsEmailExists(false);
      return false;
    } catch (error) {
      setEmailError("이메일 확인 중 오류가 발생했습니다.");
      setIsEmailExists(true);
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 이메일 입력 필드의 onBlur 이벤트 핸들러
  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email) {
      await checkEmailExists(email);
    }
  };

  // 이메일 입력 단계 → 다음
  const handleEmailNext = async () => {
    if (!validateEmail(email)) {
      return;
    }
    // 이메일 중복 체크 실행
    const exists = await checkEmailExists(email);
    if (exists) {
      return;
    }
    setStep(1);
  };

  // 정보입력 단계 → 다음
  const handleInfoNext = async () => {
    try {
      const values = await form.validateFields();
      setUserInfo({
        name: values.name,
        password: values.password,
        phone: values.phone,
        nickname: values.nickname,
      });
      setStep(2);
    } catch (e) {
      // validation error
    }
  };

  // 약관동의 단계 → 가입
  const handleSignUp = async () => {
    if (!agreements.age || !agreements.terms || !agreements.privacy) {
      message.error("필수 약관에 동의해주세요.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:3001/auth/signup", {
        email,
        password: userInfo.password,
        name: userInfo.name,
        nickname: userInfo.nickname,
      });
      setStep(3);
      message.success("회원가입이 완료되었습니다! 이메일 인증을 진행해주세요.");
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setStep(0);
    setEmail("");
    setIsEmailExists(false);
    setEmailError("");
    setUserInfo({ name: "", password: "", phone: "", nickname: "" });
    setAgreements({
      all: false,
      age: false,
      terms: false,
      privacy: false,
      marketing: false,
      marketingMobile: true,
      marketingEmail: true,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={<CloseOutlined style={{ fontSize: 20, color: "#bbb" }} />}
      width={400}
      centered
      maskClosable={false}
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
                }}
              >
                {label}
              </span>
              {idx < arr.length - 1 && (
                <span style={{ opacity: 0.2, color: "#222" }}>{">"}</span>
              )}
            </React.Fragment>
          )
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
            <Input
              size="large"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value) {
                  validateEmail(e.target.value);
                } else {
                  setEmailError("");
                }
              }}
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
            시작하기
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
              rules={[{ required: true, message: "이름을 입력하세요." }]}
            >
              <Input
                size="large"
                placeholder="실명을 입력하세요."
                style={{ borderRadius: 12 }}
              />
            </Form.Item>
            <Form.Item
              label="닉네임"
              name="nickname"
              rules={[{ required: true, message: "닉네임을 입력하세요." }]}
            >
              <Input
                size="large"
                placeholder="닉네임을 입력하세요."
                style={{ borderRadius: 12 }}
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
                        "특수문자를 1개 이상 포함해야 합니다."
                      );
                    }
                    if (!/[A-Z]/.test(value)) {
                      return Promise.reject(
                        "대문자를 1개 이상 포함해야 합니다."
                      );
                    }
                    if (!/[a-z]/.test(value)) {
                      return Promise.reject(
                        "소문자를 1개 이상 포함해야 합니다."
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
              label="휴대폰 번호"
              name="phone"
              rules={[{ required: true, message: "휴대폰 번호를 입력하세요." }]}
            >
              <Input
                size="large"
                addonBefore={phonePrefix}
                placeholder="-없이 입력해주세요"
                style={{ borderRadius: 12 }}
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
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Title level={3} style={{ marginBottom: 16 }}>
            가입이 완료되었습니다!
          </Title>
          <Text style={{ color: "#666", fontSize: 16 }}>
            이제부터 크레팬스에서 활동하실 수 있습니다.
          </Text>
          <Button
            type="primary"
            size="large"
            style={{
              marginTop: 32,
              borderRadius: 16,
              fontWeight: 600,
              fontSize: 18,
            }}
            block
            onClick={handleClose}
          >
            닫기
          </Button>
        </div>
      )}
    </Modal>
  );
}
