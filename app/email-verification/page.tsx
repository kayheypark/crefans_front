"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Spin, Alert, Button, Typography, Space } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  HomeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { earlybirdApi } from "@/lib/api/earlybird";

const { Title, Text } = Typography;

export default function EmailLinkAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [isEarlybird, setIsEarlybird] = useState(false);

  const email = searchParams.get("email");
  const code = searchParams.get("code");

  useEffect(() => {
    const confirmEmailVerification = async () => {
      if (!email || !code) {
        setError("이메일과 인증 코드가 필요합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-email-verification`,
          {
            params: {
              email,
              code,
            },
          }
        );

        if (response.data.success) {
          setSuccess(true);
          
          // 이메일 인증 성공 후 얼리버드 상태 확인 (현재 이메일로)
          if (email) {
            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/earlybird/status?email=${email}`
              );
              if (response.data.success && response.data.data.isEarlybird) {
                setIsEarlybird(true);
              }
            } catch (earlybirdError) {
              // 얼리버드 상태 확인 실패는 무시
              console.warn("얼리버드 상태 확인 실패:", earlybirdError);
            }
          }
        } else {
          setError(response.data.message || "인증에 실패했습니다.");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message || "이메일 인증 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmailVerification();
  }, [email, code]);

  // 카운트다운 타이머
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push("/");
    }
  }, [success, countdown, router]);

  const handleGoToHome = () => {
    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #f0f0f0",
        }}
        styles={{ body: { padding: "40px 32px" } }}
      >
        {loading ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Spin size="large" />
            <div>
              <Title level={3} style={{ margin: 0, color: "#262626" }}>
                이메일 인증 중
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                잠시만 기다려주세요...
              </Text>
            </div>
          </Space>
        ) : success ? (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <CheckCircleOutlined
              style={{
                fontSize: "48px",
                color: "#52c41a",
              }}
            />
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626" }}>
                {isEarlybird ? "얼리버드 인증 완료!" : "인증 완료!"}
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: "16px", display: "block", marginTop: "8px" }}
              >
                {isEarlybird 
                  ? "얼리버드로 회원가입이 완료되었습니다. 자세한 내용은 이벤트 게시판을 참조해주세요."
                  : "이메일 인증이 성공적으로 완료되었습니다."
                }
              </Text>
            </div>
            <div
              style={{
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                borderRadius: "6px",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <Text
                style={{ color: "#389e0d", fontSize: "16px", fontWeight: 500 }}
              >
                {countdown}초 후 메인페이지로 자동 이동합니다
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoToHome}
              style={{
                marginTop: "8px",
              }}
            >
              지금 홈으로 가기
            </Button>
          </Space>
        ) : (
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <CloseCircleOutlined
              style={{
                fontSize: "48px",
                color: "#ff4d4f",
              }}
            />
            <div>
              <Title level={2} style={{ margin: 0, color: "#262626" }}>
                인증 실패
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: "16px", display: "block", marginTop: "8px" }}
              >
                이메일 인증에 실패했습니다.
              </Text>
            </div>
            <Alert
              message={error}
              type="error"
              style={{
                borderRadius: "6px",
              }}
              showIcon
            />
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={handleGoToHome}
              style={{
                marginTop: "8px",
              }}
            >
              홈으로 돌아가기
            </Button>
          </Space>
        )}
      </Card>
    </div>
  );
}
