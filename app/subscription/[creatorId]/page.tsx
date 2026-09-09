"use client";
import { message as uiMessage } from "antd";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useMembershipSubscriptionPageModel } from "@/features/subscription-creator-id/useMembershipSubscriptionPageModel";
import {
  ArrowLeftOutlined,
  CrownOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";

const { Title, Text, Paragraph } = Typography;

export default function MembershipSubscriptionPage() {
  const model = useMembershipSubscriptionPageModel({ message: uiMessage });
  return <MembershipSubscriptionPageView model={model} />;
}

function MembershipSubscriptionPageView({
  model,
}: {
  model: ReturnType<typeof useMembershipSubscriptionPageModel>;
}) {
  const {
    router,
    creator,
    memberships,
    loading,
    subscribing,
    handleSubscribe,
    getBillingText,
  } = model;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card>
          <Text>크리에이터를 찾을 수 없습니다.</Text>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
            style={{ marginBottom: 16 }}
          >
            뒤로 가기
          </Button>

          <Title level={2} style={{ margin: 0 }}>
            <CrownOutlined style={{ marginRight: 8, color: "#faad14" }} />
            멤버십 구독
          </Title>
        </div>

        {/* 크리에이터 정보 */}
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar
              size={80}
              src={creator.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#f56a00" }}
            />
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                {creator.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 16, marginBottom: 8 }}>
                @{creator.handle}
              </Text>
              {creator.bio && (
                <Paragraph style={{ margin: 0, color: "#666" }}>
                  {creator.bio}
                </Paragraph>
              )}
            </div>
          </div>
        </Card>

        {/* 멤버십 목록 */}
        {memberships.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: 40 }}>
              <HeartOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#999" }}>
                제공되는 멤버십이 없습니다
              </Title>
              <Text type="secondary">
                이 크리에이터는 아직 멤버십을 설정하지 않았습니다.
              </Text>
            </div>
          </Card>
        ) : (
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              멤버십 선택
            </Title>

            <Alert
              message="자동결제 안내"
              description="멤버십 구독 시 설정한 주기에 따라 자동으로 결제됩니다. 언제든지 구독을 취소할 수 있습니다."
              type="info"
              style={{ marginBottom: 16 }}
            />

            <Space direction="vertical" style={{ width: "100%" }} size="large">
              {memberships.map((membership) => (
                <Card
                  key={membership.id}
                  style={{
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                  }}
                  hoverable
                >
                  <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={16}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Title level={5} style={{ margin: 0 }}>
                            {membership.name}
                          </Title>
                          <Tag color="gold">레벨 {membership.level}</Tag>
                        </div>

                        {membership.description && (
                          <Paragraph
                            style={{
                              margin: 0,
                              marginBottom: 12,
                              color: "#666",
                            }}
                          >
                            {membership.description}
                          </Paragraph>
                        )}

                        {membership.benefits && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {(() => {
                              let benefits: string[] = [];
                              try {
                                // Try to parse as JSON first, fallback to comma-separated
                                if (membership.benefits.startsWith("[")) {
                                  benefits = JSON.parse(membership.benefits);
                                } else {
                                  benefits = membership.benefits
                                    .split(",")
                                    .map((b) => b.trim())
                                    .filter((b) => b.length > 0);
                                }
                              } catch (e) {
                                // Fallback to comma-separated parsing
                                benefits = membership.benefits
                                  .split(",")
                                  .map((b) => b.trim())
                                  .filter((b) => b.length > 0);
                              }
                              return benefits.map((benefit, index) => (
                                <Tag key={index} color="blue">
                                  {benefit}
                                </Tag>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    </Col>

                    <Col xs={24} md={8}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ marginBottom: 8 }}>
                          <Text
                            strong
                            style={{ fontSize: 24, color: "#faad14" }}
                          >
                            {(membership.price || 0).toLocaleString()}원
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">
                            /{" "}
                            {getBillingText(
                              membership.billing_unit,
                              membership.billing_period,
                            )}
                          </Text>
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          icon={<CrownOutlined />}
                          loading={subscribing === membership.id}
                          onClick={() => handleSubscribe(membership)}
                          style={{
                            background:
                              "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
                            border: "none",
                            fontWeight: "600",
                            minWidth: 120,
                          }}
                        >
                          구독하기
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </div>
        )}

        <Divider />

        <div style={{ textAlign: "center", color: "#999", fontSize: 12 }}>
          <Text type="secondary">
            구독 후 언제든지 설정에서 취소할 수 있습니다. 결제는 토스페이먼츠를
            통해 안전하게 처리됩니다.
          </Text>
        </div>
      </div>
    </ProtectedRoute>
  );
}
