"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Divider,
  message,
  Card,
  Tag,
  Switch,
  Alert,
} from "antd";
import {
  CrownOutlined,
  HeartOutlined,
  CreditCardOutlined,
  CheckOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { getParticle } from "@/lib/utils/koreanUtils";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionAPI } from "@/lib/api/subscription";
import { subscriptionBillingAPI } from "@/lib/api/subscriptionBilling";
import { createBillingInstance } from "@/lib/tossPayments";

const { Title, Text } = Typography;

interface Membership {
  id: string;           // Updated to string for billing system
  name: string;
  level: number;
  price: number;
  description?: string;
  benefits: string[];
  billing_unit: "DAY" | "WEEK" | "MONTH" | "YEAR";
  billing_period: number;
  trial_unit?: string;
  trial_period?: number;
}

interface MembershipJoinModalProps {
  open: boolean;
  onClose: () => void;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar?: string;
  memberships: Membership[];
  defaultSelectedMembershipId?: string;
  subscribedMembershipIds?: string[];
  onJoin?: (membershipId: string, paymentMethod: string, isRecurring?: boolean) => void;
}

// 결제 수단 옵션
const PAYMENT_METHODS = [
  { value: "card", label: "신용카드", icon: "💳" },
  { value: "kakao", label: "카카오페이", icon: "💛" },
  { value: "naver", label: "네이버페이", icon: "🟢" },
  { value: "toss", label: "토스페이", icon: "🔵" },
];

