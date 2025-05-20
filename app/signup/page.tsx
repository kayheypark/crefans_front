"use client";

import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Steps,
  Form,
  Input,
  Button,
  Radio,
  Space,
  message,
  Tag,
  Select,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  TeamOutlined,
  PhoneOutlined,
  PlusOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const FAN_COLOR = "#1890ff"; // 파란색
const CREATOR_COLOR = "#722ed1"; // 보라색

const PLATFORM_OPTIONS = [
  { value: "youtube", label: "유튜브" },
  { value: "soop", label: "SOOP" },
  { value: "twitch", label: "트위치" },
  { value: "chzzk", label: "치지직" },
];

const COUNTRY_CODES = [
  { code: "+82", country: "대한민국", iso: "KR" },
  { code: "+81", country: "일본", iso: "JP" },
  { code: "+86", country: "중국", iso: "CN" },
  { code: "+1", country: "미국/캐나다", iso: "US" },
  { code: "+44", country: "영국", iso: "GB" },
  { code: "+852", country: "홍콩", iso: "HK" },
  { code: "+65", country: "싱가포르", iso: "SG" },
];

interface PlatformInfo {
  platform: string;
  nickname: string;
  link: string;
}

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<"fan" | "creator">("fan");
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const router = useRouter();
  const [form] = Form.useForm();
  const [otherPlatform, setOtherPlatform] = useState("");
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [isVerificationTimerRunning, setIsVerificationTimerRunning] =
    useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const { login } = useAuth();
  const [checkedNickname, setCheckedNickname] = useState<string>("");

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerificationTimerRunning && verificationTimer > 0) {
      timer = setInterval(() => {
        setVerificationTimer((prev) => prev - 1);
      }, 1000);
    } else if (verificationTimer === 0) {
      setIsVerificationTimerRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isVerificationTimerRunning, verificationTimer]);

  const handleUserTypeSelect = (type: "fan" | "creator") => {
    setUserType(type);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    } else {
      router.back();
    }
  };

  const onFinish = async (values: any) => {
    try {
      // TODO: API 연동
      // 회원가입 성공 시 자동 로그인 처리
      login({
        nickname: values.nickname,
        points: 1000, // 기본 포인트(임시)
      });
      setCurrentStep(2); // 가입 완료 단계로 이동
      message.success("회원가입이 완료되었습니다!");
    } catch (error) {
      message.error("회원가입 중 오류가 발생했습니다.");
    }
  };

  const handleNicknameCheck = async () => {
    try {
      const currentNickname = form.getFieldValue("nickname");
      if (!currentNickname) {
        message.error("닉네임을 입력해주세요");
        return;
      }
      // TODO: API 연동
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsNicknameChecked(true);
      setCheckedNickname(currentNickname);
      message.success("사용 가능한 닉네임입니다.");
    } catch (error) {
      setIsNicknameChecked(false);
      setCheckedNickname("");
      message.error("이미 사용 중인 닉네임입니다.");
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNickname = e.target.value;
    if (newNickname !== checkedNickname) {
      setIsNicknameChecked(false);
      setCheckedNickname("");
    }
  };

  const handlePhoneVerification = async () => {
    try {
      // TODO: API 연동
      await new Promise((resolve) => setTimeout(resolve, 500));
      setVerificationTimer(5); // 3분 타이머 설정
      setIsVerificationTimerRunning(true);
      message.success("인증번호가 발송되었습니다.");
    } catch (error) {
      message.error("인증번호 발송에 실패했습니다.");
    }
  };

  const handleResendVerification = async () => {
    try {
      // TODO: API 연동
      await new Promise((resolve) => setTimeout(resolve, 500));
      setVerificationTimer(5); // 타이머 리셋
      setIsVerificationTimerRunning(true);
      message.success("인증번호가 재발송되었습니다.");
    } catch (error) {
      message.error("인증번호 재발송에 실패했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const code = form.getFieldValue("verificationCode");
      if (code === "1234") {
        message.success("인증이 완료되었습니다.");
      } else {
        message.error("인증번호가 일치하지 않습니다.");
      }
    } catch (error) {
      message.error("인증에 실패했습니다.");
    }
  };

  const handlePlatformChange = (index: number, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = {
      ...newPlatforms[index],
      platform: value,
    };
    setPlatforms(newPlatforms);
  };

  const handleIdChange = (index: number, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = {
      ...newPlatforms[index],
      nickname: value,
    };
    setPlatforms(newPlatforms);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = {
      ...newPlatforms[index],
      link: value,
    };
    setPlatforms(newPlatforms);
  };

  const handleAddPlatform = () => {
    setPlatforms([...platforms, { platform: "", nickname: "", link: "" }]);
  };

  const handleOtherPlatformChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOtherPlatform(e.target.value);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          zIndex: 1000,
        }}
      >
        <div style={{ position: "absolute", left: "16px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ padding: 0 }}
          />
        </div>
        <div style={{ width: "100%", textAlign: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            회원가입
          </Title>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "76px auto 50px",
          padding: "0 40px",
        }}
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: "40px" }}
          items={[
            {
              title: "회원 유형 선택",
              description: "팬 또는 크리에이터 선택",
            },
            {
              title: "정보 입력",
              description: "회원 정보 입력",
            },
            // {
            //   title: "가입 완료",
            //   description: "회원가입 완료",
            // },
          ]}
        />

        {currentStep === 0 ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              hoverable
              onClick={() => handleUserTypeSelect("fan")}
              style={{
                textAlign: "center",
                borderColor: FAN_COLOR,
                borderWidth: "2px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <Title level={4} style={{ color: FAN_COLOR }}>
                팬으로 가입하기
              </Title>
              <Text>
                좋아하는 크리에이터를 구독하고
                <br />
                유료 콘텐츠를 소장하세요
              </Text>
            </Card>

            <Card
              hoverable
              onClick={() => handleUserTypeSelect("creator")}
              style={{
                textAlign: "center",
                borderColor: CREATOR_COLOR,
                borderWidth: "2px",
                maxWidth: "800px",
                margin: "0 auto",
              }}
            >
              <Title level={4} style={{ color: CREATOR_COLOR }}>
                크리에이터로 가입하기
              </Title>
              <Text>
                5분이내 짧은 영상/사진으로
                <br />
                수익을 창출하세요
              </Text>
            </Card>
          </Space>
        ) : currentStep === 1 ? (
          <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <Space align="center">
                {userType === "fan" ? (
                  <>
                    <TeamOutlined
                      style={{ fontSize: "24px", color: FAN_COLOR }}
                    />
                    <Text strong style={{ fontSize: "16px", color: FAN_COLOR }}>
                      팬으로 가입하기
                    </Text>
                  </>
                ) : (
                  <>
                    <CrownOutlined
                      style={{ fontSize: "24px", color: CREATOR_COLOR }}
                    />
                    <Text
                      strong
                      style={{ fontSize: "16px", color: CREATOR_COLOR }}
                    >
                      크리에이터로 가입하기
                    </Text>
                  </>
                )}
              </Space>
              <div style={{ marginTop: "8px" }}>
                <Tag color={userType === "fan" ? "blue" : "purple"}>
                  {userType === "fan" ? "팬" : "크리에이터"}
                </Tag>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              <Form.Item
                name="email"
                label="이메일"
                rules={[
                  { required: true, message: "이메일을 입력해주세요" },
                  { type: "email", message: "올바른 이메일 형식이 아닙니다" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="이메일" />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    휴대폰
                    <Tooltip title="인증하지 않아도 가입할 수 있어요. 결제 및 수익창출 이전까지만 업데이트 해주세요.">
                      <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                    </Tooltip>
                  </Space>
                }
                required
              >
                <Space
                  direction="vertical"
                  style={{ width: "100%", gap: "12px" }}
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: "휴대폰 번호를 입력해주세요" },
                    ]}
                    style={{ margin: 0 }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Select defaultValue="+82" style={{ width: "180px" }}>
                        {COUNTRY_CODES.map((item) => (
                          <Option key={item.code} value={item.code}>
                            <span style={{ marginRight: "8px" }}>
                              <img
                                src={`https://flagcdn.com/20x15/${item.iso.toLowerCase()}.png`}
                                alt={item.country}
                                style={{
                                  width: "20px",
                                  height: "15px",
                                  verticalAlign: "middle",
                                  marginRight: "8px",
                                  objectFit: "cover",
                                }}
                              />
                            </span>
                            {item.country} ({item.code})
                          </Option>
                        ))}
                      </Select>
                      <Input
                        style={{ flex: 1 }}
                        prefix={<PhoneOutlined />}
                        placeholder="휴대폰 번호 (- 없이 입력)"
                        readOnly={isVerificationTimerRunning}
                      />
                      <Button
                        type="primary"
                        style={{ width: "100px" }}
                        onClick={
                          isVerificationTimerRunning
                            ? handleResendVerification
                            : handlePhoneVerification
                        }
                      >
                        {isVerificationTimerRunning
                          ? "재발송"
                          : "인증번호 발송"}
                      </Button>
                    </div>
                  </Form.Item>

                  {isVerificationTimerRunning && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <Form.Item
                          name="verificationCode"
                          rules={[
                            {
                              required: true,
                              message: "인증번호를 입력해주세요",
                            },
                          ]}
                          style={{ margin: 0, flex: 1 }}
                        >
                          <Input placeholder="인증번호" />
                        </Form.Item>
                        <Button
                          type="primary"
                          style={{ width: "100px" }}
                          onClick={handleVerifyCode}
                        >
                          인증하기
                        </Button>
                      </div>
                      <div style={{ textAlign: "right", color: "#8c8c8c" }}>
                        인증번호 유효시간: {Math.floor(verificationTimer / 60)}:
                        {(verificationTimer % 60).toString().padStart(2, "0")}
                      </div>
                    </>
                  )}
                </Space>
              </Form.Item>

              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true, message: "비밀번호를 입력해주세요" },
                  { min: 8, message: "비밀번호는 8자 이상이어야 합니다" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="비밀번호"
                />
              </Form.Item>

              <Form.Item
                name="passwordConfirm"
                label="비밀번호 확인"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "비밀번호를 다시 입력해주세요" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("비밀번호가 일치하지 않습니다")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="비밀번호 확인"
                />
              </Form.Item>

              <Form.Item
                name="nickname"
                label={<span style={{ fontSize: "14px" }}>닉네임</span>}
                rules={[
                  { required: true, message: "닉네임을 입력해주세요" },
                  {
                    validator: async (_, value) => {
                      if (value && !isNicknameChecked) {
                        return Promise.reject(
                          new Error("닉네임 중복 확인이 필요합니다")
                        );
                      } else if (!value) {
                        return Promise.resolve();
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="닉네임"
                    onChange={handleNicknameChange}
                  />
                  <Button
                    type="primary"
                    onClick={handleNicknameCheck}
                    style={{ width: "100px" }}
                  >
                    중복확인
                  </Button>
                </div>
              </Form.Item>

              {userType === "creator" && (
                <>
                  <Form.Item
                    label={
                      <Space>
                        활동중인 플랫폼
                        <Tooltip title="누구나 볼 수 있는 크리에이터 홈에 표시되요. 설정에서 비공개 처리할 수 있어요.">
                          <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                        </Tooltip>
                      </Space>
                    }
                  >
                    {platforms.map((platformInfo, index) => (
                      <div key={index} style={{ marginBottom: "16px" }}>
                        <Input.Group compact style={{ width: "100%" }}>
                          <Select
                            style={{ width: "25%" }}
                            placeholder="플랫폼"
                            onChange={(value) =>
                              handlePlatformChange(index, value)
                            }
                            value={platformInfo.platform}
                          >
                            {PLATFORM_OPTIONS.map((option) => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                          <Input
                            style={{ width: "25%" }}
                            placeholder="닉네임"
                            onChange={(e) =>
                              handleIdChange(index, e.target.value)
                            }
                            value={platformInfo.nickname}
                          />
                          <Input
                            style={{ width: "calc(50% - 40px)" }}
                            placeholder="채널 링크"
                            onChange={(e) =>
                              handleLinkChange(index, e.target.value)
                            }
                            value={platformInfo.link}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              const newPlatforms = platforms.filter(
                                (_, i) => i !== index
                              );
                              setPlatforms(newPlatforms);
                            }}
                          />
                        </Input.Group>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={handleAddPlatform}
                      block
                      icon={<PlusOutlined />}
                    >
                      플랫폼 추가
                    </Button>
                  </Form.Item>
                </>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  style={{
                    marginTop: "20px",
                    backgroundColor:
                      userType === "fan" ? FAN_COLOR : CREATOR_COLOR,
                  }}
                >
                  회원가입
                </Button>
              </Form.Item>
            </Form>
          </Card>
        ) : (
          <>
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={200}
              recycle={false}
            />
            <Card
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                textAlign: "center",
                background: "linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ padding: "60px 40px" }}>
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    margin: "0 auto 32px",
                    background: "#f0f7ff",
                    borderRadius: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(24,144,255,0.2)",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: "64px",
                      color: "#1890ff",
                    }}
                  />
                </div>
                <Title
                  level={2}
                  style={{
                    marginBottom: "24px",
                    background: "linear-gradient(45deg, #1890ff, #722ed1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  환영합니다!
                </Title>
                <Title level={3} style={{ marginBottom: "16px" }}>
                  회원가입이 완료되었습니다
                </Title>
                <Paragraph
                  style={{
                    fontSize: "18px",
                    marginBottom: "40px",
                    color: "#666",
                  }}
                >
                  {userType === "fan" ? "팬" : "크리에이터"}으로 가입이
                  완료되었습니다.
                  <br />
                  지금 바로{" "}
                  {userType === "fan"
                    ? "좋아하는 크리에이터를 찾아보세요!"
                    : "크리에이터 활동을 시작해보세요!"}
                </Paragraph>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push("/")}
                    style={{
                      height: "48px",
                      padding: "0 40px",
                      fontSize: "16px",
                      background: "linear-gradient(45deg, #1890ff, #722ed1)",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(24,144,255,0.3)",
                    }}
                  >
                    홈으로 가기
                  </Button>
                  {userType === "creator" && (
                    <Button
                      size="large"
                      onClick={() => router.push("/creator/setup")}
                      style={{
                        height: "48px",
                        padding: "0 40px",
                        fontSize: "16px",
                      }}
                    >
                      크리에이터 설정하기
                    </Button>
                  )}
                </Space>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
