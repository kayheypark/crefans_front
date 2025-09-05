"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Spin, Alert, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import axios from "axios";

export default function EmailLinkAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

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
          // 성공시 카운트다운 시작
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
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 400, textAlign: "center" }}>
        {loading ? (
          <div>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>이메일 인증을 처리하고 있습니다...</p>
          </div>
        ) : success ? (
          <div>
            <CheckCircleOutlined
              style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
            />
            <h2>이메일 인증 완료</h2>
            <p>이메일 인증이 성공적으로 완료되었습니다.</p>
            <p style={{ fontSize: "16px", color: "#1890ff", marginTop: 16 }}>
              {countdown}초 후 메인페이지로 이동합니다.
            </p>
          </div>
        ) : (
          <div>
            <CloseCircleOutlined
              style={{ fontSize: 48, color: "#ff4d4f", marginBottom: 16 }}
            />
            <h2>이메일 인증 실패</h2>
            <Alert
              message={error}
              type="error"
              style={{ marginBottom: 16 }}
              showIcon
            />
            <Button type="primary" onClick={handleGoToHome}>
              홈으로 가기
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