export default function MembershipJoinModal({
  open,
  onClose,
  creatorName,
  creatorHandle,
  creatorAvatar,
  memberships,
  defaultSelectedMembershipId,
  subscribedMembershipIds = [],
  onJoin,
}: MembershipJoinModalProps) {
  const { user } = useAuth();
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurringPayment, setIsRecurringPayment] = useState(true); // Default to recurring payment

  // 모달이 열릴 때마다 내용 초기화
  useEffect(() => {
    if (open) {
      // defaultSelectedMembershipId가 있으면 해당 멤버십 선택, 없으면 첫 번째 멤버십 선택
      if (defaultSelectedMembershipId) {
        const defaultMembership = memberships.find(
          (m) => m.id === defaultSelectedMembershipId
        );
        setSelectedMembership(
          defaultMembership || (memberships.length > 0 ? memberships[0] : null)
        );
      } else if (!selectedMembership && memberships.length > 0) {
        setSelectedMembership(memberships[0]);
      }
      setSelectedPaymentMethod("card");
      setIsRecurringPayment(true); // Reset to recurring payment
      setIsSubmitting(false);
    }
  }, [open, memberships, defaultSelectedMembershipId]);

  // 멤버십 가입 처리
  const handleJoin = async () => {
    if (!selectedMembership) {
      message.error("멤버십을 선택해주세요.");
      return;
    }

    if (!user?.attributes?.sub) {
      message.error("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRecurringPayment) {
        // 정기결제 (TossPayments 빌링)
        await handleRecurringPayment();
      } else {
        // 일회성 결제 (기존 방식)
        await handleOneTimePayment();
      }
    } catch (error: any) {
      console.error("Membership join error:", error);
      message.error(error.message || "멤버십 가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 정기결제 처리
  const handleRecurringPayment = async () => {
    if (!selectedMembership || !user?.attributes?.sub) return;

    try {
      // 1. 빌링 준비 API 호출
      const prepareResponse = await subscriptionBillingAPI.prepareBilling({
        membershipItemId: selectedMembership.id,
      });

      if (!prepareResponse.success || !prepareResponse.data) {
        throw new Error(prepareResponse.message || "빌링 준비 중 오류가 발생했습니다.");
      }

      const { clientKey, customerKey, successUrl, failUrl } = prepareResponse.data;

      // 2. TossPayments SDK를 사용한 정기결제 인증 요청
      const tossPayments = await createBillingInstance();
      const payment = tossPayments.payment({ customerKey });

      await payment.requestBillingAuth({
        method: "CARD", // 카드 자동결제 (테스트 환경에서 지원)
        successUrl: `${successUrl}?membershipItemId=${selectedMembership.id}&userId=${user.attributes.sub}`,
        failUrl: `${failUrl}?membershipItemId=${selectedMembership.id}&userId=${user.attributes.sub}`,
        customerEmail: user.attributes.email || "customer@example.com",
        customerName: user.attributes.name || user.attributes.nickname || "고객",
      });

      // TossPayments로 리다이렉트되므로 이 부분은 실행되지 않음
    } catch (error: any) {
      console.error("Recurring payment setup failed:", error);
      throw new Error(error.message || "정기결제 설정 중 오류가 발생했습니다.");
    }
  };

  // 일회성 결제 처리 (기존 방식)
  const handleOneTimePayment = async () => {
    if (!selectedMembership) return;

    try {
      const response = await subscriptionAPI.subscribeToMembership(parseInt(selectedMembership.id));

      if (response.success) {
        onJoin?.(selectedMembership.id, selectedPaymentMethod, false);
        message.success(`${selectedMembership.name}에 가입되었습니다!`);
        handleClose();
      } else {
        throw new Error(response.message || "멤버십 가입 중 오류가 발생했습니다.");
      }
    } catch (error: any) {
      console.error("One-time payment failed:", error);
      throw new Error(error.message || "일회성 멤버십 가입 중 오류가 발생했습니다.");
    }
  };

  // 모달 닫기
  const handleClose = () => {
    onClose();
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

  // 체험 기간 텍스트 변환
  const getTrialText = (membership: Membership) => {
    if (!membership.trial_period || !membership.trial_unit) return null;
    const unitMap: { [key: string]: string } = {
      DAY: "일",
      WEEK: "주",
      MONTH: "개월",
      YEAR: "년",
    };
    return `${membership.trial_period}${unitMap[membership.trial_unit] || membership.trial_unit} 무료 체험`;
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CrownOutlined style={{ color: "#faad14", fontSize: 20 }} />
          <span>멤버십 가입</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      centered
      maskClosable={false} // 모달 밖 영역 클릭으로 닫히지 않도록 설정
      styles={{
        header: {
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 16,
        },
      }}
    >
      <div style={{ padding: "8px 0" }}>
        {/* 크리에이터 정보 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            padding: 16,
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <HeartOutlined style={{ color: "#ff6b6b" }} />
            )}
          </div>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              {creatorName}
            </Title>
            <Text type="secondary">@{creatorHandle}</Text>
          </div>
        </div>

        {/* 멤버십 선택 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <CrownOutlined style={{ marginRight: 8, color: "#faad14" }} />
            멤버십 선택
          </Title>

          <div style={{ width: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {memberships.map((membership) => {
                const isSubscribed = subscribedMembershipIds.includes(membership.id);
                return (
                <div
                  key={membership.id}
                  style={{
                    width: "100%",
                    display: "block",
                    marginBottom: 0,
                  }}
                  onClick={() => {
                    if (!isSubscribed) {
                      setSelectedMembership(membership);
                    }
                  }}
                >
                  <Card
                    size="small"
                    style={{
                      width: "100%",
                      marginTop: 8,
                      marginLeft: 0,
                      marginRight: 0,
                      border: isSubscribed
                        ? "2px solid #52c41a"
                        : selectedMembership?.id === membership.id
                          ? "2px solid #faad14"
                          : "1px solid #d9d9d9",
                      backgroundColor: isSubscribed
                        ? "#f6ffed"
                        : selectedMembership?.id === membership.id
                          ? "#fffbe6"
                          : "#fff",
                      opacity: isSubscribed ? 0.7 : 1,
                      cursor: isSubscribed ? "not-allowed" : "pointer",
                    }}
                    bodyStyle={{
                      padding: "12px",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text strong style={{ fontSize: 16 }}>
                            {membership.name}
                          </Text>
                          <Tag color="gold" style={{ margin: 0, fontSize: 12 }}>
                            레벨 {membership.level}
                          </Tag>
                        </div>

                        {membership.description && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginBottom: 8,
                            }}
                          >
                            {membership.description}
                          </Text>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 4,
                            marginBottom: 8,
                          }}
                        >
                          {membership.benefits.map(
                            (benefit: string, index: number) => (
                              <Tag
                                key={index}
                                color="blue"
                                style={{ fontSize: 11 }}
                              >
                                {benefit}
                              </Tag>
                            )
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <Text strong style={{ fontSize: 18, color: "#faad14" }}>
                          {membership.price.toLocaleString()}원
                        </Text>
                        <div style={{ fontSize: 12, color: "#999" }}>
                          /{" "}
                          {getBillingText(
                            membership.billing_unit,
                            membership.billing_period
                          )}
                          {getTrialText(membership) && (
                            <div style={{ color: "#52c41a", fontSize: 11, marginTop: 2 }}>
                              {getTrialText(membership)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                );
              })}
            </Space>
          </div>
        </div>

        <Divider />

        {/* 결제 방식 선택 */}
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <ReloadOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            결제 방식 선택
          </Title>

          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              background: isRecurringPayment ? "#f6ffed" : "#fafafa",
              border: `1px solid ${isRecurringPayment ? "#b7eb8f" : "#d9d9d9"}`,
              borderRadius: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SafetyCertificateOutlined
                  style={{
                    color: isRecurringPayment ? "#52c41a" : "#999",
                    fontSize: 20
                  }}
                />
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    정기결제 (자동결제)
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    매월 자동으로 결제되며 언제든 해지 가능
                  </div>
                </div>
              </div>
              <Switch
                checked={isRecurringPayment}
                onChange={setIsRecurringPayment}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>

            {isRecurringPayment && (
              <Alert
                message="정기결제 안내"
                description="TossPayments 자동결제를 통해 안전하고 편리하게 매월 자동결제됩니다. 언제든지 구독을 해지할 수 있습니다."
                type="info"
                showIcon
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        </div>

        {/* 결제 수단 선택 (일회성 결제일 때만) */}
        {!isRecurringPayment && (
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 16 }}>
              <CreditCardOutlined style={{ marginRight: 8, color: "#52c41a" }} />
              결제 수단 선택
            </Title>

            <Row gutter={[8, 8]}>
              {PAYMENT_METHODS.map((method) => (
                <Col span={12} key={method.value}>
                  <Button
                    type={
                      selectedPaymentMethod === method.value
                        ? "primary"
                        : "default"
                    }
                    size="large"
                    block
                    style={{
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background:
                        selectedPaymentMethod === method.value
                          ? "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)"
                          : undefined,
                      borderColor:
                        selectedPaymentMethod === method.value
                          ? "transparent"
                          : "#d9d9d9",
                    }}
                    onClick={() => setSelectedPaymentMethod(method.value)}
                  >
                    {/* <span style={{ fontSize: 16 }}>{method.icon}</span> */}
                    <span style={{ fontSize: 14 }}>{method.label}</span>
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 결제 요약 */}
        {selectedMembership && (
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>
                  선택한 멤버십
                </Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  {selectedMembership.name}
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>결제 금액</Text>
                <Text
                  style={{ fontSize: 14, color: "#52c41a", fontWeight: "500" }}
                >
                  {selectedMembership.price.toLocaleString()}원
                </Text>
              </div>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e8e8e8",
                  margin: "4px 0",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#999" }}>결제 주기</Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  {getBillingText(
                    selectedMembership.billing_unit,
                    selectedMembership.billing_period
                  )}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button size="large" onClick={handleClose}>
            취소
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            loading={isSubmitting}
            disabled={!selectedMembership}
            onClick={handleJoin}
            style={{
              background: isRecurringPayment
                ? "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)"
                : "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              border: "none",
              fontWeight: "600",
            }}
          >
            {selectedMembership
              ? `@${creatorHandle}의 ${selectedMembership.name}${getParticle(
                  selectedMembership.name
                )} ${selectedMembership.price.toLocaleString()}원/${getBillingText(
                  selectedMembership.billing_unit,
                  selectedMembership.billing_period
                )} ${isRecurringPayment ? '정기결제' : '가입하기'}`
              : "멤버십 가입하기"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
