"use client";

import React, { useState } from "react";
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
} from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { Step } = Steps;

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<"fan" | "creator">("fan");
  const router = useRouter();
  const [form] = Form.useForm();

  const handleUserTypeSelect = (type: "fan" | "creator") => {
    setUserType(type);
    setCurrentStep(1);
  };

  const onFinish = async (values: any) => {
    try {
      // TODO: API 연동
      console.log("회원가입 정보:", { ...values, userType });
      message.success("회원가입이 완료되었습니다!");
      router.push("/");
    } catch (error) {
      message.error("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <div
        style={{
          maxWidth: "800px",
          margin: "50px auto",
          padding: "0 20px",
        }}
      >
        <Title level={2} style={{ textAlign: "center", marginBottom: "40px" }}>
          SECON.ID 회원가입
        </Title>

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
          ]}
        />

        {currentStep === 0 ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
              hoverable
              onClick={() => handleUserTypeSelect("fan")}
              style={{ textAlign: "center" }}
            >
              <Title level={4}>팬으로 가입하기</Title>
              <Text>
                좋아하는 크리에이터를 구독하고
                <br />
                다양한 콘텐츠를 즐겨보세요
              </Text>
            </Card>

            <Card
              hoverable
              onClick={() => handleUserTypeSelect("creator")}
              style={{ textAlign: "center" }}
            >
              <Title level={4}>크리에이터로 가입하기</Title>
              <Text>
                나만의 콘텐츠를 만들고
                <br />
                팬들과 소통해보세요
              </Text>
            </Card>
          </Space>
        ) : (
          <Card>
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
                <Input prefix={<MailOutlined />} placeholder="이메일" />
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
                label="닉네임"
                rules={[{ required: true, message: "닉네임을 입력해주세요" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="닉네임" />
              </Form.Item>

              {userType === "creator" && (
                <Form.Item
                  name="creatorName"
                  label="크리에이터명"
                  rules={[
                    { required: true, message: "크리에이터명을 입력해주세요" },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="크리에이터명" />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  style={{ marginTop: "20px" }}
                >
                  회원가입
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}
      </div>
    </Layout>
  );
}
