"use client";
import { Form as UiForm, message as uiMessage } from "antd";

import CreatorCenterLayout from "@/components/layout/CreatorCenterLayout";
import { useBecomeCreatorPageModel } from "@/features/creator-center-become-creator/useBecomeCreatorPageModel";
import {
  CheckCircleOutlined,
  CrownOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Space,
  Typography,
} from "antd";

const { Title, Text } = Typography;

const { Option } = Select;

export default function BecomeCreatorPage() {
  const [form] = UiForm.useForm();
  const model = useBecomeCreatorPageModel({ message: uiMessage, form });
  return <BecomeCreatorPageView model={model} />;
}

function BecomeCreatorPageView({
  model,
}: {
  model: ReturnType<typeof useBecomeCreatorPageModel>;
}) {
  const {
    router,
    form,
    loading,
    categories,
    categoriesLoading,
    handleBecomeCreator,
  } = model;

  return (
    <CreatorCenterLayout>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* 메인 헤더 섹션 */}
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <CrownOutlined
            style={{
              fontSize: "64px",
              color: "#1890ff",
              marginBottom: "24px",
            }}
          />
          <Title level={1} style={{ marginBottom: "16px", color: "#1a1a1a" }}>
            크리에이터가 되세요
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: "18px",
              display: "block",
              marginBottom: "32px",
            }}
          >
            당신의 열정을 수익으로, 팬들과의 소통을 성장으로
          </Text>
        </div>

        {/* 혜택 섹션 */}
        <Card style={{ marginBottom: "40px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={3} style={{ marginBottom: "16px" }}>
              <StarOutlined style={{ color: "#faad14", marginRight: "8px" }} />
              크리에이터 혜택
            </Title>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              전문적인 도구와 함께 성공적인 크리에이터로 성장하세요
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>통계</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>유료 멤버십 구독 서비스 운영</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>후원</Text>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>포스팅 유료 설정</Text>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>크리에이터 뱃지</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 신청 폼 섹션 */}
        <Card>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title level={2} style={{ marginBottom: "16px" }}>
              크리에이터 전환 신청
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: "16px",
                display: "block",
                marginBottom: "20px",
              }}
            >
              어떤 분야의 크리에이터가 되고 싶으신가요?
            </Text>
          </div>

          <Alert
            message="크리에이터 전환 후에는 일반 사용자로 돌아갈 수 없습니다."
            type="info"
            showIcon
            style={{ marginBottom: "32px", textAlign: "left" }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleBecomeCreator}
            style={{ textAlign: "left" }}
          >
            <Form.Item
              name="category_id"
              label={
                <Text strong style={{ fontSize: "16px" }}>
                  크리에이터 카테고리 선택
                </Text>
              }
              rules={[{ required: true, message: "카테고리를 선택해주세요." }]}
            >
              <Select
                placeholder="어떤 분야의 크리에이터인가요?"
                size="large"
                loading={categoriesLoading}
                style={{ width: "100%" }}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ marginRight: "8px", fontSize: "16px" }}>
                        {category.icon}
                      </span>
                      <span style={{ fontWeight: "bold" }}>
                        {category.name}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: "32px" }}>
              <Space size="large">
                <Button
                  onClick={() => router.back()}
                  size="large"
                  style={{ minWidth: "120px" }}
                >
                  취소
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  style={{
                    minWidth: "200px",
                    height: "48px",
                    fontSize: "16px",
                  }}
                >
                  크리에이터로 전환하기
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </CreatorCenterLayout>
  );
}
