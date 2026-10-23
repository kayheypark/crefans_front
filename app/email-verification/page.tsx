"use client";

import { useEmailLinkAuthPageModel } from "@/features/email-verification/useEmailLinkAuthPageModel";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Space, Spin, Typography } from "antd";

const { Title, Text } = Typography;

export default function EmailLinkAuthPage() {
  const model = useEmailLinkAuthPageModel();
  return <EmailLinkAuthPageView model={model} />;
}

function EmailLinkAuthPageView({
  model,
}: {
  model: ReturnType<typeof useEmailLinkAuthPageModel>;
}) {
  const { loading, success, error, countdown, handleGoToHome } = model;

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
                인증 완료!
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: "16px", display: "block", marginTop: "8px" }}
              >
                이메일 인증이 성공적으로 완료되었습니다.
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
