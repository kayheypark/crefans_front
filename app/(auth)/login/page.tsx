"use client";

import { useLoginPageModel } from "@/features/login/useLoginPageModel";
import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function LoginPage() {
  const model = useLoginPageModel();
  return <LoginPageView model={model} />;
}

function LoginPageView({
  model,
}: {
  model: ReturnType<typeof useLoginPageModel>;
}) {
  const { user, router, handleLogin } = model;

  if (user) {
    return <div>로그인 중...</div>;
  }

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
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <UserOutlined style={{ fontSize: "48px", color: "#1890ff" }} />

          <div>
            <Title level={2}>로그인이 필요합니다</Title>
            <Text type="secondary">
              크리에이터 센터에 접근하려면 로그인해주세요.
            </Text>
          </div>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button type="primary" size="large" block onClick={handleLogin}>
              로그인하기
            </Button>

            <Button size="large" block onClick={() => router.push("/")}>
              홈으로 돌아가기
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}
