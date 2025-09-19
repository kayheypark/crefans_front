"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Row,
  Col,
  message,
  Spin,
  Avatar,
  Divider,
  Alert,
} from "antd";
import {
  CrownOutlined,
  UserOutlined,
  HeartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { membershipAPI, MembershipItem } from "@/lib/api/membership";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
import { loadTossPaymentsInstance } from "@/lib/tossPayments";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const { Title, Text, Paragraph } = Typography;

interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
  membershipItems?: MembershipItem[];
}

export default function MembershipSubscriptionPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const creatorId = params.creatorId as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  // 크리에이터와 멤버십 정보 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // TODO: 실제 크리에이터 정보 API 호출
        // 현재는 mock 데이터 사용
        const mockCreator: Creator = {
          id: creatorId,
          name: "크리에이터 이름",
          handle: "creator_handle",
          avatar: undefined,
          bio: "안녕하세요! 다양한 콘텐츠를 만들고 있는 크리에이터입니다.",
        };

        // 멤버십 아이템 로드 (실제 API 호출 - 크리에이터별 멤버십)
        try {
          const membershipResponse = await membershipAPI.getMembershipsByCreatorId(creatorId);

          if (membershipResponse.success && membershipResponse.data) {
            // 활성화된 멤버십만 필터링
            const memberships = membershipResponse.data.memberships || [];
            const activeMemberships = memberships.filter(
              (membership) => membership.isActive !== false
            );

            setMemberships(activeMemberships);
            mockCreator.membershipItems = activeMemberships;
          }
        } catch (membershipError) {
          console.error('Failed to load creator memberships:', membershipError);
          // Fallback to empty array if membership loading fails
          setMemberships([]);
        }

        setCreator(mockCreator);
      } catch (error) {
        console.error("Failed to load creator and membership data:", error);
        message.error("크리에이터 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      loadData();
    }
  }, [creatorId]);

  // 구독 시작 처리
  const handleSubscribe = async (membershipItem: MembershipItem) => {
    if (!user) {
      message.error("로그인이 필요합니다.");
      router.push('/auth/signin');
      return;
    }

    try {
      setSubscribing(membershipItem.id);

      // 1. 구독 청구 준비 API 호출
      const prepareResponse = await subscriptionBillingAPI.prepareBilling({
        membershipItemId: membershipItem.id,
      });

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(prepareResponse.message || "구독 준비에 실패했습니다.");
      }

      const { clientKey, customerKey, successUrl, failUrl } = prepareResponse.data;

      // 2. TossPayments SDK 로드 및 자동결제 등록
      const tossPayments = await loadTossPaymentsInstance();

      // requestBillingAuth를 사용하여 자동결제 등록 (임시로 any 타입 사용)
      await (tossPayments as any).requestBillingAuth({
        method: "TRANSFER", // 계좌 자동결제
        customerKey,
        successUrl,
        failUrl,
      });

    } catch (error: any) {
      console.error("Subscription failed:", error);
      message.error(error.message || "구독 처리 중 오류가 발생했습니다.");
    } finally {
      setSubscribing(null);
    }
  };

  // 결제 주기 텍스트 변환
  const getBillingText = (unit: string, period: number) => {
    const unitMap: { [key: string]: string } = {
      DAY: "일",
      WEEK: "주",
      MONTH: "개월",
      YEAR: "년",
    };
    return `${period}${unitMap[unit] || unit}`;
  };

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
              <HeartOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
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
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <Title level={5} style={{ margin: 0 }}>
                            {membership.name}
                          </Title>
                          <Tag color="gold">레벨 {membership.level}</Tag>
                        </div>

                        {membership.description && (
                          <Paragraph
                            style={{ margin: 0, marginBottom: 12, color: "#666" }}
                          >
                            {membership.description}
                          </Paragraph>
                        )}

                        {membership.benefits && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {(() => {
                              let benefits: string[] = [];
                              try {
                                // Try to parse as JSON first, fallback to comma-separated
                                if (membership.benefits.startsWith('[')) {
                                  benefits = JSON.parse(membership.benefits);
                                } else {
                                  benefits = membership.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0);
                                }
                              } catch (e) {
                                // Fallback to comma-separated parsing
                                benefits = membership.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0);
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
                          <Text strong style={{ fontSize: 24, color: "#faad14" }}>
                            {(membership.price || 0).toLocaleString()}원
                          </Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">
                            / {getBillingText(membership.billing_unit, membership.billing_period)}
                          </Text>
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          icon={<CrownOutlined />}
                          loading={subscribing === membership.id}
                          onClick={() => handleSubscribe(membership)}
                          style={{
                            background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
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
            구독 후 언제든지 설정에서 취소할 수 있습니다.
            결제는 토스페이먼츠를 통해 안전하게 처리됩니다.
          </Text>
        </div>
      </div>
    </ProtectedRoute>
  );
}